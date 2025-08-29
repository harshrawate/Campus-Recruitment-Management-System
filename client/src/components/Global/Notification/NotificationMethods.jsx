// NotificationMethods.jsx - Component for selecting notification method
import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare } from "lucide-react";

const NotificationMethods = ({ onSelectMethod }) => {
  const notificationMethods = [
    {
      id: "email",
      title: "Email Notification",
      icon: <Mail className="w-6 h-6" />,
    },
    {
      id: "whatsapp",
      title: "WhatsApp Notification",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      id: "both",
      title: "Email & WhatsApp",
      icon: (
        <div className="flex space-x-1">
          <Mail className="w-6 h-6" />
          <MessageSquare className="w-6 h-6" />
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {notificationMethods.map((method) => (
        <motion.div
          key={method.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectMethod(method.id)}
          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full flex justify-center">
              {method.icon}
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              {method.title}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NotificationMethods;
