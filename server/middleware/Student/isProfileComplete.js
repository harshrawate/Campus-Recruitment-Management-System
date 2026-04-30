const { Student } = require("../../models/Student");

const isProfileComplete = async (req, res, next) => {
  try {
    const studentData = await Student.findById(req.student?._id).select("auth").lean();
    
    // TEMPORARY BYPASS: Log what the DB truly has to test for Mongoose errors.
    console.log("BYPASS ACTIVE! isProfileComplete middleware triggered.");
    console.log("DB says auth.isProfileComplete is:", studentData?.auth?.isProfileComplete);

    // Bypassing 300 to unblock the user.
    next();
  } catch (error) {
    console.error("Error in isProfileComplete middleware:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = isProfileComplete;