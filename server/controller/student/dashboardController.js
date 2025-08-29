const mongoose = require("mongoose");
const University = mongoose.model("University");

exports.getStudentDashboard = async (req, res) => {
  try {
    // Get the student object from the middleware
    const student = req.student;

    // Extract student name
    const name = student.personal.firstName + " " + student.personal.lastName;

    // Get the university ID from the student's academic information
    const universityId = student.academic.university;

    // Fetch university details using the university ID
    const university = await University.findById(universityId);

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Return student dashboard information including more university details
    res.status(200).json({
      student: {
        name,
        email: student.personal.collegeEmail,
        rollNumber: student.academic.rollNumber,
        branch: student.academic.branch,
        program: student.academic.degreeProgram,
      },
      university: {
        _id: university._id,
        name: university.name,
        website: university.website,
        logo: university.logo,
        email: university.email,
        address: university.address,
        totalStudents: university.students?.length || 0,
        totalFaculties: university.faculties?.length || 0,
        degreePrograms:
          university.degreePrograms?.map((program) => program.programName) ||
          [],
      },
      message: "Student dashboard data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard information" });
  }
};
