const Joi = require('joi');
const Escrow = require('../models/Escrow');

// Joi schemas
const createEscrowSchema = Joi.object({
    amount: Joi.number().positive().required(),
    buyerId: Joi.string().required(),
    sellerId: Joi.string().required(),
});

const updateEscrowSchema = Joi.object({
    amount: Joi.number().positive(),
    status: Joi.string().valid('pending', 'completed', 'disputed'),
});

// Create a new escrow transaction
exports.createEscrow = async (req, res) => {
    const { error } = createEscrowSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    try {
        const { amount, buyerId, sellerId } = req.body;
        const newEscrow = new Escrow({ amount, buyer: buyerId, seller: sellerId });
        await newEscrow.save();
        res.status(201).json({ message: 'Escrow created successfully', escrow: newEscrow });
    } catch (error) {
        res.status(500).json({ message: 'Error creating escrow', error });
    }
};

// Update an existing escrow transaction
exports.updateEscrow = async (req, res) => {
    const { error } = updateEscrowSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedEscrow = await Escrow.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedEscrow) {
            return res.status(404).json({ message: 'Escrow not found' });
        }
        res.status(200).json({ message: 'Escrow updated successfully', escrow: updatedEscrow });
    } catch (error) {
        res.status(500).json({ message: 'Error updating escrow', error });
    }
};

// Retrieve escrow details
exports.getEscrowDetails = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            return res.status(404).json({ message: 'Escrow not found' });
        }
        res.status(200).json({ escrow });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving escrow details', error });
    }
};