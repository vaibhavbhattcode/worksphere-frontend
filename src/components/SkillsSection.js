import React from "react";
import { motion } from "framer-motion";
import SkillsSelector from "./SkillsSelector";
import { PuzzlePieceIcon, CpuChipIcon } from "@heroicons/react/24/outline";

const SkillsSection = ({
  editMode,
  skillsValue,
  profileSkills,
  onSkillsChange,
}) => {
  const skillCategories = {
    technical: {
      color: "bg-blue-100 text-blue-800",
      icon: <CpuChipIcon className="w-4 h-4" />,
    },
    soft: {
      color: "bg-green-100 text-green-800",
      icon: <PuzzlePieceIcon className="w-4 h-4" />,
    },
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 lg:p-10 mb-6">
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          knowsAbout: profileSkills || [],
        })}
      </script>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PuzzlePieceIcon className="w-7 h-7 text-blue-600" />
          Core Competencies
        </h2>
      </div>

      {editMode ? (
        <div className="space-y-4">
          <SkillsSelector
            onChange={onSkillsChange}
            value={
              skillsValue?.map((skill) => ({ label: skill, value: skill })) ||
              []
            }
            className="react-select-container"
            classNamePrefix="react-select"
            aria-label="Select skills"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Start typing to search or add skills.
          </p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {profileSkills?.map((skill, index) => {
              const category = skill.toLowerCase().includes("soft")
                ? "soft"
                : "technical";
              return (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 ${skillCategories[category].color} rounded-full text-sm flex items-center gap-2 transition-transform`}
                  itemProp="knowsAbout"
                >
                  {skillCategories[category].icon}
                  {skill.replace("Skill: ", "")}
                </motion.span>
              );
            })}
          </motion.div>
          {/* Hidden semantic content for SEO */}
          <div className="sr-only" aria-hidden="true">
            <h3>Skill Set</h3>
            <ul>
              {profileSkills?.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
};

export default SkillsSection;
