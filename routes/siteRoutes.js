const express = require("express");
const router = express.Router();

const {
  getSiteSettings,
  updateSiteSettings,
  maintenanceMode,
} = require("../controllers/siteController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Route to get site settings
router.get("/site/info", getSiteSettings);

// Route to get site frontpage content
// router.get("/site/frontpage", getSiteSettings);
// Route to update site settings
router.put(
  "/settings",
  upload.single("siteLogo"),
  authMiddleware,
  isAdmin,
  updateSiteSettings
);
// Route to enable maintenance mode
router.put("/settings/maintenance", authMiddleware, isAdmin, maintenanceMode);

module.exports = router;
