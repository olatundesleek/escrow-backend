const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to create a new escrow
router.post('/escrow', authMiddleware.verifyToken, escrowController.createEscrow);

// Route to get escrow details by ID
router.get('/escrow/:id', authMiddleware.verifyToken, escrowController.getEscrowById);

// Route to update an existing escrow
router.put('/escrow/:id', authMiddleware.verifyToken, escrowController.updateEscrow);

// Route to get all escrows for a user
router.get('/escrows', authMiddleware.verifyToken, escrowController.getAllEscrows);

module.exports = router;