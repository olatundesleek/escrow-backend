const Joi = require("joi");
const Escrow = require("../models/Escrow");
const {
  createNewEscrow,
  acceptNewEscrow,
} = require("../services/escrowServices.js");

// Joi schemas
const createEscrowSchema = Joi.object({
  creatorRole: Joi.string().valid("buyer", "seller").required(),
  counterpartyEmail: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().required(),
  terms: Joi.array().items(Joi.string().required()).min(1).required(),
});

const updateEscrowSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  status: Joi.string().valid("pending", "completed", "disputed").optional(),
});

// Create a new escrow transaction
const createEscrow = async (req, res) => {
  const { error } = createEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  try {
    const creatorId = req.userId;
    const { creatorRole, counterpartyEmail, amount, description, terms } =
      req.body;

    const escrow = await createNewEscrow(
      creatorId,
      creatorRole,
      counterpartyEmail,
      amount,
      description,
      terms
    );

    return res.status(201).json({
      message: "Escrow created successfully",
      escrow,
    });
  } catch (err) {
    console.error("Create Escrow Error:", err);
    return res.status(500).json({
      message: "Error creating escrow",
      error: err.message || "Internal server error",
    });
  }
};

// Accept an escrow transaction
const acceptEscrow = async (req, res) => {
  const { escrowId } = req.body;
  if (!escrowId) {
    return res.status(400).json({
      message: "escrowId is required to accept an escrow",
    });
  }

  try {
    const userId = req.userId;
    const escrow = await acceptNewEscrow(userId, escrowId);

    return res.status(200).json({
      message: "Escrow accepted successfully",
      escrow,
    });
  } catch (err) {
    console.error("Accept Escrow Error:", err);
    return res.status(500).json({
      message: "Error accepting escrow",
      error: err.message || "Internal server error",
    });
  }
};

// Update an escrow transaction
const updateEscrow = async (req, res) => {
  const { error } = updateEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedEscrow = await Escrow.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedEscrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    return res.status(200).json({
      message: "Escrow updated successfully",
      escrow: updatedEscrow,
    });
  } catch (err) {
    console.error("Update Escrow Error:", err);
    return res.status(500).json({
      message: "Error updating escrow",
      error: err.message || "Internal server error",
    });
  }
};

// Get details of an escrow
const getEscrowDetails = async (req, res) => {
  try {
    const { escrowId } = req.params;
    if (!escrowId) {
      return res.status(400).json({ message: "escrowId is required" });
    }

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    return res.status(200).json({ escrow });
  } catch (err) {
    console.error("Get Escrow Details Error:", err);
    return res.status(500).json({
      message: "Error retrieving escrow details",
      error: err.message || "Internal server error",
    });
  }
};

module.exports = {
  createEscrow,
  updateEscrow,
  getEscrowDetails,
  acceptEscrow,
};
