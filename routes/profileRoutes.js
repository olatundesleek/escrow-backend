const express = require("express");
const router = express.Router();
const {
  getProfileDetails,
  isAuthenticated,
} = require("../controllers/profileController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfileDetails);
router.get("/me", authMiddleware, isAuthenticated);
// router.get("/profile:username", authMiddleware);

module.exports = router;
