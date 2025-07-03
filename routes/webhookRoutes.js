const express = require("express");
const router = express.Router();
const { updatePaymentStatus } = require("../controllers/paymentController");

// route for paystack webhook
router.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  updatePaymentStatus
);

module.exports = router;
