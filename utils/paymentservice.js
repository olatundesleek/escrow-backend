const mongoose = require("mongoose");
const axios = require("axios");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Escrow = require("../models/Escrow");
const Transaction = require("../models/Transaction");
const PaymentSetting = require("../models/PaymentSetting");
const PaystackBaseUrl = process.env.PAYSTACK_BASE_URL;
const initiatePaystackPayment = require("./paymentgateway/paystack");
const initiateFlutterwavePayment = require("./paymentgateway/flutterwave");

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

async function lockUserFunds(userId, amount) {
  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      const error = new Error("Wallet not found");
      error.statusCode = 404;
      throw error;
    }

    // Call the method you defined
    await wallet.lockFunds(amount);

    return wallet; // or return a success message
  } catch (error) {
    throw error;
  }
}

async function initiateEscrowPayment(userId, escrowId, method) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Load required records
    const [escrow, user, wallet, setting] = await Promise.all([
      Escrow.findById(escrowId),
      User.findById(userId),
      Wallet.findOne({ user: userId }),
      PaymentSetting.findOne(),
    ]);

    // Manual error throwing with statusCode
    if (!escrow) {
      const err = new Error("Escrow not found");
      err.statusCode = 404;
      throw err;
    }
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    if (!wallet) {
      const err = new Error("Wallet not found");
      err.statusCode = 404;
      throw err;
    }
    if (!setting) {
      const err = new Error("Payment settings not found");
      err.statusCode = 500;
      throw err;
    }

    if (escrow.status !== "active") {
      const err = new Error(
        "Escrow is not active. Accept the escrow before making a payment."
      );
      err.statusCode = 400;
      throw err;
    }

    if (userId.toString() !== escrow.buyer.toString()) {
      const err = new Error("You are not authorized to make this payment");
      err.statusCode = 403;
      throw err;
    }

    if (escrow.paymentStatus !== "unpaid") {
      const err = new Error("Payment has already been made for this escrow");
      err.statusCode = 409;
      throw err;
    }

    // Fee calculation
    let feePercentage = 0;
    switch (escrow.escrowfeepayment) {
      case "buyer":
        feePercentage = setting.fee;
        break;
      case "split":
        feePercentage = setting.fee / 2;
        break;
      case "seller":
        feePercentage = 0;
        break;
      default:
        const err = new Error("Invalid escrow fee payment type");
        err.statusCode = 400;
        throw err;
    }

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
        type: "addFunds",
        reference: reference,
      },
    };

    const transactionData = {
      user: userId,
      escrow: escrow._id,
      wallet: wallet._id,
      direction: "debit",
      role: "buyer",
      type: "escrow_payment",
      from: escrow.counterpartyEmail,
      to: escrow.creatorEmail,
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

    if (method === "paymentgateway") {
      switch (setting.merchant) {
        case "paystack":
          console.log("Using Paystack for payment");
          payment = await initiatePaystackPayment(paymentData);
          transaction.status = "pending";
          transaction.merchant = "paystack";
          return payment; // Return payment response directly
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
    } else if (method === "wallet") {
      try {
        payment = await lockUserFunds(userId, totalAmount);
        transaction.status = "success";

        escrow.paymentStatus = "paid";
        escrow.paidWith = "wallet";
        await escrow.save({ session }); // ✅ Save escrow changes
      } catch (err) {
        transaction.status = "failed";
        await transaction.save({ session });
        throw err;
      }
    } else {
      const err = new Error("Invalid payment method");
      err.statusCode = 400;
      throw err;
    }

    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    return {
      transactionId: transaction._id,
      escrowId: escrow._id,
      amount: totalAmount,
      status: transaction.status,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (!error.statusCode) error.statusCode = 500;
    throw error;
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
