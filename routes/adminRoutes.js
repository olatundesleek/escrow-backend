const express = require("express");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const {
  getDashboardData,
  getEscrowData,
  getTransactionData,
  getAllUsersData,
  getUserData,
} = require("../controllers/adminController");
const router = express.Router();

router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardData);
router.get("/admin/escrows", authMiddleware, isAdmin, getEscrowData);
router.get("/admin/transactions", authMiddleware, isAdmin, getTransactionData);
router.get("/admin/users", authMiddleware, isAdmin, getAllUsersData);
router.get("/admin/user/:username", authMiddleware, isAdmin, getUserData);

module.exports = router;
