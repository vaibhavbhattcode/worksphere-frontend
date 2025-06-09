import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CompanySidebar from "../../components/Company/CompanySidebar";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaIndustry,
  FaHome,
  FaTools,
  FaClock,
  FaHeart,
  FaListUl,
  FaGraduationCap,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// Mapping currency codes to symbols
const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
};

// Collapsible section component
const CollapsibleSection = ({ title, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`section-${title}`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {isOpen ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`section-${title}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="py-4 text-gray-700 dark:text-gray-300">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JobDetailsPage = () => {
  const { state } = useLocation();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(state?.job || null);
  const [loading, setLoading] = useState(!state?.job);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Detect theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  // Fetch job details if not provided in state
  useEffect(() => {
    if (!job) {
      const fetchJobDetails = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/jobs/${jobId}`,
            { withCredentials: true }
          );
          setJob(response.data);
        } catch (err) {
          toast.error("Failed to fetch job details.");
          setError("Failed to fetch job details.");
        } finally {
          setLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [job, jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-gray-600 dark:text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading job details...
        </motion.div>
      </div>
    );
  }

  if (!job || error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-red-600 dark:text-red-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error || "No job found."}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      <CompanySidebar />
      <div className="flex-grow md:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </motion.button>

        {/* Job Details Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                {job.jobTitle}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Posted on{" "}
                {new Date(job.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <motion.button
              onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
              className="mt-4 sm:mt-0 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit Job</span>
            </motion.button>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center space-x-3">
              <FaBriefcase className="text-indigo-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Job Type
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {job.jobType}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-indigo-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Location
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {job.location}
                </p>
              </div>
            </div>
            {job.salary && (
              <div className="flex items-center space-x-3">
                <FaMoneyBillWave className="text-indigo-500 text-xl" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Salary Range
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {currencySymbols[job.salary.currency] ||
                      job.salary.currency}{" "}
                    {job.salary.min} -{" "}
                    {currencySymbols[job.salary.currency] ||
                      job.salary.currency}{" "}
                    {job.salary.max}
                  </p>
                </div>
              </div>
            )}
            {job.industry && (
              <div className="flex items-center space-x-3">
                <FaIndustry className="text-indigo-500 text-xl" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Industry
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {job.industry}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <FaHome className="text-indigo-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Remote Option
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {job.remoteOption ? "Yes" : "No"}
                </p>
              </div>
            </div>
            {job.experienceLevel && (
              <div className="flex items-center space-x-3">
                <FaGraduationCap className="text-indigo-500 text-xl" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Experience Level
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {job.experienceLevel}
                  </p>
                </div>
              </div>
            )}
            {job.applicationDeadline && (
              <div className="flex items-center space-x-3">
                <FaClock className="text-indigo-500 text-xl" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Application Deadline
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Sections */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center space-x-2">
                <FaListUl className="text-indigo-500" />
                <span>Description</span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {job.description}
              </p>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center space-x-2">
                  <FaTools className="text-indigo-500" />
                  <span>Skills</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <CollapsibleSection
                title="Responsibilities"
                icon={<FaListUl className="text-indigo-500 text-xl" />}
              >
                <ul className="list-disc pl-5 space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {job.qualifications && job.qualifications.length > 0 && (
              <CollapsibleSection
                title="Qualifications"
                icon={<FaGraduationCap className="text-indigo-500 text-xl" />}
              >
                <ul className="list-disc pl-5 space-y-2">
                  {job.qualifications.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <CollapsibleSection
                title="Benefits"
                icon={<FaHeart className="text-indigo-500 text-xl" />}
              >
                <ul className="list-disc pl-5 space-y-2">
                  {job.benefits.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}
          </div>
        </motion.div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default JobDetailsPage;
