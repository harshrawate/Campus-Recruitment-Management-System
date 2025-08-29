const jwt = require("jsonwebtoken");
const University = require("../../models/University");
const Faculty = require("../../models/Faculty");
const Admin = require("../../models/Admin");
const Token = require("../../models/Token");
const { Student } = require("../../models/Student");
const {
  sendResetPasswordMail,
  sendPasswordResetSuccessMail,
} = require("../../services/emailService");
const mongoose = require("mongoose");

exports.generateResetToken = (user, role) => {
  const payload = {
    email: user.email,
    role: role,
    userId: user._id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });

  return token;
};

exports.completeUniversityData = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await University.findById(id)
      .populate("faculties")
      .populate({
        path: "students",
        select:
          "personal.firstName personal.lastName personal.collegeEmail personal.whatsappNumber academic.rollNumber academic.degreeProgram academic.branch academic.section academic.graduationYear auth.isDeactivated auth.loginHistory auth.status auth.isProfileComplete",
      })
      .lean();

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        university,
        faculties: university.faculties,
        students: university.students,
        degreePrograms: university.degreePrograms || [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    let user;
    console.log(role);
    if (role === "admin") {
      user = await Admin.findOne({ email });
    } else if (role === "faculty") {
      user = await Faculty.findOne({ email });
    } else if (role === "student") {
      user = await Student.findOne({ "personal.collegeEmail": email });
      user.name=user.personal.firstName + " " + user.personal.lastName;
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) {
      return res.status(404).json({
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found`,
      });
    }

    const isTokenAvailable = await Token.findOne({ userId: user._id });
    if (isTokenAvailable) {
      return res.status(400).json({
        message:
          "A reset password email has already been sent. Please check your inbox and spam or try again later.",
      });
    }

    const resetToken = this.generateResetToken(user, role);

    const newToken = new Token({
      userId: user._id,
      email,
      token: resetToken,
      role,
      created_at: new Date(),
    });

    await newToken.save();

    sendResetPasswordMail(email, user.name, resetToken);

    return res.status(200).json({
      message: "Reset password email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

exports.validateToken = async (req, res) => {
  res.status(200).json({});
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { email, role } = decoded;

    let userModel;
    switch (role) {
      case "admin":
        userModel = Admin;
        break;
      case "faculty":
        userModel = Faculty;
        break;
      case "student":
        // userModel = University;
        break;
      default:
        return res.status(401).json({ message: "Invalid User Type" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    await Token.findOneAndDelete({ token });

    sendPasswordResetSuccessMail(email, user.name, role);

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Password reset error:", error);
    return res
      .status(500)
      .json({ message: "Server error during password reset" });
  }
};

exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find({}, { _id: 1, name: 1 }).sort({
      name: 1,
    });
    res.status(200).json({
      universities,
    });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.createDegreeProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, branches } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        message: "Program name is required",
      });
    }

    // Find the university
    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }

    // Create new program
    const newProgram = {
      programName: name,
      branches: branches || [],
    };

    // Add program to university's degree programs
    university.degreePrograms.push(newProgram);
    await university.save();

    // Return the newly created program
    const createdProgram =
      university.degreePrograms[university.degreePrograms.length - 1];

    res.status(201).json({
      id: createdProgram._id,
      name: createdProgram.programName,
      branches: createdProgram.branches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateDegreeProgram = async (req, res) => {
  try {
    const { id, programId } = req.params;
    const { name, branches } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        message: "Program name is required",
      });
    }

    // Find the university
    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }

    // Find and update the specific program
    const programToUpdate = university.degreePrograms.id(programId);
    if (!programToUpdate) {
      return res.status(404).json({
        message: "Program not found",
      });
    }

    // Update the program details
    programToUpdate.programName = name;
    programToUpdate.branches = branches || [];

    await university.save();

    res.status(200).json({
      _id: programToUpdate._id,
      name: programToUpdate.programName,
      branches: programToUpdate.branches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.deleteDegreeProgram = async (req, res) => {
  try {
    const { id, programId } = req.params;

    // Find the university
    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }

    // Remove the specific program
    university.degreePrograms = university.degreePrograms.filter(
      (program) => program._id.toString() !== programId
    );

    await university.save();

    res.status(200).json({
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { userType, user } = req;

    const baseQuery = Student.find()
      .populate({
        path: "academic.university",
        select: "name degreePrograms",
      })
      .select(
        "_id personal.firstName personal.lastName academic.university academic.degreeProgram academic.branch academic.section academic.rollNumber personal.collegeEmail academic.graduationYear placement"
      );

    const mapStudent = (student) => ({
      id: student._id,
      name: `${student.personal.firstName} ${student.personal.lastName}`,
      degree: student.academic.degreeProgram,
      branch: student.academic.branch,
      section: student.academic.section,
      rollNumber: student.academic.rollNumber,
      email: student.personal.collegeEmail,
      graduationYear: student.academic.graduationYear,
      university: student.academic.university.name,
      isPlaced: student.placement?.isPlaced || false,
      placement: student.placement || { isPlaced: false, offers: [] },
    });

    let students;

    if (userType === "Head" || userType === "Coordinator") {
      const faculty = await Faculty.findById(user._id).populate({
        path: "university",
        select: "name degreePrograms",
      });

      if (!faculty) {
        return res.status(403).json({
          success: false,
          message: "Faculty not found",
        });
      }

      students = await baseQuery
        .where("academic.university")
        .equals(faculty.university._id)
        .exec();

      const universityPrograms = faculty.university.degreePrograms.map(
        (program) => ({
          degree: program.programName,
          branches: program.branches,
        })
      );

      const formattedResponse = {
        success: true,
        count: students.length,
        data: {
          students: students.map(mapStudent),
          university: {
            name: faculty.university.name,
            programs: universityPrograms,
          },
        },
      };

      return res.status(200).json(formattedResponse);
    } else if (userType === "Admin" || userType === "Super Admin") {
      students = await baseQuery.exec();

      const universities = await mongoose
        .model("University")
        .find()
        .select("name degreePrograms");

      const formattedResponse = {
        success: true,
        count: students.length,
        data: {
          students: students.map(mapStudent),
          universities: universities.map((univ) => ({
            id: univ._id,
            name: univ.name,
            programs: univ.degreePrograms.map((program) => ({
              degree: program.programName,
              branches: program.branches,
            })),
          })),
        },
      };

      return res.status(200).json(formattedResponse);
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access: Invalid role",
      });
    }
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getStudentData = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
