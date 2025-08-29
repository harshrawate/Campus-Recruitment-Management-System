const mongoose = require("mongoose");
const Faculty = require("../../models/Faculty");
const University = require("../../models/University");
const { generateRandomPassword } = require("../../services/randomPassword");
const {
  sendFacultyAccountCreationMail,
  sendPasswordChangeMail,
} = require("../../services/emailService");
const { createAuditLog } = require("../../services/auditService");

exports.addFacultyData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, role, phoneNumber, universityId } = req.body;

    // Check if faculty exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ message: "Faculty already exists" });
    }

    const defaultPassword = generateRandomPassword();

    // Create new faculty
    const newFaculty = new Faculty({
      name,
      email,
      role,
      phoneNumber,
      password: defaultPassword,
      university: universityId,
    });
    await newFaculty.save({ session });

    const university = await University.findById(universityId).session(session);
    if (!university) {
      throw new Error(`University not found`);
    }

    // Check if `faculties` array exists and is valid
    if (!Array.isArray(university.faculties)) {
      throw new Error(
        `Faculties array is not initialized for University ID: ${universityId}`
      );
    }

    // Add the faculty to the array
    university.faculties.push(newFaculty._id);
    await university.save({ session });

    // Send email
    await sendFacultyAccountCreationMail(email, defaultPassword, name);

    // Create audit log
    const performerId = req.user._id;
    await createAuditLog({
      action: "FACULTY_CREATION",
      performedBy: performerId,
      performerModel: req.userType,
      targetFaculty: newFaculty._id,
      university: university._id,
      changes: {
        name,
        email,
        role,
        phoneNumber,
      },
      req,
      session,
    });

    // Commit transaction
    await session.commitTransaction();

    res
      .status(201)
      .json({ success: true, message: "Faculty added successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.updateFaculty = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { name, email, phoneNumber } = req.body;
    const performerId = req.user._id;
    const performerModel = req.userType;

    // Store original faculty data for audit
    const originalFaculty = await Faculty.findById(id).session(session);
    if (!originalFaculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== originalFaculty.email) {
      const existingFaculty = await Faculty.findOne({
        email,
        _id: { $ne: id },
      }).session(session);

      if (existingFaculty) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name, email, phoneNumber },
      { new: true, runValidators: true, session }
    );

    // Create audit log for profile update
    await createAuditLog({
      action: "PROFILE_UPDATE",
      performedBy: performerId,
      performerModel,
      targetFaculty: id,
      university: originalFaculty.university,
      changes: {
        previous: {
          name: originalFaculty.name,
          email: originalFaculty.email,
          phoneNumber: originalFaculty.phoneNumber,
        },
        current: {
          name: updatedFaculty.name,
          email: updatedFaculty.email,
          phoneNumber: updatedFaculty.phoneNumber,
        },
      },
      req,
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Faculty details updated successfully",
      data: updatedFaculty,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.toggleFacultyStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const performerId = req.user._id;

    const faculty = await Faculty.findById(id).session(session);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const previousStatus = faculty.isAccountDeactivated;
    faculty.isAccountDeactivated = !faculty.isAccountDeactivated;
    faculty.status = faculty.isAccountDeactivated ? "inactive" : "active";
    await faculty.save({ session });

    // Create audit log
    await createAuditLog({
      action: faculty.isAccountDeactivated
        ? "ACCOUNT_DEACTIVATION"
        : "ACCOUNT_ACTIVATION",
      performedBy: performerId,
      performerModel,
      targetFaculty: faculty._id,
      university: faculty.university,
      changes: {
        previousStatus,
        newStatus: faculty.isAccountDeactivated,
        statusChange: faculty.status,
      },
      req,
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Faculty account ${
        faculty.isAccountDeactivated ? "deactivated" : "activated"
      } successfully`,
      data: faculty,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.deleteFaculty = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const performerId = req.user._id; // Use req.user from verifyTokenAndRole middleware
    const performerModel = req.userType; // Use req.userType to determine the role

    // Find faculty before deletion for audit purposes
    const faculty = await Faculty.findById(id).session(session);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // Store faculty data for audit
    const facultyData = {
      name: faculty.name,
      email: faculty.email,
      phoneNumber: faculty.phoneNumber,
      role: faculty.role,
      university: faculty.university,
    };

    // Remove faculty reference from university
    await University.updateOne(
      { _id: faculty.university },
      { $pull: { faculties: faculty._id } },
      { session }
    );

    // Create audit log before deletion
    await createAuditLog({
      action: "ACCOUNT_DELETION",
      performedBy: performerId,
      performerModel,
      targetFaculty: faculty._id,
      university: faculty.university,
      changes: {
        deletedFacultyData: facultyData,
      },
      req,
      session,
    });

    // Delete the faculty
    await Faculty.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.changePassword = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { password } = req.body;
    const performerId = req.user._id; // Use req.user from verifyTokenAndRole middleware
    const performerModel = req.userType; // Use req.userType to determine the role

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const faculty = await Faculty.findById(id).session(session);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    faculty.password = password;
    faculty.lastPasswordChange = new Date();
    await faculty.save({ session });

    await createAuditLog({
      action: "PASSWORD_CHANGE",
      performedBy: performerId,
      performerModel,
      targetFaculty: faculty._id,
      university: faculty.university,
      changes: {
        lastPasswordChange: faculty.lastPasswordChange,
      },
      req,
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

    // Send email
    await sendPasswordChangeMail(faculty.email, faculty.name, password);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
