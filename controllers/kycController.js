// import crypto from "crypto";
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User.js");

const QOREID_WEBHOOK_SECRET = process.env.QOREID_WEBHOOK_SECRET;

// Update KYC Status via QoreID Webhook

const updateKycStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const signature = req.headers["x-verifyme-signature"];

    // 🔒 Verify QoreID webhook signature
    const generatedHash = crypto
      .createHmac("sha512", QOREID_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const hashBuffer = Buffer.from(generatedHash, "hex");
    const sigBuffer = Buffer.from(signature, "hex");

    if (
      hashBuffer.length !== sigBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, sigBuffer)
    ) {
      console.warn("Invalid QoreID signature");
      await session.abortTransaction();
      session.endSession();
      return res.status(401).send("Unauthorized");
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event_type;
    const verificationStatus = event?.status?.status;
    const identityData = event?.identity || {};
    const customerReference = event?.customerReference; // depends on your setup

    if (!customerReference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid QoreID webhook payload",
      });
    }

    // 🧾 Find user
    const user = await User.findOne({ customerReference }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 🧍 Compare names
    const nameMatches =
      user.firstName?.trim().toLowerCase() ===
        identityData?.firstName?.trim().toLowerCase() &&
      user.lastName?.trim().toLowerCase() ===
        identityData?.lastName?.trim().toLowerCase();

    // 🟢 Mark as verified if everything passes
    if (
      eventType === "verification_completed" &&
      verificationStatus === "verified" &&
      nameMatches
    ) {
      await User.findByIdAndUpdate(
        user._id,
        { $set: { "kyc.status": "verified" } },
        { session }
      );
      console.log(`✅ KYC verified for user ${user._id}`);
    } else {
      // ❌ If not approved or name mismatch → mark rejected
      await User.findByIdAndUpdate(
        user._id,
        { $set: { "kyc.status": "rejected" } },
        { session }
      );
      console.log(`❌ KYC rejected for user ${user._id}`);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "KYC status updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("🔥 KYC Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error processing KYC webhook",
      error: error.message,
    });
  }
};

module.exports = updateKycStatus;
