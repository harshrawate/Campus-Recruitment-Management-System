import React, { useMemo } from "react";
import { motion } from "framer-motion";

const CompanyBackground = () => {
  const backgroundCircles = useMemo(() => {
    return [...Array(3)].map((_, i) => ({
      color: ["#10B981", "#3B82F6", "#8B5CF6"][i],
      width: Math.random() * 600 + 400,
      height: Math.random() * 600 + 400,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      xOffset: Math.random() * 100 - 50,
      yOffset: Math.random() * 100 - 50,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hexagons"
            width="50"
            height="43.4"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(2)"
          >
            <path
              d="M25 0 L50 14.4 L50 28.8 L25 43.4 L0 28.8 L0 14.4 Z"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
      {backgroundCircles.map((circle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70"
          style={{
            background: `radial-gradient(circle, ${circle.color} 0%, transparent 70%)`,
            width: `${circle.width}px`,
            height: `${circle.height}px`,
            top: `${circle.top}%`,
            left: `${circle.left}%`,
          }}
          animate={{
            x: [0, circle.xOffset],
            y: [0, circle.yOffset],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(CompanyBackground);
