const Joi = require("joi");
const paymentservice = require("../utils/paymentservice");
const Escrow = require("../models/Escrow");
const Wallet = require("../models/Wallet");
const crypto = require("crypto");
const axios = require("axios");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PaystackBaseUrl = process.env.PAYSTACK_BASE_URL;
// Joi schemas
const initiatePaymentSchema = Joi.object({
  escrowId: Joi.string().required(),
});

// Function to initiate a payment
const initiatePayment = async (req, res) => {
  const { error } = initiatePaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }

  try {
    const { escrowId } = req.body;
    const userId = req.userId;
    const paymentDetails = await paymentservice.initiateEscrowPayment(
      userId,
      escrowId
    );
    res.status(200).json({ success: true, paymentDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to update payment status from webhook

const updatePaymentStatus = async (req, res) => {
  try {
    // Step 1: Convert raw body to string for signature verification
    const rawBody = req.body.toString("utf8");
    const receivedSignature = req.headers["x-paystack-signature"];

    const generatedHash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");
    console.log("Body is buffer:", Buffer.isBuffer(req.body)); // Should be true

    if (generatedHash !== receivedSignature) {
      console.log("Expected:", generatedHash);
      console.log("Received:", receivedSignature);
      return res.status(401).send("Unauthorized");
    }

    // Step 2: Parse the raw JSON body
    const event = JSON.parse(rawBody);

    // Step 3: Basic payload validation
    const { data } = event;
    if (!data || !data.metadata || !data.reference) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload structure",
      });
    }

    const { reference, metadata } = data;

    // Step 4: Verify transaction status with Paystack
    const verifyUrl = `${PaystackBaseUrl}/transaction/verify/${reference}`;
    const verifyRes = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const isSuccess = verifyRes?.data?.data?.status === "success";

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: "Transaction verification failed or not successful",
      });
    }

    const amount = verifyRes.data.data.amount / 100;
    console.log(metadata.type, "metadata type");
    // Step 5: Update payment record based on metadata
    switch (metadata.type) {
      case "escrowPayment":
        await Escrow.findByIdAndUpdate(metadata.escrowId, {
          paymentStatus: "paid",
        });
        break;

      case "addfunds":
        await Wallet.findOneAndUpdate(
          { userId: metadata.userId },
          { $inc: { totalBalance: amount } }
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unknown payment type in metadata",
        });
    }

    // Step 6: Respond with success
    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error processing webhook",
      error: error.message,
    });
  }
};

// Function to confirm a payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const confirmation = await paymentservice.confirmPayment(paymentId);
    res.status(200).json({ success: true, confirmation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { initiatePayment, confirmPayment, updatePaymentStatus };
