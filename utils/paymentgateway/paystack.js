const axios = require("axios");

/**
 * Initialize a Paystack payment
 * @param {Object} paymentData - { amount, email, reference, [callback_url] }
 * @returns {Promise<Object>} - Paystack response
 */
async function initiatePaystackPayment(paymentData) {
  console.log("Initiating Paystack payment with data:", paymentData);
  if (
    !paymentData ||
    !paymentData.amount ||
    !paymentData.email ||
    !paymentData.reference
  ) {
    throw new Error(
      "Invalid payment data. Amount, email, and reference are required."
    );
  }
  const url = "https://api.paystack.co/transaction/initialize";
  try {
    const response = await axios.post(url, paymentData, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Paystack initialization response:", response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

const initializePaystackWithdrawal = async (withdrawalData) => {
  console.log("Initiating Paystack withdrawal with data:", withdrawalData);

  // Validate input
  if (
    !withdrawalData ||
    !withdrawalData.amount ||
    !withdrawalData.recipient ||
    !withdrawalData.reference
  ) {
    const err = new Error(
      "Invalid withdrawal data. Amount, recipient, and reference are required."
    );
    err.statusCode = 400;
    throw err;
  }

  const url = "https://api.paystack.co/transfer";

  try {
    // Ensure amount is in kobo (Paystack expects integer)
    const payload = {
      ...withdrawalData,
      Amount:
        withdrawalData.amount < 1000
          ? withdrawalData.amount * 100 // if caller passed naira
          : withdrawalData.amount, // if already in kobo
    };

    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return data?.data || data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      error.message ||
      "Error initiating Paystack withdrawal";

    const err = new Error(message);
    err.statusCode = error.response?.status || 502;
    throw err;
  }
};

module.exports = {
  initiatePaystackPayment,
  initializePaystackWithdrawal,
};
