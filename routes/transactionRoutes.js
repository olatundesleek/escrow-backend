const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getTransaction,
} = require("../controllers/transactionController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Route to get all transactions for a user
router.get("/transactions", authMiddleware, getAllTransactions);

// Route to get a specific transaction by ID
router.get("/transaction/:reference", authMiddleware, getTransaction);

module.exports = router;
