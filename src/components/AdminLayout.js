import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiLayers,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiBell,
  FiSun,
  FiMoon,
  FiSearch,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: <FiHome /> },
  { label: "Users", to: "/admin/users", icon: <FiUsers /> },
  { label: "Companies", to: "/admin/companies", icon: <FiBriefcase /> },
  { label: "Jobs", to: "/admin/jobs", icon: <FiLayers /> },
];

const sidebarVariants = {
  open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 40 } },
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setNotificationDropdownOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
    setUserDropdownOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || windowWidth >= 1024) && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 w-64 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                JobPortal Admin
              </h1>
              {windowWidth < 1024 && (
                <button
                  className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={toggleSidebar}
                  aria-label="Close sidebar"
                >
                  <FiX size={24} />
                </button>
              )}
            </div>
            <nav className="flex-1 sticky top-0 overflow-y-auto">
              <ul>
                {navItems.map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors duration-200 ${
                        isActive(to)
                          ? "bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 font-semibold"
                          : ""
                      }`}
                    >
                      <span className="text-lg">{icon}</span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
              >
                <FiLogOut size={20} />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-margin duration-300 ease-in-out ${
          sidebarOpen && windowWidth >= 1024 ? "ml-64" : "ml-0"
        }`}
        style={{ height: "calc(100vh - 0px)" }}
      >
        {/* Mobile header */}
        {windowWidth < 1024 && (
          <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow p-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Open sidebar"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <div className="flex items-center gap-4">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-4 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <FiSearch className="absolute left-2 top-1.5 text-gray-400" />
              </div>

              {/* Notification bell */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={toggleNotificationDropdown}
                  className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 relative"
                  aria-label="Notifications"
                >
                  <FiBell size={24} />
                  <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                </button>
                <AnimatePresence>
                  {notificationDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
                    >
                      <ul className="p-2 max-h-60 overflow-y-auto">
                        <li className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          New user registered
                        </li>
                        <li className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Job posted by Company XYZ
                        </li>
                        <li className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Server maintenance scheduled
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User profile */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    A
                  </div>
                  <FiChevronDown />
                </button>
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
                    >
                      <ul>
                        <li className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Profile
                        </li>
                        <li
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={handleLogout}
                        >
                          Logout
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <FiMoon size={24} /> : <FiSun size={24} />}
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
