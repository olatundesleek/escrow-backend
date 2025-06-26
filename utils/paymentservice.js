const PaymentSetting = require("../models/PaymentSetting");
const initiatePaystackPayment = require("./paystackService");
const initiateFlutterwavePayment = require("./flutterwaveService");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

async function initiatePayment(escrowId, currency, userId) {
  try {
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      throw new Error("Escrow not found");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    const User = await User.findById(userId);
    if (!User) {
      throw new Error("User not found");
    }
    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    if (userId !== escrow.buyer) {
      throw new Error("You are not authorized to make this payment");
    }

    const setting = await PaymentSetting.findOne();
    if (!setting) {
      throw new Error("Payment settings not found");
    }

    let fee;

    if (escrow.escrowfeepayment === "buyer") {
      fee = setting.amount;
    } else if (escrow.escrowfeepayment === "seller") {
      fee = 0;
    } else if (escrow.escrowfeepayment === "split") {
      fee = setting.amount / 2;
    } else {
      throw new Error("Invalid escrow fee payment ");
    }
    const paymentData = {
      userEmail: escrow.buyerEmail,
      userId: userId,
      escrowId: escrow._id,
      escrowFee: fee * 100, // Convert to kobo for Nigerian Naira
      amount: escrow.amount * 100, // Convert to kobo for Nigerian Naira
      feeCurrency: setting.currency,
      merchant: setting.merchant,
    };

    const transaction = new Transaction({
      user: userId,
      escrow: escrow._id,
      wallet: wallet._id,
      type: "escrow_payment",
      from: {
        user: escrow.buyerEmail,
      },
      to: {
        user: escrow.sellerEmail,
      },
      reference: `escrow_${escrow._id}_${Date.now()}`,
      amount: escrow.amount + fee,
      gateway: setting.merchant,
      metadata: {
        escrowId: escrow._id,
        userEmail: escrow.buyerEmail,
        userId: userId,
        fee: fee,
      },
      status: "initiated",
    });

    await transaction.save();

    if (setting.merchant === "paystack") {
      const payment = await initiatePaystackPayment(paymentData);
      transaction.status = "pending";
      transaction.merchant = "paystack";
      await transaction.save();
      return payment;
    } else if (setting.merchant === "flutterwave") {
      const payment = await initiateFlutterwavePayment(paymentData);
      return payment;
    } else {
      throw new Error("Unsupported payment gateway");
    }
  } catch (error) {
    throw new Error("Failed to initiate payment: " + error.message);
  }
}

async function confirmPayment(paymentId) {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

module.exports = { initiatePayment, confirmPayment };
