const Wallet = require("../models/Wallet");
const User = require("../models/User");
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

const getWalletBalance = async (userId) => {
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
    };
    return walletDetails;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
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

module.exports = {
  getWalletBalance,
  addFundsToWallet,
};
