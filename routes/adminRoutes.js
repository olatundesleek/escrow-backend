const express = require("express");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const {
  getDashboardData,
  getEscrowData,
  getTransactionData,
  getAllUsersData,
  getUserData,
  userAction,
  paymentSettings,
} = require("../controllers/adminController");
const router = express.Router();

router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardData);
router.get("/admin/escrows", authMiddleware, isAdmin, getEscrowData);
router.get("/admin/transactions", authMiddleware, isAdmin, getTransactionData);
router.get("/admin/users", authMiddleware, isAdmin, getAllUsersData);
router.get("/admin/user/:username", authMiddleware, isAdmin, getUserData);
router.get("/admin/user/:username", authMiddleware, isAdmin, getUserData);
router.post("/admin/user-action", authMiddleware, isAdmin, userAction);
router.put(
  "/admin/escrowpaymentsetting",
  authMiddleware,
  isAdmin,
  paymentSettings
);

module.exports = router;
