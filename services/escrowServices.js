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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (creatorRole !== "buyer" && creatorRole !== "seller") {
      throw new Error('Invalid creator role. Must be "buyer" or "seller".');
    }

    if (!terms || terms.length === 0) {
      throw new Error("Escrow must include terms");
    }

    const user = await User.findById(creatorId).session(session);
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

    await escrow.save({ session });

    user.escrows.push(escrow._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send emails outside the transaction
    try {
      await sendCreateEscrowEmail(
        creatorFirstName,
        escrow._id,
        amount,
        escrow.createdAt,
        creatorRole,
        creatorEmail,
        description
      );
    } catch (emailError) {
      console.error("Failed to send creator email:", emailError.message);
    }

    try {
      const counterpartyUser = await User.findOne({ email: counterEmail });
      const counterpartyFirstName = counterpartyUser
        ? counterpartyUser.firstname
        : "User";

      await sendReceiveEscrowEmail(
        creatorFirstName,
        counterpartyFirstName,
        escrow._id,
        amount,
        escrow.createdAt,
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
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createNewEscrow:", error.message);
    throw new Error("Failed to create escrow: " + error.message);
  }
}

async function acceptNewEscrow(userId, escrowId) {
  if (!mongoose.Types.ObjectId.isValid(escrowId)) {
    throw new Error("Invalid escrow ID format");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const escrow = await Escrow.findById(escrowId).session(session);
    if (!escrow) throw new Error("Escrow not found");
    if (escrow.status === "active") throw new Error("Escrow already accepted");

    const user = await User.findById(userId).session(session);
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

    const newChat = await Chat.create(
      [
        {
          escrow: escrow._id,
          participants: [escrow.creator, userId],
          chatActive: true,
        },
      ],
      { session }
    );

    escrow.chat = newChat[0]._id;
    escrow.chatActive = true;

    await escrow.save({ session });

    user.escrows.push(escrow._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedEscrow = await Escrow.findById(escrow._id).populate("chat");

    return populatedEscrow;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in acceptNewEscrow:", error.message);
    throw new Error("Failed to accept escrow: " + error.message);
  }
}

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

async function getAllEscrows(userId) {
  try {
    const userEscrows = await User.findById(userId).populate("escrows");
    if (!userEscrows) throw new Error("User not found");

    return userEscrows.escrows;
  } catch (error) {
    console.error("Error in getEscrowAllEscrows:", error.message);
    throw new Error("Failed to retrieve all escrows: " + error.message);
  }
}

module.exports = {
  createNewEscrow,
  acceptNewEscrow,
  getEscrowById,
  getAllEscrows,
};
