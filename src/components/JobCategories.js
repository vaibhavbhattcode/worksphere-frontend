// JobCategories.js
import React, { useEffect, useState } from "react";
import {
  FaLaptopCode,
  FaChartLine,
  FaStethoscope,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";

export default function JobCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icons mapping
  const iconMap = {
    Technology: <FaLaptopCode />,
    Business: <FaChartLine />,
    Healthcare: <FaStethoscope />,
    Others: <FaLaptopCode />,
  };

  // Gradient mapping
  const gradientMap = {
    Technology: "from-blue-500 to-cyan-500",
    Business: "from-purple-500 to-pink-500",
    Healthcare: "from-green-500 to-emerald-500",
    Others: "from-gray-500 to-gray-400",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/jobs/categories"
        );
        const fetchedCategories = response.data.map((cat, index) => ({
          icon: iconMap[cat.industry] || iconMap["Others"],
          title: cat.industry,
          jobs: `${cat.totalJobs.toLocaleString()}+`,
          gradient: gradientMap[cat.industry] || gradientMap["Others"],
          progress: cat.growth,
          roles: cat.popularRoles || [], // Ensure roles exist
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching job categories:", error);
        // Fallback mock data
        setCategories([
          {
            title: "Technology",
            icon: iconMap.Technology,
            jobs: "12,500+",
            gradient: gradientMap.Technology,
            progress: 28,
            roles: [
              { jobId: "tech1", title: "Software Engineer" },
              { jobId: "tech2", title: "Data Scientist" },
            ],
          },
          {
            title: "Business",
            icon: iconMap.Business,
            jobs: "8,200+",
            gradient: gradientMap.Business,
            progress: 15,
            roles: [
              { jobId: "biz1", title: "Product Manager" },
              { jobId: "biz2", title: "Marketing Lead" },
            ],
          },
          {
            title: "Healthcare",
            icon: iconMap.Healthcare,
            jobs: "6,800+",
            gradient: gradientMap.Healthcare,
            progress: 22,
            roles: [
              { jobId: "health1", title: "Registered Nurse" },
              { jobId: "health2", title: "Physician Assistant" },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 min-h-[360px] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            High-Demand Career Paths
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore thriving industries with top opportunities and competitive
            salaries
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((cat, index) => (
            <motion.article
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group glassmorphism rounded-2xl p-6 shadow-lg min-h-[360px] flex flex-col justify-between border border-gray-100/20 dark:border-gray-700/20"
              aria-label={`Job category: ${cat.title}`}
            >
              <div>
                <motion.div
                  className={`mb-5 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-500 dark:to-pink-500 flex items-center justify-center shadow-md`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-white text-2xl">{cat.icon}</span>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {cat.title}
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {cat.jobs} Open Positions
                  </p>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-purple-400 bg-indigo-100 dark:bg-purple-900/30 px-2.5 py-1 rounded-full">
                    +{cat.progress}% Growth
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-5 overflow-hidden">
                  <motion.div
                    className={`bg-gradient-to-r ${cat.gradient} h-3 rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${cat.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Popular Roles:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {cat.roles.length > 0 ? (
                      cat.roles.map((role, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Link
                            to={role.jobId ? `/job/${role.jobId}` : "#"}
                            className={`px-4 py-2 text-sm rounded-full text-gray-700 dark:text-gray-300 transition-colors ${
                              role.jobId
                                ? "bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-purple-900 hover:text-indigo-600 dark:hover:text-purple-400"
                                : "bg-gray-200 dark:bg-gray-600 opacity-50 cursor-not-allowed"
                            }`}
                            aria-label={`View ${role.title} job`}
                          >
                            {role.title}
                          </Link>
                        </motion.div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        No roles available
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to={`/jobs?industry=${encodeURIComponent(cat.title)}`}
                className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-500 dark:to-pink-500 text-white rounded-xl hover:shadow-glow transition-all group"
                aria-label={`Explore ${cat.title} jobs`}
              >
                <span className="text-sm font-semibold">
                  Browse Opportunities
                </span>
                <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to="/jobs"
            className="inline-flex items-center px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-500 dark:to-pink-500 rounded-xl hover:shadow-glow transition-all gap-2"
            aria-label="Explore all job categories"
          >
            Explore All Categories
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
