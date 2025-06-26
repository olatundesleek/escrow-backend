const express = require("express");
const router = express.Router();
const {
  createEscrow,
  getEscrowDetails,
  acceptEscrow,
  rejectEscrow,
  updateEscrow,
  getEscrows,
} = require("../controllers/escrowController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Route to create a new escrow
router.post("/escrow", authMiddleware, createEscrow);
router.get("/escrow", authMiddleware, getEscrows);

// Route to accept an escrow
router.post("/acceptescrow", authMiddleware, acceptEscrow);

// Route to reject an escrow
router.post("/rejectescrow", authMiddleware, rejectEscrow);

// Route to get escrow details by ID
router.get("/escrow/:id", authMiddleware, getEscrowDetails);

// Route to update an existing escrow
router.put("/escrow/:id", authMiddleware, updateEscrow);

// Route to get all escrows for a user
// router.get("/escrows", authMiddleware, getAllEscrows);

module.exports = router;
