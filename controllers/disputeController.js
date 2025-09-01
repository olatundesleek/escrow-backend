const Joi = require("joi");
const createNewDispute = require("../services/disputeServices.js");
// const io = require("../server").io; // Import the io instance from server.js
// Joi schemas

const createDisputeSchema = Joi.object({
  escrowId: Joi.required(),
  reason: Joi.string().required(),
  files: Joi.string().optional(),
});

// Create Dispute

const createDispute = async (req, res) => {
  const { error } = createDisputeSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { escrowId, reason, files } = req.body;
    const userId = req.userId;

    console.log("Creating dispute for user:", userId, "and escrow:", escrowId);

    const dispute = await createNewDispute(userId, escrowId, reason, files);
    return res.status(201).json({
      success: true,
      message: "Dispute created successfully",
      dispute,
    });
  } catch (err) {
    console.error("Create Dispute Error:", err);
    return res.status(500).json({
      success: false,

      error: "Error creating dispute",
      message: err.message || "Internal server error",
    });
  }
};

const closeDispute = async (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
};

const getAllDisputes = async (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
};

module.exports = {
  createDispute,
  closeDispute,
  getAllDisputes,
};
