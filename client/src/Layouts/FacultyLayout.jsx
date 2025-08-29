import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import FacultySidebar from "../components/Global/Sidebar/FacultySidebar";
import Header from "../components/Global/Header";
import { Outlet } from "react-router-dom";

const FacultyLayout = ({ children }) => {
  const isOpen = useSelector((state) => state.facultySidebar.isOpen);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <motion.div
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg z-10"
          initial={false}
          animate={{
            width: isOpen ? "240px" : "60px",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <FacultySidebar />
        </motion.div>

        <motion.main
          className="flex-1 overflow-y-auto p-6 bg-white"
          initial={false}
          animate={{
            marginLeft: isOpen ? "210px" : "40px",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            marginTop: "44px",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default FacultyLayout;
