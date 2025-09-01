const express = require("express");
const router = express.Router();
const {
  createDispute,
  closeDispute,
  getAllDisputes,
} = require("../controllers/disputeController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Route to create a new dispute
router.post("/dispute-create", authMiddleware, createDispute);

// Route to close a dispute
router.post("/dispute-close", authMiddleware, closeDispute);

// Route to get all disputes for a user
router.get("/disputes", authMiddleware, getAllDisputes);
module.exports = router;
