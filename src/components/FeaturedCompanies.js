// FeaturedCompanies.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBriefcase, FaUsers, FaMapMarkerAlt } from "react-icons/fa";

export default function FeaturedCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOldestCompanies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/company-profiles/oldest"
        );
        console.log("Fetched Companies:", response.data);
        setCompanies(response.data);
      } catch (err) {
        console.error("Error fetching oldest companies:", err);
        // Fallback mock data
        setCompanies([
          {
            _id: "1",
            company: "innovex-solutions",
            companyName: "Innovex Solutions",
            industry: "Technology",
            logo: "https://source.unsplash.com/100x100/?tech,logo",
            totalActiveJobs: 12,
            companySize: "500-1000 employees",
            companyAddress: "San Francisco, CA",
          },
          {
            _id: "2",
            company: "datacore-technologies",
            companyName: "DataCore Technologies",
            industry: "Data Analytics",
            logo: "https://source.unsplash.com/100x100/?data,logo",
            totalActiveJobs: 8,
            companySize: "100-500 employees",
            companyAddress: "New York, NY",
          },
          {
            _id: "3",
            company: "brightpath-inc",
            companyName: "BrightPath Inc.",
            industry: "Marketing",
            logo: "https://source.unsplash.com/100x100/?marketing,logo",
            totalActiveJobs: 5,
            companySize: "50-100 employees",
            companyAddress: "Austin, TX",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOldestCompanies();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Featured Companies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the pioneers shaping the future of work
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-5 min-h-[300px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={company._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="glassmorphism rounded-2xl p-5 shadow-lg min-h-[300px] flex flex-col justify-between"
                aria-label={`Featured company: ${company.companyName}`}
              >
                {/* Logo Section */}
                <motion.div
                  className="mb-4 flex justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <img
                      src={company.logo || "/demo.png"}
                      alt={`${company.companyName} logo`}
                      className="w-20 h-20 object-cover rounded-full border-2 border-transparent"
                    />
                    <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-indigo-500 to-purple-500 dark:from-purple-500 dark:to-pink-500" />
                  </div>
                </motion.div>

                {/* Company Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {company.companyName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {company.industry || "Others"}
                  </p>
                </div>

                {/* Details Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaBriefcase className="text-indigo-500 dark:text-purple-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Active Jobs
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-purple-400">
                      {company.totalActiveJobs || "No Jobs Available"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-indigo-500 dark:text-purple-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Company Size
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {company.companySize || "Not Specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-indigo-500 dark:text-purple-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Location
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {company.companyAddress || "Not Available"}
                    </span>
                  </div>
                </div>

                {/* View Profile Button */}
                <motion.div
                  className="text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to={`/company/profile/${company.company || company._id}`}
                    className="inline-block px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-glow dark:from-purple-500 dark:to-pink-500 transition-all duration-300"
                    aria-label={`View ${company.companyName} profile`}
                  >
                    View Profile
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
