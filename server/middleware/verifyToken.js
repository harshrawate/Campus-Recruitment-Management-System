const verifyToken = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "No authorization token provided",
        });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error verifying token",
        error: error.message,
      });
    }
  };
};

module.exports = verifyToken;
