import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ErrorOverlay from "../Global/ErrorOverlay";
import LoadingOverlay from "../Global/LoadingOverlay";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");

  const fetchDashboardData = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_API_URL}/faculty/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["faculty", "dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleUniversityProfile = () => {
    navigate(`/university/${university._id}`);
  };

  if (isLoading) return <LoadingOverlay />;

  if (!data) {
    return <ErrorOverlay statusCode={404} message="No data available" />;
  }

  if (isError) {
    console.error(error);
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
  }

  const { university, faculty, placementStats, academicYear } = data;

  if (!university || !faculty) {
    return <ErrorOverlay statusCode={404} message="Missing required data" />;
  }

  const insights = {
    totalPlacedStudents: data.studentInsights.totalPlacedStudents,
    totalEligibleStudents: data.studentInsights.totalEligibleStudents,
    highestPackage: data.studentInsights.highestPackage,
    averagePackage: data.studentInsights.averagePackage,
  };

  const placementTrends = Object.entries(placementStats || {})
    .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
    .map(([year, stats]) => ({
      year: year,
      placed: stats.placedStudents || 0,
      total: stats.totalStudents || 0,
      rate: stats.totalStudents
        ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1)
        : "0.0",
    }));

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50">
      {/* Greeting Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          {getGreeting()}, {faculty.name}
        </h1>
      </div>

      {/* University Profile Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
              <img
                src={university.logo}
                alt={university.name}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
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
          <button
            onClick={handleUniversityProfile}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold 
                     hover:bg-indigo-700 transition-colors duration-200 shadow-md
                     flex items-center space-x-2"
          >
            <span>View University Profile</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(insights).map(([key, value]) => {
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .trim()
            .replace(/^Total /i, ""); // Removes "Total " from beginning if present

          return (
            <div
              key={key}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-500 capitalize">
                {`Total ${formattedKey} of ${academicYear || "N/A"}`}
              </h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {value}
                {key.includes("Rate") || key.includes("Attendance") ? "%" : ""}
              </p>
            </div>
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Placement Trends Over Years
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={placementTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" padding={{ left: 20, right: 20 }} />
              <YAxis
                yAxisId="left"
                domain={[0, "auto"]}
                allowDecimals={false}
                label={{
                  value: "Students",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                label={{
                  value: "Placement Rate %",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "rate") return [`${value}%`, "Placement Rate"];
                  return [
                    value,
                    name === "placed" ? "Placed Students" : "Total Students",
                  ];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="placed"
                stroke="#4F46E5"
                name="Placed Students"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total"
                stroke="#10B981"
                name="Total Students"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                stroke="#F59E0B"
                name="Placement Rate %"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default FacultyDashboard;
