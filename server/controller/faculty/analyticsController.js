const { Student } = require("../../models/Student");
const Faculty = require("../../models/Faculty");

exports.getFilters = async (req, res) => {
  try {
    const facultyId = req.faculty._id;
    const faculty = await Faculty.findById(facultyId).populate("university");

    if (!faculty || !faculty.university) {
      return res.status(404).json({
        error: !faculty ? "Faculty not found" : "University not found",
      });
    }

    // Get graduation years
    const graduationYears = await Student.distinct("academic.graduationYear", {
      "academic.university": faculty.university._id,
    });
    graduationYears.sort((a, b) => b - a);

    // Extract degree programs with their branches and sections in a hierarchical structure
    const university = faculty.university;
    const programsWithBranches = [];

    university.degreePrograms.forEach((prog) => {
      const programData = {
        name: prog.programName,
        branches: [],
      };

      prog.branches.forEach((branch) => {
        programData.branches.push({
          name: branch.name,
          sections: branch.sections,
        });
      });

      programsWithBranches.push(programData);
    });

    // For backward compatibility, also provide flat lists
    const allDegreePrograms = programsWithBranches.map((prog) => prog.name);
    const allBranches = new Set();
    const allSections = new Set();

    programsWithBranches.forEach((program) => {
      program.branches.forEach((branch) => {
        allBranches.add(branch.name);
        branch.sections.forEach((section) => allSections.add(section));
      });
    });

    return res.json({
      // Hierarchical structure that maintains relationships
      programsWithBranches,

      // Flat lists for backward compatibility
      degreePrograms: allDegreePrograms,
      branches: [...allBranches],
      sections: [...allSections],
      graduationYears,
    });
  } catch (error) {
    console.error("Filter Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const facultyId = req.faculty._id;
    const { degreeProgram, branch, section, graduationYear } = req.query;

    // Get faculty's university
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Build query with faculty's university and additional filters
    const query = {
      "academic.university": faculty.university,
    };

    if (degreeProgram) query["academic.degreeProgram"] = degreeProgram;
    if (branch) query["academic.branch"] = branch;
    if (section) query["academic.section"] = section;
    if (graduationYear)
      query["academic.graduationYear"] = parseInt(graduationYear);

    // Get students matching the filters - only fetch needed fields
    const students = await Student.find(query)
      .select({
        "academic.graduationYear": 1,
        "academic.cgpa": 1,
        "academic.backlogs": 1,
        "placement.isPlaced": 1,
        "placement.offers": 1,
      })
      .lean();

    // Calculate analytics
    const analytics = calculateAnalytics(students);

    return res.json(analytics);
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Calculate comprehensive analytics from student data
 */
function calculateAnalytics(students) {
  // Get unique graduation years
  const graduationYears = [
    ...new Set(students.map((s) => s.academic.graduationYear)),
  ].sort();

  // Prepare statistics objects
  const placementStats = {};
  const companyStats = {};
  const industryStats = {};
  const roleStats = {};

  // Calculate placement statistics by year
  graduationYears.forEach((year) => {
    const yearlyStudents = students.filter(
      (s) => s.academic.graduationYear === year
    );
    const placedStudents = yearlyStudents.filter((s) => s.placement.isPlaced);

    // Gather all package values from offers
    const packages = placedStudents
      .flatMap((s) => s.placement.offers || [])
      .map((o) => o.ctc)
      .filter(Boolean);

    // Calculate package statistics
    placementStats[year] = {
      totalStudents: yearlyStudents.length,
      placedStudents: placedStudents.length,
      highestPackage: packages.length ? Math.max(...packages) : 0,
      lowestPackage: packages.length ? Math.min(...packages) : 0,
      medianPackage: packages.length
        ? packages.sort((a, b) => a - b)[Math.floor(packages.length / 2)]
        : 0,
      averagePackage: packages.length
        ? packages.reduce((a, b) => a + b, 0) / packages.length
        : 0,
      offerCount: packages.length,
      placementRate:
        yearlyStudents.length > 0
          ? ((placedStudents.length / yearlyStudents.length) * 100).toFixed(2) +
            "%"
          : "0%",
    };
  });

  // Calculate company, industry, and role statistics
  students.forEach((student) => {
    if (student.placement.offers?.length) {
      student.placement.offers.forEach((offer) => {
        if (offer.company)
          companyStats[offer.company] = (companyStats[offer.company] || 0) + 1;
        if (offer.industry)
          industryStats[offer.industry] =
            (industryStats[offer.industry] || 0) + 1;
        if (offer.role)
          roleStats[offer.role] = (roleStats[offer.role] || 0) + 1;
      });
    }
  });

  return {
    placementStats,
    cgpaRanges: calculateCgpaRanges(students),
    companyStats,
    industryStats,
    roleStats,
    backlogStats: calculateBacklogStats(students),
  };
}

/**
 * Calculate CGPA range distribution
 */
function calculateCgpaRanges(students) {
  return {
    "< 6.0": students.filter((s) => s.academic.cgpa < 6).length,
    "6.0-6.5": students.filter(
      (s) => s.academic.cgpa >= 6 && s.academic.cgpa < 6.5
    ).length,
    "6.5-7.0": students.filter(
      (s) => s.academic.cgpa >= 6.5 && s.academic.cgpa < 7
    ).length,
    "7.0-7.5": students.filter(
      (s) => s.academic.cgpa >= 7 && s.academic.cgpa < 7.5
    ).length,
    "7.5-8.0": students.filter(
      (s) => s.academic.cgpa >= 7.5 && s.academic.cgpa < 8
    ).length,
    "8.0-8.5": students.filter(
      (s) => s.academic.cgpa >= 8 && s.academic.cgpa < 8.5
    ).length,
    "8.5-9.0": students.filter(
      (s) => s.academic.cgpa >= 8.5 && s.academic.cgpa < 9
    ).length,
    "9.0-9.5": students.filter(
      (s) => s.academic.cgpa >= 9 && s.academic.cgpa < 9.5
    ).length,
    "9.5-10.0": students.filter(
      (s) => s.academic.cgpa >= 9.5 && s.academic.cgpa <= 10
    ).length,
  };
}

/**
 * Calculate backlog statistics
 */
function calculateBacklogStats(students) {
  const backlogCounts = students.map((s) => s.academic.backlogs || 0);
  const withBacklogs = students.filter((s) => s.academic.backlogs > 0).length;
  const noBacklogs = students.length - withBacklogs;

  return {
    withBacklogs,
    noBacklogs,
    averageBacklogs: backlogCounts.length
      ? (
          backlogCounts.reduce((a, b) => a + b, 0) / backlogCounts.length
        ).toFixed(2)
      : 0,
    maxBacklogs: backlogCounts.length ? Math.max(...backlogCounts) : 0,
    backlogDistribution: {
      0: noBacklogs,
      "1-2": students.filter(
        (s) => s.academic.backlogs >= 1 && s.academic.backlogs <= 2
      ).length,
      "3-5": students.filter(
        (s) => s.academic.backlogs >= 3 && s.academic.backlogs <= 5
      ).length,
      "6+": students.filter((s) => s.academic.backlogs >= 6).length,
    },
  };
}
