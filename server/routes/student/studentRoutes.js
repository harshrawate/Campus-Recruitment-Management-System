const express = require("express");
const router = express.Router();
const { upload } = require("../../middleware/fileUpload");
const loginAndRegisterController = require("../../controller/student/loginAndRegisterController");
const dashboardController = require("../../controller/student/dashboardController");
const profileController = require("../../controller/student/profileController");
const verifyTokenAndRole = require("../../middleware/Student/verifyTokenAndRole");
const isProfileComplete = require("../../middleware/Student/isProfileComplete");

router.post("/verify-email/otp", loginAndRegisterController.getMailOtP);
router.post("/verify-otp/email", loginAndRegisterController.verifyMailOtp);
router.post("/verify-phone/otp", loginAndRegisterController.getWhatsappOtp);
router.post("/verify-otp/phone", loginAndRegisterController.verifyWhatsappOtp);
router.post("/register", loginAndRegisterController.createStudentAccount);
router.post("/login", loginAndRegisterController.loginStudent);
router.get(
  "/get/dashboard",
  verifyTokenAndRole,
  isProfileComplete,
  dashboardController.getStudentDashboard
);
router.get(
  "/complete/profile",
  verifyTokenAndRole,
  profileController.getStudentProfile
);
router.put(
  "/update/profile",
  verifyTokenAndRole,
  upload.fields([
    { name: "photograph", maxCount: 1 },
    { name: "aadharDocument", maxCount: 1 },
    { name: "panDocument", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  profileController.updateStudentProfile
);

module.exports = router;
