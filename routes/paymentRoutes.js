const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  confirmPayment,
} = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Route to initiate a payment
router.post("/pay", authMiddleware, initiatePayment);

// Route to confirm a payment
router.post("/confirm", authMiddleware, confirmPayment);

// Route to get payment status
// router.get("/status", authMiddleware, (req, res) => {
//   // Logic to get payment status
// });

module.exports = router;
