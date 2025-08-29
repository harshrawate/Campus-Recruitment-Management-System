// services/auditService.js
const Audit = require("../models/Audit");

const createAuditLog = async ({
  action,
  performedBy,
  performerModel,
  targetFaculty,
  university,
  changes = {},
  status = "SUCCESS",
  reason = null,
  req = null,
  session = null,
}) => {
  try {
    const eventData = {
      performedBy,
      performerModel,
      changes,
      status,
      reason,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      timestamp: new Date(),
    };

    // Format action string to be consistent
    const formattedAction = action.toUpperCase().replace(/ /g, "_");

    // Try to find existing audit document
    let auditDoc = await Audit.findOne({
      action: formattedAction,
      targetFaculty,
      university,
    }).session(session);

    if (auditDoc) {
      // Add new event to existing document
      auditDoc.events.push(eventData);
    } else {
      // Create new audit document
      auditDoc = new Audit({
        action: formattedAction,
        targetFaculty,
        university,
        events: [eventData],
      });
    }

    if (session) {
      await auditDoc.save({ session });
    } else {
      await auditDoc.save();
    }

    return auditDoc;
  } catch (error) {
    console.error("Audit log creation failed:", error);
    throw error;
  }
};

const getAuditHistory = async ({
  action = null,
  targetFaculty = null,
  university = null,
  startDate = null,
  endDate = null,
  limit = 50,
  skip = 0,
}) => {
  try {
    const query = {};
    if (action) query.action = action;
    if (targetFaculty) query.targetFaculty = targetFaculty;
    if (university) query.university = university;

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    if (Object.keys(dateQuery).length > 0) {
      query["events.timestamp"] = dateQuery;
    }

    const audits = await Audit.find(query)
      .populate("targetFaculty", "name email")
      .populate("university", "name")
      .populate("events.performedBy")
      .sort({ "events.timestamp": -1 })
      .skip(skip)
      .limit(limit);

    return audits;
  } catch (error) {
    console.error("Error fetching audit history:", error);
    throw error;
  }
};

module.exports = { createAuditLog, getAuditHistory };
