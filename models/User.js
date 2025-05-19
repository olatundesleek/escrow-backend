const mongoose = require("mongoose");

// Define the address schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["inactive", "active", "suspended"],
      default: "inactive",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    address: { type: addressSchema, required: false },

    kyc: {
      status: {
        type: String,
        enum: ["unverified", "pending", "approved", "rejected"],
        default: "unverified",
      },
      documentUrl: String,
    },

    disputes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dispute" }],

    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },

    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.role;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.role;
        return ret;
      },
    },
  }
);

// Export the User model
module.exports = mongoose.model("User", userSchema);
