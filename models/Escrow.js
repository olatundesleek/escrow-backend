const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorRole: { type: String, enum: ["buyer", "seller"], required: true },
    counterparty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    counterpartyEmail: { type: String, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    terms: { type: [String], required: true },
    description: String,

    status: {
      type: String,
      enum: ["pending", "active", "completed", "disputed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    escrowfee: {
      paidby: {
        type: String,
        enum: ["creator", "counterparty"],
        default: "creator",
      },
    },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }, //
    chatActive: { type: Boolean, default: false }, //

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update updatedAt automatically
escrowSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Escrow", escrowSchema);
