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
    bankInfo: {
      bankName: {
        type: String,
        default: null,
      },
      accountNumber: {
        type: String,
        default: null,
      },
      accountName: {
        type: String,
        default: null,
      },
      bankCode: {
        type: String,
        default: null,
      },
      recipientCode: {
        type: String,
        default: null,
      },
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
walletSchema.methods.lockFunds = async function (amount) {
  if (typeof amount !== "number" || amount <= 0) {
    const err = new Error("Invalid lock amount");
    err.statusCode = 400;
    throw err;
  }

  const available = this.totalBalance - this.lockedBalance;

  if (available < amount) {
    const err = new Error("Insufficient available balance");
    err.statusCode = 422;
    throw err;
  }

  this.lockedBalance += amount;

  await this.save();
  return this;
};

// Unlock funds
walletSchema.methods.unlockFunds = async function (amount) {
  if (typeof amount !== "number" || amount <= 0) {
    const err = new Error("Invalid unlock amount");
    err.statusCode = 400;
    throw err;
  }

  if (this.lockedBalance < amount) {
    const err = new Error("Insufficient locked funds");
    err.statusCode = 422;
    throw err;
  }

  this.lockedBalance -= amount;

  await this.save();
  return this;
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
