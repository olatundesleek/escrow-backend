const Joi = require("joi");
const Escrow = require("../models/Transaction.js");
const {
  getTransaction,
  getTransactions,
} = require("../services/transactionServices.js");

// const getTransactionSchema = Joi.object({
//  // Assuming ID is a string, adjust if using ObjectId
// });
const getTransactionSchema = Joi.object({
  id: Joi.string().required(), // Assuming ID is a string, adjust if using ObjectId
});

// Create a new escrow transaction

const getTransaction = async (req, res) => {
  const { error } = getTransactionSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  const transaction = await getTransaction(req.params.id, req.userId);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  return res.status(200).json(transaction);
};

const getAllTransactions = async (req, res) => {
  const userId = req.userId;
  const query = req.query;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const status = query.status || "all";

  try {
    const transactions = await getAllTransactions(userId, page, limit, status);
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllTransactions,
  getTransaction,
};
