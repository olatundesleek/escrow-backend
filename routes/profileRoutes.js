const express = require("express");
const router = express.Router();
const {
  getProfileDetails,
  isAuthenticated,
  getDashboardDetails,
  updateProfile,
} = require("../controllers/profileController");
const upload = require("../middleware/upload");

const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfileDetails);
router.get("/me", authMiddleware, isAuthenticated);

router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfile
);

// route to get dahboard details
router.get("/dashboard", authMiddleware, getDashboardDetails);
// router.get("/profile:username", authMiddleware);

module.exports = router;
