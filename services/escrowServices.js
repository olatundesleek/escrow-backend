const mongoose = require("mongoose");

const {
  sendCreateEscrowEmail,
  sendReceiveEscrowEmail,
} = require("../Email/email");
const Escrow = require("../models/Escrow");
const User = require("../models/User");

async function createNewEscrow(
  creatorId,
  creatorRole,
  counterpartyEmail,
  amount,
  description,
  terms
) {
  try {
    if (creatorRole !== "buyer" && creatorRole !== "seller") {
      throw new Error('Invalid creator role. Must be "buyer" or "seller".');
    }

    if (!terms || terms.length === 0) {
      throw new Error("Escrow must include terms");
    }

    const user = await User.findById(creatorId);
    if (!user) throw new Error("User not found");

    const creatorFirstName = user.firstname;
    const creatorEmail = user.email.toLowerCase();
    const counterEmail = counterpartyEmail.toLowerCase();

    if (creatorEmail === counterEmail) {
      throw new Error(
        "You cannot create an escrow with your own email address. Please enter the email of the other party involved in the transaction."
      );
    }

    const escrow = new Escrow({
      creator: creatorId,
      creatorRole,
      counterpartyEmail: counterEmail,
      amount,
      description,
      terms,
      status: "pending",
    });

    await escrow.save();

    const escrowId = escrow._id;
    const createdAt = escrow.createdAt;

    // Send email to the creator
    try {
      await sendCreateEscrowEmail(
        creatorFirstName,
        escrowId,
        amount,
        createdAt,
        creatorRole,
        counterEmail,
        description
      );
    } catch (emailError) {
      console.error("Failed to send creator email:", emailError.message);
    }

    // Try sending to counterparty
    try {
      const counterpartyUser = await User.findOne({ email: counterEmail });
      const counterpartyFirstName = counterpartyUser
        ? counterpartyUser.firstname
        : "User";

      await sendReceiveEscrowEmail(
        creatorFirstName,
        counterpartyFirstName,
        escrowId,
        amount,
        createdAt,
        creatorRole,
        description,
        terms,
        counterEmail
      );
    } catch (emailError) {
      console.error("Failed to send counterparty email:", emailError.message);
    }

    return escrow;
  } catch (error) {
    console.error("Error in createNewEscrow:", error.message);
    throw new Error("Failed to create escrow: " + error.message);
  }
}

async function acceptNewEscrow(userId, escrowId) {
  if (!mongoose.Types.ObjectId.isValid(escrowId)) {
    throw new Error("Invalid escrow ID format");
  }

  try {
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) throw new Error("Escrow not found");
    if (escrow.status === "active") throw new Error("Escrow already accepted");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (user.email.toLowerCase() !== escrow.counterpartyEmail.toLowerCase()) {
      throw new Error(
        "Unauthorized: Your email does not match the counterparty email"
      );
    }

    const oppositeRole = escrow.creatorRole === "buyer" ? "seller" : "buyer";

    escrow.counterparty = userId;
    escrow[escrow.creatorRole] = escrow.creator;
    escrow[oppositeRole] = userId;
    escrow.status = "active";

    await escrow.save();

    return escrow;
  } catch (error) {
    console.error("Error in acceptNewEscrow:", error.message);
    throw new Error("Failed to accept escrow: " + error.message);
  }
}

module.exports = {
  createNewEscrow,
  acceptNewEscrow,
};
