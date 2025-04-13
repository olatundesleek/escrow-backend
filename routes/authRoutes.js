const express = require("express");
const {
  register,
  login,
  logout,
  verifyEmail,
} = require("../controllers/authController");

const router = express.Router();

//Route for user registration
router.post("/register", register);
// Route for user login
router.post("/login", login);
// Route for user logout
router.post("/logout", logout);

// Route for email verfification
router.get("/verify-email/:token", verifyEmail);

// Route for token verification
// router.get('/verify', authController.verifyToken);

module.exports = router;
