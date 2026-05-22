const express = require("express");
const router = express.Router();
const Track = require("../models/Track");
const { protect } = require("../middleware/authMiddleware");

// @route  POST /api/vault/save
router.post("/save", protect, async (req, res) => {
  try {
    const { audioUrl, inputType, voice, contentPreview, customName } = req.body;

    const newTrack = await Track.create({
      user: req.user._id,
      audioUrl,
      inputType,
      voice: voice || "Default Voice",
      // Use the custom provided name, or fallback to standard system metadata string
      contentPreview:
        customName || contentPreview || "Untitled Narration Track",
    });

    return res.status(201).json({ success: true, track: newTrack });
  } catch (error) {
    return res.status(500).json({ error: "Failed to write asset logs." });
  }
});

// @route  PUT /api/vault/tracks/:id/rename
router.put("/tracks/:id/rename", protect, async (req, res) => {
  try {
    const { customName } = req.body;
    const track = await Track.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { contentPreview: customName },
      { new: true },
    );
    if (!track) return res.status(404).json({ error: "Track not found." });
    return res.status(200).json({ success: true, track });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route  DELETE /api/vault/tracks/:id
router.delete("/tracks/:id", protect, async (req, res) => {
  try {
    const track = await Track.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!track)
      return res.status(404).json({ error: "Track record not found." });
    return res
      .status(200)
      .json({ success: true, message: "Asset dropped successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// @route  GET /api/vault/tracks
router.get("/tracks", protect, async (req, res) => {
  try {
    const tracks = await Track.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(tracks);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to extract storage track arrays." });
  }
});

module.exports = router;
