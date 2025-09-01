const User = require("../models/User");
const Escrow = require("../models/Escrow");
const Transaction = require("../models/Transaction");
const Dispute = require("../models/Dispute");
const Wallet = require("../models/Wallet");
// const Chat = require("../models/Chat");
const bcrypt = require("bcrypt");

// get Dashboard details
async function getDashboardData(userId) {
  try {
    const userDashboardData = await User.findById(userId)
      .select("-password")
      .populate([
        { path: "escrows" },
        { path: "transactions" },
        { path: "disputes" },
        { path: "wallet" },
      ]);

    if (!userDashboardData) {
      throw new Error("User not found");
    }

    return {
      success: true,
      data: userDashboardData,
    };
  } catch (error) {
    throw new Error("Failed to fetch user data");
  }
}

// Get user by ID
async function getUserById(userId) {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const data = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      role: user.role,
      subRole: user.subRole,
      isVerified: user.isVerified,
      address: user.address,
      kyc: user.kyc,
    };

    return { success: true, data };
  } catch (error) {
    return { success: false, message: "Failed to retrieve user" };
  }
}

// Update user profile
async function updateUser(userId, updatedData) {
  try {
    const addressFields = ["street", "city", "state", "postalCode", "country"];
    const updatePayload = {};

    for (const [key, value] of Object.entries(updatedData)) {
      if (value === null || value === undefined || value === "") continue;

      if (addressFields.includes(key)) {
        updatePayload[`address.${key}`] = value; // put inside address
      } else {
        updatePayload[key] = value; // keep top-level
      }
    }

    const update = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select("-password -role");

    if (!update) {
      return { success: false, message: "User not found or update failed" };
    }

    return { success: true, data: update };
  } catch (error) {
    return { success: false, message: "Failed to update user profile" };
  }
}

// Delete user account
async function deleteUser(userId) {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete user" };
  }
}

// Change user password
async function changeUserPassword(userId, oldPassword, newPassword) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return { success: false, message: "Incorrect old password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    return { success: false, message: "Failed to change password" };
  }
}

// Enable 2FA
async function enable2FA(userId, secret) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    user.twoFactorAuth = { enabled: true, secret };
    await user.save();

    return { success: true, data: { enabled: true, secret } };
  } catch (error) {
    return { success: false, message: "Failed to enable 2FA" };
  }
}

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  changeUserPassword,
  enable2FA,
  getDashboardData,
};
