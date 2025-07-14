const express = require("express");
const router = express.Router();
const {
  getUserTransactions,
  getUserTransaction,
} = require("../controllers/transactionController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Route to get all transactions for a user
router.get("/transactions", authMiddleware, getUserTransactions);

// Route to get a specific transaction by ID
router.get("/transaction/:reference", authMiddleware, getUserTransaction);

module.exports = router;
