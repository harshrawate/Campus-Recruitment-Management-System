exports.getAuditLogs = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        action,
        startDate,
        endDate,
        facultyId
      } = req.query;
  
      const query = {};
  
      if (action) query.action = action;
      if (facultyId) query.targetFaculty = facultyId;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
  
      // If faculty is requesting logs, only show their own
      if (req.faculty) {
        query.targetFaculty = req.faculty.id;
      }
  
      // If admin is requesting logs, filter by their university
      if (req.admin) {
        query.university = req.admin.universityId;
      }
  
      const auditLogs = await Audit.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('performedBy', 'name email')
        .populate('targetFaculty', 'name email')
        .populate('university', 'name');
  
      const total = await Audit.countDocuments(query);
  
      res.status(200).json({
        success: true,
        data: auditLogs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving audit logs",
        error: error.message
      });
    }
  };