// src/components/JobList.js

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaFilter,
  FaBuilding,
  FaStar, // for the “Recommended” badge
} from "react-icons/fa";
import Select from "react-select";
import Header from "./Header";

////////////////////////////////////////////////////////////////////////////////
// timeAgo utility: “Just now,” “5 mins ago,” etc.
////////////////////////////////////////////////////////////////////////////////
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

////////////////////////////////////////////////////////////////////////////////
// Debounce hook (waits “delay” ms after the user stops typing)
////////////////////////////////////////////////////////////////////////////////
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

////////////////////////////////////////////////////////////////////////////////
// Framer Motion variants (stagger & card animations)
////////////////////////////////////////////////////////////////////////////////
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
  hover: {
    y: -10,
    scale: 1.03,
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
    transition: { duration: 0.3 },
  },
};

////////////////////////////////////////////////////////////////////////////////
// SkeletonCard: shown while loading
////////////////////////////////////////////////////////////////////////////////
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="animate-pulse space-y-4">
      <div className="flex space-x-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

////////////////////////////////////////////////////////////////////////////////
// Industries list—for the “Industry” multi-select dropdown
////////////////////////////////////////////////////////////////////////////////
const allIndustries = [
  "Agriculture",
  "Automotive",
  "Banking",
  "Biotechnology",
  "Chemicals",
  "Communications",
  "Construction",
  "Consulting",
  "Education",
  "Energy",
  "Engineering",
  "Entertainment",
  "Environmental",
  "Finance",
  "Food & Beverage",
  "Government",
  "Healthcare",
  "Hospitality",
  "Insurance",
  "Legal",
  "Manufacturing",
  "Media",
  "Nonprofit",
  "Pharmaceuticals",
  "Real Estate",
  "Retail",
  "Telecommunications",
  "Transportation",
  "Utilities",
  "Technology",
  "Other",
];

