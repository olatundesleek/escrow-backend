const Transaction = require("../models/Transaction");

const addTransaction = async (transactionData) => {
  try {
    const transaction = new Transaction(transactionData);
    await transaction.save();
    return transaction;
  } catch (error) {
    throw error;
  }
};

module.exports = addTransaction;
