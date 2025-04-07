const Joi = require('joi');
const Dispute = require('../models/Dispute');

// Joi schemas
const fileDisputeSchema = Joi.object({
    escrowId: Joi.string().required(),
    reason: Joi.string().min(10).required(),
});

// File a new dispute
exports.fileDispute = async (req, res) => {
    const { error } = fileDisputeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    try {
        const { escrowId, reason } = req.body;
        const dispute = new Dispute({ escrowId, reason, status: 'Pending' });
        await dispute.save();
        res.status(201).json({ message: 'Dispute filed successfully', dispute });
    } catch (error) {
        res.status(500).json({ message: 'Error filing dispute', error });
    }
};

// Get all disputes for a specific escrow
exports.getDisputesByEscrow = async (req, res) => {
    try {
        const disputes = await Dispute.find({ escrowId: req.params.escrowId });
        res.status(200).json(disputes);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving disputes', error });
    }
};

// Resolve a dispute
exports.resolveDispute = async (req, res) => {
    try {
        const { disputeId, resolution } = req.body;
        const dispute = await Dispute.findByIdAndUpdate(disputeId, { status: 'Resolved', resolution }, { new: true });
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }
        res.status(200).json({ message: 'Dispute resolved successfully', dispute });
    } catch (error) {
        res.status(500).json({ message: 'Error resolving dispute', error });
    }
};