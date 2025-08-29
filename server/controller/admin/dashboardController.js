const Admin = require("../../models/Admin");

exports.dashboard = async (req, res) => {
  try {
    const { id } = req.admin;
    const adminData = await Admin.findById(id);

    if (!adminData) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(adminData);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
