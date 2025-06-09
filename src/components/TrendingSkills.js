// TrendingSkills.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCode, FaCloud, FaChartBar, FaDatabase } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import axios from "axios";

export default function TrendingSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/skills/trending"
        );
        setSkills(
          response.data.map((skill, i) => ({
            ...skill,
            id: `skill-${i}`,
            icon: [FaCode, FaCloud, FaChartBar, FaDatabase][i % 4],
          }))
        );
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSkills([
          {
            name: "TypeScript",
            demand: 90,
            tooltip: "Essential for scalable web apps",
            courses: "Coursera: TypeScript Advanced",
            id: "skill-0",
            icon: FaCode,
          },
          {
            name: "Kubernetes",
            demand: 87,
            tooltip: "Orchestrating cloud-native solutions",
            courses: "Udemy: Kubernetes Mastery",
            id: "skill-1",
            icon: FaCloud,
          },
          {
            name: "Machine Learning",
            demand: 84,
            tooltip: "Driving AI innovation",
            courses: "edX: ML with Python",
            id: "skill-2",
            icon: FaChartBar,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Trending Skills
        </motion.h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className="glassmorphism rounded-2xl p-6 shadow-xl hover:shadow-glow"
                data-tooltip-id={skill.id}
                data-tooltip-content={skill.tooltip}
                aria-label={`Skill: ${skill.name}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.span
                    className="text-4xl text-indigo-600 dark:text-purple-400"
                    whileHover={{ scale: 1.2 }}
                  >
                    {skill.icon()}
                  </motion.span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h3>
                </div>
                <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.demand}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Learn:{" "}
                  <a
                    href="#"
                    className="text-indigo-600 dark:text-purple-400 hover:underline"
                  >
                    {skill.courses}
                  </a>
                </p>
              </motion.div>
            ))}
          </div>
        )}
        {skills.map((skill) => (
          <Tooltip
            key={skill.id}
            id={skill.id}
            place="top"
            className="bg-indigo-900 dark:bg-purple-900 text-white rounded-md px-3 py-1 shadow-lg"
            effect="float"
          />
        ))}
      </div>
    </section>
  );
}
