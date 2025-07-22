const express = require("express");
const {
  register,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  confirmResetToken,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

//Route for user registration
router.post("/register", register);
// Route for user login
router.post("/login", login);
// Route for user logout
router.post("/logout", logout);

// Route for reseting password
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// change password
router.post("/change-password", authMiddleware, changePassword);

// Route for resending email verification
router.post("/send-verification-email", resendVerificationEmail);

// Route for confirming password reset token
router.get("/confirm-reset-token/:token", confirmResetToken);

// Route for email verfification
router.get("/verify-email/:token", verifyEmail);

// Route for token verification
// router.get('/verify', authController.verifyToken);

module.exports = router;
