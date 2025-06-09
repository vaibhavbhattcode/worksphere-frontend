import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CompanySidebar from "../../components/Company/CompanySidebar";
import {
  FaBriefcase,
  FaUsers,
  FaCalendar,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Tooltip } from "react-tooltip";

// Mock data for fallback
const mockData = {
  company: {
    logo: "",
    companyName: "Your Company Name",
    email: "contact@yourcompany.com",
    tagline: "Innovating the Future",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    industry: "Technology",
    founded: "2020",
  },
  metrics: {
    totalJobPostings: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    notifications: [],
    upcomingInterviews: [],
    applicationTrends: [],
  },
  incompleteProfileMessage: "",
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CompanyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [interval, setInterval] = useState("months"); // Default interval
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const navigate = useNavigate();

  // Detect theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/company/auth/status",
          { withCredentials: true }
        );
        if (!res.data.loggedIn || res.data.type !== "company") {
          navigate("/company/login");
          return;
        }

        const fetchDashboardData = async () => {
          try {
            const response = await axios.get(
              `http://localhost:5000/api/company/dashboard/overview?interval=${interval}`,
              { withCredentials: true }
            );
            setDashboardData(response.data || mockData);
          } catch (err) {
            setError("Failed to load dashboard data. Using mock data.");
            setDashboardData(mockData);
          } finally {
            setLoading(false);
          }
        };
        fetchDashboardData();
      } catch (err) {
        navigate("/company/login");
      }
    };
    checkSession();
  }, [navigate, interval]); // Re-fetch when interval changes

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <motion.div
          className="text-gray-600 dark:text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading dashboard...
        </motion.div>
      </div>
    );
  }

  const {
    company = {},
    metrics = {},
    incompleteProfileMessage = "",
  } = dashboardData;

  const displayName =
    (company.companyName && company.companyName.trim()) ||
    (company.email ? company.email.split("@")[0] : "Your Company Name");
  const displayEmail = company.email || "No email provided";

  // Filter upcoming interviews based on search term
  const filteredInterviews =
    metrics.upcomingInterviews?.filter(
      (interview) =>
        interview.candidateEmail
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        interview.position?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Chart color configuration
  const chartColors = {
    axisText: "#000000", // Black for X and Y axis text, ticks, and lines
    background: isDarkMode ? "#1F2937" : "#FFFFFF", // gray-800 for dark, white for light
    tooltipText: isDarkMode ? "#E5E7EB" : "#1F2937", // gray-200 for dark, gray-900 for light
    line: "#4F46E5", // indigo-600
    dot: "#4F46E5",
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <CompanySidebar />
      <motion.div
        className="flex-1 p-4 sm:p-6 md:ml-64 lg:p-8 xl:p-10 w-full overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed top-16 left-4 right-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-lg w-full border border-red-400"
            >
              <span className="text-lg sm:text-xl">⚠</span>
              <span className="text-sm sm:text-base">{error}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed top-16 left-4 right-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-lg w-full border border-green-400"
            >
              <span className="text-lg sm:text-xl">✓</span>
              <span className="text-sm sm:text-base">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">
            Welcome, <span className="text-indigo-600">{displayName}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Email: {displayEmail}
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Here’s an overview of your hiring activities.
          </p>
        </motion.div>

        {/* Incomplete Profile Alert */}
        {incompleteProfileMessage && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between border border-yellow-200 dark:border-yellow-700"
          >
            <span className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-2 sm:mb-0">
              {incompleteProfileMessage}
            </span>
            <button
              onClick={() => navigate("/company/profile")}
              className="w-full sm:w-auto bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              Complete Profile
            </button>
          </motion.div>
        )}

        {/* Company Info Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
        >
          {company.logo ? (
            <img
              src={company.logo}
              alt="Company Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
              {displayName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {displayEmail}
            </p>
            {company.tagline && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                {company.tagline}
              </p>
            )}
          </div>
        </motion.div>

        {/* Metrics Section */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
            data-tooltip-id="job-postings-tooltip"
            data-tooltip-content="Total jobs posted by your company"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <FaBriefcase className="text-indigo-500 text-2xl sm:text-3xl" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  Job Postings
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1 sm:mt-2">
                  {metrics.totalJobPostings || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Total jobs posted
                </p>
              </div>
            </div>
          </div>
          <div
            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
            data-tooltip-id="applications-tooltip"
            data-tooltip-content="Total candidate applications received"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <FaUsers className="text-green-500 text-2xl sm:text-3xl" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  Applications
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1 sm:mt-2">
                  {metrics.totalApplications || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Total applications
                </p>
              </div>
            </div>
          </div>
          <div
            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
            data-tooltip-id="interviews-tooltip"
            data-tooltip-content="Interviews scheduled with candidates"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <FaCalendar className="text-yellow-500 text-2xl sm:text-3xl" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                  Interviews
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1 sm:mt-2">
                  {metrics.interviewsScheduled || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Interviews scheduled
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/company/jobs")}
              className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors flex items-center justify-center shadow-md text-sm sm:text-base"
            >
              <FaBriefcase className="mr-2" /> Post a Job
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/company/applications")}
              className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors flex items-center justify-center shadow-md text-sm sm:text-base"
            >
              <FaUsers className="mr-2" /> View Applications
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/company/interviews")}
              className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-colors flex items-center justify-center shadow-md text-sm sm:text-base"
            >
              <FaCalendar className="mr-2" /> Schedule Interview
            </motion.button>
          </div>
        </motion.div>

        {/* Application Trends Chart */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
              Application Trends
            </h2>
            <div className="relative w-full sm:w-40">
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 dark:text-white text-sm sm:text-base appearance-none"
              >
                <option value="years">By Years</option>
                <option value="months">By Months</option>
                <option value="hours">By Hours</option>
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          {metrics.applicationTrends && metrics.applicationTrends.length > 0 ? (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metrics.applicationTrends}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke={chartColors.axisText}
                    fontSize={12}
                    tick={{ fill: chartColors.axisText }}
                    tickLine={{ stroke: chartColors.axisText }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke={chartColors.axisText}
                    fontSize={12}
                    tick={{ fill: chartColors.axisText }}
                    tickLine={{ stroke: chartColors.axisText }}
                    width={40}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: chartColors.background,
                      color: chartColors.tooltipText,
                      border: `1px solid ${isDarkMode ? "#4B5563" : "#D1D5DB"}`,
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      padding: "8px",
                    }}
                    itemStyle={{ color: chartColors.tooltipText }}
                    labelStyle={{ color: chartColors.tooltipText }}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke={chartColors.line}
                    strokeWidth={2}
                    dot={{ fill: chartColors.dot, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              No application data available.
            </p>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <FaBell className="text-indigo-500 text-lg sm:text-xl" />{" "}
            Notifications
          </h2>
          {metrics.notifications && metrics.notifications.length > 0 ? (
            <ul className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {metrics.notifications.map((note, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <FaBell className="text-indigo-500 text-base sm:text-lg" />
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                    {note}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              No new notifications
            </p>
          )}
        </motion.div>

        {/* Upcoming Interviews with Search */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
              Upcoming Interviews
            </h2>
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute top-2.5 sm:top-3 left-3 text-gray-400 text-sm sm:text-base" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              />
            </div>
          </div>
          {filteredInterviews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {filteredInterviews.map((interview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                      {interview.candidateEmail}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {interview.position}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {interview.date}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/company/interviews/${interview.id || index}`)
                      }
                      className="text-indigo-500 hover:underline flex items-center mt-1 sm:mt-2 text-xs sm:text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No interviews match your search."
                : "No upcoming interviews scheduled."}
            </p>
          )}
        </motion.div>

        {/* Tooltip Components */}
        <Tooltip
          id="job-postings-tooltip"
          place="top"
          className="text-xs sm:text-sm bg-gray-800 text-white rounded-lg"
        />
        <Tooltip
          id="applications-tooltip"
          place="top"
          className="text-xs sm:text-sm bg-gray-800 text-white rounded-lg"
        />
        <Tooltip
          id="interviews-tooltip"
          place="top"
          className="text-xs sm:text-sm bg-gray-800 text-white rounded-lg"
        />
      </motion.div>
    </div>
  );
};

export default CompanyDashboard;
