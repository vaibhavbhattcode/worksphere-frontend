// src/components/JobDetails.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaStar,
  FaMoneyBillWave,
  FaClock,
  FaGlobe,
  FaBuilding,
  FaBookmark,
  FaRegBookmark,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import Header from "../components/Header";
import ApplyModal from "../components/ApplyModal";

/**
 * Skeleton loader with dark mode support
 */
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6 p-6">
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64" />
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-48" />
        </div>
      </div>
      <div className="flex space-x-3">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>

    {/* Basic Info Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
    </div>

    {/* Detailed Sections */}
    <div className="space-y-4">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>

    {/* Contact Email */}
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
  </div>
);

/**
 * timeAgo: Converts a date string into a human-readable relative time
 */
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopBar, setShowTopBar] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [userApplication, setUserApplication] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch job details
  const fetchJobDetails = () => {
    axios
      .get(`/api/jobs/${id}`)
      .then((response) => {
        setJob(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
        setLoading(false);
      });
  };

  // Fetch current user's application for this job
  const fetchUserApplication = () => {
    axios
      .get(`/api/applications/my/${id}`, { withCredentials: true })
      .then((response) => {
        setUserApplication(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setUserApplication(null);
        } else {
          console.error("Error fetching user application:", error);
        }
      });
  };

  // Fetch saved state for this job
  const fetchSavedState = () => {
    axios
      .get("/api/user/saved-jobs", { withCredentials: true })
      .then((response) => {
        const saved = response.data.some((savedJob) => savedJob.job._id === id);
        setIsSaved(saved);
      })
      .catch((error) => console.error("Error fetching saved jobs:", error));
  };

  useEffect(() => {
    fetchJobDetails();
    fetchUserApplication();
    fetchSavedState();
  }, [id]);

  // Show sticky top bar when scrolled (if user has not applied)
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBar(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle saving the job
  const handleSaveJob = () => {
    axios
      .post(`/api/user/save-job/${id}`, {}, { withCredentials: true })
      .then(() => {
        setIsSaved(true);
      })
      .catch((error) => console.error("Error saving job:", error));
  };

  // Handle removing the saved job
  const handleRemoveSavedJob = () => {
    axios
      .delete(`/api/user/remove-job/${id}`, { withCredentials: true })
      .then(() => {
        setIsSaved(false);
      })
      .catch((error) => console.error("Error removing job:", error));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
        <Header />
        <div className="container mx-auto px-4 py-6 pt-24">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <SkeletonLoader />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200 transition-colors overflow-x-hidden">
        <Header />
        <div className="container mx-auto px-4 py-6 pt-24">
          <p className="text-lg text-center mt-10">Job not found.</p>
        </div>
      </div>
    );
  }

  // Helpers for status & deadline
  const now = new Date();
  const isClosedStatus = job.status?.toLowerCase() === "closed";
  const isPastDeadline =
    job.applicationDeadline && new Date(job.applicationDeadline) < now;
  const isJobOpen = !isClosedStatus && !isPastDeadline;

  // Time since user applied
  const applicationTimeAgo = userApplication
    ? timeAgo(userApplication.createdAt)
    : "";

  // Render Save/Apply or disabled or “applied” badge
  const renderActionButtons = () => {
    if (userApplication) {
      return (
        <motion.div
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md font-semibold"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FaCheckCircle />
          <span>Application submitted {applicationTimeAgo}</span>
        </motion.div>
      );
    } else if (!isJobOpen) {
      return (
        <div className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md font-semibold">
          {isClosedStatus
            ? "This job is closed."
            : "Application deadline has ended."}
        </div>
      );
    } else {
      return (
        <>
          <button
            className="flex items-center space-x-1 px-4 py-2 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors font-semibold"
            onClick={isSaved ? handleRemoveSavedJob : handleSaveJob}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
            <span>{isSaved ? "Unsave" : "Save"}</span>
          </button>
          <button
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-semibold"
            onClick={() => setShowApplyModal(true)}
          >
            <FaPaperPlane />
            <span>Apply</span>
          </button>
        </>
      );
    }
  };

  // Render the dots info in sticky bar
  const renderDottedInfo = () => (
    <div className="flex items-center flex-wrap space-x-2">
      <span className="font-semibold text-base text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
        {job.jobTitle}
      </span>
      <span className="text-gray-400 hidden sm:inline">•</span>
      <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
        {job.companyName}
      </span>
      <span className="text-gray-400 hidden sm:inline">•</span>
      <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
        {job.location}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      <Header />
      <motion.div
        className="container mx-auto max-w-screen-xl px-4 py-6 pt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back link */}
        <Link
          to="/jobs"
          className="inline-flex items-center mb-6 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Job Listings
        </Link>

        {/* Sticky Top Bar */}
        <AnimatePresence>
          {!userApplication && showTopBar && (
            <motion.div
              className="fixed top-[60px] left-0 w-full bg-white dark:bg-gray-800 shadow-md py-2 px-4 z-50 flex items-center justify-between"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderDottedInfo()}
              <div className="flex space-x-2">{renderActionButtons()}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Details Card */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          {/* Title / Logo */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain rounded-full border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">
                  {job.jobTitle}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 break-words">
                  {job.companyName}
                </p>
              </div>
            </div>
            {/* Save / Apply / Disabled / Applied */}
            <div className="flex space-x-3">{renderActionButtons()}</div>
          </div>

          {/* Basic Info Section */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
            {job.location && (
              <div className="flex items-center space-x-2 break-words">
                <FaMapMarkerAlt className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Location:</strong> {job.location}
                </p>
              </div>
            )}
            {job.createdAt && (
              <div className="flex items-center space-x-2 break-words">
                <FaCalendarAlt className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Posted on:</strong>{" "}
                  {new Date(job.createdAt).toLocaleDateString()}{" "}
                  <span className="italic text-sm">
                    ({timeAgo(job.createdAt)})
                  </span>
                </p>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center space-x-2 break-words">
                <FaBriefcase className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Job Type:</strong> {job.jobType}
                </p>
              </div>
            )}
            {job.experienceLevel && (
              <div className="flex items-center space-x-2 break-words">
                <FaStar className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Experience:</strong> {job.experienceLevel}
                </p>
              </div>
            )}
            {job.salary && (job.salary.min || job.salary.max) && (
              <div className="flex items-center space-x-2 break-words">
                <FaMoneyBillWave className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Salary:</strong> {job.salary.currency}{" "}
                  {job.salary.min} - {job.salary.max}
                </p>
              </div>
            )}
            {job.applicationDeadline && (
              <div className="flex items-center space-x-2 break-words">
                <FaClock className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Deadline:</strong>{" "}
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            )}
            {typeof job.remoteOption !== "undefined" && (
              <div className="flex items-center space-x-2 break-words">
                <FaGlobe className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Remote:</strong> {job.remoteOption ? "Yes" : "No"}
                </p>
              </div>
            )}
            {job.industry && (
              <div className="flex items-center space-x-2 break-words">
                <FaBuilding className="text-blue-500" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Industry:</strong> {job.industry}
                </p>
              </div>
            )}
          </div>

          {/* Detailed Sections */}
          <div className="mt-8 space-y-6">
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 break-words">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Required Skills
                </h2>
                <ul className="list-disc pl-6 text-gray-800 dark:text-gray-200 space-y-1">
                  {job.skills.map((skill, index) => (
                    <li key={index} className="break-words">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 break-words">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Benefits
                </h2>
                <ul className="list-disc pl-6 text-gray-800 dark:text-gray-200 space-y-1">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="break-words">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 break-words">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Responsibilities
                </h2>
                <ul className="list-disc pl-6 text-gray-800 dark:text-gray-200 space-y-1">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="break-words">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 break-words">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Qualifications
                </h2>
                <ul className="list-disc pl-6 text-gray-800 dark:text-gray-200 space-y-1">
                  {job.qualifications.map((qual, index) => (
                    <li key={index} className="break-words">
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700 break-words">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Job Description
                </h2>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed break-words whitespace-normal">
                  {job.description}
                </p>
              </div>
            )}

            {/* Contact Email */}
            {job.contactEmail && (
              <div className="break-words">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Contact Email:</strong>{" "}
                  <a
                    href={`mailto:${job.contactEmail}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline break-words"
                  >
                    {job.contactEmail}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Apply Modal */}
      <AnimatePresence>
        {!userApplication && showApplyModal && (
          <ApplyModal
            job={job}
            onClose={() => {
              setShowApplyModal(false);
              fetchUserApplication();
            }}
            onSuccess={fetchUserApplication}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobDetails;
