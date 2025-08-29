const Admin = require("../../models/Admin");
const { sendUserAddedMail } = require("../../services/emailService");
const { generateRandomPassword } = require("../../services/randomPassword");

exports.teamData = async (req, res) => {
  try {
    const teamDetails = await Admin.find();
    res.status(200).json(teamDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addTeamData = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const defaultPassword = generateRandomPassword();
    const adminDetails = new Admin({
      name,
      email,
      role,
      password: defaultPassword,
    });

    await adminDetails.save();
    sendUserAddedMail(email, 123456);
    res.status(201).json({ message: "Admin added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
