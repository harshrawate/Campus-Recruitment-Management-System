// controllers/facultyController.js
const Faculty = require("../../models/Faculty");
const University = require("../../models/University");

exports.getUniversityFaculties = async (req, res) => {
  try {
    // Get university ID from authenticated faculty
    const { university: universityId } = req.faculty;

    // Validate university ID
    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: "University ID not found in faculty profile",
      });
    }

    // Find all faculties from the university
    const faculties = await Faculty.find({ university: universityId })
      .select("-password") // Exclude password
      .populate({
        path: "university",
        select: "name email website address", // Select specific university fields
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert to plain JavaScript object

    return res.status(200).json({
      faculty: faculties,
    });
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching faculty data",
      error: error.message,
    });
  }
};
