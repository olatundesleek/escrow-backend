const express = require("express");
const router = express.Router();
const { updatePaymentStatus } = require("../controllers/paymentController");

const updateKycStatus = require("../controllers/kycController");

// route for paystack webhook
router.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  updatePaymentStatus
);

router.post(
  "/qoreid",
  express.raw({ type: "application/json" }),
  updateKycStatus
);

module.exports = router;
