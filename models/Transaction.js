const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Escrow",
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },

    type: {
      type: String,
      enum: [
        "escrow_payment",
        "wallet_deposit",
        "wallet_withdrawal",
        "wallet_transfer",
        "escrow_release",
        "refund",
      ],
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "success", "failed", "pending"],
      default: "initiated",
      required: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
    },
    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    gateway: {
      type: String,
      enum: ["Paystack", "Flutterwave", "Stripe", "Wallet"],
    },
  },
  {
    timestamps: true,
  },

  { updatedAt: { type: Date, default: Date.now } }
);

transactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
