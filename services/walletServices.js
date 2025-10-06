const axios = require("axios");
const crypto = require("crypto");

const Wallet = require("../models/Wallet");
const User = require("../models/User");
const PaymentSetting = require("../models/PaymentSetting");

const {
  initiatePaystackPayment,
  initializePaystackWithdrawal,
} = require("../utils/paymentgateway/paystack");
const initiateFlutterwavePayment = require("../utils/paymentgateway/flutterwave");
const addTransaction = require("../utils/transaction");

// -------------------------------------------------------------
// 🔧 Helper: Centralized Error Builder
// -------------------------------------------------------------
function createError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// -------------------------------------------------------------
// 🔧 Paystack Helpers
// -------------------------------------------------------------
async function verifyAccount(accountNumber, bankCode) {
  if (!accountNumber || !bankCode)
    throw createError("Account number and bank code are required", 400);

  try {
    const { data } = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    if (!data?.data)
      throw createError(
        "Account verification failed: No data returned from Paystack",
        400
      );

    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    throw createError(`Paystack verification error: ${message}`, 400);
  }
}

async function createTransferRecipient(accountNumber, bankCode, name) {
  if (!accountNumber || !bankCode || !name)
    throw createError("Account number, bank code, and name are required", 400);

  try {
    const { data } = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    if (!data?.data)
      throw createError(
        "Transfer recipient creation failed: No data returned from Paystack",
        400
      );

    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    throw createError(`Paystack transfer recipient error: ${message}`, 400);
  }
}

// -------------------------------------------------------------
// 💰 Wallet Services
// -------------------------------------------------------------
async function getWalletDetailsService(userId) {
  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw createError("Wallet not found", 404);

  return {
    totalBalance: wallet.totalBalance,
    lockedBalance: wallet.lockedBalance,
    availableBalance: wallet.availableBalance,
    bankInfo: wallet.bankInfo,
  };
}

async function addFundsToWallet(userId, amount) {
  if (amount <= 0) throw createError("Amount must be positive", 400);

  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw createError("Wallet not found", 404);

  const setting = await PaymentSetting.findOne();
  if (!setting) throw createError("Payment settings not found", 500);

  const reference = `deposit_${wallet._id}_${Date.now()}`;
  const paymentData = {
    reference,
    email: user.email,
    amount: amount * 100,
    FeeCurrency: setting.currency,
    metadata: { type: "addFunds", userId },
  };

  const transactionData = {
    user: userId,
    wallet: wallet._id,
    direction: "credit",
    type: "wallet_deposit",
    from: "system",
    to: user.username,
    reference,
    amount,
    gateway: setting.merchant,
    metadata: { userEmail: user.email },
    status: "initiated",
  };

  const transaction = await addTransaction(transactionData);
  if (!transaction) throw createError("Transaction creation failed", 500);

  let payment;
  switch (setting.merchant) {
    case "Paystack":
      payment = await initiatePaystackPayment(paymentData);
      transaction.status = "pending";
      transaction.merchant = "Paystack";
      break;

    case "Flutterwave":
      payment = await initiateFlutterwavePayment(paymentData);
      transaction.status = "pending";
      transaction.merchant = "Flutterwave";
      break;

    default:
      throw createError("Unsupported payment gateway", 400);
  }

  await transaction.save();
  return { transaction, payment };
}

async function resolveBankService(userId, bankCode, accountNumber) {
  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const accountInfo = await verifyAccount(accountNumber, bankCode);
  return { accountInfo };
}

async function addBankService(userId, bankCode, accountNumber) {
  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw createError("Wallet not found", 404);

  if (wallet.bankInfo && Object.values(wallet.bankInfo).some(Boolean))
    throw createError("Bank details already exist", 400);

  const accountInfo = await verifyAccount(accountNumber, bankCode);
  const recipientData = await createTransferRecipient(
    accountInfo.account_number,
    bankCode,
    accountInfo.account_name
  );

  wallet.bankInfo = {
    recipientCode: recipientData.recipient_code,
    bankName: recipientData.details.bank_name,
    accountNumber: recipientData.details.account_number,
    accountName: recipientData.details.account_name,
    bankCode: recipientData.details.bank_code,
  };

  await wallet.save();
  return {
    accountInfo: recipientData.details,
    walletInfo: wallet.bankInfo,
  };
}

async function requestWithdrawalService(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw createError("Wallet not found", 404);

  if (wallet.availableBalance < amount)
    throw createError("Insufficient funds", 400);

  const setting = await PaymentSetting.findOne();
  if (!setting) throw createError("Payment settings not found", 500);

  const merchant = setting.merchant;

  if (merchant === "Paystack") {
    if (!wallet.bankInfo?.recipientCode)
      throw createError("No bank details found", 400);

    await wallet.lockFunds(amount);
    await wallet.save();

    const reference = `withdrawal-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const transactionData = {
      user: userId,
      wallet: wallet._id,
      direction: "credit",
      type: "wallet_withdrawal",
      from: "system",
      to: user.username,
      reference,
      amount,
      gateway: "Paystack",
      metadata: { userEmail: user.email },
      status: "initiated",
    };

    const transaction = await addTransaction(transactionData);
    if (!transaction) throw createError("Transaction creation failed", 500);

    try {
      const transferData = await initializePaystackWithdrawal({
        source: "balance",
        reason: "User withdrawal",
        amount,
        recipient: wallet.bankInfo.recipientCode,
        reference,
      });

      transaction.status = "pending";
      await transaction.save();

      return { transaction, transferData };
    } catch (error) {
      await wallet.unlockFunds(amount);
      await wallet.save();

      transaction.status = "failed";
      await transaction.save();

      const message =
        error.message || "Error initiating withdrawal with Paystack";
      throw createError(message, 502);
    }
  }

  // Future support for Flutterwave withdrawals can go here.
  throw createError("Unsupported withdrawal gateway", 400);
}

// -------------------------------------------------------------
// 🧩 Exports
// -------------------------------------------------------------
module.exports = {
  getWalletDetailsService,
  addFundsToWallet,
  addBankService,
  resolveBankService,
  requestWithdrawalService,
};
