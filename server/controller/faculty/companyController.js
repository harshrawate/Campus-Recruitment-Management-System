const University = require("../../models/University");
const { Student } = require("../../models/Student");
const Faculty = require("../../models/Faculty");
const { uploadToS3 } = require("../../services/fileUpload");
const { S3_PATHS } = require("../../config/s3Config");
const mongoose = require("mongoose");

exports.getFacultyCompanies = async (req, res) => {
  try {
    const facultyId = req.faculty._id;

    const university = await University.findOne({ faculties: facultyId })
      .select("placement")
      .lean();

    if (!university) {
      return res
        .status(404)
        .json({ message: "University not found for faculty" });
    }

    const companies = (university.placement || []).map((placement) => ({
      _id: placement._id,
      company: {
        name: placement.company?.name || "Unknown",
        logo: placement.company?.logo || null,
      },
      opportunities: placement.opportunities || [],
    }));

    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching faculty's university companies:", error);
    res.status(500).json({ message: "Server error while fetching companies" });
  }
};

exports.addCompany = async (req, res) => {
  try {
    const facultyId = req.faculty._id;
    const university = await University.findOne({ faculties: facultyId });

    if (!university) {
      return res
        .status(404)
        .json({ message: "University not found for faculty" });
    }

    const uploadedFile = req.file || (req.files && req.files.companyLogo);
    if (!uploadedFile) {
      return res.status(400).json({ message: "Company logo is required" });
    }

    const { companyName } = req.body;
    const opportunities = JSON.parse(req.body.opportunities || "[]");

    if (
      !companyName ||
      !Array.isArray(opportunities) ||
      opportunities.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing required fields" });
    }

    let logoUrl;
    try {
      logoUrl = await uploadToS3(req.file, S3_PATHS.COMPANY.LOGO);
    } catch (error) {
      console.error("S3 upload error:", error);
      return res.status(500).json({ message: "Error uploading logo" });
    }

    const newPlacement = {
      company: {
        name: companyName,
        logo: logoUrl,
      },
      opportunities: opportunities.map((opp) => ({
        role: opp.role,
        package: opp.package,
      })),
    };

    university.placement.push(newPlacement);
    await university.save();

    res.status(201).json({
      message: "Company added successfully",
      placement: newPlacement,
    });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({
      message: "Server error while adding company",
      error: error.message,
    });
  }
};

