const Payment = require("../models/Payment"); // Assuming there's a Payment model
const Joi = require("joi");
const paymentGateway = require("../utils/paymentGateway");
const Escrow = require("../models/Escrow");

// Joi schemas
const initiatePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
  userId: Joi.string().required(),
  escrowId: Joi.string().required(),
});

// Function to initiate a payment
exports.initiatePayment = async (req, res) => {
  const { error } = initiatePaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }

  try {
    const { amount, currency, userId, escrowId } = req.body;
    const paymentDetails = await paymentGateway.initiatePayment(
      amount,
      currency,
      userId,
      escrowId
    );
    res.status(200).json({ success: true, paymentDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to confirm a payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const confirmation = await paymentGateway.confirmPayment(paymentId);
    res.status(200).json({ success: true, confirmation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
