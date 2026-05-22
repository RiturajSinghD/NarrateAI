const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { extractArticleText } = require("../services/scraperService");
const { synthesizeTextToFile } = require("../services/ttsService");
const { protect } = require("../middleware/authMiddleware");

// Setup tracking directories locally
const publicDirPath = path.join(__dirname, "../public");
const uploadsDirPath = path.join(__dirname, "../uploads");
const upload = multer({ dest: uploadsDirPath });

//ROUTE 1: Main Audio Generator Pipeline
router.post(
  "/generate-audio",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const { text, url, type, voice } = req.body;
      let textToNarrate = "";

      console.log(
        `Audio compilation processed for verified account: ${req.user.email}`,
      );

      if (type === "doc" || req.file) {
        if (!req.file) {
          return res
            .status(400)
            .json({ error: "No file payload detected in submission." });
        }
        try {
          const temporaryFilePath = req.file.path;
          textToNarrate = fs.readFileSync(temporaryFilePath, "utf-8");
          fs.unlinkSync(temporaryFilePath);

          if (!textToNarrate.trim()) {
            return res
              .status(422)
              .json({ error: "The uploaded document appears to be empty." });
          }
        } catch (fileReadError) {
          console.error("Document parsing failure:", fileReadError);
          return res
            .status(500)
            .json({ error: `Failed to open file: ${fileReadError.message}` });
        }
      } else if (type === "url") {
        if (!url || !url.trim().startsWith("http")) {
          return res.status(400).json({
            error: "A valid article URL starting with http/https is required.",
          });
        }
        try {
          textToNarrate = await extractArticleText(url);
          if (!textToNarrate) {
            return res.status(422).json({
              error:
                "Could not extract clean text content from this website link.",
            });
          }
        } catch (scrapeError) {
          console.error("Scraping failure:", scrapeError);
          return res.status(500).json({
            error: `Failed to parse web link: ${scrapeError.message}`,
          });
        }
      } else {
        if (!text || text.trim() === "") {
          return res.status(400).json({ error: "Text content is required." });
        }
        textToNarrate = text;
      }

      const truncatedText = textToNarrate.substring(0, 4000);
      const fileName = `speech-${Date.now()}.mp3`;
      const filePath = path.join(publicDirPath, fileName);
      const targetVoice = voice || "en-US-AvaNeural";

      await synthesizeTextToFile(truncatedText, targetVoice, filePath);

      const audioUrl = `http://localhost:${process.env.PORT || 5000}/public/${fileName}`;
      return res.status(200).json({ audioUrl });
    } catch (error) {
      console.error("Server audio exception:", error);
      return res.status(500).json({ error: "Failed to process audio asset." });
    }
  },
);

// ROUTE 2: Voice Actor Sample Previews
router.post("/preview-voice", async (req, res) => {
  try {
    const { voice, sampleText } = req.body;
    if (!voice || !sampleText) {
      return res.status(400).json({ error: "Voice settings are required." });
    }

    const fileName = `preview-${voice.replace(/[^a-zA-Z0-9]/g, "")}.mp3`;
    const filePath = path.join(publicDirPath, fileName);

    if (fs.existsSync(filePath)) {
      const audioUrl = `http://localhost:${process.env.PORT || 5000}/public/${fileName}`;
      return res.status(200).json({ audioUrl });
    }

    await synthesizeTextToFile(sampleText, voice, filePath);
    const audioUrl = `http://localhost:${process.env.PORT || 5000}/public/${fileName}`;
    return res.status(200).json({ audioUrl });
  } catch (error) {
    console.error("Preview configuration exception:", error);
    return res.status(500).json({ error: "Server error processing sample." });
  }
});

module.exports = router;
