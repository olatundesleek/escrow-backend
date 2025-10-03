const Wallet = require("../models/Wallet");
const User = require("../models/User");
const axios = require("axios");
const Transaction = require("../models/Transaction");
const PaymentSetting = require("../models/PaymentSetting");
const initiatePaystackPayment = require("../utils/paymentgateway/paystack");
const initiateFlutterwavePayment = require("../utils/paymentgateway/flutterwave");
// function to add a new transaction
const addTransaction = async (transactionData) => {
  try {
    const transaction = new Transaction(transactionData);
    await transaction.save();
    return transaction;
  } catch (error) {
    throw error;
  }
};

const verifyAccount = async (accountNumber, bankCode) => {
  try {
    // Validate input before making an API call
    if (!accountNumber || !bankCode) {
      throw new Error("Account number and bank code are required");
    }

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        port: 443,
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = response.data?.data;

    // Ensure data is present
    if (!data) {
      throw new Error(
        "Account verification failed: No data returned from Paystack"
      );
    }

    console.log("Verified account:", data); // More meaningful logging

    return data; // This contains account_name, account_number, bank_id, etc.
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    console.error("Paystack verification error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const createTransferRecipient = async (accountNumber, bankCode, name) => {
  try {
    if (!accountNumber || !bankCode || !name) {
      throw new Error("Account number, bank code, and name are required");
    }
    console.log("Creating transfer recipient with:", {
      accountNumber,
      bankCode,
      name,
    });
    const response = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name: name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data?.data;

    if (!data) {
      throw new Error(
        "Transfer recipient creation failed: No data returned from Paystack"
      );
    }

    console.log("Created transfer recipient:", data);
    return data; // contains the transfer recipient details
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    console.error("Paystack transfer recipient error:", errorMessage);
    throw new Error(errorMessage);
  }
};

const getWalletDetailsService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const wallet = await Wallet.findOne({ user: userId });
    // Ensure the virtual 'availableBalance' is included
    if (!wallet) {
      const error = new Error("Wallet not found");
      error.statusCode = 404;
      throw error;
    }

    const walletDetails = {
      totalBalance: wallet.totalBalance,
      lockedBalance: wallet.lockedBalance,
      availableBalance: wallet.availableBalance, //
      bankInfo: { ...wallet.bankInfo },
    };
    return walletDetails;
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    error.statusCode = 500;
    throw error;
  }
};

const addFundsToWallet = async (userId, amount) => {
  console.log("Adding funds to wallet:", userId, amount);
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      const error = new Error("Wallet not found");
      error.statusCode = 404;
      throw error;
    }

    if (amount <= 0) {
      const error = new Error("Amount must be positive");
      error.statusCode = 400;
      throw error;
    }

    const amountInKobo = amount * 100;
    const reference = `deposit_${wallet._id}_${Date.now()}`;
    const setting = await PaymentSetting.findOne();
    const paymentData = {
      reference,
      email: user.email,

      amount: amountInKobo,
      FeeCurrency: setting.currency,
      metadata: {
        type: "addFunds",
        reference,
        userId,
      },
    };
    const transactionData = {
      user: userId,
      wallet: wallet._id,
      direction: "credit",
      type: "wallet_deposit",
      from: "system",
      to: user.username,
      reference,
      amount: amount,
      gateway: setting.merchant,
      metadata: {
        type: "wallet_deposit",
        userEmail: user.email,
      },
      status: "initiated",
    };

    let transaction = await addTransaction(transactionData);
    if (!transaction) {
      const error = new Error("Transaction creation failed");
      error.statusCode = 500;
      throw error;
    }
    let payment;

    if (!setting) {
      transaction.status = "failed";
      await transaction.save();
      const error = new Error("Payment settings not found");
      error.statusCode = 404;
      throw error;
    }

    switch (setting.merchant) {
      case "paystack":
        console.log("Using Paystack for payment");
        payment = await initiatePaystackPayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "paystack";

        break;
      case "flutterwave":
        payment = await initiateFlutterwavePayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "flutterwave";
        break;
      default:
        const err = new Error("Unsupported payment gateway");
        err.statusCode = 400;
        throw err;
    }
    await transaction.save();
    const response = {
      transaction,
      payment,
    };
    return response;
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    throw new Error("Internal server error");
  }
};

const resolveBankService = async (userId, bankCode, accountNumber) => {
  let user;
  try {
    // Find user by ID
    user = await User.findById(userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
  } catch (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }

  let accountInfo;
  try {
    // Step 2: Verify bank account
    accountInfo = await verifyAccount(accountNumber, bankCode);
  } catch (error) {
    // Handle errors from account verification
    throw Object.assign(error, { statusCode: 400 });
  }

  return {
    accountInfo, // Returning the verified account details
  };
};

// function to add or update bank details in the user's wallet
const addBankService = async (userId, bankCode, accountNumber) => {
  const buildError = (error, genericMessage, statusCode = 500) => {
    const paystackMessage =
      error?.response?.data?.message || error?.message || "Unknown error";
    return Object.assign(new Error(genericMessage), {
      statusCode,
      error: genericMessage, // generic
      message: paystackMessage, // specific
    });
  };

  let user;
  try {
    // Step 1: Find user by ID
    user = await User.findById(userId);
    if (!user) {
      throw buildError(null, "User not found", 404);
    }
  } catch (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }

  let userWallet;
  try {
    // Step 2: Get user wallet
    userWallet = await Wallet.findOne({ user: userId });
    if (!userWallet) {
      throw buildError(null, "Wallet not found for user", 404);
    }

    if (
      userWallet.bankInfo &&
      Object.values(userWallet.bankInfo).some((val) => val)
    ) {
      throw buildError(null, "Bank details already exist", 400);
    }
  } catch (error) {
    console.error("Error fetching wallet:", error.message);
    throw error;
  }

  // Step 3: Verify bank account with Paystack
  let accountInfo;
  try {
    accountInfo = await verifyAccount(accountNumber, bankCode);
  } catch (error) {
    throw buildError(error, "Bank account verification failed", 400);
  }

  // Step 4: Create transfer recipient
  let recipientData;
  try {
    const recipientResponse = await createTransferRecipient(
      accountInfo.account_number,
      bankCode,
      accountInfo.account_name
    );
    recipientData = recipientResponse; // response.data.data
  } catch (error) {
    throw buildError(error, "Transfer recipient creation failed", 500);
  }

  // Step 5: Save bank details
  try {
    userWallet.bankInfo = {
      recipientCode: recipientData.recipient_code,
      bankName: recipientData.details.bank_name,
      accountNumber: recipientData.details.account_number,
      accountName: recipientData.details.account_name,
      bankCode: recipientData.details.bank_code,
    };

    await userWallet.save();
    console.log("Bank details saved successfully for user:", userId);
  } catch (error) {
    throw buildError(error, "Error saving bank details", 500);
  }

  return {
    accountInfo: recipientData.details,
    walletInfo: userWallet.bankInfo,
  };
};

module.exports = {
  getWalletDetailsService,
  addFundsToWallet,
  addBankService,
  resolveBankService,
};
