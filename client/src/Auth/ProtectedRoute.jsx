// src/Auth/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingOverlay from "../components/Global/LoadingOverlay";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, role, isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return <LoadingOverlay />; // Use a loading component instead of null
  }

  // First, check if token exists and role is allowed
  if (!token) {
    // Redirect to specific login based on route requirements
    const loginRoutes = {
      Admin: "/login/admin",
      "Super Admin": "/login/admin",
      Head: "/login/faculty",
      Coordinator: "/login/faculty",
      Student: "/login/student",
    };

    const defaultLoginRoute = loginRoutes[allowedRoles[0]] || "/login/student";
    return <Navigate to={defaultLoginRoute} replace />;
  }

  // Check if user's role matches allowed roles
  if (!allowedRoles.includes(role)) {
    const dashboardRoutes = {
      "Super Admin": "/admin/dashboard",
      Admin: "/admin/dashboard",
      Head: "/faculty/dashboard",
      Coordinator: "/faculty/dashboard",
      Student: "/student/dashboard",
    };

    const defaultDashboard = dashboardRoutes[role] || "/";
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
