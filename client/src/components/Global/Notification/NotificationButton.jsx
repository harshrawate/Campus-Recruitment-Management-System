// NotificationButton.jsx - Main component that orchestrates the notification system
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationModal from "./NotificationModal";

const NotificationButton = ({ students }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 flex items-center gap-2"
      >
        <Bell className="w-4 h-4" /> Notification Center
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <NotificationModal
            students={students}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationButton;
