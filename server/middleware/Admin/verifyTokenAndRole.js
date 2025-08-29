const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

const verifyTokenAndRole = () => {
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

      if (role !== "Super Admin" && role !== "Admin") {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found",
        });
      }

      req.admin = {
        _id: admin._id,
        role: admin.role,
        university: admin.university,
      };

      req.userType = admin.role;

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

module.exports = verifyTokenAndRole;
