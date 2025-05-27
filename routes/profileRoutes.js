const express = require("express");
const router = express.Router();
const {
  getProfileDetails,
  isAuthenticated,
  getDashboardDetails,
} = require("../controllers/profileController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfileDetails);
router.get("/me", authMiddleware, isAuthenticated);

// route to get dahboard details
router.get("/dashboard", authMiddleware, getDashboardDetails);
// router.get("/profile:username", authMiddleware);

module.exports = router;
