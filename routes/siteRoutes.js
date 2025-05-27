const express = require("express");
const router = express.Router();

const {
  getSiteSettings,
  updateSiteSettings,
} = require("../controllers/siteController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// Route to get site settings
router.get("/site/info", getSiteSettings);

// Route to get site frontpage content
// router.get("/site/frontpage", getSiteSettings);
// Route to update site settings
router.put("/settings", authMiddleware, isAdmin, updateSiteSettings);
// Route to enable maintenance mode
router.put(
  "/settings/maintenance",
  authMiddleware,
  isAdmin,
  updateSiteSettings
);

module.exports = router;
