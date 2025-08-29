const express = require("express");
const router = express.Router();
const sharedController = require("../../controller/shared/sharedController");
const validateResetToken = require("../../middleware/resetTokenValidation");
const verifyToken = require("../../middleware/verifyToken");
const verifyTokenAndRoleAll = require("../../middleware/Shared/verifyTokenAndRoleAll");


router.get(
  "/university/:id",
  verifyToken(),
  sharedController.completeUniversityData
);
router.post("/forgot-password", sharedController.forgotPassword);
router.get(
  "/validate-reset-token/:token",
  validateResetToken,
  sharedController.validateToken
);
router.post(
  "/resetPassword/:token",
  validateResetToken,
  sharedController.resetPassword
);
router.get("/universities", sharedController.getUniversities);

router.post(
  "/university/:id/programs",
  verifyToken(),
  sharedController.createDegreeProgram
);

router.put(
  "/university/:id/programs/:programId",
  verifyToken(),
  sharedController.updateDegreeProgram
);

router.delete(
  "/university/:id/programs/:programId",
  verifyToken(),
  sharedController.deleteDegreeProgram
);

router.get(
  "/students/data",
  verifyTokenAndRoleAll(),
  sharedController.getAllStudents
);

router.get(
  "/student/:id",
  verifyTokenAndRoleAll(),
  sharedController.getStudentData
);

module.exports = router;
