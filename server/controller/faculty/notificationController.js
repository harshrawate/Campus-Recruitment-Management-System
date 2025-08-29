const { Student } = require("../../models/Student");
const { sendBulkNotification } = require("../../services/emailService");
const { job, form, reminder } = require("../../constants/whatsappTemplate");
const { sendBulkWhatsappMessages } = require("../../services/whatsappService");

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

exports.getWhatsAppTemplates = async (req, res) => {
  try {
    const { notificationType } = req.params;
    if (notificationType === "form") {
      res.status(200).json(form);
    } else if (notificationType === "job") {
      res.status(200).json(job);
    } else if (notificationType === "reminder") {
      res.status(200).json(reminder);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      " status": "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.sendWhatsappNotification = async (req, res) => {
  try {
    const { studentIds, templateId, variables, notificationType } = req.body;
    console.log(studentIds, templateId, variables, notificationType);

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No student IDs provided",
      });
    }

    const students = await Student.find({ _id: { $in: studentIds } }).select(
      "personal.whatsappNumber"
    );

    const mobileNumbers = students
      .map((student) => student?.personal?.whatsappNumber)
      .filter(Boolean);

    if (mobileNumbers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No valid Mobile numbers found for the provided student IDs",
      });
    }

    await sendBulkWhatsappMessages(
      mobileNumbers,
      templateId,
      variables,
      notificationType
    );

    res.status(200).json({
      status: "success",
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
