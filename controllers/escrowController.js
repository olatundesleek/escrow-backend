const Joi = require("joi");
const Escrow = require("../models/Escrow");
const {
  createNewEscrow,
  acceptNewEscrow,
} = require("../services/escrowServices");

// Joi schemas
const createEscrowSchema = Joi.object({
  // creatorId: Joi.string().required(), // Added creatorId
  creatorRole: Joi.string().valid("buyer", "seller").required(), // Role can either be buyer or seller
  counterpartyEmail: Joi.string().email().required(), // Counterparty email validation
  amount: Joi.number().positive().required(), // Amount should be a positive number
  description: Joi.string().required(), // Optional description
  terms: Joi.array().items(Joi.string().required()).min(1).required(), // Terms must be an array of strings and cannot be empty
});

const updateEscrowSchema = Joi.object({
  amount: Joi.number().positive().optional(), // Amount can be updated, but must be positive
  status: Joi.string().valid("pending", "completed", "disputed").optional(), // Status should be one of the valid values
});

// Create a new escrow transaction
const createEscrow = async (req, res) => {
  const { error } = createEscrowSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }

  try {
    const creatorId = req.userId;
    const { creatorRole, counterpartyEmail, amount, description, terms } =
      req.body;

    // Create a new escrow using the validated data
    const escrow = await createNewEscrow(
      creatorId,
      creatorRole,
      counterpartyEmail,
      amount,
      description,
      terms
    );

    res
      .status(201)
      .json({ message: "Escrow created successfully", escrow: escrow });
  } catch (error) {
    res.status(500).json({ message: "Error creating escrow", error });
  }
};

const acceptEscrow = async (req, res) => {
  // const { error } = createEscrowSchema.validate(req.body);
  // if (error) {
  //   return res
  //     .status(400)
  //     .json({ message: "Validation error", details: error.details });
  // }

  try {
    const userId = req.userId;
    const escrowId = req.body.escrowId;

    // Create a new escrow using the validated data
    const escrow = await acceptNewEscrow(userId, escrowId);

    res
      .status(201)
      .json({ message: "Escrow accepted successfully", escrow: escrow });
  } catch (error) {
    res.status(500).json({ message: "Error accepting escrow", error });
  }
};

// Update an existing escrow transaction
const updateEscrow = async (req, res) => {
  const { error } = updateEscrowSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", details: error.details });
  }

  try {
    const { id } = req.params;
    const updates = req.body;

    // Find and update the escrow
    const updatedEscrow = await Escrow.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedEscrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    res
      .status(200)
      .json({ message: "Escrow updated successfully", escrow: updatedEscrow });
  } catch (error) {
    res.status(500).json({
      message: "Error updating escrow",
      error: error.message || "Unknown error occurred",
    });
  }
};

// Retrieve escrow details
const getEscrowDetails = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }
    res.status(200).json({ escrow });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving escrow details", error });
  }
};

module.exports = {
  createEscrow,
  updateEscrow,
  getEscrowDetails,
  acceptEscrow,
};
