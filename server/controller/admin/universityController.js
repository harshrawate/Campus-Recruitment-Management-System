// controllers/admin/universityController.js
const mongoose = require("mongoose");
const University = require("../../models/University");
const Faculty = require("../../models/Faculty");
const { uploadToS3 } = require("../../services/fileUpload");
const { S3_PATHS } = require("../../config/s3Config");
const { deleteFromS3 } = require("../../services/fileDelete");
const { sendUniversityCreationMail } = require("../../services/emailService");
const { generateRandomPassword } = require("../../services/randomPassword");

exports.universityData = async (req, res) => {
  try {
    const universityData = await University.find().populate("faculties");
    res.status(200).json({
      success: true,
      data: universityData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.addUniversityData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, address, website, email, head } = req.body;

    const headData = typeof head === "string" ? JSON.parse(head) : head;
    parsedHead = head ? JSON.parse(head) : null;

    if (
      !name ||
      !address ||
      !website ||
      !email ||
      !parsedHead.name ||
      !parsedHead.email ||
      !parsedHead.phone
    ) {
      throw new Error("All fields are required");
    }

    const existingUniversity = await University.findOne({ email });
    if (existingUniversity) {
      throw new Error("University with this email already exists");
    }

    const existingFaculty = await Faculty.findOne({ email: headData.email });
    if (existingFaculty) {
      throw new Error("Faculty with this email already exists");
    }

    let logoUrl = null;
    if (req.file) {
      logoUrl = await uploadToS3(req.file, S3_PATHS.UNIVERSITY.LOGO);
    } else {
      throw new Error("University logo is required");
    }

    const university = new University({
      name,
      address,
      email,
      website,
      logo: logoUrl,
      faculties: [],
    });

    const savedUniversity = await university.save({ session });

    const defaultPassword = generateRandomPassword();
    const faculty = new Faculty({
      name: headData.name,
      email: headData.email,
      phoneNumber: headData.phone,
      password: defaultPassword,
      role: "Head",
      university: savedUniversity._id,
    });

    const savedFaculty = await faculty.save({ session });

    savedUniversity.faculties.push(savedFaculty._id);
    await savedUniversity.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Send email notification to the university head
    await sendUniversityCreationMail(
      headData.email,
      name, // University name
      defaultPassword // Faculty default password
    );

    res.status(201).json({
      success: true,
      message: "University and faculty head added successfully",
      data: {
        university: savedUniversity,
        faculty: savedFaculty,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Error in addUniversityData:", error);

    res.status(error.message.includes("already exists") ? 409 : 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    session.endSession();
  }
};

exports.deleteUniversity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Check if university exists
    const university = await University.findById(id);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    // Delete university logo from S3
    if (university.logo) {
      try {
        await deleteFromS3(university.logo);
      } catch (s3Error) {
        console.error("Error deleting logo from S3:", s3Error);
        // You could decide whether to proceed or fail here
      }
    }

    // Delete all faculty members associated with the university
    const deletedFaculty = await Faculty.deleteMany(
      { university: id },
      { session }
    );

    // Delete the university
    const deletedUniversity = await University.findByIdAndDelete(id, {
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "University and associated data deleted successfully",
      data: {
        university: deletedUniversity,
        facultyCount: deletedFaculty.deletedCount,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Error in deleteUniversity:", error);

    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    session.endSession();
  }
};

exports.editUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, website, address } = req.body;

    // Update university data
    const updatedUniversity = await University.findByIdAndUpdate(
      id,
      { $set: { name, email, website, address } },
      { new: true }
    );

    if (!updatedUniversity) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "University Data Updated Successfully",
      data: updatedUniversity,
    });
  } catch (error) {
    console.error("Error in Updating University:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
