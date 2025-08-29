import React from "react";
import { motion } from "framer-motion";

const ProgressIndicator = ({ currentStep, steps }) => (
  <div className="mb-8">
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{
          width: `${((currentStep + 1) / steps.length) * 100}%`,
        }}
        transition={{ duration: 0.5 }}
        className="h-2 bg-indigo-500 rounded-full"
      />
    </div>
    <div className="flex justify-between mt-2">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: index <= currentStep ? 1 : 0.5,
            color: index <= currentStep ? "#6366f1" : "#9ca3af",
          }}
          className="text-xs"
        >
          {step}
        </motion.div>
      ))}
    </div>
  </div>
);

export default ProgressIndicator;
