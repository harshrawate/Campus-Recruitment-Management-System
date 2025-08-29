const Faculty = require("../../models/Faculty");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const faculty = await Faculty.findOne({ email: email.toLowerCase() });

    if (!faculty) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (faculty.isAccountDeactivated) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact the administrator",
      });
    }

    if (faculty.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${faculty.status}. Please contact support`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, faculty.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    faculty.loginTimestamps.push(new Date());
    await faculty.save();

    const token = jwt.sign(
      {
        id: faculty._id,
        email: faculty.email,
        role: faculty.role,
        university: faculty.university,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
    });
  } catch (error) {
    console.error("Faculty login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again",
    });
  }
};

