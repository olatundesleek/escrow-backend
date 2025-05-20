const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    locked: {
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
  }
);

// === Utility Methods ===

// Deposit funds (add to balance)
walletSchema.methods.deposit = function (amount) {
  if (amount <= 0) throw new Error("Invalid deposit amount");
  this.balance += amount;
  return this.save();
};

// Withdraw funds (subtract from balance if sufficient)
walletSchema.methods.withdraw = function (amount) {
  if (amount <= 0) throw new Error("Invalid withdrawal amount");
  if (this.balance < amount) throw new Error("Insufficient balance");
  this.balance -= amount;
  return this.save();
};

// Lock funds (move from balance to locked)
walletSchema.methods.lockFunds = function (amount) {
  if (amount <= 0) throw new Error("Invalid lock amount");
  if (this.balance < amount) throw new Error("Insufficient balance to lock");
  this.balance -= amount;
  this.locked += amount;
  return this.save();
};

// Unlock funds (move from locked back to balance)
walletSchema.methods.unlockFunds = function (amount) {
  if (amount <= 0) throw new Error("Invalid unlock amount");
  if (this.locked < amount) throw new Error("Insufficient locked funds");
  this.locked -= amount;
  this.balance += amount;
  return this.save();
};

// Deduct locked funds (for completing escrow)
walletSchema.methods.deductLocked = function (amount) {
  if (amount <= 0) throw new Error("Invalid deduction amount");
  if (this.locked < amount) throw new Error("Insufficient locked funds");
  this.locked -= amount;
  return this.save();
};

module.exports = mongoose.model("Wallet", walletSchema);
