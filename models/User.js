const mongoose = require("mongoose");

// Define the address schema for better structure
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
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
  address: { type: addressSchema, required: false }, // Using addressSchema for detailed address
  kyc: {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    documentUrl: String,
  },
  createdAt: { type: Date, default: Date.now },
});

// Export the User model
module.exports = mongoose.model("User", userSchema);
