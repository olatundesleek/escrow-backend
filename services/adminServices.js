const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Escrow = require("../models/Escrow");
const Dispute = require("../models/Dispute");

async function getAdminDashboardData(subRole) {
  try {
    const [
      totalUsers,
      totalTransactions,
      totalEscrows,
      totalDisputes,
      transactions,
      walletStats,
      escrowStatusStats,
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Escrow.countDocuments(),
      Dispute.countDocuments(),
      Transaction.find()
        .populate("user", "username")
        .sort({ createdAt: -1 })
        .limit(10),
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalAvailable: { $sum: "$balance" },
            totalLocked: { $sum: "$locked" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAvailable: 1,
            totalLocked: 1,
            total: { $add: ["$totalAvailable", "$totalLocked"] },
          },
        },
      ]),
      Escrow.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format wallet summary
    const walletSummary = walletStats[0] || {
      totalAvailable: 0,
      totalLocked: 0,
      total: 0,
    };

    // Normalize escrow status counts to include all possible statuses
    const escrowCounts = escrowStatusStats.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {
        pending: 0,
        active: 0,
        completed: 0,
        disputed: 0,
      }
    );

    // Base dashboard data
    let data = {
      totalUsers,
      totalDisputes,
      totalEscrows,
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        user: transaction.user.username,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      })),
      escrowStatus: escrowCounts,
    };

    // Add more details depending on admin subRole
    if (subRole === "auditor" || subRole === "super_admin") {
      data.totalTransactions = totalTransactions;
      data.wallet = walletSummary;
    }

    if (subRole === "customer_care") {
      data.totalTransactions = totalTransactions;
    }

    return {
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    };
  }
}

const getAllEscrows = async (params) => {
  try {
    const { status, username, page = 1, limit = 10 } = params;

    const query = {};

    if (status) query.status = status;

    if (username) {
      const user = await User.findOne({ username });

      if (!user) {
        // Return empty if username doesn't exist
        return {
          data: {
            escrows: [],
            totalPages: 0,
            currentPage: Number(page),
          },
        };
      }

      // Filter escrows by either creator or counterpartyEmail
      query.$or = [{ creator: user._id }, { counterpartyEmail: user.email }];
    }

    const totalEscrows = await Escrow.countDocuments(query);

    const escrows = await Escrow.find(query)
      .populate("creator")
      .populate("counterparty")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return {
      data: {
        escrows,
        totalPages: Math.ceil(totalEscrows / limit),
        currentPage: Number(page),
      },
    };
  } catch (error) {
    console.error("Error fetching all escrows:", error);
    return {
      error: error.message,
    };
  }
};

const getAllTransactions = async (params) => {
  try {
    const { page = 1, limit = 10 } = params;

    const totalTransactions = await Transaction.countDocuments();

    const transactions = await Transaction.find()
      .populate("user", "username")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return {
      data: {
        transactions,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: Number(page),
      },
    };
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return {
      error: error.message,
    };
  }
};

const getAllUsers = async (params) => {
  try {
    const { page = 1, limit = 10 } = params;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return {
      data: {
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: Number(page),
      },
    };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return {
      error: error.message,
    };
  }
};

const getUser = async (username) => {
  try {
    const user = await User.findOne({ username }, "-password")
      .populate("wallet")
      .populate("escrows")
      .populate("transactions");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

module.exports = {
  getAdminDashboardData,
  getAllEscrows,
  getAllTransactions,
  getAllUsers,
  getUser,
};
