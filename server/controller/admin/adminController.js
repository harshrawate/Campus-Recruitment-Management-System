const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findAdmin = await Admin.findOne({ email });
    if (!findAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      findAdmin.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: findAdmin._id, email: findAdmin.email, role: findAdmin.role },
      process.env.JWT_SECRET
    );

    await findAdmin.addLoginTimestamp();

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error! Please try again later" });
  }
};
