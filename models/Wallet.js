const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalBalance: {
      type: Number,
      default: 0,
      required: true,
    },
    lockedBalance: {
      type: Number,
      default: 0, // Funds reserved for pending or escrowed actions
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === Utility Methods ===

// Deposit funds (add to balance)
// Deposit funds (add to total balance)
walletSchema.methods.deposit = function (amount) {
  if (amount <= 0) throw new Error("Invalid deposit amount");
  this.totalBalance += amount;
  return this.save();
};

// Withdraw funds (subtract from total balance if available)
walletSchema.methods.withdraw = function (amount) {
  if (amount <= 0) throw new Error("Invalid withdrawal amount");
  const available = this.totalBalance - this.lockedBalance;
  if (available < amount) {
    const error = new Error("Insufficient available balance");
    error.statusCode = 422;
    throw error;
  }
  this.totalBalance -= amount;
  return this.save();
};

// Lock funds (reserve some funds)
walletSchema.methods.lockFunds = function (amount) {
  if (amount <= 0) throw new Error("Invalid lock amount");
  const available = this.totalBalance - this.lockedBalance;
  if (available < amount) {
    const error = new Error("Insufficient available balance");
    error.statusCode = 422;
    throw error;
  }
  this.lockedBalance += amount;
  return this.save();
};

// Unlock funds
walletSchema.methods.unlockFunds = function (amount) {
  if (amount <= 0) throw new Error("Invalid unlock amount");
  if (this.lockedBalance < amount) throw new Error("Insufficient locked funds");
  this.lockedBalance -= amount;
  return this.save();
};

// Deduct locked funds (e.g., complete escrow)
walletSchema.methods.deductLocked = function (amount) {
  if (amount <= 0) throw new Error("Invalid deduction amount");
  if (this.lockedBalance < amount) throw new Error("Insufficient locked funds");
  this.lockedBalance -= amount;
  this.totalBalance -= amount;
  return this.save();
};

// Get available balance (non-persistent)

walletSchema.virtual("availableBalance").get(function () {
  return this.totalBalance - this.lockedBalance;
});

module.exports = mongoose.model("Wallet", walletSchema);
