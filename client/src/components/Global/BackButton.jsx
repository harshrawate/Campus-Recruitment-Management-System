import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 transition-colors duration-200 text-indigo-600 hover:text-indigo-800"
    >
      <ChevronLeft className="h-5 w-5" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
