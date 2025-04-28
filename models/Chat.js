const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Escrow",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true, // Ensure a sender is present for regular user messages
        },
        text: { type: String, required: true },
        system: { type: Boolean, default: false }, // Flag for system messages
        timestamp: { type: Date, default: Date.now },
      },
    ],
    chatActive: { type: Boolean, default: false },
    isDispute: { type: Boolean, default: false },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Mongoose middleware to add a system message when a new chat is created
chatSchema.pre("save", function (next) {
  if (this.isNew) {
    // Add a system message to the new chat when it's created
    this.messages.push({
      sender: null, // Null sender indicates a system message
      text: "Chat has been opened between the parties.",
      system: true, // System message flag
    });
  }
  next();
});

module.exports = mongoose.model("Chat", chatSchema);
