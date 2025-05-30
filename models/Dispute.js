const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  escrowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Escrow",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "resolved", "closed"],
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

disputeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
disputeSchema.methods.resolve = function () {
  this.status = "resolved";
  return this.save();
};

disputeSchema.methods.close = function () {
  this.status = "closed";
  return this.save();
};
disputeSchema.methods.open = function () {
  this.status = "open";
  return this.save();
};
disputeSchema.methods.updateReason = function (newReason) {
  this.reason = newReason;
  return this.save();
};

module.exports = mongoose.model("Dispute", disputeSchema);
