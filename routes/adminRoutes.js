const express = require("express");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const {
  getDashboardData,
  getEscrowData,
} = require("../controllers/adminController");
const router = express.Router();

router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardData);
router.get("/admin/escrows", authMiddleware, isAdmin, getEscrowData);

module.exports = router;
