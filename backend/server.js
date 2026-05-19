const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Service Module Imports
const { extractArticleText } = require("./services/scraperService");
const { synthesizeTextToFile } = require("./services/ttsService");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const publicDirPath = path.join(__dirname, "public");
if (!fs.existsSync(publicDirPath)) {
  fs.mkdirSync(publicDirPath, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Intercept streaming byte-range checks
app.use("/public", (req, res, next) => {
  if (req.headers.range === "bytes=0-") {
    delete req.headers.range;
  }
  next();
});

app.use("/public", express.static(publicDirPath));

// ENDPOINT 1: Main Audio Generator
app.post("/api/generate-audio", async (req, res) => {
  try {
    const { text, url, type, voice } = req.body;
    let textToNarrate = "";

    if (type === "url") {
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
        return res
          .status(500)
          .json({ error: `Failed to parse web link: ${scrapeError.message}` });
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

    const audioUrl = `http://localhost:${PORT}/public/${fileName}`;
    return res.status(200).json({ audioUrl });
  } catch (error) {
    console.error("Server audio exception:", error);
    return res.status(500).json({ error: "Failed to process audio asset." });
  }
});

// ENDPOINT 2: Voice Actor Sample Previews
app.post("/api/preview-voice", async (req, res) => {
  try {
    const { voice, sampleText } = req.body;
    if (!voice || !sampleText) {
      return res.status(400).json({ error: "Voice settings are required." });
    }

    const fileName = `preview-${voice.replace(/[^a-zA-Z0-9]/g, "")}.mp3`;
    const filePath = path.join(publicDirPath, fileName);

    if (fs.existsSync(filePath)) {
      const audioUrl = `http://localhost:${PORT}/public/${fileName}`;
      return res.status(200).json({ audioUrl });
    }

    await synthesizeTextToFile(sampleText, voice, filePath);

    const audioUrl = `http://localhost:${PORT}/public/${fileName}`;
    return res.status(200).json({ audioUrl });
  } catch (error) {
    console.error("Preview configuration exception:", error);
    return res.status(500).json({ error: "Server error processing sample." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API actively running on http://localhost:${PORT}`);
});
