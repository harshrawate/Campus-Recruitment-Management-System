const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");
const Faculty = require("../../models/Faculty");

const verifyToken = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No authorization token provided",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id, role } = decoded;

      // Verify roles
      if (!["Super Admin", "Admin", "Head"].includes(role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      let user;
      if (role === "Super Admin" || role === "Admin") {
        user = await Admin.findById(id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Admin not found",
          });
        }
        req.user = {
          _id: user._id,
          role: user.role,
          university: user.university,
        };
      } else if (role === "Head") {
        user = await Faculty.findById(id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Faculty not found",
          });
        }
        req.user = {
          _id: user._id,
          role: user.role,
          university: user.university,
        };
      }

      req.userType = role;

      next();
    } catch (error) {
      console.error("Auth error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  };
};

module.exports = verifyToken;
