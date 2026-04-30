const { Student } = require("../../models/Student");
const { sendBulkNotification } = require("../../services/emailService");


exports.sendEmailNotification = async (req, res) => {
  try {
    const { studentIds, subject, content, notificationType } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No student IDs provided",
      });
    }

    const students = await Student.find({ _id: { $in: studentIds } }).select(
      "personal.collegeEmail"
    );

    const emails = students
      .map((student) => student?.personal?.collegeEmail)
      .filter(Boolean);

    if (emails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No valid college emails found for the provided student IDs",
      });
    }

    await sendBulkNotification(emails, subject, content);

    res.status(200).json({
      status: "success",
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error in sendNotification:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};