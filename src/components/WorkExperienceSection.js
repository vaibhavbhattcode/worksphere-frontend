import React from "react";
import { motion } from "framer-motion";
import {
  PlusCircleIcon,
  TrashIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

const WorkExperienceSection = ({
  editMode,
  editExperience,
  profileExperience,
  handleAddExperience,
  handleExperienceChange,
  handleRemoveExperience,
}) => {
  // Renders a date input that switches type on focus/blur for a smooth UX.
  const renderDateInput = (value, onChange, placeholder) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
      onFocus={(e) => (e.target.type = "month")}
      onBlur={(e) => (e.target.type = "text")}
    />
  );

  // Framer Motion variants for each card.
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-10 mb-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BriefcaseIcon className="w-7 h-7 text-blue-600" />
          Professional Experience
        </h2>
        {editMode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddExperience}
            className="flex items-center bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
            aria-label="Add work experience"
          >
            <PlusCircleIcon className="w-6 h-6 mr-2" />
            Add Position
          </motion.button>
        )}
      </div>
      {(editMode ? editExperience : profileExperience)?.length > 0 ? (
        <div className="space-y-8">
          {(editMode ? editExperience : profileExperience).map((exp, index) => (
            <motion.article
              key={exp.id || index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="relative p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 group shadow hover:shadow-lg transition-shadow duration-300"
              itemScope
              itemType="https://schema.org/OrganizationRole"
            >
              {editMode && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleRemoveExperience(index)}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Remove experience"
                  type="button"
                >
                  <TrashIcon className="w-5 h-5" />
                </motion.button>
              )}
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "position",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Senior Software Engineer"
                        aria-label="Job position"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Tech Corp Inc."
                        aria-label="Company name"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      {renderDateInput(
                        exp.start,
                        (e) =>
                          handleExperienceChange(
                            index,
                            "start",
                            e.target.value
                          ),
                        "MM/YYYY"
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      {renderDateInput(
                        exp.end,
                        (e) =>
                          handleExperienceChange(index, "end", e.target.value),
                        "MM/YYYY or Present"
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Describe your responsibilities and achievements..."
                      aria-label="Job description"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                    itemProp="roleName"
                  >
                    {exp.position}
                  </h3>
                  <p
                    className="text-gray-600 dark:text-gray-300"
                    itemProp="worksFor"
                  >
                    {exp.company}
                  </p>
                  <p className="text-sm text-gray-500">
                    <time dateTime={exp.start} itemProp="startDate">
                      {exp.start}
                    </time>{" "}
                    -{" "}
                    {exp.end === "Present" ? (
                      <span itemProp="endDate">Present</span>
                    ) : (
                      <time dateTime={exp.end} itemProp="endDate">
                        {exp.end}
                      </time>
                    )}
                  </p>
                  <p
                    className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap"
                    itemProp="description"
                  >
                    {exp.description}
                  </p>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 italic dark:text-gray-400">
            {editMode
              ? "Add your professional experience"
              : "No work experience listed"}
          </p>
        </div>
      )}
    </motion.section>
  );
};

export default WorkExperienceSection;
