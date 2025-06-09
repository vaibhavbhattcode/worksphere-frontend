import React from "react";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";

const AboutSection = ({
  editMode,
  generatingAbout,
  editData,
  profileData,
  handleGenerateAbout,
  handleInputChange,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-10 mb-6"
    >
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: profileData.name,
          description: profileData.about,
        })}
      </script>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Professional Summary
        </h2>
        {editMode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateAbout}
            disabled={generatingAbout}
            className="flex items-center bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-600 px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-md"
            aria-label={
              generatingAbout
                ? "Generating content"
                : "Generate professional summary"
            }
          >
            {generatingAbout ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                AI Generate Summary
              </>
            )}
          </motion.button>
        )}
      </div>

      {editMode ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <textarea
            name="about"
            value={editData.about}
            onChange={handleInputChange}
            rows="5"
            maxLength="500"
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-700 outline-none transition-all duration-200 placeholder-gray-400 resize-none bg-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Describe your professional experience, skills, and career objectives..."
            aria-label="Edit professional summary"
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-400">
            {editData.about?.length || 0}/500
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose max-w-none text-gray-600 dark:text-gray-300 leading-relaxed"
        >
          {profileData.about?.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
          {/* Hidden semantic content for SEO */}
          <div className="sr-only" aria-hidden="true">
            <h3>{profileData.name}'s Professional Summary</h3>
            <p>{profileData.about}</p>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default AboutSection;
