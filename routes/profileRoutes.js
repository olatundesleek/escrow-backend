const express = require("express");
const router = express.Router();
const { getProfileDetails } = require("../controllers/profileController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfileDetails);
// router.get("/profile:username", authMiddleware);

module.exports = router;
