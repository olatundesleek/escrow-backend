const Joi = require("joi");
const paymentservice = require("../utils/paymentservice");

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
    const paymentDetails = await paymentservice.initiatePayment(
      userId,
      escrowId
    );
    res.status(200).json({ success: true, paymentDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

module.exports = { initiatePayment, confirmPayment };
