const mongoose = require("mongoose");
const Escrow = require("../models/Escrow");
const User = require("../models/User");
const Chat = require("../models/Chat");
const {
  sendCreateEscrowEmail,
  sendReceiveEscrowEmail,
} = require("../Email/email");

async function createNewEscrow(
  creatorId,
  creatorRole,
  counterpartyEmail,
  amount,
  category,
  escrowfeepayment,
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
      category,
      escrowfeepayment,
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
        creatorEmail,
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

    // Update escrow parties and status
    escrow.counterparty = userId;
    escrow[escrow.creatorRole] = escrow.creator;
    escrow[oppositeRole] = userId;
    escrow.status = "active";

    // CREATE chat when escrow is accepted
    const newChat = await Chat.create({
      escrow: escrow._id,
      participants: [escrow.creator, userId],
      chatActive: true,
    });

    //  Link chat to escrow
    escrow.chat = newChat._id;
    escrow.chatActive = true;

    await escrow.save();

    // Populate the chat field when returning the escrow
    const populatedEscrow = await Escrow.findById(escrow._id).populate("chat"); // Populating the chat field

    return populatedEscrow;
  } catch (error) {
    console.error("Error in acceptNewEscrow:", error.message);
    throw new Error("Failed to accept escrow: " + error.message);
  }
}

// async function getEscrowById(escrowId) {
//   try {
//     const escrow = await Escrow.findById(escrowId).populate("chat");
//     if (!escrow) throw new Error("Escrow not found");

//     return escrow;
//   } catch (error) {
//     console.error("Error in getEscrowById:", error.message);
//     throw new Error("Failed to retrieve escrow: " + error.message);
//   }
// }
async function getEscrowById(escrowId, userId) {
  if (!mongoose.Types.ObjectId.isValid(escrowId)) {
    throw new Error("Invalid escrow ID format");
  }
  try {
    const escrow = await Escrow.findById(escrowId).populate("chat");
    if (!escrow) throw new Error("Escrow not found");

    console.log("this is the escrow creator id", escrow.creator.toString());
    console.log("this is the logged in user id", userId);

    if (userId !== escrow.creator.toString()) {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      console.log(
        "this is the logged in user email" + user.email.toLowerCase(),
        "this is the logged in escrow counterparty email" +
          escrow.counterpartyEmail.toLowerCase()
      );

      if (
        user.email.toLowerCase() !== escrow.counterpartyEmail.toLowerCase() &&
        user.role !== "admin"
      ) {
        throw new Error(
          "Unauthorized: You do not have permission to access this escrow"
        );
      }
    }
    return escrow;
  } catch (error) {
    console.error("Error in getEscrowById:", error.message);
    throw new Error("Failed to retrieve escrow: " + error.message);
  }
}

module.exports = {
  createNewEscrow,
  acceptNewEscrow,
  getEscrowById,
};
