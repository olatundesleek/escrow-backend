const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get user by ID
async function getUserById(userId) {
    try {
        const user = await User.findById(userId).select('-password'); // Exclude password from the result
        return user;
    } catch (error) {
        throw new Error('Error fetching user by ID');
    }
}

// Update user profile
async function updateUser(userId, updatedData) {
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');
        return updatedUser;
    } catch (error) {
        throw new Error('Error updating user profile');
    }
}

// Delete user account
async function deleteUser(userId) {
    try {
        await User.findByIdAndDelete(userId);
    } catch (error) {
        throw new Error('Error deleting user account');
    }
}

// Change user password
async function changeUserPassword(userId, oldPassword, newPassword) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return false; // Old password is incorrect
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return true;
    } catch (error) {
        throw new Error('Error changing user password');
    }
}

// Enable 2FA
async function enable2FA(userId, secret) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.twoFactorAuth = { enabled: true, secret };
        await user.save();
        return { enabled: true, secret };
    } catch (error) {
        throw new Error('Error enabling 2FA');
    }
}

module.exports = {
    getUserById,
    updateUser,
    deleteUser,
    changeUserPassword,
    enable2FA,
};