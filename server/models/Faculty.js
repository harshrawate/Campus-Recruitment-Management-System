const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const facultySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Head", "Coordinator"],
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    registerTimestamp: { type: Date, default: Date.now },
    loginTimestamps: { type: [Date], default: [] },
    isAccountDeactivated: {
      type: Boolean,
      default: false,
    },
    lastPasswordChange: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true, versionKey: false }
);

facultySchema.pre("save", async function (next) {
  const faculty = this;

  if (!faculty.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    faculty.password = await bcrypt.hash(faculty.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

facultySchema.methods.addLoginTimestamp = async function () {
  this.loginTimestamps.push(new Date());
  await this.save();
};

facultySchema.index({ university: 1 });

module.exports = mongoose.model("Faculty", facultySchema);
