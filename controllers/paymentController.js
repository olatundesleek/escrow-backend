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
    // Signature verification
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Unauthorized");
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (!event || !event.data || !event.data.metadata) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook payload" });
    }

    const { reference, metadata } = event.data;

    // Verify transaction status via Paystack API
    const verifyUrl = `${PaystackBaseUrl}/transaction/verify/${reference}`;
    const verifyRes = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const verified =
      verifyRes.data &&
      verifyRes.data.data &&
      verifyRes.data.data.status === "success";

    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction not successful" });
    }

    const amount = verifyRes.data.data.amount / 100;

    if (metadata.type === "escrow") {
      await Escrow.findByIdAndUpdate(metadata.escrowId, {
        paymentStatus: "paid",
      });
    } else if (metadata.type === "addfunds") {
      await Wallet.findOneAndUpdate(
        { userId: metadata.userId },
        { $inc: { totalBalance: amount } } // increment by the amount paid
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unknown payment type" });
    }

    res.status(200).json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = updatePaymentStatus;

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
