const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: String, trim: true },
    topicPost: {type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    seenBy: [{ type: String, trim: true}],
    lastMessageTime: { type: Date, default: Date.now } 
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;