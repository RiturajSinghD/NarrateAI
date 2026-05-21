const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Ties the saved audio asset directly to the authenticated user account instance
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  inputType: {
    type: String,
    enum: ["text", "url", "doc"],
    required: true,
  },
  voice: {
    type: String,
    required: true,
  },
  contentPreview: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Track", TrackSchema);
