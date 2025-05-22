const express = require("express");
const router = express.Router();
const { initiatePayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Route to initiate a payment
router.post("/pay", authMiddleware, initiatePayment);

// Route to confirm a payment
router.post(
  "/confirm",
  authMiddleware.verifyToken,
  paymentController.confirmPayment
);

// Route to get payment status
router.get(
  "/status/:paymentId",
  authMiddleware.verifyToken,
  paymentController.getPaymentStatus
);

module.exports = router;
