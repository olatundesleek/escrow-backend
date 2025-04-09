const Joi = require('joi');
const { getUserById, updateUser, deleteUser, changeUserPassword, enable2FA } = require('../services/userService');

// Validation schemas
const updateProfileSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});

const enable2FASchema = Joi.object({
    secret: Joi.string().required(),
});

// Get profile details
async function getProfileDetails(req, res) {
    try {
        const userId = req.user.id;
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile details', error });
    }
}

// Update profile
async function updateProfile(req, res) {
    try {
        const { error } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const userId = req.user.id;
        const updatedData = req.body;
        const updatedUser = await updateUser(userId, updatedData);
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
}

// Change password
async function changePassword(req, res) {
    try {
        const { error } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        const result = await changeUserPassword(userId, oldPassword, newPassword);
        if (!result) {
            return res.status(400).json({ message: 'Invalid old password' });
        }
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
}

// Delete account
async function deleteAccount(req, res) {
    try {
        const userId = req.user.id;
        await deleteUser(userId);
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting account', error });
    }
}

// Enable 2FA
async function enableTwoFactorAuth(req, res) {
    try {
        const { error } = enable2FASchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const userId = req.user.id;
        const { secret } = req.body; // Assume secret is generated on the client side
        const result = await enable2FA(userId, secret);
        res.status(200).json({ message: '2FA enabled successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error enabling 2FA', error });
    }
}

module.exports = {
    getProfileDetails,
    updateProfile,
    changePassword,
    deleteAccount,
    enableTwoFactorAuth,
};