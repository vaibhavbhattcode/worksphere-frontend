import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";

const MyJobsPage = () => {
  const [filter, setFilter] = useState("applied");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch jobs based on filter
  useEffect(() => {
    // Clear jobs immediately when filter changes to avoid mix-ups
    setJobs([]);
    setLoading(true);
    const endpoint =
      filter === "applied"
        ? "/api/applications/applied"
        : "/api/user/saved-jobs";

    axios
      .get(endpoint, { withCredentials: true })
      .then((response) => {
        if (filter === "applied") {
          setJobs(response.data.jobs || []);
        } else {
          // For saved jobs, extract job from each saved record and filter out nulls
          const extracted = response.data
            .map((saved) => saved.job)
            .filter((job) => job !== null);
          setJobs(extracted);
        }
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter]);

  const handleUnsaveJob = (jobId) => {
    axios
      .delete(`/api/user/remove-job/${jobId}`, { withCredentials: true })
      .then(() => {
        setJobs((prev) => prev.filter((job) => job._id !== jobId));
      })
      .catch((error) => {
        console.error("Error unsaving job:", error);
      });
  };

  // Helper function to format salary object into a string
  const formatSalary = (salary) => {
    if (!salary || typeof salary !== "object") return null;
    const { min, max, currency } = salary;
    if (!min || !max || !currency) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  // Animation variants for job cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      <Header />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            My Jobs
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {jobs.length} {filter === "applied" ? "Applied" : "Saved"} Jobs
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-3 mb-8">
          <button
            onClick={() => setFilter("applied")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
              filter === "applied"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            Applied Jobs
          </button>
          <button
            onClick={() => setFilter("saved")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
              filter === "saved"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            Saved Jobs
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {/* Jobs List */}
        {!loading && jobs.length > 0 ? (
          <AnimatePresence>
            <div className="space-y-4">
              {jobs.map((job) => {
                const isClosed =
                  job.status && job.status.toLowerCase() === "closed";
                return (
                  <motion.div
                    key={job._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName || "Company Logo"}
                          className="w-12 h-12 object-cover rounded-full border border-gray-200 dark:border-gray-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold text-sm">
                          {job.companyName?.charAt(0) || "C"}
                        </div>
                      )}
                      <div className="flex-1">
                        {filter === "saved" && isClosed ? (
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {job.jobTitle}
                          </span>
                        ) : (
                          <Link
                            to={`/job/${job._id}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {job.jobTitle}
                          </Link>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {job.companyName}
                          {job.location && (
                            <span className="text-gray-500 dark:text-gray-500">
                              {" • "}
                              {job.location}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {job.salary && formatSalary(job.salary) && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {formatSalary(job.salary)}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {job.jobType}
                            </span>
                          )}
                        </div>
                        {filter === "saved" && isClosed && (
                          <p className="mt-2 text-xs text-red-500">
                            This job is no longer active.
                          </p>
                        )}
                      </div>
                    </div>
                    {filter === "saved" && (
                      <button
                        onClick={() => handleUnsaveJob(job._id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Unsave job"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No {filter === "applied" ? "applied" : "saved"} jobs found.
              </p>
              <Link
                to="/jobs"
                className="mt-4 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Explore Jobs
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyJobsPage;
