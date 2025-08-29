const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Define upload paths for different types of files
const S3_PATHS = {
  UNIVERSITY: {
    LOGO: "universities/logos",
    DOCUMENTS: "universities/documents",
  },
  TEAM: {
    PROFILE: "team/profile",
    DOCUMENTS: "team/documents",
  },
  FACULTY: {
    PROFILE: "faculty,profile",
    DOCUMENTS: "faculty/documents",
  },
  STUDENT: {
    PROFILE: "student/profile",
    DOCUMENTS: "student/documents",
  },
  COMPANY: {
    LOGO: "company/logo",
  },
  COMMON: {
    TEMP: "temp",
  },
};

module.exports = { s3, S3_PATHS };
