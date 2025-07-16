const {
  getWalletBalance,
  addFundsToWallet,
} = require("../services/walletServices");
const joi = require("joi");

const addFundsSchema = joi.object({
  amount: joi.number().positive().required(),
});
const getWalletDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const walletDetails = await getWalletBalance(userId);
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

module.exports = {
  getWalletDetails,
  addWalletFunds,
};
