const axios = require("axios");

/**
 * Initialize a Paystack payment
 * @param {Object} paymentData - { amount, email, reference, [callback_url] }
 * @returns {Promise<Object>} - Paystack response
 */
async function initializePayment(paymentData) {
  const url = "https://api.paystack.co/transaction/initialize";
  try {
    const response = await axios.post(url, paymentData, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

module.exports = initializePayment;
