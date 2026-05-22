const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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

// Setup foundational system path directories cleanly
const directories = [
  path.join(__dirname, "public"),
  path.join(__dirname, "uploads"),
];
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors());
app.use(express.json());

// Intercept streaming byte-range checks
app.use("/public", (req, res, next) => {
  if (req.headers.range === "bytes=0-") {
    delete req.headers.range;
  }
  next();
});

app.use("/public", express.static(path.join(__dirname, "public")));

// ==========================================
// AUTHENTICATION ROUTING ENDPOINTS
// ==========================================
app.post("/api/auth/register", registerUser);
app.post("/api/auth/login", loginUser);
app.put("/api/auth/profile", protect, updateUserProfile);

// ==========================================
// APPLICATION PIPELINE ROUTERS MOUNT POINT
// ==========================================
app.use("/api/vault", require("./routes/vaultRoutes"));
app.use("/api", require("./routes/audioRoutes")); // ⚡ CLEAN: Logic moved to route file

app.listen(PORT, () => {
  console.log(`Backend API actively running on http://localhost:${PORT}`);
});