////////////////////////////////////////////////////////////////////////////////
// MAIN COMPONENT
////////////////////////////////////////////////////////////////////////////////
const JobList = () => {
  const locationObj = useLocation();
  const params = new URLSearchParams(locationObj.search);

  // If the URL already had query‐string filters, initialize from there:
  const initialSearch = params.get("search") || "";
  const initialLocation = params.get("location") || "";
  const initialJobType = params.get("jobType") || "";
  const initialIndustry = params.get("industry") || "";

  // ─── State: We fetch one unified array “jobs” from the server ───
  // Each job object has: { …jobFields…, isRecommended: Boolean, companyName, companyLogo, skills: [] }
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filter/Search state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    jobType: initialJobType,
    remote: "",
    experience: "",
    industry: initialIndustry ? [initialIndustry] : [],
    datePosted: "",
    location: initialLocation,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce the searchTerm so that we only save each query once the user stops typing
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // ───────────────────────────────────────────────────────────────────────────
  // 1) ON MOUNT: Fetch all jobs (with recommended flagged & sorted first)
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    axios.defaults.withCredentials = true;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        // 1. Fetch recommended jobs
        const recommendedRes = await axios.get("/api/jobs/recommended");
        const recommendedJobs = recommendedRes.data || [];

        // 2. Fetch all jobs
        const allRes = await axios.get("/api/jobs");
        const allJobs = allRes.data || [];

        // 3. Remove duplicates (so recommended ones don’t show up twice)
        const recommendedIds = new Set(recommendedJobs.map((j) => j._id));
        const otherJobs = allJobs.filter((job) => !recommendedIds.has(job._id));

        // 4. Add `isRecommended` flag
        const flaggedRecommended = recommendedJobs.map((j) => ({
          ...j,
          isRecommended: true,
        }));

        // 5. Combine
        const combinedJobs = [...flaggedRecommended, ...otherJobs];
        setJobs(combinedJobs);
      } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // 2) Fetch “My Applications” so we can mark “Applied” jobs
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const resp = await axios.get("/api/applications/my", {
          withCredentials: true,
        });
        const appliedIds = new Set(
          resp.data.map((app) => app.jobId.toString())
        );
        setAppliedJobIds(appliedIds);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
      }
    };
    fetchAppliedJobs();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // 3) Whenever `debouncedSearchTerm` updates, store that query in /api/searches
  // so the backend can incorporate it into recommendations
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedSearchTerm.trim() !== "") {
      axios
        .post(
          "/api/searches",
          { query: debouncedSearchTerm },
          { withCredentials: true }
        )
        .catch((err) => {
          console.error("Failed to store search:", err);
        });
    }
  }, [debouncedSearchTerm]);

  // ───────────────────────────────────────────────────────────────────────────
  // 4) Clear Filters handler
  // ───────────────────────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setFilters({
      jobType: "",
      remote: "",
      experience: "",
      industry: [],
      datePosted: "",
      location: "",
    });
    setSearchTerm("");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 5) DERIVE `filteredJobs` by applying searchTerm + filters to the original `jobs` array
  //    We still want to keep “recommended first” inside filtered results, so we’ll sort again.
  // ───────────────────────────────────────────────────────────────────────────
  const filteredJobs = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    return jobs
      .filter((job) => {
        // --- 5a) TEXT SEARCH: if searchTerm is nonempty, match against
        //      jobTitle, companyName, location, OR skills[] (substring match)
        if (searchTerm.trim() !== "") {
          const term = searchTerm.trim().toLowerCase();
          const inTitle = job.jobTitle.toLowerCase().includes(term);
          const inCompany = job.companyName.toLowerCase().includes(term);
          const inLocation = job.location.toLowerCase().includes(term);

          // Check skills array as well:
          const inSkills =
            Array.isArray(job.skills) &&
            job.skills.some((skill) => skill.toLowerCase().includes(term));

          if (!(inTitle || inCompany || inLocation || inSkills)) return false;
        }

        // --- 5b) FILTER BY jobType
        if (filters.jobType && job.jobType !== filters.jobType) {
          return false;
        }

        // --- 5c) FILTER BY remote (expects filters.remote === "true" or "false")
        if (filters.remote) {
          const wantsRemote = filters.remote === "true";
          if (job.remoteOption !== wantsRemote) return false;
        }

        // --- 5d) FILTER BY experience
        if (filters.experience && job.experienceLevel !== filters.experience) {
          return false;
        }

        // --- 5e) FILTER BY datePosted ("24h", "week", "month")
        if (filters.datePosted && filters.datePosted !== "any") {
          const now = new Date();
          let cutoff = null;
          if (filters.datePosted === "24h") {
            cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          } else if (filters.datePosted === "week") {
            cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else if (filters.datePosted === "month") {
            cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          }
          if (cutoff && new Date(job.createdAt) < cutoff) return false;
        }

        // --- 5f) FILTER BY location text (city)
        if (
          filters.location.trim() !== "" &&
          !job.location
            .toLowerCase()
            .includes(filters.location.trim().toLowerCase())
        ) {
          return false;
        }

        // --- 5g) FILTER BY industry (job.industry is a single string)
        if (filters.industry.length > 0) {
          // Convert both sides to lowercase
          const selectedLower = filters.industry.map((i) => i.toLowerCase());
          const jobIndLower = job.industry ? job.industry.toLowerCase() : "";
          // If job’s industry is not in our selected list, skip this job:
          if (!selectedLower.includes(jobIndLower)) return false;
        }

        // If all criteria passed, keep this job:
        return true;
      })
      .sort((a, b) => {
        // Re‐sort so that recommended jobs still come first, then newest first:
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        // If same “isRecommended” value, sort by createdAt descending:
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [jobs, filters, searchTerm]);

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pt-16">
        {/* ====================== SEARCH BAR ====================== */}
        <section className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs by title, company, location, or skill..."
              className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 pb-10 flex flex-col lg:flex-row gap-8">
          {/* ====================== FILTERS SIDEBAR (desktop) ====================== */}
          <aside className="hidden lg:block lg:w-80 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Filters
              </h3>
              <FaFilter className="text-blue-500" />
            </div>
            <div className="space-y-5">
              {[
                {
                  label: "Job Type",
                  key: "jobType",
                  options: ["Full-time", "Part-time", "Contract"],
                },
                {
                  label: "Remote Option",
                  key: "remote",
                  options: ["true:Remote", "false:On-site"],
                },
                {
                  label: "Experience Level",
                  key: "experience",
                  options: ["Entry-level", "Mid-level", "Senior"],
                },
                {
                  label: "Date Posted",
                  key: "datePosted",
                  options: [
                    "24h:Past 24 hours",
                    "week:Past week",
                    "month:Past month",
                  ],
                },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                  </label>
                  <select
                    value={filters[key]}
                    onChange={(e) =>
                      setFilters({ ...filters, [key]: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Any {label}</option>
                    {options.map((opt) => {
                      const [value, display] = opt.includes(":")
                        ? opt.split(":")
                        : [opt, opt];
                      return (
                        <option key={value} value={value}>
                          {display}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  placeholder="Enter city (e.g., Surat)"
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <Select
                  isMulti
                  options={allIndustries.map((ind) => ({
                    value: ind,
                    label: ind,
                  }))}
                  value={filters.industry.map((ind) => ({
                    value: ind,
                    label: ind,
                  }))}
                  onChange={(selected) =>
                    setFilters({
                      ...filters,
                      industry: selected ? selected.map((s) => s.value) : [],
                    })
                  }
                  placeholder="Select industries..."
                  className="w-full"
                  classNamePrefix="react-select"
                />
              </div>

              <button
                onClick={handleClearFilters}
                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* ====================== FILTERS BUTTON (mobile) ====================== */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
          </div>

          {/* ====================== MAIN CONTENT: JOB LIST ====================== */}
          <main className="flex-1">
            {/* ─────────────────────────────────────────────────────────
                Show total count of all filtered jobs
            ───────────────────────────────────────────────────────── */}
            {!loading && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-t-xl border-b border-gray-200 dark:border-gray-700 shadow-sm mb-6">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {filteredJobs.length} Job
                  {filteredJobs.length !== 1 ? "s" : ""} Found
                </p>
              </div>
            )}

            {loading ? (
              // ─────────────────────────────────────────────────────
              // Show skeleton cards while loading
              // ─────────────────────────────────────────────────────
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No jobs found
                  {filters.location ? ` in ${filters.location}` : ""}. Try
                  adjusting your search or filters.
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job._id}
                    layout
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <img
                          src={job.companyLogo || "/default-logo.png"}
                          alt={job.companyName}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex items-center space-x-2">
                          {job.isRecommended && (
                            <span className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
                              <FaStar className="mr-1" /> Recommended
                            </span>
                          )}
                          {appliedJobIds.has(job._id.toString()) && (
                            <span className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-3 py-1 rounded-md text-xs font-medium flex items-center">
                              <FaCheckCircle className="mr-1.5" /> Applied
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <Link to={`/job/${job._id}`} className="block group">
                          <h2
                            className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200 truncate"
                            title={job.jobTitle}
                          >
                            {job.jobTitle}
                          </h2>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center">
                          <FaBuilding className="mr-2 text-teal-500" />
                          <span className="truncate">{job.companyName}</span>
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-teal-500 w-4 h-4" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <FaBriefcase className="mr-2 text-teal-500 w-4 h-4" />
                          <span className="truncate">{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-teal-500 w-4 h-4" />
                          <span className="truncate">
                            {timeAgo(job.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <Link
                        to={`/job/${job._id}`}
                        className="block w-full text-center bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors duration-200 font-semibold"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>

        {/* ====================== MOBILE FILTERS OVERLAY ====================== */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 lg:hidden"
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                className="bg-white dark:bg-gray-800 w-full sm:w-96 max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        label: "Job Type",
                        key: "jobType",
                        options: ["Full-time", "Part-time", "Contract"],
                      },
                      {
                        label: "Remote Option",
                        key: "remote",
                        options: ["true:Remote", "false:On-site"],
                      },
                      {
                        label: "Experience Level",
                        key: "experience",
                        options: ["Entry-level", "Mid-level", "Senior"],
                      },
                      {
                        label: "Date Posted",
                        key: "datePosted",
                        options: [
                          "24h:Past 24 hours",
                          "week:Past week",
                          "month:Past month",
                        ],
                      },
                    ].map(({ label, key, options }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {label}
                        </label>
                        <select
                          value={filters[key]}
                          onChange={(e) =>
                            setFilters({ ...filters, [key]: e.target.value })
                          }
                          className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="">Any {label}</option>
                          {options.map((opt) => {
                            const [value, display] = opt.includes(":")
                              ? opt.split(":")
                              : [opt, opt];
                            return (
                              <option key={value} value={value}>
                                {display}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) =>
                          setFilters({ ...filters, location: e.target.value })
                        }
                        placeholder="Enter city (e.g., Surat)"
                        className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Industry
                      </label>
                      <Select
                        isMulti
                        options={allIndustries.map((ind) => ({
                          value: ind,
                          label: ind,
                        }))}
                        value={filters.industry.map((ind) => ({
                          value: ind,
                          label: ind,
                        }))}
                        onChange={(selected) =>
                          setFilters({
                            ...filters,
                            industry: selected
                              ? selected.map((s) => s.value)
                              : [],
                          })
                        }
                        placeholder="Select industries..."
                        className="w-full"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <button
                      onClick={handleClearFilters}
                      className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default JobList;
