const Faculty = require("../../models/Faculty");
const { Student } = require("../../models/Student");
const axios = require("axios");
const University = require("../../models/University");
const { sendBulkNotification } = require("../../services/emailService");

exports.getFilteredData = async (req, res) => {
  try {
    const query = {
      "academic.university": req.faculty.university,
      "auth.isDeactivated": false,
    };

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    //sorting
    let sortOptions = {};
    if (req.query.sortBy && req.query.sortOrder) {
      // Map frontend column keys to MongoDB paths
      const sortFieldMappings = {
        fullName: "personal.firstName",
        rollNumber: "academic.rollNumber",
        collegeEmail: "personal.collegeEmail",
        personalEmail: "personal.personalEmail",
        dateOfBirth: "personal.dateOfBirth",
        degreeProgram: "academic.degreeProgram",
        branch: "academic.branch",
        cgpa: "academic.cgpa",
        backlogs: "academic.backlogs",
        graduationYear: "academic.graduationYear",
        tenthPercentage: "academic.tenth.percentage",
        twelfthPercentage: "academic.twelfth.percentage",
        aadharNumber: "documents.aadhar.number",
        panNumber: "documents.pan.number",
        fatherName: "family.father.name",
        fatherContact: "family.father.contact",
        motherName: "family.mother.name",
        motherContact: "family.mother.contact",
        linkedin: "social.linkedin",
        github: "social.github",
      };

      const sortField = sortFieldMappings[req.query.sortBy] || req.query.sortBy;

      if (req.query.sortOrder === "asc" || req.query.sortOrder === "desc") {
        sortOptions[sortField] = req.query.sortOrder === "asc" ? 1 : -1;

        // Special handling for fullName sorting
        if (req.query.sortBy === "fullName") {
          sortOptions = {
            "personal.firstName": req.query.sortOrder === "asc" ? 1 : -1,
            "personal.lastName": req.query.sortOrder === "asc" ? 1 : -1,
          };
        }
      }
    }

    // Filters
    if (req.query.ageMin || req.query.ageMax) {
      const today = new Date();
      query["personal.dateOfBirth"] = {};
      if (req.query.ageMin) {
        const maxDate = new Date(
          today.getFullYear() - parseInt(req.query.ageMin),
          today.getMonth(),
          today.getDate()
        );
        query["personal.dateOfBirth"].$lte = maxDate;
      }
      if (req.query.ageMax) {
        const minDate = new Date(
          today.getFullYear() - parseInt(req.query.ageMax),
          today.getMonth(),
          today.getDate()
        );
        query["personal.dateOfBirth"].$gte = minDate;
      }
    }

    if (req.query.degreeProgram) {
      const programs = Array.isArray(req.query.degreeProgram)
        ? req.query.degreeProgram
        : [req.query.degreeProgram];
      query["academic.degreeProgram"] = { $in: programs };
    }

    if (req.query.branch) {
      const branches = Array.isArray(req.query.branch)
        ? req.query.branch
        : [req.query.branch];
      query["academic.branch"] = { $in: branches };
    }

    if (req.query.cgpaMin || req.query.cgpaMax) {
      query["academic.cgpa"] = {};
      if (req.query.cgpaMin)
        query["academic.cgpa"].$gte = parseFloat(req.query.cgpaMin);
      if (req.query.cgpaMax)
        query["academic.cgpa"].$lte = parseFloat(req.query.cgpaMax);
    }

    if (req.query.backlogsMin || req.query.backlogsMax) {
      query["academic.backlogs"] = {};
      if (req.query.backlogsMin)
        query["academic.backlogs"].$gte = parseInt(req.query.backlogsMin);
      if (req.query.backlogsMax)
        query["academic.backlogs"].$lte = parseInt(req.query.backlogsMax);
    }

    if (req.query.graduationYear) {
      query["academic.graduationYear"] = parseInt(req.query.graduationYear);
    }

    if (req.query.tenthMin || req.query.tenthMax) {
      query["academic.tenth.percentage"] = {};
      if (req.query.tenthMin)
        query["academic.tenth.percentage"].$gte = parseFloat(
          req.query.tenthMin
        );
      if (req.query.tenthMax)
        query["academic.tenth.percentage"].$lte = parseFloat(
          req.query.tenthMax
        );
    }

    if (req.query.twelfthMin || req.query.twelfthMax) {
      query["academic.twelfth.percentage"] = {};
      if (req.query.twelfthMin)
        query["academic.twelfth.percentage"].$gte = parseFloat(
          req.query.twelfthMin
        );
      if (req.query.twelfthMax)
        query["academic.twelfth.percentage"].$lte = parseFloat(
          req.query.twelfthMax
        );
    }

    if (req.query.isPlaced !== undefined) {
      query["placement.isPlaced"] = req.query.isPlaced === "true";
    }

    // Select fields based on requested columns
    let selection = "";
    if (req.query.columns) {
      const columns = req.query.columns.split(",");
      selection = columns.join(" ");
    }

    // Execute query with pagination and get total count
    const [students, totalCount] = await Promise.all([
      Student.find(query)
        .select(selection || "-auth.password -auth.loginHistory")
        .sort(Object.keys(sortOptions).length > 0 ? sortOptions : { _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getFilteredData:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getDegreePrograms = async (req, res) => {
  try {
    const university = await University.findById(req.faculty.university)
      .select("degreePrograms")
      .lean();

    res.status(200).json({
      status: "success",
      data: university.degreePrograms,
    });
  } catch (error) {
    console.error("Error in getDegreePrograms:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateMarksAndPredict = async (req, res) => {
  try {
    const { id } = req.params; // Student ID
    const {
      cgpa,
      avg_test_score,
      technical_score,
      aptitude_score,
      num_projects,
      num_internships,
      skills
    } = req.body;

    const student = await Student.findOne({ 
      _id: id,
      "academic.university": req.faculty.university,
      "auth.isDeactivated": false
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found or unauthorized." });
    }

    const name = `${student.personal?.firstName || ""} ${student.personal?.lastName || ""}`.trim();
    const finalBranch = student.academic?.branch || "Computer Science";
    const finalSkills = skills && Array.isArray(skills) && skills.length > 0 ? skills : (student.professional?.skills || []);
    const finalCgpa = Number(cgpa || student.academic?.cgpa || 0);

    const payload = {
      student_id: id.toString(),
      name: name,
      branch: finalBranch,
      cgpa: finalCgpa,
      avg_test_score: Number(avg_test_score || 0),
      technical_score: Number(technical_score || 0),
      aptitude_score: Number(aptitude_score || 0),
      num_projects: Number(num_projects || 0),
      num_internships: Number(num_internships || 0),
      skills: finalSkills
    };

    const pythonApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000/predict";
    const response = await axios.post(pythonApiUrl, payload);
    const predictionResult = response.data;

    const companyProbsArray = Object.entries(predictionResult.company_probabilities || {}).map(([company, probability]) => ({
      company,
      probability
    }));

    const newPredictionData = {
      ...payload,
      placement_probability: predictionResult.probability,
      company: predictionResult.company,
      company_probabilities: companyProbsArray,
      salary: predictionResult.salary || null
    };

    student.predictions = newPredictionData;
    await student.save();

    res.status(200).json({
      status: "success",
      message: "Marks updated and prediction successful.",
      data: newPredictionData
    });

  } catch (error) {
    console.error("Error in AI prediction via Faculty:", error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to generate prediction.", 
      error: error.response?.data || error.message 
    });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ 
      _id: id,
      "academic.university": req.faculty.university
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
