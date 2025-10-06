const {
  getWalletDetailsService,
  addFundsToWallet,
  addBankService,
  resolveBankService,
  requestWithdrawalService,
} = require("../services/walletServices");
const joi = require("joi");

const addFundsSchema = joi.object({
  amount: joi.number().positive().required(),
});
const bankDetailsSchema = joi.object({
  bankCode: joi.string().required(),
  accountNumber: joi.string().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Account number must be exactly 10 digits",
    "string.pattern.base": "Account number must contain only digits",
  }),
});

const resolveBankSchema = joi.object({
  bankCode: joi.string().required(),
  accountNumber: joi.string().length(10).pattern(/^\d+$/).required().messages({
    "string.length": "Account number must be exactly 10 digits",
    "string.pattern.base": "Account number must contain only digits",
  }),
});

const requestWithdrawalSchema = joi.object({
  amount: joi.number().positive().required(),
});

const getWalletDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const walletDetails = await getWalletDetailsService(userId);
    res.json({
      statusCode: 200,
      success: true,
      walletDetails,
      message: "Wallet details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    res.json({
      statusCode: error.statusCode || 500,
      success: false,
      error: "Internal server error",
    });
  }
};

const addWalletFunds = async (req, res) => {
  const { error } = addFundsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { amount } = req.body;

  try {
    const userId = req.userId;

    const addFundsResponse = await addFundsToWallet(userId, amount);
    return res.json({
      statusCode: 200,
      success: true,
      addFundsResponse,
      message: "Add Funds Process initiated successfully",
    });
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: "Internal server error" });
  }
};

const resolveBankDetails = async (req, res) => {
  const { error } = resolveBankSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: error.details[0].message,
    });
  }
  const { bankCode, accountNumber } = req.body;

  try {
    const userId = req.userId;
    const accountInfo = await resolveBankService(
      userId,
      bankCode,
      accountNumber
    );

    res.json({
      statusCode: 200,
      success: true,
      message: "Bank account resolved successfully",
      accountInfo: accountInfo, // Include the resolved account information
    });
  } catch (error) {
    console.error("Error resolving bank details:", error); // Log the error for debugging
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    res.status(statusCode).json({
      statusCode: statusCode,
      success: false,
      message: message,
    });
  }
};

const addBankDetails = async (req, res) => {
  // Input validation using Joi (or your preferred validation library)
  const { error } = bankDetailsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    // Extract user ID and bank details from the request body
    const userId = req.userId;
    const { bankCode, accountNumber, bankName } = req.body;

    // Call the addBankService to handle the business logic
    const bankDetails = await addBankService(userId, bankCode, accountNumber);

    // Send a success response with the bank details
    res.json({
      statusCode: 200,
      success: true,
      message: "Bank details added successfully",
      bankDetails: bankDetails, // Include the verified bank details here
    });
  } catch (error) {
    console.error("Error adding bank details:", error); // Log the error for debugging

    // Check if the error has a statusCode property (i.e., custom errors from service layer)
    const statusCode = error.statusCode || 500;
    error;
    const message = error.message || "Internal server error";

    // Respond with a meaningful error message and status code
    res.status(statusCode).json({
      statusCode: statusCode,
      success: false,
      error: error.error || "An error occurred",
      message: message,
    });
  }
};

const requestWithdrawal = async (req, res) => {
  const { error } = requestWithdrawalSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { amount } = req.body;

  try {
    const userId = req.userId;
    const withdrawalResponse = await requestWithdrawalService(userId, amount);
    return res.json({
      statusCode: 200,
      success: true,
      message: "Withdrawal request processed successfully",
      withdrawalResponse,
    });
  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: "Error processing withdrawal request",
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getWalletDetails,
  addWalletFunds,
  addBankDetails,
  resolveBankDetails,
  requestWithdrawal,
};
