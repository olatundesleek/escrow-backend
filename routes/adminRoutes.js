const express = require("express");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const {
  getDashboardData,
  getEscrows,
  adminGetEscrowDetails,
  getTransactionsData,
  getTransaction,
  getAllUsersData,
  getUserData,
  userAction,
  paymentSettings,
  addFundsToUserWallet,
} = require("../controllers/adminController");
const router = express.Router();

router.get("/admin/dashboard", authMiddleware, isAdmin, getDashboardData);
router.get("/admin/escrows", authMiddleware, isAdmin, getEscrows);
router.get("/admin/escrow/:id", authMiddleware, isAdmin, adminGetEscrowDetails);
router.get(
  "/admin/transaction/:reference",
  authMiddleware,
  isAdmin,
  getTransaction
);
router.get("/admin/transactions", authMiddleware, isAdmin, getTransactionsData);
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
// Admin Route to add funds to a user's wallet
router.put(
  "/admin/wallet/add-funds",
  authMiddleware,
  isAdmin,
  addFundsToUserWallet
);
module.exports = router;
