import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth } from "./redux/authSlice";
import { ToastContainer, Bounce } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";

// Import Login Components
import AdminLogin from "./components/Admin/Login/Login";
import FacultyLogin from "./components/Faculty/Login/Login";
import StudentLogin from "./components/Student/Login/Login";

// Import Layouts and Components
import AdminLayout from "./Layouts/AdminLayout";
import FacultyLayout from "./Layouts/FacultyLayout";
import StudentLayout from "./Layouts/StudentLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminTeam from "./components/Admin/AdminTeam";
import AdminUniversity from "./components/Admin/AdminUniversity";
import UniversityProfile from "./components/Shared/UniversityProfile/UniversityProfile";
import LoadingOverlay from "./components/Global/LoadingOverlay";
import FacultyDashboard from "./components/Faculty/FacultyDashboard";
import FacultyTeam from "./components/Faculty/FacultyTeam";
import StudentRegistrationForm from "./components/Student/StudentRegistrationForm";
import StudentProfileForm from "./components/Student/Student Profile/StudentProfileForm";

import ProtectedRoute from "./Auth/ProtectedRoute";
import StudentDashboard from "./components/Student/studentDashboard";
import ForgotPassword from "./components/Shared/forgotPassword";
import ResetPassword from "./components/Shared/resetPassword";
import StudentList from "./components/Shared/StudentData/StudentList";
import StudentProfile from "./components/Shared/StudentData/StudentProfile";
import FilteredStudent from "./components/Faculty/FilteredStudent";
import FacultyAnalytics from "./components/Faculty/FacultyAnalytics";
import FacultyCompanies from "./components/Faculty/Placements/FacultyComapnies";
import CompanyProfile from "./components/Faculty/Placements/CompanyProfile";

const App = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route
          path="/student/create-profile"
          element={<StudentRegistrationForm />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin/universities" element={<AdminUniversity />} />
          <Route path="/admin/students" element={<StudentList />} />
        </Route>

        {/* Faculty Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Head", "Coordinator"]}>
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/team" element={<FacultyTeam />} />
          <Route path="/faculty/students" element={<StudentList />} />
          <Route path="/faculty/filter/student" element={<FilteredStudent />} />
          <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
          <Route path="/faculty/companies" element={<FacultyCompanies />} />
        </Route>

        {/* Student Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route
            path="/student/update-profile"
            element={<StudentProfileForm />}
          />
        </Route>

        {/* Shared Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "Super Admin",
                "Admin",
                "Head",
                "Coordinator",
                "Student",
              ]}
            >
              <UniversityProfile />
            </ProtectedRoute>
          }
        >
          <Route path="/university/:id" element={<UniversityProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentProfileForm />
            </ProtectedRoute>
          }
        >
          <Route
            path="/student/complete-profile"
            element={<StudentProfileForm />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["Head", "Coordinator"]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        >
          <Route path="/company/:id" element={<CompanyProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Super Admin", "Admin", "Head", "Coordinator"]}
            >
              <StudentProfile />
            </ProtectedRoute>
          }
        >
          <Route path="/student/:id" element={<StudentProfile />} />
        </Route>

        {/* <Route>
          element=
          {
            <ProtectedRoute
              allowedRoles={["Head", "Coordinator", "Student"]}
            >
            <Route path="/forms/:id"/>
            </ProtectedRoute>
          }
        </Route> */}

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login/student" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
};

export default App;
