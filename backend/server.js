const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

// 1. Load configurations
dotenv.config();

// 2. Initialize the app variable
const app = express();
const PORT = process.env.PORT || 5000;

// Auto-create 'public' directory if it doesn't exist on system boot
const publicDirPath = path.join(__dirname, "public");
if (!fs.existsSync(publicDirPath)) {
  fs.mkdirSync(publicDirPath, { recursive: true });
  console.log("Created missing 'public' folder directory automatically!");
}

// 3. Middlewares
app.use(cors());
app.use(express.json());

// Intercept streaming byte-range checks to prevent Range Not Satisfiable terminal errors
app.use("/public", (req, res, next) => {
  if (req.headers.range === "bytes=0-") {
    delete req.headers.range;
  }
  next();
});

// Re-expose static assets through explicit prefix routing matching the middleware path above
app.use("/public", express.static(publicDirPath));

// ==========================================
// ENDPOINT 1: Main Audio Generator (Text or URL)
// ==========================================
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
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          },
        });

        if (!response.ok)
          throw new Error(
            `Website responded with status code: ${response.status}`,
          );

        const html = await response.text();
        const doc = new JSDOM(html, { url });

        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (
          article &&
          article.textContent &&
          article.textContent.trim().length > 100
        ) {
          textToNarrate = article.textContent.trim();
        } else {
          const paragraphs = doc.window.document.querySelectorAll("p");
          let fallbackText = "";
          paragraphs.forEach((p) => {
            if (p.textContent) fallbackText += p.textContent + " ";
          });
          textToNarrate = fallbackText.trim();
        }

        if (!textToNarrate) {
          return res.status(422).json({
            error:
              "Could not extract clean text content from this website link.",
          });
        }
      } catch (scrapeError) {
        console.error("Scraping failure:", scrapeError);
        return res.status(500).json({
          error: `Failed to access or parse the provided web link: ${scrapeError.message}`,
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

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION,
    );

    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
    speechConfig.speechSynthesisVoiceName =
      voice || "en-US-Ava:DragonHDLatestNeural";

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      truncatedText,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const audioUrl = `http://localhost:${PORT}/public/${fileName}`;
          return res.status(200).json({ audioUrl });
        } else {
          console.error(
            "Azure Synthesis Cancelled/Failed:",
            result.errorDetails,
          );
          return res
            .status(500)
            .json({ error: "Azure synthesis process failed." });
        }
      },
      (err) => {
        synthesizer.close();
        console.error("Azure Error:", err);
        return res
          .status(500)
          .json({ error: "Failed to process speech using Azure." });
      },
    );
  } catch (error) {
    console.error("Server side error processing audio:", error);
    return res.status(500).json({ error: "Failed to process audio asset." });
  }
});

// ==========================================
// ENDPOINT 2: Voice Actor Sample Previews
// ==========================================
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

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION,
    );
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
    speechConfig.speechSynthesisVoiceName = voice;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      sampleText,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const audioUrl = `http://localhost:${PORT}/public/${fileName}`;
          return res.status(200).json({ audioUrl });
        } else {
          return res
            .status(500)
            .json({ error: "Azure preview generation failed." });
        }
      },
      (err) => {
        synthesizer.close();
        return res
          .status(500)
          .json({ error: "Failed to process preview path." });
      },
    );
  } catch (error) {
    console.error("Preview error:", error);
    return res.status(500).json({ error: "Server error processing sample." });
  }
});

// 4. Start Server
app.listen(PORT, () => {
  console.log(`Backend API actively running on http://localhost:${PORT}`);
  console.log(
    "DEBUG CHECK - Key Loaded:",
    process.env.AZURE_SPEECH_KEY ? "YES" : "NO",
  );
  console.log(
    "DEBUG CHECK - Region Loaded:",
    process.env.AZURE_SPEECH_REGION || "NOT FOUND",
  );
});
