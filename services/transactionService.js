const moongose = require("mongoose");
const Transaction = require("../models/Transaction");

const getTransaction = async (reference, userId) => {
  console.log(
    "Fetching transaction with reference:",
    reference,
    "for user:",
    userId
  );
  try {
    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }
    if (transaction.user.toString() !== userId) {
      const error = new Error("cannot access this transaction");
      error.statusCode = 403;
      throw error;
    }
    return transaction;
  } catch (error) {
    throw error;
  }
};

const getTransactions = async (
  userId,
  page = 1,
  limit = 10,
  status = "all"
) => {
  try {
    const query = { user: userId };
    if (status !== "all") {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return transactions;
  } catch (error) {
    throw error;
  }
};

const adminGetUsersTransactions = async (
  page = 1,
  limit = 10,
  status = "all"
) => {
  try {
    const query = {};
    if (status !== "all") {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return transactions;
  } catch (error) {
    throw error;
  }
};

const adminGetTransactionByReference = async (reference) => {
  try {
    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getTransaction,
  getTransactions,
  adminGetUsersTransactions,
  adminGetTransactionByReference,
};
