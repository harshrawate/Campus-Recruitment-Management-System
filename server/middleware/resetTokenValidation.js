const jwt = require("jsonwebtoken");
const Token = require("../models/Token");

const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "No reset token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const dbToken = await Token.findOne({
      token,
    });

    if (!dbToken) {
      return res
        .status(400)
        .json({ message: "Token has expired or is invalid" });
    }

    req.dbToken = dbToken;
    next();
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ message: "Server error during token validation" });
  }
};

module.exports = validateResetToken;
