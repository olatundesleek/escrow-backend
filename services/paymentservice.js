// const initiatePaystackPayment = require("./paystackService");

async function initiatePayment(amount, currency, userId) {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const payment = new Payment({
      amount,
      currency,
      userId,
      status: "initiated",
    });

    await payment.save({ session });
    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Failed to initiate payment: " + error.message);
  }
}

module.exports = {
  initiatePayment,
  confirmPayment,
  sendCreateEscrowEmail,
  sendReceiveEscrowEmail,
  getEscrowById,
  acceptNewEscrow,
  getEscrowsByUserId,
  getAllEscrows,
  updateEscrowStatus,
};
