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
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    from: {
      user: {
        type: String,
        required: true,
      },
    },
    to: {
      user: {
        type: String,
        required: true,
      },
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
      default: "pending",
      required: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    gateway: {
      type: String,
      default: "paystack",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
