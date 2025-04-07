const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to file a dispute
router.post('/file', authMiddleware.verifyToken, disputeController.fileDispute);

// Route to get all disputes for a user
router.get('/', authMiddleware.verifyToken, disputeController.getUserDisputes);

// Route to resolve a dispute
router.put('/resolve/:id', authMiddleware.verifyToken, disputeController.resolveDispute);

// Route to get dispute details
router.get('/:id', authMiddleware.verifyToken, disputeController.getDisputeDetails);

module.exports = router;