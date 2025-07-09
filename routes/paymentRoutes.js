const express = require("express");
const router = express.Router();
const {
  initiatePayment,

  confirmPayment,
} = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Route to initiate a payment
router.post("/pay", authMiddleware, initiatePayment);

// // route for paystack webhook
// router.post(
//   "/webhook/paystack",
//   express.raw({ type: "application/json" }),
//   updatePaymentStatus
// );

// Route to confirm a payment
router.get("/confirm-payment/:reference", authMiddleware, confirmPayment);

// Route to get payment status
// router.get("/status", authMiddleware, (req, res) => {
//   // Logic to get payment status
// });

module.exports = router;
