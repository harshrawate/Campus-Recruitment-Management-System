import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, LogOut, User } from "lucide-react";
import Cookies from "js-cookie";
import { clearAuth } from "../../redux/authSlice";
import { getUserRole } from "../../utils/auth";

const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleNotification = () => {
    setIsNotificationOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationOpen(false);
  };

  return (
    <header className="bg-white shadow-lg w-full fixed top-0 left-0 h-16 z-50 border-b border-indigo-100">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-indigo-600">
            Campus Recruitment Gateway
          </h1>
        </div>

        <div className="flex items-center space-x-4 relative">
          {/* <IconButton
            icon={Bell}
            onClick={toggleNotification}
            isActive={isNotificationOpen}
          />
          <AnimatePresence>
            {isNotificationOpen && <NotificationPanel />}
          </AnimatePresence> */}

          <IconButton
            icon={User}
            onClick={toggleProfile}
            isActive={isProfileOpen}
          />
          <AnimatePresence>
            {isProfileOpen && <ProfileDropdown />}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const IconButton = ({ icon: Icon, onClick, isActive }) => (
  <motion.button
    onClick={onClick}
    className={`p-2 rounded-full ${
      isActive ? "bg-indigo-100" : "hover:bg-indigo-50"
    } text-indigo-600 transition-colors duration-200`}
    whileHover={{ scale: 1.1 }}
  >
    <Icon size={24} />
  </motion.button>
);

const NotificationPanel = () => (
  <motion.div
    className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-xl py-2 z-50 border border-indigo-100"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    <h3 className="text-lg font-semibold text-indigo-600 px-4 py-2 border-b border-indigo-100">
      Notifications
    </h3>
    <div className="px-4 py-2 text-sm text-gray-600">
      <p className="mb-2">🌱 New crop yield predictions available!</p>
      <p>🚜 Maintenance reminder for Tractor #3</p>
    </div>
  </motion.div>
);

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = getUserRole();

  const getLoginPath = (userRole) => {
    const loginPaths = {
      "super admin": "/login/admin",
      admin: "/login/admin",
      head: "/login/faculty",
      coordinator: "/login/faculty",
      student: "/login/student",
    };
    return loginPaths[userRole] || "/login/student";
  };

  const handleLogout = () => {
    try {
      // Remove the cookie
      Cookies.remove("userCookie");

      // Clear the auth state in Redux
      dispatch(clearAuth());

      // Get the appropriate login path based on user role
      const loginPath = getLoginPath(role);

      // Navigate to login page - this will trigger ProtectedRoute's logic
      navigate(loginPath, { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const openProfileComponent = () => {
    navigate("/user/profile");
  };

  const menuItems = [
    { icon: User, text: "Profile", onClick: openProfileComponent },
    { icon: Settings, text: "Settings", href: "#" },
    { icon: LogOut, text: "Logout", onClick: handleLogout },
  ];

  return (
    <motion.div
      className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-indigo-100"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
          onClick={item.onClick}
        >
          <item.icon size={18} className="mr-2 text-indigo-600" />
          {item.text}
        </button>
      ))}
    </motion.div>
  );
};

export default Header;
