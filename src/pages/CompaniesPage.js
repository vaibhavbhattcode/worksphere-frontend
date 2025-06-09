import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { motion } from "framer-motion";

const SkeletonCompanyCard = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 animate-pulse flex flex-col space-y-4 w-full max-w-sm">
    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
    </div>
  </div>
);

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesRes = await axios.get("/api/companies");
        const companiesData = companiesRes.data;
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies. Please try again.");
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCompanies(companies);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = companies.filter(
      (company) =>
        (company.companyName &&
          company.companyName.toLowerCase().includes(lowerQuery)) ||
        (company.tagline &&
          company.tagline.toLowerCase().includes(lowerQuery)) ||
        (company.industry &&
          company.industry.toLowerCase().includes(lowerQuery))
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCompanyCard key={idx} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
          >
            <p className="text-red-600 dark:text-red-400 text-xl font-semibold mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Explore Top Companies
            </h1>
            <p className="mt-3 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover innovative employers and exciting career opportunities
              waiting for you.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12 relative max-w-2xl mx-auto"
          >
            <input
              type="text"
              placeholder="Search companies by name, industry, or tagline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </motion.div>

          {/* Companies Grid */}
          {filteredCompanies.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 dark:text-gray-400 text-xl font-medium"
            >
              No companies found matching your search.
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                >
                  {company.jobOpenings > 0 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      {company.jobOpenings} Openings
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={company.logo || "/demo.png"}
                      alt={`${company.companyName} logo`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900 mb-4"
                    />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {company.companyName}
                    </h2>
                    {company.tagline && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">
                        {company.tagline}
                      </p>
                    )}
                    <Link
                      to={`/company/profile/${company.company || company._id}`}
                      className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CompaniesPage;
