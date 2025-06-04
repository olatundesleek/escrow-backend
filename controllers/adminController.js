const Joi = require("joi");

const {
  getAdminDashboardData,
  getAllEscrows,
  getAllTransactions,
  getAllUsers,
  getUser,
} = require("../services/adminServices");

// Joi Schemas
const escrowQuerySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "active", "completed", "disputed")
    .optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
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
const getEscrowData = async (req, res) => {
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

// Controller: Transactions
const getTransactionData = async (req, res) => {
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

module.exports = {
  getDashboardData,
  getEscrowData,
  getTransactionData,
  getAllUsersData,
  getUserData,
};
