const isProfileComplete = async (req, res, next) => {
  try {
    if (!req.student.auth.isProfileComplete) {
      return res.status(300).json({
        redirect: "/student/complete-profile",
        message: "Please complete your profile",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = isProfileComplete;
