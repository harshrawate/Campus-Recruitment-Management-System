const { s3 } = require("../config/s3Config");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const uploadToS3 = async (file, folder) => {
  try {
    if (!file) throw new Error("No file provided");

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const fullPath = `${folder}/${fileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fullPath,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = { uploadToS3 };
