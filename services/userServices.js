const User = require("../models/User");
const bcrypt = require("bcrypt");

// Get user by ID
async function getUserById(userId) {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, message: "Failed to retrieve user" };
  }
}

// Update user profile
async function updateUser(userId, updatedData) {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return { success: false, message: "User not found or update failed" };
    }

    return { success: true, data: updatedUser };
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
};
