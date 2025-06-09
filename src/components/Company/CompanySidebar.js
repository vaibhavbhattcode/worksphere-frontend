import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBriefcase,
  FaUser,
  FaChartBar,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  {
    name: "Overview",
    icon: <FaTachometerAlt />,
    path: "/company",
    exact: true,
  },
  { name: "Job Postings", icon: <FaBriefcase />, path: "/company/jobs" },
  { name: "Posted Jobs", icon: <FaBriefcase />, path: "/company/posted-jobs" },
  { name: "Applications", icon: <FaUser />, path: "/company/applications" },
  { name: "Interviews", icon: <FaChartBar />, path: "/company/interviews" },
  { name: "Notifications", icon: <FaBell />, path: "/company/notifications" },
  { name: "Profile", icon: <FaUser />, path: "/company/profile" },
  { name: "Settings", icon: <FaCog />, path: "/company/settings" },
];

const CompanySidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/company/auth/status",
          { withCredentials: true }
        );
        if (!res.data.loggedIn || res.data.type !== "company") {
          navigate("/company/login");
        }
      } catch (err) {
        if (err.response?.status === 429) {
          console.warn("Too many requests. Please wait before trying again.");
        } else {
          navigate("/company/login");
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/company/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/company/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg z-30 overflow-y-auto"
      >
        <div className="flex items-center p-6 border-b border-indigo-700/50">
          <NavLink to="/company" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-800 text-2xl font-bold shadow-md ring-2 ring-indigo-600/30">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Company Panel
            </span>
          </NavLink>
        </div>
        <nav className="flex-1 mt-4 px-3">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-3 px-4 rounded-lg mb-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      isActive
                        ? "bg-indigo-700 text-white border-l-4 border-indigo-300"
                        : "text-indigo-100 hover:bg-indigo-700/80 hover:text-white"
                    }`
                  }
                  aria-label={item.name}
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-lg"
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
        <div className="p-4 text-xs text-indigo-300 dark:text-gray-400 text-center">
          © 2025 Company Panel
        </div>
      </motion.div>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-indigo-800 to-indigo-900 dark:from-gray-900 dark:to-gray-800 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-40">
        <NavLink to="/company" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-800 text-xl font-bold shadow-md">
            C
          </div>
          <span className="text-lg font-semibold">Company Panel</span>
        </NavLink>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="p-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="relative bg-gradient-to-b from-indigo-800 to-indigo-900 dark:from-gray-900 dark:to-gray-800 text-white w-72 h-full p-6 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-6">
                <NavLink
                  to="/company"
                  className="flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-800 text-2xl font-bold shadow-md ring-2 ring-indigo-600/30">
                    C
                  </div>
                  <span className="text-xl font-semibold">Company Panel</span>
                </NavLink>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close sidebar"
                  className="p-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav>
                <ul>
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.path}
                        end={item.exact}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 py-3 px-4 rounded-lg mb-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            isActive
                              ? "bg-indigo-700 text-white border-l-4 border-indigo-300"
                              : "text-indigo-100 hover:bg-indigo-700/80 hover:text-white"
                          }`
                        }
                        aria-label={item.name}
                      >
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-lg"
                        >
                          {item.icon}
                        </motion.span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto p-4 border-t border-indigo-700/50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
              <div className="p-4 text-xs text-indigo-300 dark:text-gray-400 text-center">
                © 2025 Company Panel
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CompanySidebar;
