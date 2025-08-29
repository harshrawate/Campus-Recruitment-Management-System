const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function cleanupIndexes(collection) {
  const indexesToDrop = [
    "email_1",
    "collegeEmail_1",
    "personalInfo.collegeEmail_1",
    "systemInfo.university_1_academicInfo.rollNumber_1",
    "academic.university_1_academic.rollNumber_1",
    "personal.collegeEmail_1",
    "academic.rollNumber_1",
    "university_rollnumber_unique",
  ];

  for (const indexName of indexesToDrop) {
    try {
      await collection.dropIndex(indexName);
    } catch (error) {
      console.log(`Index ${indexName} may not exist, continuing...`);
    }
  }
}

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
});

const documentSchema = new mongoose.Schema({
  fileUrl: String,
  fileName: String,
  uploadedAt: { type: Date, default: Date.now },
});

const entranceExamSchema = new mongoose.Schema({
  examName: { type: String },
  rank: { type: Number },
});

const placementSchema = new mongoose.Schema({
  company: { type: String },
  role: { type: String },
  ctc: { type: Number },
});

const studentSchema = new mongoose.Schema(
  {
    personal: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      whatsappNumber: { type: String, required: true, trim: true },
      collegeEmail: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
      },
      personalEmail: { type: String, lowercase: true },
      religion: { type: String },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      caste: {
        type: String,
        enum: [
          "OC",
          "BC-A",
          "BC-B",
          "BC-C",
          "BC-D",
          "BC-E",
          "SC",
          "ST",
          "Other",
        ],
      },
      dateOfBirth: Date,
      address: {
        permanent: addressSchema,
        current: addressSchema,
      },
      photograph: String,
    },

    academic: {
      university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        required: true,
      },
      rollNumber: {
        type: String,
        lowercase: true,
        sparse: true,
        default: null,
      },
      collegeName: String,
      degreeProgram: String,
      branch: String,
      section: { type: String },
      cgpa: Number,
      backlogs: { type: Number, default: 0 },
      graduationYear: { type: Number },
      tenth: {
        percentage: Number,
        boardName: String,
        passingYear: Number,
      },
      twelfth: {
        percentage: Number,
        boardName: String,
        passingYear: Number,
      },
      entranceExams: [entranceExamSchema],
    },

    professional: {
      experience: [
        {
          company: String,
          role: String,
          duration: String,
        },
      ],
      skills: [String],
      certifications: [
        {
          name: String,
          authority: String,
          link: String,
        },
      ],
    },

    documents: {
      aadhar: {
        number: String,
        document: documentSchema,
      },
      pan: {
        number: { type: String, uppercase: true },
        document: documentSchema,
      },
    },

    family: {
      father: {
        name: String,
        occupation: String,
        contact: String,
      },
      mother: {
        name: String,
        occupation: String,
        contact: String,
      },
      annualIncome: Number,
    },

    placement: {
      isPlaced: { type: Boolean, default: false },
      offers: [placementSchema],
    },

    social: {
      linkedin: String,
      github: String,
      resume: String,
      extracurricular: [String],
    },

    auth: {
      password: { type: String, required: true },
      isProfileComplete: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active",
      },
      role: {
        type: String,
        enum: ["Student"],
        default: "Student",
      },
      lastLogin: Date,
      loginHistory: [Date],
      registeredAt: { type: Date, default: Date.now },
      lastPasswordChange: Date,
      isDeactivated: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ROLL_NUMBER_INDEX = "university_rollnumber_unique";
const EMAIL_INDEX = "personal.collegeEmail_1";

// Remove any existing index definitions
studentSchema.clearIndexes();

// Add the compound index for roll numbers with explicit name
studentSchema.index(
  {
    "academic.university": 1,
    "academic.rollNumber": 1,
  },
  {
    unique: true,
    name: ROLL_NUMBER_INDEX,
    partialFilterExpression: {
      "academic.rollNumber": { $type: "string" },
      "academic.university": { $exists: true },
    },
    background: true,
  }
);

// Add the email index with explicit name
studentSchema.index(
  { "personal.collegeEmail": 1 },
  {
    unique: true,
    name: EMAIL_INDEX,
    background: true,
    partialFilterExpression: {
      "personal.collegeEmail": { $exists: true },
    },
  }
);

// Password hashing middleware
studentSchema.pre("save", async function (next) {
  if (!this.isModified("auth.password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.auth.password = await bcrypt.hash(this.auth.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Login timestamp method
studentSchema.methods.recordLogin = async function () {
  this.auth.lastLogin = new Date();
  this.auth.loginHistory = (this.auth.loginHistory || []).concat([
    this.auth.lastLogin,
  ]);
  await this.save();
};

const Student  = mongoose.model("Student", studentSchema);

async function initializeIndexes() {
  try {
    const collection = mongoose.connection.collection("students");
    console.log("Starting index cleanup...");
    await cleanupIndexes(collection);
    console.log("Old indexes cleaned up successfully");

    // Get current indexes
    const currentIndexes = await collection.indexes();
    console.log("Current indexes:", currentIndexes);

    // Create the roll number index
    await collection.createIndex(
      {
        "academic.university": 1,
        "academic.rollNumber": 1,
      },
      {
        unique: true,
        name: ROLL_NUMBER_INDEX,
        partialFilterExpression: {
          "academic.rollNumber": { $type: "string" },
          "academic.university": { $exists: true },
        },
        background: true,
      }
    );
    console.log(`Created ${ROLL_NUMBER_INDEX} index`);

    // Create the email index
    await collection.createIndex(
      { "personal.collegeEmail": 1 },
      {
        unique: true,
        name: EMAIL_INDEX,
        background: true,
        partialFilterExpression: {
          "personal.collegeEmail": { $exists: true },
        },
      }
    );
    console.log(`Created ${EMAIL_INDEX} index`);

    const finalIndexes = await collection.indexes();
    console.log("Final indexes:", finalIndexes);

    console.log("Index initialization completed successfully");
  } catch (error) {
    console.error("Error managing indexes:", error);
    throw error;
  }
}

module.exports = {
  Student,
  initializeIndexes,
};
