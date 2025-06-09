// src/components/Company/CompanyViewProfileModal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaUserCircle,
  FaGraduationCap,
  FaBriefcase,
  FaCertificate,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import Modal from "react-modal";

const CompanyViewProfileModal = ({ userId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  // Function to fetch profile data
  const fetchProfile = () => {
    setLoading(true);
    setError("");
    axios
      .get(
        `${
          process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
        }/api/user/profile/${userId}`,
        { withCredentials: true }
      )
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
        setLoading(false);
      });
  };

  const handleReportUser = async () => {
    setReportError("");
    setReportSuccess("");
    if (!reportReason || reportReason.trim().length < 10) {
      setReportError("Please provide a valid reason (at least 10 characters).");
      return;
    }
    try {
      await axios.post(
        `/api/report/user/${userId}`,
        { reason: reportReason },
        { withCredentials: true }
      );
      setReportSuccess(
        "Report submitted successfully. Our team will review it soon."
      );
      setReportReason("");
    } catch (err) {
      setReportError(
        err.response?.data?.message ||
          "Failed to submit report. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[80vh]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Header with Title and Close Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Applicant Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FaTimes className="text-xl text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
              <span className="ml-3 text-lg text-gray-600">
                Loading profile...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">{error}</p>
              <button
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Profile Content */}
          {profile && !loading && !error && (
            <div>
              {/* Profile Header */}
              <div className="flex items-center space-x-6 mb-6">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={`${profile.name}'s profile`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 text-gray-400" />
                )}
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.name || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {profile.title || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {profile.location || "N/A"}
                  </p>
                </div>
              </div>

              {/* About Section */}
              {profile.about && profile.about.trim() !== "" && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    About
                  </h4>
                  <p className="text-gray-700 dark:text-gray-200">
                    {profile.about}
                  </p>
                </section>
              )}

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Education Section */}
              {profile.education && profile.education.length > 0 && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Education
                  </h4>
                  <ul className="space-y-2">
                    {profile.education.map((edu, index) => (
                      <li key={index} className="flex items-start">
                        <FaGraduationCap className="text-blue-500 mt-1 mr-2" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {edu.degree || "N/A"}
                          </div>
                          <div className="text-gray-700 dark:text-gray-200">
                            {edu.institution || "N/A"}{" "}
                            {edu.year ? `(${edu.year})` : ""}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Experience Section */}
              {profile.experience && profile.experience.length > 0 && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Experience
                  </h4>
                  <ul className="space-y-4">
                    {profile.experience.map((exp, index) => (
                      <li key={index} className="flex items-start">
                        <FaBriefcase className="text-green-500 mt-1 mr-2" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {exp.position || "N/A"}
                          </div>
                          <div className="text-gray-700 dark:text-gray-200">
                            {exp.company || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {exp.start || ""} - {exp.end || "Present"}
                          </div>
                          {exp.description && (
                            <p className="mt-1 text-gray-700 dark:text-gray-200">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Certifications Section */}
              {profile.certificates && profile.certificates.length > 0 && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Certifications
                  </h4>
                  <ul className="space-y-2">
                    {profile.certificates.map((cert, index) => (
                      <li key={index} className="flex items-center">
                        <FaCertificate className="text-yellow-500 mr-2" />
                        {typeof cert === "object" ? (
                          <a
                            href={
                              cert.fileUrl.startsWith("/")
                                ? `${
                                    process.env.REACT_APP_BACKEND_URL ||
                                    "http://localhost:5000"
                                  }${cert.fileUrl}`
                                : cert.fileUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {cert.title || "Untitled Certificate"}
                          </a>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-200">
                            {cert}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Resume Section */}
              {profile.resume && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Resume
                  </h4>
                  <div className="flex items-center">
                    <FaFileAlt className="text-blue-500 mr-2" />
                    <a
                      href={
                        profile.resume.startsWith("/")
                          ? `${
                              process.env.REACT_APP_BACKEND_URL ||
                              "http://localhost:5000"
                            }${profile.resume}`
                          : profile.resume
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      View Resume
                    </a>
                  </div>
                </section>
              )}

              {/* Video Introduction Section */}
              {profile.videoIntroduction && (
                <section className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Video Introduction
                  </h4>
                  <div className="relative pb-[56.25%] h-0 overflow-hidden">
                    <video
                      src={
                        profile.videoIntroduction.startsWith("/")
                          ? `${
                              process.env.REACT_APP_BACKEND_URL ||
                              "http://localhost:5000"
                            }${profile.videoIntroduction}`
                          : profile.videoIntroduction
                      }
                      controls
                      className="absolute top-0 left-0 w-full h-full rounded-md"
                    />
                  </div>
                </section>
              )}

              {/* Report User Button and Modal */}
              {profile && (
                <div>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Report User
                  </button>
                  {/* Report User Modal */}
                  <Modal
                    isOpen={showReportModal}
                    onRequestClose={() => setShowReportModal(false)}
                    className="bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto mt-24"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                    ariaHideApp={false}
                  >
                    <h2 className="text-xl font-bold mb-4">Report User</h2>
                    <textarea
                      className="w-full border rounded p-2 mb-2"
                      rows={4}
                      placeholder="Describe the reason for reporting this user (at least 10 characters)"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    {reportError && (
                      <div className="text-red-600 mb-2">{reportError}</div>
                    )}
                    {reportSuccess && (
                      <div className="text-green-600 mb-2">{reportSuccess}</div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={() => setShowReportModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded"
                        onClick={handleReportUser}
                      >
                        Submit Report
                      </button>
                    </div>
                  </Modal>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanyViewProfileModal;
