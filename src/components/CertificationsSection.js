import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  PlusCircleIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// Helper function to check if file is an image
const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);

// Card animation variants (consistent with Experience/Education)
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

const CertificationsSection = ({
  editMode,
  profileCertificates, // array of certificate objects { _id, title, fileUrl }
  onCertificateUpload,
  onCertificateDelete,
}) => {
  const [newCertificateTitle, setNewCertificateTitle] = useState("");
  const [newCertificateFile, setNewCertificateFile] = useState(null);

  const handleFileChange = (e) => {
    setNewCertificateFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!newCertificateTitle.trim() || !newCertificateFile) {
      alert("Please provide a title and select a file.");
      return;
    }
    onCertificateUpload(newCertificateTitle, newCertificateFile);
    setNewCertificateTitle("");
    setNewCertificateFile(null);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-10 mb-6"
    >
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AcademicCapIcon className="w-7 h-7 text-blue-600" />
          Professional Certifications
        </h2>
      </div>

      {/* Upload Fields (only shown in edit mode) */}
      {editMode && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-8 space-y-4">
          {/* Certificate Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Certificate Title
            </label>
            <input
              type="text"
              placeholder="e.g. AWS Certified Developer"
              value={newCertificateTitle}
              onChange={(e) => setNewCertificateTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition-colors bg-white dark:bg-gray-600 dark:text-white"
            />
          </div>

          {/* File Input + Add Button Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            {/* File selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Choose File
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                id="certificateFile"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="certificateFile"
                className="block w-full px-4 py-2 border border-gray-300 
                           dark:border-gray-600 rounded-lg text-center cursor-pointer 
                           bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 
                           transition-colors dark:text-white 
                           overflow-hidden whitespace-nowrap text-ellipsis"
                title={
                  newCertificateFile
                    ? newCertificateFile.name
                    : "No file chosen"
                }
              >
                {newCertificateFile
                  ? newCertificateFile.name
                  : "No file chosen"}
              </label>
            </div>

            {/* Add Certificate Button */}
            <div className="flex justify-start sm:justify-end">
              <button
                onClick={handleUpload}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 
                           rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Add Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Certificates */}
      {profileCertificates && profileCertificates.length > 0 ? (
        <div className="space-y-8">
          {profileCertificates.map((cert, index) => {
            const certUrl = cert.fileUrl.startsWith("http")
              ? cert.fileUrl
              : `${backendUrl}${cert.fileUrl}`;

            return (
              <motion.article
                key={cert._id || index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="relative p-6 bg-gray-50 dark:bg-gray-700 
                           rounded-xl border border-gray-200 dark:border-gray-600 
                           group shadow hover:shadow-lg transition-shadow"
              >
                {/* Delete Button (Edit Mode Only) */}
                {editMode && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => onCertificateDelete(cert._id)}
                    className="absolute top-4 right-4 p-2 text-red-600 hover:text-red-700 
                               transition-colors"
                    aria-label="Remove certificate"
                    type="button"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Certificate Content */}
                <div className="flex items-center gap-4">
                  {/* Thumbnail or PDF Icon */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                    {isImage(certUrl) ? (
                      <img
                        src={certUrl}
                        alt={cert.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <DocumentTextIcon className="w-10 h-10 text-blue-600" />
                      </div>
                    )}
                    {/* Hover overlay to open file */}
                    <a
                      href={certUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-25 
                                 transition duration-300 flex items-center justify-center"
                    >
                      <EyeIcon
                        className="w-6 h-6 text-white opacity-0 
                                   hover:opacity-100 transition-opacity duration-300"
                      />
                    </a>
                  </div>

                  {/* Certificate Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cert.title}
                    </h3>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic dark:text-gray-400">
          No certifications uploaded.
        </p>
      )}
    </motion.section>
  );
};

export default CertificationsSection;
