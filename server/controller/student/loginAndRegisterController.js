const { Student } = require("../../models/Student");
const University = require("../../models/University");
const { generateOTP } = require("../../services/otpService");
const {
  encryptData,
  decryptData,
} = require("../../services/encryptionService");
const { sendOTPMail } = require("../../services/emailService");
const { sendVerificationCode } = require("../../services/whatsappService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.getMailOtP = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ collegeEmail: email });
    if (student) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const otp = generateOTP();
    const { iv, encryptedData: encryptedOTP } = encryptData(otp);

    res
      .status(200)
      .json({ message: "OTP sent to your email", encryptedOTP, iv });

    await sendOTPMail(email, otp);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating profile" });
  }
};

exports.verifyMailOtp = async (req, res) => {
  try {
    const { otp, encryptedOTP, iv } = req.body;
    if (!encryptedOTP || !iv) {
      return res.status(400).json({ message: "Error during OTP verification" });
    }

    const decryptedOTP = decryptData(encryptedOTP, iv);

    if (otp !== decryptedOTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error verifying OTP" });
  }
};

exports.getWhatsappOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const student = await Student.findOne({ whatsappNumber: phoneNumber });
    if (student) {
      return res.status(400).json({ message: "Mobile Number already exists" });
    }
    const otp = generateOTP();
    const { iv, encryptedData: encryptedOTP } = encryptData(otp);
    console.log(phoneNumber, otp, encryptedOTP, iv);
    const message = await sendVerificationCode(phoneNumber, otp);

    console.log(message);

    res
      .status(200)
      .json({ message: "OTP sent to your number", encryptedOTP, iv });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error generating OTP" });
  }
};

exports.verifyWhatsappOtp = async (req, res) => {
  try {
    const { otp, encryptedOTP, iv } = req.body;
    if (!encryptedOTP || !iv) {
      return res.status(400).json({ message: "Error during OTP verification" });
    }
    const decryptedOTP = decryptData(encryptedOTP, iv);
    if (otp !== decryptedOTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error verifying OTP" });
  }
};

exports.createStudentAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      firstName,
      lastName,
      email,
      whatsappNumber,
      password,
      universityId,
      rollNumber,
    } = req.body;

    // Enhanced input validation
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }

    const existingEmail = await Student.findOne({
      "personal.collegeEmail": email.toLowerCase().trim(),
    });

    if (existingEmail) {
      throw new Error("Email already registered");
    }

    // Only check for duplicate roll number if one is provided
    if (rollNumber && rollNumber.trim()) {
      const normalizedRollNumber = rollNumber.toLowerCase().trim();
      const existingRollNumber = await Student.findOne({
        "academic.university": universityId,
        "academic.rollNumber": normalizedRollNumber,
      });

      if (existingRollNumber) {
        throw new Error("Roll number already exists for this university");
      }
    }

    if (
      !firstName ||
      !lastName ||
      !whatsappNumber ||
      !password ||
      !universityId
    ) {
      throw new Error("All required fields must be provided");
    }

    const university = await University.findById(universityId).session(session);
    if (!university) {
      throw new Error("University not found");
    }

    const student = new Student({
      personal: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        collegeEmail: email.toLowerCase().trim(),
      },
      academic: {
        university: universityId,
        rollNumber: rollNumber ? rollNumber.toLowerCase().trim() : null,
      },
      auth: {
        password,
        isProfileComplete: false,
      },
    });

    await student.save({ session });
    await university.updateOne(
      { $push: { students: student._id } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Student Account Created Successfully",
      studentId: student._id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Account creation error:", error);

    let statusCode = 500;
    let message = "Error creating student account";

    if (error.code === 11000) {
      statusCode = 409;
      message = "Duplicate entry found. Please check email and roll number.";
    } else if (
      error.message.includes("already registered") ||
      error.message.includes("already exists")
    ) {
      statusCode = 409;
      message = error.message;
    } else if (error.message.includes("required")) {
      statusCode = 400;
      message = error.message;
    } else if (error.message === "University not found") {
      statusCode = 404;
      message = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({
      "personal.collegeEmail": email,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.auth.status !== "active" || student.auth.isDeactivated) {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, student.auth.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: student.auth.role,
        email: student.personal.collegeEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await student.recordLogin();
    let url;
    if (!student.auth.isProfileComplete) {
      url = "/student/complete-profile";
    } else {
      url = "/student/dashboard";
    }

    res.status(200).json({
      message: "Login successful",
      data: { token },
      redirect: url,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error logging in student",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // From auth middleware
    const profileData = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update all profile fields
    Object.assign(student, profileData);
    student.isProfileComplete = true;

    await student.save();

    res.status(200).json({
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.error("Profile completion error:", error);
    res.status(500).json({
      message: "Error completing profile",
      error: error.message,
    });
  }
};
