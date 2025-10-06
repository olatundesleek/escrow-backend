const axios = require("axios");

/**
 * Initialize a Paystack payment
 * @param {Object} paymentData - { amount, email, reference, [callback_url] }
 * @returns {Promise<Object>} - Paystack response
 */
async function initiateFlutterwavePayment(paymentData) {
  const url = "https://api.flutterwave.com/v3/charges?type=mobilemoneyghana";
  try {
    const response = await axios.post(url, paymentData, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

const initiateFlutterwaveWithdrawal = async (withdrawalData) => {
  const url = "https://api.flutterwave.com/v3/transfers";
  try {
    const response = await axios.post(url, withdrawalData, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

module.exports = {
  initiateFlutterwavePayment,
  initiateFlutterwaveWithdrawal,
};
