const mongoose = require("mongoose");
const Faculty = require("../../models/Faculty");
const University = require("../../models/University");
const { Student } = require("../../models/Student");

exports.dashboard = async (req, res) => {
  try {
    const facultyId = req.faculty._id;

    const faculty = await Faculty.findById(facultyId)
      .populate("university")
      .lean();

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const universityId = faculty.university._id;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const batchYear = month < 5 ? year : year + 1;
    const studentInsights = await Student.aggregate([
      {
        $match: {
          "academic.university": new mongoose.Types.ObjectId(universityId),
          "academic.graduationYear": batchYear,
        },
      },
      {
        $facet: {
          eligibleStudents: [
            {
              $match: {
                "academic.backlogs": 0,
                "academic.cgpa": { $gt: 6 },
              },
            },
            { $count: "count" },
          ],

          placementInsights: [
            {
              $match: {
                "placement.isPlaced": true,
              },
            },
            {
              $unwind: "$placement.offers",
            },
            {
              $group: {
                _id: null,
                totalPlacedStudents: { $sum: 1 },
                highestPackage: { $max: "$placement.offers.ctc" },
                averagePackage: { $avg: "$placement.offers.ctc" },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalEligibleStudents: {
            $ifNull: [{ $arrayElemAt: ["$eligibleStudents.count", 0] }, 0],
          },
          totalPlacedStudents: {
            $ifNull: [
              { $arrayElemAt: ["$placementInsights.totalPlacedStudents", 0] },
              0,
            ],
          },
          highestPackage: {
            $ifNull: [
              { $arrayElemAt: ["$placementInsights.highestPackage", 0] },
              0,
            ],
          },
          averagePackage: {
            $ifNull: [
              { $arrayElemAt: ["$placementInsights.averagePackage", 0] },
              0,
            ],
          },
        },
      },
    ]);

    // Get placement trends data (similar to analytics endpoint)
    // Get all students from this university
    const students = await Student.find({
      "academic.university": universityId,
    }).lean();

    // Get all graduation years for these students
    const graduationYears = [
      ...new Set(students.map((s) => s.academic.graduationYear)),
    ].sort();

    // Calculate placement statistics by year
    const placementStats = {};

    // Initialize stats for each year
    graduationYears.forEach((year) => {
      const yearlyStudents = students.filter(
        (s) => s.academic.graduationYear === year
      );

      const placedStudents = yearlyStudents.filter((s) => s.placement.isPlaced);

      // Calculate package statistics
      const packages = placedStudents
        .flatMap((s) => s.placement.offers)
        .map((o) => o.ctc);

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
      };
    });

    // Fetch university details
    const university = await University.findById(universityId)
      .select("name email website address logo")
      .lean();

    return res.status(200).json({
      university,
      faculty,
      studentInsights: studentInsights[0] || {
        totalEligibleStudents: 0,
        totalPlacedStudents: 0,
        highestPackage: 0,
        averagePackage: 0,
      },
      placementStats,
      academicYear: batchYear,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
