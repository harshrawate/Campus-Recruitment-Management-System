import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../../redux/facultySidebarSlice";
import { motion, AnimatePresence } from "framer-motion";
import { SiGoogleforms } from "react-icons/si";
import { PiStudent } from "react-icons/pi";
import { LiaSuitcaseSolid } from "react-icons/lia";

import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  ChartPie,
} from "lucide-react";

const sidebarVariants = {
  expanded: { width: "240px" },
  collapsed: { width: "60px" },
};

const menuItemVariants = {
  hover: { x: 4 },
  tap: { scale: 0.98 },
};

const iconContainerVariants = {
  hover: { y: -2 },
  initial: { y: 0 },
};

const MENU_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/faculty/dashboard",
    ariaLabel: "Navigate to Dashboard",
  },
  {
    icon: Users,
    label: "Team",
    path: "/faculty/team",
    ariaLabel: "Navigate to Team Management",
  },
  {
    icon: PiStudent,
    label: "Students",
    path: "/faculty/students",
    ariaLabel: "Navigate to Students",
  },
  {
    icon: LiaSuitcaseSolid,
    label: "Companies",
    path: "/faculty/companies",
    ariaLabel: "Navigate to Companies",
  },
  {
    icon: SlidersHorizontal,
    label: "Filter and Download",
    path: "/faculty/filter/student",
    ariaLabel: "Navigate to Filter and Download",
  },
  {
    icon: ChartPie,
    label: "Analytics",
    path: "/faculty/analytics",
    ariaLabel: "Navigate to Analytics",
  },
  // {
  //   icon: SiGoogleforms,
  //   label: "Forms",
  //   path: "/faculty/forms",
  //   ariaLabel: "Navigate to Forms",
  // },
];

const MenuItem = React.memo(({ item, isOpen }) => {
  const IconComponent = item.icon;
  return (
    <motion.div
      className="group flex items-center mb-2 cursor-pointer rounded-lg transition-colors"
      variants={menuItemVariants}
      whileHover="hover"
      whileTap="tap"
      aria-label={item.ariaLabel}
      role="menuitem"
      data-testid={`menu-item-${item.label.toLowerCase()}`}
    >
      <Link
        to={item.path}
        className={`
          flex items-center
          ${
            isOpen
              ? "p-2 hover:bg-green-50 w-full"
              : "p-1 hover:bg-green-50 justify-center"
          }
        `}
      >
        <motion.span
          className={`
            flex items-center justify-center bg-indigo-600
             text-white rounded-full transition-all
            ${isOpen ? "p-2 min-w-[40px]" : "p-1.5 w-8 h-8"}
          `}
          variants={iconContainerVariants}
          initial="initial"
        >
          <IconComponent size={24} />
        </motion.span>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between items-center w-full ml-4 whitespace-nowrap"
            >
              <span className="text-base font-medium">{item.label}</span>
              {item.count !== undefined && (
                <motion.span
                  className="ml-auto text-xs bg-indigo-500 text-white rounded-full px-2 py-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.count}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
});

MenuItem.displayName = "MenuItem";

const FacultySidebar = () => {
  const isOpen = useSelector((state) => state.facultySidebar.isOpen);
  const dispatch = useDispatch();

  const handleToggle = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const toggleIcon = useMemo(() => {
    return isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />;
  }, [isOpen]);

  return (
    <motion.div
      className="h-full bg-white text-gray-800 shadow-lg z-10 flex flex-col"
      variants={sidebarVariants}
      initial="collapsed"
      animate={isOpen ? "expanded" : "collapsed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="p-4 flex items-center justify-between pb-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
        <motion.button
          className="text-xl hover:bg-gray-100 rounded-full"
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          data-testid="sidebar-toggle"
        >
          {toggleIcon}
        </motion.button>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2 py-4"
        role="menu"
        aria-label="Faculty Sidebar Navigation Menu"
      >
        {MENU_ITEMS.map((item) => (
          <MenuItem key={item.path} item={item} isOpen={isOpen} />
        ))}
      </nav>
    </motion.div>
  );
};

export default React.memo(FacultySidebar);
