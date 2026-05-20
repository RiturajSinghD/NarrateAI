const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Custom Express Middleware to authenticate incoming requests via JWT tokens
 */
async function protect(req, res, next) {
  let token;

  // 1. Check if token exists in the incoming request's Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from format: "Bearer <token_string>"
      token = req.headers.authorization.split(" ")[1];

      // 2. Decode and verify the token signature using your environmental secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Fetch the verified user from MongoDB by ID and attach them to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ error: "Authorization failed: User no longer exists." });
      }

      // Token is valid! Pass execution control to the next endpoint controller block
      return next();
    } catch (error) {
      console.error("JWT Verification Exception:", error.message);
      return res
        .status(401)
        .json({ error: "Access denied: Token is invalid or expired." });
    }
  }

  // If no token was found at all
  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied: No authentication token provided." });
  }
}

module.exports = { protect };
