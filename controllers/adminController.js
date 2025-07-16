const Joi = require("joi");

const {
  getAdminDashboardData,
  getAllEscrows,
  adminGetEscrowById,
  getAllTransactions,
  getAllUsers,
  getUser,
  addFunds,
  getTransactionByReference,
  performUserAction,
  paymentSettingService,
} = require("../services/adminServices");

// Joi Schemas
const escrowQuerySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "active", "completed", "disputed")
    .optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const getEscrowDetailsSchema = Joi.object({
  id: Joi.string().required(), // Assuming ID is a string
});

const userActionSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  action: Joi.string().valid("activate", "suspend", "delete").required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const userParamSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
});

const dashboardRoleSchema = Joi.string()
  .valid("auditor", "super_admin", "customer_care")
  .required();

const paymentSettingSchema = Joi.object({
  fee: Joi.number(),
  merchant: Joi.string().valid("Paystack", "Flutterwave", "Bank Transfer"),
  currency: Joi.string().valid("USD", "EUR", "NGN"),
}).or("fee", "merchant", "currency"); // at least one of these must be present

const transactionSchema = Joi.object({
  reference: Joi.string().required(),
});

const addFundsSchema = Joi.object({
  amount: Joi.number().positive().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
});

// Controller: Dashboard
const getDashboardData = async (req, res) => {
  try {
    const subRole = req.subRole;

    const { error } = dashboardRoleSchema.validate(subRole);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const dashboardDetails = await getAdminDashboardData(subRole);
    res.status(200).json({
      message: "Dashboard details fetched successfully",
      dashboardDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching dashboard details", error });
  }
};

// Controller: Escrow
const getEscrows = async (req, res) => {
  try {
    const { error, value } = escrowQuerySchema.validate(req.query);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { status, page, limit } = value;

    const escrowDetails = await getAllEscrows({ status, page, limit });
    res.status(200).json({
      success: true,
      message: "Escrow details fetched successfully",
      escrowDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching escrow details",
      error,
    });
  }
};

const adminGetEscrowDetails = async (req, res) => {
  const { error } = getEscrowDetailsSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  const escrowId = req.params.id;

  try {
    const escrow = await adminGetEscrowById(escrowId);

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

// Controller: Transactions
const getTransactionsData = async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { page, limit } = value;

    const transactionDetails = await getAllTransactions({ page, limit });
    res.status(200).json({
      success: true,
      message: "Transaction details fetched successfully",
      transactionDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transaction details",
      error,
    });
  }
};

const getTransaction = async (req, res) => {
  const { error } = transactionSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  const reference = req.params.reference;

  try {
    const transaction = await getTransactionByReference(reference);

    return res.status(200).json({
      message: "Transaction details retrieved successfully",
      transaction,
    });
  } catch (err) {
    console.error("Get Transaction Details Error:", err);
    return res.status(err.statusCode || 500).json({
      message: "Error retrieving transaction details",
      error: err.message || "Internal server error",
    });
  }
};

// Controller: All Users
const getAllUsersData = async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { page, limit } = value;

    const userDetails = await getAllUsers({ page, limit });
    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      userDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error,
    });
  }
};

// Controller: Single User
const getUserData = async (req, res) => {
  try {
    const { error, value } = userParamSchema.validate(req.params);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { username } = value;

    const userDetails = await getUser(username);
    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      userDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error,
    });
  }
};

const userAction = async (req, res) => {
  const { error, value } = userActionSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const subRole = req.subRole;
    const action = await performUserAction(
      value.username,
      value.action,
      subRole
    );
    // Implement user action logic here
    res.status(200).json({
      success: true,
      message: action,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error performing user action",
      error,
    });
  }
};

// controller to add funds to a user's wallet
const addFundsToUserWallet = async (req, res) => {
  const { error } = addFundsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { amount, username } = req.body;

  try {
    const updatedWallet = await addFunds(amount, username);

    res.status(200).json({
      success: true,
      updatedWallet,
      message: ` ${amount} added to ${username}'s wallet successfully`,
    });
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: "Internal server error",
      message: error.message || "An error occurred while adding funds",
    });
  }
};

// Update payment settings in the database

const paymentSettings = async (req, res) => {
  const { error, value } = paymentSettingSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    if (!req.subRole || req.subRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can update payment settings",
      });
    }
    const { fee, merchant, currency } = value;
    console.log("Payment Settings:", fee, merchant, currency);
    // Validate the input
    if (fee == null || merchant == null || currency == null) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Update payment settings in the database
    const updatedSettings = await paymentSettingService(
      fee,
      merchant,
      currency
    );
    res.status(200).json({
      success: true,
      message: "Payment settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payment settings",
      error,
    });
  }
};

module.exports = {
  getDashboardData,
  getTransaction,
  getEscrows,
  getTransactionsData,
  getAllUsersData,
  getUserData,
  userAction,
  paymentSettings,
  adminGetEscrowDetails,
  addFundsToUserWallet,
};
