const express = require("express");
const router = express.Router();
const {
  getWalletDetails,
  addWalletFunds,
} = require("../controllers/walletController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Route to get all transactions for a user
router.get("/wallet", authMiddleware, getWalletDetails);
router.put("/wallet/add-funds", authMiddleware, addWalletFunds);

module.exports = router;
