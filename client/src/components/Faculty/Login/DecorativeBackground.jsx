import React from "react";
import { motion } from "framer-motion";

const FacultyBackground = React.memo(({ elements }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {elements.map((element, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70"
          style={{
            background: `radial-gradient(circle, ${element.color} 0%, transparent 70%)`,
            width: element.width,
            height: element.height,
            top: element.top,
            left: element.left,
          }}
          animate={{
            x: [0, element.movement],
            y: [0, element.movement],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: element.animationDuration,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
});

export default FacultyBackground;
