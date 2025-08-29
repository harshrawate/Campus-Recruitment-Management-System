import React from "react";
import { motion } from "framer-motion";

const FormField = ({
  label,
  error,
  required = false,
  children,
  className = "",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`mb-4 ${className}`}
  >
    <label className="block text-sm font-medium text-indigo-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </motion.div>
);

export default FormField;
