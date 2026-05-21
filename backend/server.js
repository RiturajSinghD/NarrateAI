const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");

// Service Module Imports
const { extractArticleText } = require("./services/scraperService");
const { synthesizeTextToFile } = require("./services/ttsService");

// Authentication Gates & Controllers Imports
const { protect } = require("./middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  updateUserProfile,
} = require("./controllers/authController");

dotenv.config();

// Connect to MongoDB Atlas or Local instance
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("MongoDB Enterprise Data cluster linked successfully."),
  )
  .catch((err) => console.error("Database connection fault:", err));

const app = express();
const PORT = process.env.PORT || 5000;

// Set up public tracking directory for completed mp3 streams
const publicDirPath = path.join(__dirname, "public");
if (!fs.existsSync(publicDirPath)) {
  fs.mkdirSync(publicDirPath, { recursive: true });
}

//  Set up local scratch folder for temporary uploaded text files
const uploadsDirPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDirPath)) {
  fs.mkdirSync(uploadsDirPath, { recursive: true });
}

// Configure Multer engine middleware to target our scratch directory
const upload = multer({ dest: uploadsDirPath });

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

// ==========================================
// AUTHENTICATION ROUTING ENDPOINTS
// ==========================================
app.post("/api/auth/register", registerUser);
app.post("/api/auth/login", loginUser);
app.put("/api/auth/profile", protect, updateUserProfile);

// ==========================================
// CORE APPLICATION ENDPOINTS
// ==========================================

app.use("/api/vault", require("./routes/vaultRoutes"));

// ENDPOINT 1: Main Audio Generator (🚨 SECURED WITH JWT PROTECT MIDDLEWARE + FILE INTERCEPTOR)
app.post(
  "/api/generate-audio",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const { text, url, type, voice } = req.body;
      let textToNarrate = "";

      // Logging current user attached directly by your JWT middleware layer
      console.log(
        `Audio compilation processed for verified account: ${req.user.email}`,
      );

      // HANDLE TYPE: Document Upload Logic Matrix
      if (type === "doc" || req.file) {
        if (!req.file) {
          return res
            .status(400)
            .json({ error: "No file payload detected in submission." });
        }

        try {
          const temporaryFilePath = req.file.path;
          // Read string tokens from uploaded document (supports plaintext .txt, .md, etc.)
          textToNarrate = fs.readFileSync(temporaryFilePath, "utf-8");

          // Clean Up: Instantly remove temp file from disk storage to prevent pollution
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
        // HANDLE TYPE: Web URL Scraper Logic
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
        // HANDLE TYPE: Standard Text Block Fallback Input
        if (!text || text.trim() === "") {
          return res.status(400).json({ error: "Text content is required." });
        }
        textToNarrate = text;
      }

      // Pass parsed contents right down into the master processing worker sequence
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
  },
);

// ENDPOINT 2: Voice Actor Sample Previews (Left public for unauthenticated sample testing)
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
