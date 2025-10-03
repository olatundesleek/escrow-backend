const Dispute = require("../models/Dispute");
const Escrow = require("../models/Escrow");

const createNewDispute = async (userId, escrowId, reason, files) => {
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    throw new Error("Escrow not found");
  }
  if (escrow.status !== "active") {
    throw new Error("Dispute can only be created for active escrows");
  }
  if (
    escrow.buyer.toString() !== userId &&
    escrow.seller.toString() !== userId
  ) {
    throw new Error("User not part of this escrow");
  }
  // check if the escrow payment status is paid else, dispute cant be created

  if (escrow.paymentStatus !== "paid") {
    throw new Error("Dispute can only be created for paid escrows");
  }

  // Check if there's already an open dispute for this escrow
  const existingDispute = await Dispute.findOne({
    escrow: escrowId,
    status: "open",
  });
  if (existingDispute) {
    throw new Error("An open dispute already exists for this escrow");
  }
  escrow.status = "disputed";
  await escrow.save();

  const complainee =
    escrow.buyer.toString() === userId ? escrow.seller : escrow.buyer;
  const newDispute = new Dispute({
    escrowId,
    complainant: userId,
    complainee: complainee,
    reason,
    files,
    status: "open",
  });
  await newDispute.save();
  escrow.status = "disputed";
  await escrow.save();
  return newDispute;
};

module.exports = createNewDispute;
