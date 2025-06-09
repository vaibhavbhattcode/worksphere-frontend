import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";

const ProjectsForm = ({
  projects,
  addProject,
  updateProject,
  removeProject,
  prevStep,
  nextStep,
}) => {
  // Local state to track validation errors for required fields per project
  const [errors, setErrors] = useState({});

  // Validate field on blur and update errors state accordingly
  const validateField = (index, field, value) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value.trim()) {
        if (!newErrors[index]) newErrors[index] = {};
        newErrors[index][field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required.`;
      } else {
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
      }
      return newErrors;
    });
  };

  // Helper function to compute input styling conditionally
  const inputClass = (index, field) =>
    `w-full px-4 py-3 border ${
      errors[index] && errors[index][field]
        ? "border-red-500"
        : "border-gray-300"
    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`;

  const textareaClass = (index, field) =>
    `w-full px-4 py-3 border ${
      errors[index] && errors[index][field]
        ? "border-red-500"
        : "border-gray-300"
    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none`;

  // Animation variants for each project card
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Projects (Optional)
      </h3>
      {projects.map((proj, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200 space-y-4 transition-transform hover:scale-105"
        >
          <div>
            <input
              type="text"
              placeholder="Project Title"
              value={proj.title}
              onChange={(e) => updateProject(index, "title", e.target.value)}
              onBlur={(e) => validateField(index, "title", e.target.value)}
              className={inputClass(index, "title")}
              required
            />
            {errors[index] && errors[index].title && (
              <p className="text-red-500 text-xs mt-1">{errors[index].title}</p>
            )}
          </div>
          <div>
            <textarea
              placeholder="Project Description"
              value={proj.description}
              onChange={(e) =>
                updateProject(index, "description", e.target.value)
              }
              onBlur={(e) =>
                validateField(index, "description", e.target.value)
              }
              className={textareaClass(index, "description")}
              rows="4"
              required
            ></textarea>
            {errors[index] && errors[index].description && (
              <p className="text-red-500 text-xs mt-1">
                {errors[index].description}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Technologies Used"
              value={proj.technologies}
              onChange={(e) =>
                updateProject(index, "technologies", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <input
              type="url"
              placeholder="Project URL (Optional)"
              value={proj.url}
              onChange={(e) => updateProject(index, "url", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => removeProject(index)}
              className="text-red-600 text-sm flex items-center gap-1 transition-colors"
              type="button"
            >
              <TrashIcon className="w-5 h-5" />
              Remove Project
            </motion.button>
          </div>
        </motion.div>
      ))}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addProject}
          className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-3 rounded-xl shadow-md"
          type="button"
        >
          Add Project
        </motion.button>
        <div className="flex gap-4">
          <button
            onClick={prevStep}
            className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-3 rounded-xl shadow-md"
            type="button"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-3 rounded-xl shadow-md"
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsForm;
