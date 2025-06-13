const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  fee: {
    type: Number,
    required: true,
    default: 2.5,
  },

  merchant: {
    type: String,
    enum: ["Paystack", "Flutterwave", "Bank Transfer"],
    required: true,
    default: "Paystack",
  },

  currency: {
    type: String,
    enum: ["USD", "EUR", "NGN"],
    required: true,
    default: "NGN",
  },
});

const PaymentSetting = mongoose.model("PaymentSetting", feeSchema);

module.exports = PaymentSetting;
