const mongoose = require("mongoose");

// Define the address schema
const addressSchema = new mongoose.Schema({
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
});

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    profilePicture: { type: String, default: "" },

    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["inactive", "active", "suspended", "deleted"],
      default: "inactive",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    subRole: {
      type: String,
      enum: ["customer_care", "auditor", "super_admin"],
    },
    address: { type: addressSchema, required: false },

    kyc: {
      status: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
      },
      documentUrl: String,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },

    escrows: [{ type: mongoose.Schema.Types.ObjectId, ref: "Escrow" }],

    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],

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
