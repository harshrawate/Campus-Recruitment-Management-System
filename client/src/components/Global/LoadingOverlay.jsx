import React from "react";
import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100000] w-full
      bg-black/30 backdrop-blur-sm"
    >
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
        <p className="text-xl font-medium text-indigo-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
