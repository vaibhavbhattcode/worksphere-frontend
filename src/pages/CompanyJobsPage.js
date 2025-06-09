import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaBuilding,
} from "react-icons/fa";

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
  hover: {
    y: -10,
    scale: 1.03,
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
    transition: { duration: 0.3 },
  },
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="animate-pulse space-y-4">
      <div className="flex space-x-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

const CompanyJobsPage = () => {
  const { companyId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const res = await axios.get(`/api/jobs/company/jobs/${companyId}`);
        setJobs(res.data);
        setFilteredJobs(res.data);
      } catch (err) {
        console.error("Error fetching company jobs:", err);
        setError("Failed to load company jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyJobs();
  }, [companyId]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await axios.get("/api/applications/my", {
          withCredentials: true,
        });
        const ids = new Set(response.data.map((app) => app.jobId.toString()));
        setAppliedJobIds(ids);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
      }
    };
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredJobs(jobs);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = jobs.filter(
      (job) =>
        job.jobTitle.toLowerCase().includes(lowerQuery) ||
        job.location.toLowerCase().includes(lowerQuery) ||
        job.jobType.toLowerCase().includes(lowerQuery)
    );
    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </>
    );
  }

  const now = new Date();
  const openJobs = filteredJobs.filter((job) => {
    const isOpen = job.status && job.status.toLowerCase() === "open";
    const validDeadline =
      !job.applicationDeadline || new Date(job.applicationDeadline) >= now;
    return isOpen && validDeadline;
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Jobs Posted by This Company
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Open Positions: {openJobs.length}
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300 text-lg"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
                <FaSearch className="w-6 h-6" />
              </span>
            </div>
          </div>

          {openJobs.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No open jobs posted by this company yet.
            </p>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {openJobs.map((job) => (
                  <motion.div
                    key={job._id}
                    layout
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform duration-300"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <img
                          src={job.companyLogo || "/default-logo.png"}
                          alt={job.companyName}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        />
                        {appliedJobIds.has(job._id.toString()) && (
                          <span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-3 py-1 rounded-md text-xs font-medium flex items-center">
                            <FaCheckCircle className="mr-1.5" /> Applied
                          </span>
                        )}
                      </div>
                      <div>
                        <Link to={`/job/${job._id}`} className="block group">
                          <h2
                            className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200 truncate"
                            title={job.jobTitle}
                          >
                            {job.jobTitle}
                          </h2>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center">
                          <FaBuilding className="mr-2 text-teal-500" />
                          <span className="truncate">{job.companyName}</span>
                        </p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-teal-500 w-4 h-4" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <FaBriefcase className="mr-2 text-teal-500 w-4 h-4" />
                          <span className="truncate">{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-teal-500 w-4 h-4" />
                          <span className="truncate">
                            {timeAgo(job.createdAt)}
                          </span>
                        </div>
                        {job.applicationDeadline && (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">
                              Application deadline:{" "}
                              {new Date(
                                job.applicationDeadline
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {job.applicationCount !== undefined && (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">
                              {job.applicationCount} Applications
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <Link
                        to={`/job/${job._id}`}
                        className="block w-full text-center bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors duration-300 font-semibold"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyJobsPage;
