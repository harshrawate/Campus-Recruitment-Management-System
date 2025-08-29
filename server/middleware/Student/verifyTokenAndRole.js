const jwt = require("jsonwebtoken");
const { Student } = require("../../models/Student");

const verifyTokenAndRole = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Student") {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(401).json({ error: "Student not found" });
    }

    req.student = student;
    req.token = token;
    next();
  } catch (error) {
    console.error("Error in verifyTokenAndRole:", error);
    return res.status(401).json({ error: error.message });
  }
};

module.exports = verifyTokenAndRole;
