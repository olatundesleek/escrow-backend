const Joi = require("joi");
const Escrow = require("../models/Transaction.js");
const {
  getTransaction,
  getTransactions,
} = require("../services/transactionService.js");

// const getTransactionSchema = Joi.object({
//  // Assuming ID is a string, adjust if using ObjectId
// });
const getTransactionSchema = Joi.object({
  reference: Joi.string().required(), // Assuming ID is a string, adjust if using ObjectId
});

// Create a new escrow transaction

const getUserTransaction = async (req, res) => {
  const { error } = getTransactionSchema.validate(req.params);
  try {
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({ message: "Validation error" });
  }

  try {
    const userId = req.userId;
    const reference = req.params.reference;
    if (!reference) {
      return res.status(400).json({ message: "Reference is required" });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const transaction = await getTransaction(reference, userId);

    return res.status(200).json({ success: true, transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getUserTransactions = async (req, res) => {
  const userId = req.userId;
  const query = req.query;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const status = query.status || "all";

  try {
    const transactions = await getTransactions(userId, page, limit, status);
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUserTransactions,
  getUserTransaction,
};
