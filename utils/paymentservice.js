const mongoose = require("mongoose");
const axios = require("axios");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Escrow = require("../models/Escrow");
const Transaction = require("../models/Transaction");
const PaymentSetting = require("../models/PaymentSetting");
const PaystackBaseUrl = process.env.PAYSTACK_BASE_URL;
const { initiatePaystackPayment } = require("./paymentgateway/paystack");
const initiateFlutterwavePayment = require("./paymentgateway/flutterwave");
const addTransaction = require("../utils/transaction");

// // function to add a new transaction
// const addTransaction = async (transactionData) => {
//   try {
//     const transaction = new Transaction(transactionData);
//     await transaction.save();
//     return transaction;
//   } catch (error) {
//     throw error;
//   }
// };

async function initiateEscrowPayment(userId, escrowId, method) {
  const session = await mongoose.startSession();
  session.startTransaction();

  const handleError = (message, statusCode) => {
    const err = new Error(message);
    err.statusCode = statusCode || 500;
    throw err;
  };

  const checkRequiredRecords = async () => {
    const [escrow, user, wallet, setting] = await Promise.all([
      Escrow.findById(escrowId),
      User.findById(userId),
      Wallet.findOne({ user: userId }),
      PaymentSetting.findOne(),
    ]);

    if (!escrow) handleError("Escrow not found", 404);
    if (!user) handleError("User not found", 404);
    if (!wallet) handleError("Wallet not found", 404);
    if (!setting) handleError("Payment settings not found", 500);

    return { escrow, user, wallet, setting };
  };

  const checkEscrowStatus = (escrow) => {
    if (escrow.status !== "active") {
      handleError(
        "Escrow is not active. Accept the escrow before making a payment.",
        400
      );
    }
    if (userId.toString() !== escrow.buyer.toString()) {
      handleError("You are not authorized to make this payment", 403);
    }
    if (escrow.paymentStatus !== "unpaid") {
      handleError("Payment has already been made for this escrow", 409);
    }
  };

  try {
    const { escrow, user, wallet, setting } = await checkRequiredRecords();
    checkEscrowStatus(escrow);

    // Fee calculation
    const feePercentage = (() => {
      switch (escrow.escrowfeepayment) {
        case "buyer":
          return setting.fee;
        case "split":
          return setting.fee / 2;
        case "seller":
          return 0;
        default:
          handleError("Invalid escrow fee payment type", 400);
      }
    })();

    const feeValue = Math.round(escrow.amount * (feePercentage / 100));
    const totalAmount = escrow.amount + feeValue;
    const totalAmountInKobo = totalAmount * 100;
    const reference = `escrow_${escrow._id}_${Date.now()}`;

    // Prepare payment and transaction data
    const paymentData = {
      reference,
      email: escrow.counterpartyEmail,
      amount: totalAmountInKobo,
      FeeCurrency: setting.currency,
      metadata: {
        type: "escrowPayment",
        reference,
        escrowId: escrow._id,
      },
    };

    const transactionData = {
      user: userId,
      escrow: escrow._id,
      wallet: wallet._id,
      direction: "debit",
      role: "buyer",
      type: "escrow_payment",
      from: escrow.buyerUsername,
      to: escrow.sellerUsername,
      reference,
      amount: totalAmount,
      gateway: setting.merchant,
      metadata: {
        escrowId: escrow._id,
        userEmail: escrow.buyerEmail,
        userId,
        fee: feePercentage,
      },
      status: "initiated",
    };

    let transaction = await addTransaction(transactionData);
    let payment;

    const paymentGateways = {
      Paystack: async () => {
        console.log("Using Paystack for payment");
        payment = await initiatePaystackPayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "Paystack";
        escrow.paidWith = "paymentgateway";
        return payment;
      },
      Flutterwave: async () => {
        payment = await initiateFlutterwavePayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "Flutterwave";
      },
    };

    if (method === "paymentgateway") {
      if (!paymentGateways[setting.merchant]) {
        handleError("Unsupported payment gateway", 400);
      }
      payment = await paymentGateways[setting.merchant]();
    } else if (method === "wallet") {
      try {
        console.log(totalAmount, "Total Amount to lock");
        payment = await wallet.lockFunds(totalAmount);
        transaction.status = "success";

        escrow.paymentStatus = "paid";
        escrow.paidWith = "wallet";
        await escrow.save({ session });
      } catch (err) {
        transaction.status = "failed";
        await transaction.save({ session });
        throw err;
      }
    } else {
      handleError("Invalid payment method", 400);
    }

    await transaction.save({ session });
    await session.commitTransaction();

    return {
      transactionId: transaction._id,
      escrowId: escrow._id,
      amount: totalAmount,
      status: transaction.status,
      data: payment.data,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  } finally {
    session.endSession();
  }
}

async function confirmPayment(reference) {
  const transaction = await Transaction.findOne({ reference });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  if (transaction.status === "pending") {
    const error = new Error("Transaction is still pending");
    error.statusCode = 202;
    throw error;
  }

  if (transaction.status === "success") {
    return transaction;
  }

  // Handle unknown or unexpected status
  const error = new Error("Invalid transaction status");
  error.statusCode = 400;
  throw error;
}

module.exports = {
  initiateEscrowPayment,
  confirmPayment,
};
