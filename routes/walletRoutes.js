const express = require("express");
const router = express.Router();
const {
  getWalletDetails,
  addWalletFunds,
  addBankDetails,
  resolveBankDetails,
} = require("../controllers/walletController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Route to get all transactions for a user
router.get("/wallet", authMiddleware, getWalletDetails);
router.post("/wallet/add-bank", authMiddleware, addBankDetails);
router.post("/wallet/resolve-bank", authMiddleware, resolveBankDetails);
router.put("/wallet/add-funds", authMiddleware, addWalletFunds);

module.exports = router;
