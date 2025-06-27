const mongoose = require("mongoose");
const axios = require("axios");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Escrow = require("../models/Escrow");
const Transaction = require("../models/Transaction");
const PaymentSetting = require("../models/PaymentSetting");

const initiatePaystackPayment = require("./paymentgateway/paystack");
const initiateFlutterwavePayment = require("./paymentgateway/flutterwave");

async function initiatePayment(userId, escrowId) {
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

    if (userId !== escrow.buyer.toString()) {
      throw new Error("You are not authorized to make this payment");
    }

    // Determine escrow fee based on payment responsibility
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
    const paymentData = {
      reference: Reference,
      email: escrow.counterpartyEmail,
      userId,
      EscrowId: escrow._id,
      amount: escrow.amount * 100 + EscrowFee, // Convert to kobo
      FeeCurrency: setting.currency,
      Merchant: setting.merchant,
    };

    const totalAmount = escrow.amount + fee;
    console.log(
      `Total amount to be paid: ${totalAmount} (including fee: ${fee})`
    );
    console.log(escrow.creatorEmail, "Escrow creator email");
    console.log(escrow.counterpartyEmail, "Escrow counterparty email");
    const transaction = new Transaction({
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
    });

    await transaction.save({ session });

    let payment;
    switch (setting.merchant) {
      case "Paystack":
        payment = await initiatePaystackPayment(paymentData);
        transaction.status = "pending";
        transaction.merchant = "paystack";
        break;
      case "Flutterwave":
        payment = await initiateFlutterwavePayment(paymentData);
        break;
      default:
        throw new Error("Unsupported payment gateway");
    }

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
      `https://api.paystack.co/transaction/verify/${paymentId}`,
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
  initiatePayment,
  confirmPayment,
};
