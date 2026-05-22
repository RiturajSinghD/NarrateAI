const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Utility: Generate a signed JWT tracking token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token remains valid for 30 days
  });
};

/**
 * ROUTE:  POST /api/auth/register
 * DESC:   Register a new user account cluster
 */
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "All profile registration fields are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "An account with this email address already exists." });
    }

    // Hash the raw password before saving it using a secure salt factor
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Write record to MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration Exception:", error);
    return res
      .status(500)
      .json({ error: "Server error during profile creation." });
  }
}

/**
 * ROUTE:  POST /api/auth/login
 * DESC:   Authenticate credentials and deliver JWT token key
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid credentials: Email not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid credentials: Incorrect password." });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Exception:", error);
    return res
      .status(500)
      .json({ error: "Server error during authentication execution." });
  }
}

/**
 * ROUTE:  PUT /api/auth/profile
 * DESC:   Update user profile settings (Name, Email, Password)
 * ACCESS: Private (Requires JWT token)
 */
async function updateUserProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ error: "This email address is already in use." });
      }
      user.email = email;
    }

    if (name) user.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error: "Current password is required to set a new password.",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Incorrect current password." });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await user.save();

    // OPTIMIZED: Leveraged generateToken helper here to clear dead logic blocks
    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Profile Update Exception:", error);
    return res
      .status(500)
      .json({ error: "Server error updating profile settings." });
  }
}

module.exports = { registerUser, loginUser, updateUserProfile };
