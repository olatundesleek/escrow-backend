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
    console.log("Adding transaction:", transactionData);
    const transaction = new Transaction(transactionData);
    await transaction.save();
    return transaction;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

async function initiateEscrowPayment(userId, escrowId) {
  console.log(`Initiating payment for user: ${userId}, escrow: ${escrowId}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [escrow, user, wallet, setting] = await Promise.all([
      Escrow.findById(escrowId),
      User.findById(userId),
      Wallet.findOne({ user: userId }),
      PaymentSetting.findOne(),
    ]);

    if (!escrow) throw new Error("Escrow not found");
    if (!user) throw new Error("User not found");
    if (!wallet) throw new Error("Wallet not found");
    if (!setting) throw new Error("Payment settings not found");

    if (escrow.status !== "active") {
      throw new Error(
        "Escrow is not active. Accept the escrow before making a payment."
      );
    }
    if (userId !== escrow.buyer) {
      throw new Error("You are not authorized to make this payment");
    }
    if (escrow.paymentStatus !== "unpaid") {
      throw new Error("Payment has already been made for this escrow");
    }

    let fee = 0;
    switch (escrow.escrowfeepayment) {
      case "buyer":
        fee = setting.fee;
        break;
      case "split":
        fee = setting.fee / 2;
        break;
      case "seller":
        fee = 0;
        break;
      default:
        throw new Error("Invalid escrow fee payment type");
    }

    const feeValue = Math.round(escrow.amount * (fee / 100));
    const Reference = `escrow_${escrow._id}_${Date.now()}`;
    const EscrowFee = feeValue * 100;
    const escrowAmountinKobo = escrow.amount * 100;
    const totalAmountinKobo = escrowAmountinKobo + EscrowFee;
    const totalAmount = escrow.amount + feeValue;

    const paymentData = {
      reference: Reference,
      email: escrow.counterpartyEmail,
      EscrowId: escrow._id,
      amount: totalAmountinKobo,
      FeeCurrency: setting.currency,
      Merchant: setting.merchant,
      metadata: {
        type: "escrowPayment",
        escrowId: escrow._id,
        userId,
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
      reference: Reference,
      amount: totalAmount,
      gateway: setting.merchant,
      metadata: {
        escrowId: escrow._id,
        userEmail: escrow.buyerEmail,
        userId,
        fee,
      },
      status: "initiated",
    };

    // Save the transaction and capture it
    let transaction = await addTransaction(transactionData);

    let payment;
    switch (setting.merchant) {
      case "Paystack":
        payment = await initiatePaystackPayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "paystack";
        break;
      case "Flutterwave":
        payment = await initiateFlutterwavePayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "flutterwave";
        break;
      default:
        throw new Error("Unsupported payment gateway");
    }

    // Save updated transaction status
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to initiate payment: ${error.message}`);
  }
}

async function confirmPayment(paymentId) {
  try {
    const { data } = await axios.get(
      `${PaystackBaseUrl}/transaction/verify/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

module.exports = {
  initiateEscrowPayment,
  confirmPayment,
};
