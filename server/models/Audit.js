// models/Audit.js
const mongoose = require("mongoose");

const auditEventSchema = new mongoose.Schema({
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "performerModel",
  },
  performerModel: {
    type: String,
    required: true,
    enum: ["Admin", "Head", "Super Admin"],
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ["SUCCESS", "FAILURE"],
    required: true,
  },
  reason: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const auditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "PASSWORD_CHANGE",
        "ACCOUNT_DELETION",
        "ACCOUNT_DEACTIVATION",
        "ACCOUNT_ACTIVATION",
        "PROFILE_UPDATE",
        "FACULTY_CREATION",
        "LOGIN_ATTEMPT",
        "LOGIN_SUCCESS",
        "LOGIN_FAILURE",
      ],
    },
    targetFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    events: [auditEventSchema],
  },
  { timestamps: true }
);

// Indexes for common queries
auditSchema.index({ action: 1, "events.timestamp": -1 });
auditSchema.index({ targetFaculty: 1, "events.timestamp": -1 });
auditSchema.index({ university: 1, "events.timestamp": -1 });
auditSchema.index({ "events.performedBy": 1, "events.timestamp": -1 });

const Audit = mongoose.model("Audit", auditSchema);
module.exports = Audit;
