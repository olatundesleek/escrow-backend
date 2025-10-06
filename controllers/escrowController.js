const Joi = require("joi");
const Escrow = require("../models/Escrow");
const {
  createNewEscrow,
  acceptNewEscrow,
  rejectNewEscrow,
  getEscrowById,
  getAllEscrows,
} = require("../services/escrowServices.js");
const io = require("../server").io; // Import the io instance from server.js
// Joi schemas
const createEscrowSchema = Joi.object({
  creatorRole: Joi.string().valid("buyer", "seller").required(),
  counterpartyEmail: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().required(),
  escrowfeepayment: Joi.string().valid("buyer", "seller", "split").required(),
  description: Joi.string().required(),
  terms: Joi.array().items(Joi.string().required()).min(1).required(),
});

const updateEscrowSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  status: Joi.string().valid("pending", "completed", "disputed").optional(),
});

// Schema for accepting an escrow transaction
const acceptEscrowSchema = Joi.object({
  escrowId: Joi.string().required(), // Assuming ID is a string, adjust if using ObjectId
});

// Schema for rejecting an escrow transaction
const rejectEscrowSchema = Joi.object({
  escrowId: Joi.string().required(), // Assuming ID is a string, adjust if using ObjectId
});

const getEscrowDetailsSchema = Joi.object({
  id: Joi.string().required(), // Assuming ID is a string, adjust if using ObjectId
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
    const {
      creatorRole,
      counterpartyEmail,
      amount,
      description,
      category,
      escrowfeepayment,
      terms,
    } = req.body;

    const escrow = await createNewEscrow(
      creatorId,
      creatorRole,
      counterpartyEmail,
      amount,
      category,
      escrowfeepayment,
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
      error: "Error creating escrow",
      message: err.message || "Internal server error",
    });
  }
};

const getEscrows = async (req, res) => {
  const userId = req.userId;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const paymentStatus = req.query.paymentStatus || "all";
    console.log("payment from query is", req.query.paymentStatus);
    const status = req.query.status || "all";

    // Delegate logic to service
    const { data, total, totalPages } = await getAllEscrows(userId, {
      page,
      limit,
      status,
      paymentStatus,
    });

    console.log({ page, limit, status, paymentStatus });

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No escrows found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Escrows retrieved successfully",
      escrows: data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error("Get Escrows Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
      error: "Error retrieving escrows",
    });
  }
};

// Accept an escrow transaction
const acceptEscrow = async (req, res) => {
  const { error } = acceptEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

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
      message: err.message || "Internal server error",
      error: "Error accepting escrow",
    });
  }
};

// Reject an escrow transaction
const rejectEscrow = async (req, res) => {
  const { error } = rejectEscrowSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }
  const { escrowId } = req.body;
  if (!escrowId) {
    return res.status(400).json({
      success: false,
      message: "escrowId is required to reject an escrow",
    });
  }
  try {
    const userId = req.userId;
    const escrow = await rejectNewEscrow(userId, escrowId);

    return res.status(200).json({
      success: true,
      message: "Escrow Rejected Successfully",
      escrow,
    });
  } catch (err) {
    console.error("Reject Escrow Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
      error: "Error rejecting escrow",
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
  const { error } = getEscrowDetailsSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  const escrowId = req.params.id;
  const userId = req.userId;

  try {
    const escrow = await getEscrowById(escrowId, userId);

    return res.status(200).json({
      message: "Escrow details retrieved successfully",
      escrow,
    });
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
  getEscrows,
  updateEscrow,
  getEscrowDetails,
  acceptEscrow,
  rejectEscrow,
};
