import React from "react";
import { motion } from "framer-motion";
import { VideoCameraIcon, TrashIcon } from "@heroicons/react/24/outline";

const VideoIntroSection = ({
  videoIntro,
  uploadingVideo,
  handleVideoUpload,
  handleVideoRemove,
}) => {
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const videoUrl =
    videoIntro && !videoIntro.startsWith("http")
      ? `${backendUrl}${videoIntro}`
      : videoIntro;

  return (
    <section className="bg-white dark:bg-gray-800/95 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-10 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <VideoCameraIcon className="w-7 h-7 text-blue-600" />
          Video Introduction
        </h2>
      </div>
      {videoIntro ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <video
            controls
            className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVideoRemove}
            className="absolute top-4 right-4 bg-red-600 dark:bg-red-600 text-white p-2 rounded-full hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
            aria-label="Remove video introduction"
          >
            <TrashIcon className="w-6 h-6" />
          </motion.button>
        </motion.div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Upload a short video introduction to showcase your personality.
          </p>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            id="videoUpload"
            disabled={uploadingVideo}
          />
          <label
            htmlFor="videoUpload"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-md"
          >
            {uploadingVideo ? "Uploading..." : "Upload Video"}
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Max file size: 50MB
          </p>
        </div>
      )}
    </section>
  );
};

export default VideoIntroSection;
