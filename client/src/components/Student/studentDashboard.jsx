import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ErrorOverlay from "../Global/ErrorOverlay";
import LoadingOverlay from "../Global/LoadingOverlay";
import Cookies from "js-cookie";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student", "get", "dashboard"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_API_URL}/student/get/dashboard`,
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
            return null;
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

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50">
      {/* Greeting Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          {getGreeting()}, {student.name}
        </h1>
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
