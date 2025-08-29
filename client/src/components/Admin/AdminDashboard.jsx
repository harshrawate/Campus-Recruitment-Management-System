import { useQuery } from "@tanstack/react-query";
import React from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Cookies from "js-cookie";
import ErrorOverlay from "../Global/ErrorOverlay";
import LoadingOverlay from "../Global/LoadingOverlay";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const jwtToken = Cookies.get("userCookie");

  const fetchDashboardData = () => {
    return axios.get(
      `${import.meta.env.VITE_SERVER_API_URL}/admin/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    enabled: true,
    // refetchOnWindowFocus: true,
    // refetchOnReconnect: true,
    // refetchOnMount: false,
    // refetchInterval: 5000,
    // retry: 3,
    // retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const insights = {
    totalColleges: 120,
    totalStudents: 5000,
    totalCourses: 50,
    totalAssignments: 200,
    activeStudents: 4500,
    newEnrollments: 100,
  };

  const graphData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "New Enrollments",
        data: [10, 20, 30, 40, 50, 60],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.1,
      },
    ],
  };

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
    console.error(error);
  }

  const hour = new Date().getHours();

  // Determine the time of day
  const getGreeting = () => {
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50">
      <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          {getGreeting()}, {data?.data?.name}!
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(insights).map(([key, value]) => (
          <div
            key={key}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Enrollment Trends
        </h2>
        <div className="h-64">
          <Line
            data={graphData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    usePointStyle: true,
                    font: {
                      weight: 600,
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(0,0,0,0.05)",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
