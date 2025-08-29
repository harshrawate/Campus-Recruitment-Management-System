import React from "react";

const DecorativeBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#E5E7EB" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 rounded-bl-full opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-200 via-green-200 to-blue-200 rounded-tr-full opacity-30 transform -translate-x-1/3 translate-y-1/3"></div>
    </div>
  );
};

export default DecorativeBackground;
