const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name must be less than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    website: {
      type: String,
      required: [true, "Website URL is required"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
    },
    logo: {
      type: String,
      required: [true, "Logo is required"],
    },
    faculties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    degreePrograms: [
      {
        programName: {
          type: String,
          required: ["Program name is required"],
        },
        branches: [
          {
            name: {
              type: String,
            },
            sections: [
              {
                type: String,
              },
            ],
          },
        ],
      },
    ],
    placement: [
      {
        company: {
          name: { type: String },
          logo: { type: String },
        },
        opportunities: [
          {
            package: { type: String, required: true },
            role: { type: String, required: true },
            students: [
              {
                studentId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Student",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

universitySchema.index({ name: 1 });

module.exports = mongoose.model("University", universitySchema);
