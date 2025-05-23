const {
  getAdminDashboardData,
  getAllEscrows,
} = require("../services/adminServices");

const getDashboardData = async (req, res) => {
  try {
    const subRole = req.subRole;

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

const getEscrowData = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    console.log("Query Params:", req.query);

    const escrowDetails = await getAllEscrows({
      status,
      page,
      limit,
    });
    res.status(200).json({
      success: true,
      message: "Escrow details fetched successfully",
      escrowDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching escrow details",
        error,
      });
  }
};

module.exports = { getDashboardData, getEscrowData };
