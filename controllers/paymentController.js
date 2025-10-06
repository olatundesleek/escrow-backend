const Joi = require("joi");
const paymentservice = require("../utils/paymentservice");
const Escrow = require("../models/Escrow");
const Wallet = require("../models/Wallet");
const crypto = require("crypto");
const axios = require("axios");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PaystackBaseUrl = process.env.PAYSTACK_BASE_URL;

// Joi schemas
const initiatePaymentSchema = Joi.object({
  escrowId: Joi.string().required(),
  method: Joi.string().valid("paymentgateway", "wallet").required(),
});

const confirmPaymentSchema = Joi.object({
  reference: Joi.string().min(10).required(),
});

// Initiate Payment
const initiatePayment = async (req, res) => {
  const { error } = initiatePaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { escrowId, method } = req.body;
    const userId = req.userId;

    const paymentDetails = await paymentservice.initiateEscrowPayment(
      userId,
      escrowId,
      method
    );

    res.status(200).json({
      success: true,
      message: "Payment made successfully",
      paymentDetails,
    });
  } catch (error) {
    console.log(error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Update Payment Status via Webhook
const updatePaymentStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rawBody = req.body.toString("utf8");
    const receivedSignature = req.headers["x-paystack-signature"];

    const generatedHash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (generatedHash !== receivedSignature) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).send("Unauthorized");
    }

    const event = JSON.parse(rawBody);
    const { data } = event;

    if (!data || !data.metadata || !data.reference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload structure",
      });
    }

    const { reference, metadata } = data;

    const verifyUrl = `${PaystackBaseUrl}/transaction/verify/${reference}`;
    const verifyRes = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const isSuccess = verifyRes?.data?.data?.status === "success";
    const amount = verifyRes?.data?.data?.amount / 100;

    if (!isSuccess) {
      await Transaction.findOneAndUpdate(
        { reference },
        { $set: { status: "failed" } },
        { session }
      );
      await session.commitTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Transaction verification failed or not successful",
      });
    }

    // Handle payment metadata types
    switch (metadata.type) {
      case "escrowPayment":
        await Escrow.findByIdAndUpdate(
          metadata.escrowId,
          {
            paymentStatus: "paid",
            paidWith: "paymentgateway",
          },
          { session }
        );
        break;

      case "addFunds":
        console.log("trying to update wallet balance");
        console.log("metadata.userId", metadata.userId);
        console.log("amount", amount);
        console.log("metadata type", metadata.type);
        await Wallet.findOneAndUpdate(
          { user: metadata.userId },
          { $inc: { totalBalance: amount } },
          { session }
        );
        console.log("Wallet balance updated successfully");
        break;

      case "wallet_withdrawal":
        console.log("Processing wallet withdrawal");
        await Wallet.findOneAndUpdate(
          { user: metadata.userId },
          { $inc: { totalBalance: -amount } },
          { session }
        );
        console.log("Wallet balance updated successfully");
        break;

      default:
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Unknown payment type in metadata",
        });
    }

    await Transaction.findOneAndUpdate(
      { reference },
      { $set: { status: "success" } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("🔥 Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error processing webhook",
      error: error.message,
    });
  }
};

// Confirm Payment
const confirmPayment = async (req, res) => {
  const { error } = confirmPaymentSchema.validate(req.params);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const reference = req.params.reference;
    const confirmation = await paymentservice.confirmPayment(reference);

    res.status(200).json({ success: true, confirmation });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initiatePayment,
  confirmPayment,
  updatePaymentStatus,
};
