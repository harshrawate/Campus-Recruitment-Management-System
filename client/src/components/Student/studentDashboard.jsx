import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import ErrorOverlay from "../Global/ErrorOverlay";
import LoadingOverlay from "../Global/LoadingOverlay";
// import Cookies from "js-cookie";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student", "get", "dashboard"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_API_URL}/student/get/dashboard?t=${new Date().getTime()}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );
        console.log(response);
        return response.data;
      } catch (error) {
        console.error(error);
        if (error.response) {
          if (error.response.status === 300 && error.response.data.redirect) {
            navigate(error.response.data.redirect);
            throw new Error('Redirecting to Profile Completion.......');
          }
          if (error.response.status === 401) {
            throw new Error("Unauthorized access");
          }
          throw new Error(error.response.data.error || "An error occurred");
        }
        throw error;
      }
    },
    retry: false,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error.message === "Unauthorized access") {
      return <ErrorOverlay statusCode={401} />;
    }
    return <ErrorOverlay message={error.message} />;
  }

  const student = data?.student;
  const university = data?.university;

  // Format chart data for visualization
  const chartData = student?.predictions?.company_probabilities
    ? student.predictions.company_probabilities
      .map(c => ({
        name: c.company,
        probability: Number((c.probability * 100).toFixed(1))
      }))
      .sort((a, b) => b.probability - a.probability)
    : [];

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50">
      {/* Greeting Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          {getGreeting()}, {student.name}
        </h1>
      </div>

      {/* AI Prediction Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">🔮</span> AI Placement Predictor
            </h2>
          </div>

          {student.predictions && student.predictions.placement_probability !== undefined ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-100 flex flex-col justify-center items-center text-center shadow-inner">
                  <p className="text-sm font-semibold text-indigo-800 mb-2 uppercase tracking-wider">Placement Probability</p>
                  <p className="text-5xl font-extrabold text-indigo-600">
                    {(student.predictions.placement_probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 flex flex-col justify-center items-center text-center shadow-inner">
                  <p className="text-sm font-semibold text-blue-800 mb-2 uppercase tracking-wider">Top Company Match</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {student.predictions.company || "None"}
                  </p>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Company Match Probabilities</h3>
                  <div className="h-80 w-full mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9CA3AF', fontSize: 13 }}
                          domain={[0, 100]}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                          cursor={{ fill: '#F8FAFC' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '12px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                          formatter={(value) => [`${value}%`, 'Placement Match']}
                        />
                        <Bar dataKey="probability" radius={[6, 6, 0, 0]} animationDuration={1500}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#818CF8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Evaluated Metrics (Read Only) */}
              <div className="pt-6 border-t border-gray-100 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Metrics Evaluated</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">CGPA</p>
                    <p className="text-2xl font-black text-gray-800">{student.predictions.cgpa || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Avg Test Score</p>
                    <p className="text-2xl font-black text-gray-800">{student.predictions.avg_test_score || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Technical Score</p>
                    <p className="text-2xl font-black text-gray-800">{student.predictions.technical_score || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Aptitude Score</p>
                    <p className="text-2xl font-black text-gray-800">{student.predictions.aptitude_score || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Projects</p>
                    <p className="text-2xl font-black text-gray-800">{student.predictions.num_projects || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Internships</p>
                    <p className="text-2xl font-black text-gray-800">{student.predictions.num_internships || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 col-span-2 md:col-span-2">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {student.predictions.skills && student.predictions.skills.length > 0 ? (
                        student.predictions.skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-semibold shadow-sm border border-indigo-200">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 font-medium">None Listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-600 border border-gray-200">
              <p className="text-lg font-medium">No prediction data available yet.</p>
              <p className="text-sm mt-2">Your faculty will review your profile to calculate your placement chances.</p>
            </div>
          )}
        </div>
      </div>

      {/* University Profile Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <img
                src={university.logo}
                alt={university.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {university.name}
              </h2>
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                {university.website}
              </a>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              University Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="text-indigo-600 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">University Email</p>
                  <p className="text-gray-700">{university.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-indigo-600 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">My Roll Number</p>
                  <p className="text-gray-700">
                    {student.rollNumber || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-indigo-600 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">My Program</p>
                  <p className="text-gray-700">
                    {student.program || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-indigo-600 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">My Branch</p>
                  <p className="text-gray-700">
                    {student.branch || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-indigo-600 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12A6 6 0 0010 4z"
                      clipRule="evenodd"
                    />
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">University Location</p>
                  <p className="text-gray-700">{university.address}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-indigo-600 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-gray-700">{university.totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Degree Programs Section */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">
                Available Degree Programs
              </h4>
              <div className="flex flex-wrap gap-2">
                {university.degreePrograms &&
                  university.degreePrograms.length > 0 ? (
                  university.degreePrograms.map((program, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {program}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">
                    No programs available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
