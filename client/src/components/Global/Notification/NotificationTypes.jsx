// NotificationTypes.jsx - Component for selecting notification type
import React from "react";
import { motion } from "framer-motion";
import { Briefcase, FileText, Clock } from "lucide-react";

const NotificationTypes = ({ notificationTypes, onSelectType }) => {
  // Map of icons for each notification type
  const typeIcons = {
    job: <Briefcase className="w-6 h-6" />,
    form: <FileText className="w-6 h-6" />,
    reminder: <Clock className="w-6 h-6" />,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {notificationTypes.map((type) => (
        <motion.div
          key={type.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectType(type.id)}
          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              {typeIcons[type.id]}
            </div>
            <h3 className="text-lg font-medium text-gray-800">{type.title}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NotificationTypes;
