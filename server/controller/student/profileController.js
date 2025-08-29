const { Student } = require("../../models/Student");
const { uploadToS3 } = require("../../services/fileUpload");
const { S3_PATHS } = require("../../config/s3Config");

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .select("-auth.password -auth.loginHistory")
      .populate("academic.university", "name location degreePrograms");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { auth, ...studentData } = student.toObject();
    const profileData = {
      ...studentData,
      profileStatus: {
        isComplete: auth.isProfileComplete,
        status: auth.status,
        registeredAt: auth.registeredAt,
      },
    };

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const student = req.student;
    const profileData = JSON.parse(req.body.profileData);

    const fileUploads = {
      photograph: req.files?.photograph?.[0],
      aadharDocument: req.files?.aadharDocument?.[0],
      panDocument: req.files?.panDocument?.[0],
      resume: req.files?.resume?.[0],
    };

    // Handle document uploads with file deletion
    if (fileUploads.aadharDocument) {
      // Delete existing aadhar document if present
      if (student.documents?.aadhar?.document?.fileUrl) {
        await deleteFromS3(
          student.documents.aadhar.document.fileUrl,
          S3_PATHS.STUDENT.DOCUMENTS
        );
      }

      const documentUrl = await uploadToS3(
        fileUploads.aadharDocument,
        S3_PATHS.STUDENT.DOCUMENTS
      );

      profileData.documents.aadhar.document = {
        fileUrl: documentUrl,
        fileName: fileUploads.aadharDocument.originalname,
        uploadedAt: new Date(),
      };
    }

    if (fileUploads.panDocument) {
      // Delete existing pan document if present
      if (student.documents?.pan?.document?.fileUrl) {
        await deleteFromS3(
          student.documents.pan.document.fileUrl,
          S3_PATHS.STUDENT.DOCUMENTS
        );
      }

      const documentUrl = await uploadToS3(
        fileUploads.panDocument,
        S3_PATHS.STUDENT.DOCUMENTS
      );

      profileData.documents.pan.document = {
        fileUrl: documentUrl,
        fileName: fileUploads.panDocument.originalname,
        uploadedAt: new Date(),
      };
    }

    // Handle other file uploads similarly
    if (fileUploads.photograph) {
      if (student.personal?.photograph) {
        await deleteFromS3(
          student.personal.photograph,
          S3_PATHS.STUDENT.PROFILE
        );
      }
      profileData.personal.photograph = await uploadToS3(
        fileUploads.photograph,
        S3_PATHS.STUDENT.PROFILE
      );
    }

    if (fileUploads.resume) {
      if (student.social?.resume) {
        await deleteFromS3(student.social.resume, S3_PATHS.STUDENT.DOCUMENTS);
      }
      profileData.social.resume = await uploadToS3(
        fileUploads.resume,
        S3_PATHS.STUDENT.DOCUMENTS
      );
    }

    Object.keys(profileData).forEach((section) => {
      if (section !== "documents") {
        student[section] = {
          ...student[section],
          ...profileData[section],
        };
      }
    });

    if (profileData.documents) {
      student.documents.aadhar.number = profileData.documents.aadhar.number;
      student.documents.pan.number = profileData.documents.pan.number;
      if (profileData.documents.aadhar.document) {
        student.documents.aadhar.document =
          profileData.documents.aadhar.document;
      }
      if (profileData.documents.pan.document) {
        student.documents.pan.document = profileData.documents.pan.document;
      }
    }

    student.auth.isProfileComplete = true;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student: {
        personal: student.personal,
        academic: student.academic,
        professional: student.professional,
        family: student.family,
        social: student.social,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};
