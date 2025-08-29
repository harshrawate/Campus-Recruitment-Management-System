const jwt = require("jsonwebtoken");
const Faculty = require("../../models/Faculty");

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

      if (role !== "Head" && role !== "Coordinator") {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      const faculty = await Faculty.findById(id);
      if (!faculty) {
        return res.status(401).json({
          success: false,
          message: "Faculty not found",
        });
      }

      req.faculty = {
        _id: faculty._id,
        role: faculty.role,
        university: faculty.university,
        email: faculty.email,
      };

      req.userType = faculty.role;

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
