import React from "react";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";

const NoItems = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center min-h-fit bg-gray-50 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <div className="relative">
          <FolderOpen className="w-24 h-24 text-gray-300" strokeWidth={1.5} />
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{
              y: [0, -8, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h3
        className="mt-6 text-xl font-semibold text-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        No Items Found
      </motion.h3>

      <motion.p
        className="mt-2 text-sm text-gray-500 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Looks like there aren't any items here yet. Try adding some new items to
        get started.
      </motion.p>
    </motion.div>
  );
};

export default NoItems;
