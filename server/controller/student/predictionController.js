const axios = require("axios");
const { Student } = require("../../models/Student");

const predictPlacement = async (req, res) => {
  try {
    const studentId = req.userId; // From verifyTokenAndRole middleware
    
    // Get payload data from request, or fallback to database if possible
    const {
      cgpa,
      avg_test_score,
      technical_score,
      aptitude_score,
      num_projects,
      num_internships,
      branch,
      skills
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const name = `${student.personal?.firstName || ""} ${student.personal?.lastName || ""}`.trim();
    const finalBranch = branch || student.academic?.branch || "Computer Science";
    const finalSkills = skills && skills.length > 0 ? skills : (student.professional?.skills || []);

    // Prepare payload for FastAPI
    const payload = {
      student_id: studentId.toString(),
      name: name,
      branch: finalBranch,
      cgpa: Number(cgpa || student.academic?.cgpa || 0),
      avg_test_score: Number(avg_test_score || 0),
      technical_score: Number(technical_score || 0),
      aptitude_score: Number(aptitude_score || 0),
      num_projects: Number(num_projects || 0),
      num_internships: Number(num_internships || 0),
      skills: finalSkills
    };

    // Call Python FastAPI
    // Ensure the FastAPI server is running on port 8000
    const pythonApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000/predict";
    const response = await axios.post(pythonApiUrl, payload);
    const predictionResult = response.data;

    // Update the student document
    const newPredictionData = {
      ...payload,
      placed: predictionResult.placed,
      company: predictionResult.company,
      salary: predictionResult.salary || null
    };

    student.predictions = newPredictionData;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Prediction successful and saved.",
      prediction: newPredictionData,
      probability: predictionResult.probability
    });

  } catch (error) {
    console.error("Error in AI prediction:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate prediction.", 
      error: error.response?.data || error.message 
    });
  }
};

module.exports = {
  predictPlacement
};