exports.getCompanyDashboardData = async (req, res) => {
  try {
    const { companyId } = req.params;
    const facultyId = req.faculty._id;

    const faculty = await Faculty.findById(facultyId)
      .select("university")
      .lean();

    const universityData = await University.findById(faculty.university)
      .select("placement students")
      .populate("students", "academic.graduationYear")
      .lean();

    if (!universityData) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    const companyPlacement = universityData.placement.find(
      (p) => p.company.name === companyId || p._id.toString() === companyId
    );

    if (!companyPlacement) {
      return res.status(404).json({
        success: false,
        message: "No placement data found for this company",
      });
    }

    // Get all student IDs from opportunities
    const studentIds = companyPlacement.opportunities.reduce((acc, opp) => {
      if (opp.students && Array.isArray(opp.students)) {
        const ids = opp.students.map((student) => student.studentId);
        return [...acc, ...ids];
      }
      return acc;
    }, []);

    // Fetch placed students data with necessary fields
    const studentsData = await Student.find({
      _id: { $in: studentIds },
    })
      .select({
        _id: 1,
        "personal.firstName": 1,
        "personal.lastName": 1,
        "academic.rollNumber": 1,
        "academic.degreeProgram": 1,
        "academic.branch": 1,
        "academic.section": 1,
        "academic.graduationYear": 1,
      })
      .lean();

    // Get all available graduation years from university students
    const allGraduationYears = [
      ...new Set(
        universityData.students
          .map((student) => student.academic?.graduationYear)
          .filter(Boolean)
      ),
    ].sort();

    // Format opportunities and placed students data
    const opportunities = companyPlacement.opportunities.map((opp) => ({
      role: opp.role || "N/A",
      package: opp.package || "0",
      placedCount: opp.students?.length || 0,
    }));

    const placedStudents = studentsData.map((student) => {
      let studentOffer = null;
      for (const opp of companyPlacement.opportunities) {
        const studentEntry = opp.students?.find(
          (s) => s.studentId.toString() === student._id.toString()
        );
        if (studentEntry) {
          studentOffer = opp;
          break;
        }
      }

      return {
        _id: student._id.toString(),
        name: `${student.personal.firstName} ${student.personal.lastName}`,
        rollNumber: student.academic.rollNumber,
        program: student.academic.degreeProgram,
        branch: student.academic.branch,
        section: student.academic.section,
        graduationYear: student.academic.graduationYear,
        role: studentOffer?.role || "N/A",
        package: studentOffer?.package || "N/A",
      };
    });

    // Calculate stats based on all placed students
    const calculateStats = (students) => ({
      totalOpportunities: opportunities.length,
      totalPlacedStudents: students.length,
      averagePackage:
        students.length > 0
          ? (
              students.reduce(
                (acc, student) => acc + (parseFloat(student.package) || 0),
                0
              ) / students.length
            ).toFixed(2)
          : "0",
    });

    const response = {
      success: true,
      data: {
        company: {
          name: companyPlacement.company?.name || "Unknown Company",
          logo: companyPlacement.company?.logo || "",
          industry: companyPlacement.company?.industry || "",
        },
        opportunities,
        placedStudents,
        stats: calculateStats(placedStudents),
        graduationYears: allGraduationYears,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getCompanyDashboardData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getCompanyRoles = async (req, res) => {
  try {
    const { companyId } = req.params;
    const facultyId = req.faculty._id;

    const university = await University.findById(req.faculty.university);
    const companyPlacement = university.placement.find(
      (p) => p._id.toString() === companyId || p.company.name === companyId
    );

    if (!companyPlacement) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        opportunities: companyPlacement.opportunities,
      },
    });
  } catch (error) {
    console.error("Error in getCompanyRoles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Controller to get eligible students for a role
exports.getEligibleStudents = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      role,
      degreeProgram,
      branch,
      section,
      graduationYear,
      page = 1,
      limit = 10,
    } = req.query;
    const university = await University.findById(req.faculty.university);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    // Find company
    const companyPlacement = university.placement.find(
      (p) => p._id.toString() === companyId || p.company.name === companyId
    );

    if (!companyPlacement) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Find the specific opportunity/role
    const opportunity = companyPlacement.opportunities.find(
      (opp) => opp.role === role
    );

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Build query filters
    const queryFilters = {
      "academic.university": university._id,
      "auth.status": "active",
      "auth.isDeactivated": false,
      $or: [
        // Student has no placement offers
        { "placement.offers": { $size: 0 } },
        // Student has offers but none from this company in this role
        {
          "placement.offers": {
            $not: {
              $elemMatch: {
                company: companyPlacement.company.name,
                role: role,
              },
            },
          },
        },
      ],
    };

    // Add optional filters
    if (degreeProgram) {
      queryFilters["academic.degreeProgram"] = degreeProgram;
    }
    if (branch) {
      queryFilters["academic.branch"] = branch;
    }
    if (section) {
      queryFilters["academic.section"] = section;
    }
    if (graduationYear) {
      queryFilters["academic.graduationYear"] = parseInt(graduationYear);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find eligible students with sorting and pagination
    const eligibleStudents = await Student.find(queryFilters)
      .select({
        "personal.firstName": 1,
        "personal.lastName": 1,
        "academic.rollNumber": 1,
        "academic.degreeProgram": 1,
        "academic.branch": 1,
        "academic.section": 1,
        "academic.graduationYear": 1,
      })
      .sort({
        "academic.graduationYear": 1,
        "academic.rollNumber": 1,
      })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Student.countDocuments(queryFilters);

    return res.status(200).json({
      success: true,
      data: {
        students: eligibleStudents,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error in getEligibleStudents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Updated controller to save placements
exports.updateCompanyPlacement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { companyId } = req.params;
    const { addedStudents, removedStudents } = req.body;

    const university = await University.findById(
      req.faculty.university
    ).session(session);
    if (!university) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    const companyPlacement = university.placement.id(companyId);
    if (!companyPlacement) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Company placement not found",
      });
    }

    if (removedStudents?.length > 0) {
      for (const opportunity of companyPlacement.opportunities) {
        opportunity.students = opportunity.students.filter(
          (student) => !removedStudents.includes(student.studentId.toString())
        );
      }

      for (const studentId of removedStudents) {
        const student = await Student.findById(studentId).session(session);
        if (student) {
          student.placement.offers = student.placement.offers.filter(
            (offer) => offer.company !== companyPlacement.company.name
          );

          student.placement.isPlaced = student.placement.offers.length > 0;

          await student.save({ session });
        }
      }
    }

    if (addedStudents?.length > 0) {
      for (const newStudent of addedStudents) {
        const opportunity = companyPlacement.opportunities.find(
          (opp) => opp.role === newStudent.role
        );

        if (opportunity) {
          const studentExists = opportunity.students.some(
            (s) => s.studentId.toString() === newStudent.studentId
          );

          if (!studentExists) {
            opportunity.students.push({
              studentId: newStudent.studentId,
            });
          }

          const student = await Student.findById(newStudent.studentId).session(
            session
          );
          if (student) {
            const offerExists = student.placement.offers.some(
              (offer) =>
                offer.company === companyPlacement.company.name &&
                offer.role === newStudent.role
            );

            if (!offerExists) {
              student.placement.offers.push({
                company: companyPlacement.company.name,
                role: newStudent.role,
                ctc: opportunity.package,
              });
            }

            student.placement.isPlaced = true;
            await student.save({ session });
          }
        }
      }
    }

    await university.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Placement updated successfully",
      data: {
        companyPlacement: university.placement.id(companyId),
      },
    });
  } catch (error) {
    console.error("Error in updateCompanyPlacement:", error);
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: "Failed to update placement",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.addCompanyRole = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { role, package } = req.body;

    if (!role || !package) {
      return res.status(400).json({
        success: false,
        message: "Role and package are required",
      });
    }

    const university = await University.findOne({
      "placement._id": companyId,
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const companyIndex = university.placement.findIndex(
      (p) => p._id.toString() === companyId
    );

    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Company not found in placements",
      });
    }

    university.placement[companyIndex].opportunities.push({
      role,
      package,
      students: [],
    });

    await university.save();

    return res.status(200).json({
      success: true,
      message: "Role added successfully",
      data: university.placement[companyIndex],
    });
  } catch (error) {
    console.error("Error adding role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
