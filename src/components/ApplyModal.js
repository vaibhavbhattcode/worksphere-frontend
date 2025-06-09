import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalContentVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [userResume, setUserResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");

  // Fetch the user's profile to retrieve the resume URL.
  useEffect(() => {
    axios
      .get("/api/user/profile", { withCredentials: true })
      .then((response) => {
        let resumeUrl = response.data.resume;
        if (resumeUrl) {
          // Ensure the URL is absolute.
          if (!resumeUrl.startsWith("http")) {
            const backendUrl =
              process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
            resumeUrl = resumeUrl.startsWith("/")
              ? `${backendUrl}${resumeUrl}`
              : `${backendUrl}/${resumeUrl}`;
          }
        }
        setUserResume(resumeUrl);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!coverLetter.trim()) {
      setFormError("Cover letter is required.");
      return;
    }

    try {
      const payload = {
        jobId: job._id,
        coverLetter,
      };
      await axios.post(
        `${
          process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
        }/api/applications`,
        payload,
        { withCredentials: true }
      );
      alert("Application submitted successfully!");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error applying for job:", error);
      setFormError(error.response?.data?.message || "Failed to apply for job.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
        variants={modalOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-xl p-6 w-11/12 max-w-lg mx-4 my-8 max-h-[90vh] overflow-y-auto"
          variants={modalContentVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Apply for {job.jobTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-3xl leading-none text-gray-700 dark:text-gray-300"
            >
              &times;
            </button>
          </div>

          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">
              Loading your profile...
            </p>
          ) : (
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Resume:
              </p>
              {userResume ? (
                <a
                  href={userResume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline"
                >
                  View Resume
                </a>
              ) : (
                <p className="text-red-500 dark:text-red-400">
                  No resume found. Please{" "}
                  <a
                    href="/profile"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    upload your resume
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          {formError && (
            <p className="text-red-500 text-center mb-4">{formError}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="coverLetter"
                className="block text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100"
              >
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="5"
                placeholder="Tell us why you're a great fit for this role..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplyModal;
