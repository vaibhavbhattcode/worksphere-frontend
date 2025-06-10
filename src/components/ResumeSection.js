import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const ResumeSection = ({
  profileResume,
  resumeName,
  uploadingResume,
  handleResumeUpload,
  handleResumeRemove,
}) => {
  const navigate = useNavigate();

  // Derive file name from resumeName or the URL
  const fileName =
    resumeName || (profileResume ? profileResume.split("/").pop() : "");

  // Adjust backendUrl to point to the correct static file server
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // Construct the full resume URL if not absolute
  const resumeUrl =
    profileResume && !profileResume.startsWith("http")
      ? `${backendUrl}${
          profileResume.startsWith("/") ? "" : "/"
        }${profileResume}`
      : profileResume || "";

  // Validate file size (5MB = 5242880 bytes) before uploading
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size exceeds the maximum limit of 5MB.");
      return;
    }
    handleResumeUpload(e);
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 lg:p-8 mb-6 transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <DocumentIcon className="w-6 h-6 text-blue-600" />
          Professional Resume
        </h2>
      </div>

      {profileResume ? (
        /* Resume card (when resume is uploaded) */
        <div
          className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 
                        hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors"
        >
          <article className="flex flex-col gap-4">
            {/* Row 1: Icon + truncated filename */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                <DocumentIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div
                className="max-w-[180px] sm:max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={fileName}
              >
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {fileName}
                </h3>
              </div>
            </div>

            {/* Row 2: Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md 
                           text-white bg-blue-500 hover:bg-blue-600 transform transition 
                           hover:scale-105"
                aria-label="View resume"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                View Resume
              </a>
              <button
                onClick={handleResumeRemove}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md 
                           text-white bg-red-500 hover:bg-red-600 transform transition 
                           hover:scale-105"
                aria-label="Delete resume"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Delete Resume
              </button>
            </div>
          </article>
        </div>
      ) : (
        /* Upload prompt (when no resume is uploaded) */
        <div
          className="text-center border-2 border-dashed border-gray-200 dark:border-gray-600 
                        rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-700 
                        transition-colors"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You have not uploaded a resume.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Upload Button */}
            <div>
              <input
                type="file"
                accept="application/pdf,application/msword,
                        application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onFileChange}
                className="hidden"
                id="resumeUpload"
                disabled={uploadingResume}
              />
              <label
                htmlFor="resumeUpload"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 
                           rounded-xl hover:bg-blue-700 transition-colors cursor-pointer 
                           transform hover:scale-105"
              >
                {uploadingResume ? (
                  <>
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Upload Resume
                  </>
                )}
              </label>
            </div>
            {/* Build Resume Button */}
            <button
              onClick={() => navigate("/resume-builder")}
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 
                         rounded-xl hover:bg-green-700 transition-colors transform 
                         hover:scale-105"
            >
              Build Resume
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Max file size: 5MB
          </p>
        </div>
      )}
    </section>
  );
};

export default ResumeSection;
