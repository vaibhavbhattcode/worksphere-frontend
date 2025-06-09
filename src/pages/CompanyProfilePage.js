import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { motion } from "framer-motion";

const CompanyProfilePage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const { data } = await axios.get(`/api/companies/${id}`);
        setCompany(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company profile:", err);
        setError("Failed to load company profile.");
        setLoading(false);
      }
    };
    fetchCompanyProfile();

    const handleStorageChange = () => {
      setIsDark(localStorage.getItem("darkMode") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16 transition-colors duration-300">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 animate-pulse">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto sm:mx-0" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 max-w-md w-full text-center"
          >
            <p className="text-red-500 dark:text-red-400 text-lg font-semibold mb-4">
              {error}
            </p>
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            Company not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <motion.img
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              src={company.logo ? company.logo : "/demo.png"} // Fallback to demo.png if no logo is available
              alt={`${company.companyName} logo`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
            />

            <div className="flex-1 text-center sm:text-left">
              <motion.h1
                variants={itemVariants}
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2"
              >
                {company.companyName}
              </motion.h1>
              {company.tagline && (
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-gray-600 dark:text-gray-400"
                >
                  {company.tagline}
                </motion.p>
              )}
            </div>
            <motion.div variants={itemVariants}>
              {/* Updated View Jobs button uses Link to navigate to the jobs page */}
              <Link
                to={`/company/jobs/${company._id}`}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 inline-block"
              >
                View Jobs
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Sidebar Section: Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Company Info
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                {[
                  {
                    label: "Industry",
                    value: company.industry,
                    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-14",
                  },
                  {
                    label: "Size",
                    value: company.companySize,
                    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
                  },
                  {
                    label: "Location",
                    value: company.headquarters,
                    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                  },
                  {
                    label: "Founded",
                    value: company.founded,
                    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                  },
                  {
                    label: "Website",
                    value: company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Visit Site
                      </a>
                    ),
                    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
                  },
                ].map(
                  (item, i) =>
                    item.value && (
                      <div key={i} className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={item.icon}
                          />
                        </svg>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-200">
                            {item.label}:
                          </span>{" "}
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.value}
                          </span>
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Section: About & Specialties */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-8"
          >
            {company.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  About the Company
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}
            {(company.mission || company.vision) && (
              <div className="grid md:grid-cols-2 gap-6">
                {company.mission && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                      Mission
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {company.mission}
                    </p>
                  </div>
                )}
                {company.vision && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                      Vision
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {company.vision}
                    </p>
                  </div>
                )}
              </div>
            )}
            {company.specialties && company.specialties.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Specialties
                </h2>
                <div className="flex flex-wrap gap-3">
                  {company.specialties.map((specialty, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all duration-300"
                    >
                      {specialty}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
