// NotificationModal.jsx - The modal container with navigation handling
import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import NotificationTypes from "./NotificationTypes";
import NotificationMethods from "./NotificationMethods";
import EmailForm from "./EmailForm";
import WhatsAppTemplateForm from "./WhatsAppTemplateForm";
import DualNotificationForm from "./DualNotificationForm";

const NotificationModal = ({ students, onClose }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [status, setStatus] = useState("");

  const resetSelection = () => {
    setSelectedType(null);
    setSelectedMethod(null);
    setStatus("");
  };

  const notificationTypes = [
    { id: "job", title: "Job Posting Notification" },
    { id: "form", title: "Form Fill Notification" },
    { id: "reminder", title: "Remainder Notification" },
  ];

  const handleBackClick = () => {
    if (selectedMethod) {
      setSelectedMethod(null);
    } else if (selectedType) {
      setSelectedType(null);
    } else {
      onClose();
    }
  };

  const getCurrentTitle = () => {
    if (!selectedType) return "Notification Center";

    const typeName = notificationTypes.find(
      (t) => t.id === selectedType
    )?.title;

    if (!selectedMethod) return typeName;

    const methodNames = {
      email: "Email Notification",
      whatsapp: "WhatsApp Notification",
      both: "Email & WhatsApp Notification",
    };

    return `${typeName} - ${methodNames[selectedMethod]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          onClose();
          resetSelection();
        }}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-4xl max-h-[95vh] bg-white rounded-xl shadow-2xl p-6 mx-4 overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
            {getCurrentTitle()}
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleBackClick}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="overflow-y-auto pr-2 flex-1">
          {!selectedType && (
            <NotificationTypes
              notificationTypes={notificationTypes}
              onSelectType={setSelectedType}
            />
          )}

          {selectedType && !selectedMethod && (
            <NotificationMethods onSelectMethod={setSelectedMethod} />
          )}

          {selectedType && selectedMethod === "email" && (
            <EmailForm
              students={students}
              notificationType={selectedType}
              onBack={() => setSelectedMethod(null)}
              onSuccess={() => setStatus("success")}
              onError={() => setStatus("error")}
            />
          )}

          {selectedType && selectedMethod === "whatsapp" && (
            <WhatsAppTemplateForm
              students={students}
              notificationType={selectedType}
              onBack={() => setSelectedMethod(null)}
              onSuccess={() => setStatus("success")}
              onError={() => setStatus("error")}
            />
          )}

          {selectedType && selectedMethod === "both" && (
            <DualNotificationForm
              students={students}
              notificationType={selectedType}
              onBack={() => setSelectedMethod(null)}
              onSuccess={() => setStatus("success")}
              onError={() => setStatus("error")}
            />
          )}

          {status === "success" && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
              Notification sent successfully!
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              Failed to send notification. Please try again.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationModal;
