const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    email: { type: String, trim: true },
    type: { type: String, enum: ["Bug", "Suggestion", "Other"] },
    isResolved: { type: Boolean, default: false },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;