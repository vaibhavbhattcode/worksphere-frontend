import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaBriefcase, FaLightbulb, FaGraduationCap } from "react-icons/fa";

// Animation for slide-up fade-in
const suggestionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Parse raw suggestion text into structured object
const parseSuggestions = (text) => {
  const sections = text
    .split("###")
    .map((s) => s.trim())
    .filter(Boolean);
  const result = {};

  sections.forEach((section) => {
    const [title, ...lines] = section.split("\n").map((l) => l.trim());
    const cleanTitle = title.toLowerCase();

    if (cleanTitle.includes("job role")) result.roles = lines;
    else if (cleanTitle.includes("skill")) result.skills = lines;
    else if (
      cleanTitle.includes("course") ||
      cleanTitle.includes("certification")
    )
      result.courses = lines;
  });

  return result;
};

const CareerGrowthSuggestions = ({ skills, experience }) => {
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setParsed(null);
    try {
      const res = await axios.post(
        "/api/ai/career-suggestions",
        { skills, experience },
        { withCredentials: true }
      );
      setParsed(parseSuggestions(res.data.suggestions));
      setShow(true);
    } catch (err) {
      setError("⚠ Failed to fetch suggestions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        📈 Career Growth Suggestions
      </h2>

      {!show && (
        <button
          onClick={handleGenerate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-sm"
        >
          Generate Personalized Suggestions
        </button>
      )}

      {loading && <p className="mt-4">🔄 Generating insights...</p>}

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {parsed && (
        <motion.div
          className="mt-6 space-y-6"
          variants={suggestionVariants}
          initial="hidden"
          animate="visible"
        >
          {parsed.roles?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-2">
                <FaBriefcase /> Suggested Job Roles
              </h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {parsed.roles.map((role, idx) => (
                  <li key={idx}>{role}</li>
                ))}
              </ul>
            </div>
          )}

          {parsed.skills?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2 mb-2">
                <FaLightbulb /> Trending Skills to Learn
              </h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {parsed.skills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {parsed.courses?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-2">
                <FaGraduationCap /> Recommended Courses / Certifications
              </h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {parsed.courses.map((course, idx) => (
                  <li key={idx}>{course}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CareerGrowthSuggestions;
