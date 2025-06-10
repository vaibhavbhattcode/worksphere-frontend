import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CompanySidebar from "../../components/Company/CompanySidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaPlus, FaSpinner } from "react-icons/fa";
import debounce from "lodash.debounce";

const Filters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
        <FaSearch className="text-indigo-500" />
        <span>Filter Jobs</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Job Title
          </label>
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Search by title"
              value={filters.title}
              onChange={handleChange}
              className="pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              aria-label="Search by job title"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Location
          </label>
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Search by location"
              value={filters.location}
              onChange={handleChange}
              className="pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              aria-label="Search by location"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="jobType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Job Type
          </label>
          <select
            id="jobType"
            name="jobType"
            value={filters.jobType}
            onChange={handleChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
            aria-label="Select job type"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

const JobListTable = ({ jobs, onView, onUpdate, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          {[
            "Job Title",
            "Location",
            "Job Type",
            "Posted Date",
            "Applicants",
            "Status",
            "Actions",
          ].map((header) => (
            <th
              key={header}
              className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        <AnimatePresence>
          {jobs.map((job) => (
            <motion.tr
              key={job._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <td className="px-6 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {job.jobTitle}
              </td>
              <td
                className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                title={job.location}
              >
                {job.location.length > 25
                  ? job.location.slice(0, 25) + "..."
                  : job.location}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {job.jobType}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {job.applicationCount ?? 0}
              </td>
              <td className="px-6 py-4 text-center">
                {job.status === "Open" ? (
                  <span className="px-3 py-1 text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-lg">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-lg">
                    Closed
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <motion.button
                    onClick={() => onView(job)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`View job ${job.jobTitle}`}
                  >
                    View
                  </motion.button>
                  <motion.button
                    onClick={() => onUpdate(job._id)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Edit job ${job.jobTitle}`}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => onDelete(job._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Delete job ${job.jobTitle}`}
                  >
                    Delete
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

const PostedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    jobType: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const jobsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/jobs/posted`, {
          withCredentials: true,
        });
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setJobs(sorted);
      } catch (err) {
        if (err.response?.status === 401) navigate("/company/login");
        else setError("Failed to fetch jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [navigate]);

  // Debounced filter function
  const filterJobs = useMemo(
    () =>
      debounce((filters, jobs, setFilteredJobs) => {
        let result = jobs;
        if (filters.title) {
          result = result.filter((j) =>
            j.jobTitle.toLowerCase().includes(filters.title.toLowerCase())
          );
        }
        if (filters.location) {
          result = result.filter((j) =>
            j.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
        if (filters.jobType) {
          result = result.filter((j) => j.jobType === filters.jobType);
        }
        setFilteredJobs(result);
      }, 300),
    []
  );

  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    filterJobs(filters, jobs, setFilteredJobs);
    return () => filterJobs.cancel();
  }, [filters, jobs, filterJobs]);

  const handleView = (job) =>
    navigate(`/company-jobs/${job._id}`, { state: { job } });

  const handleUpdate = (id) => navigate(`/company/jobs/${id}/edit`);

  const handleDelete = async (id) => {
    if (!id || id.length !== 24) {
      toast.error("Invalid Job ID format.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/jobs/${id}`, {
          withCredentials: true,
        });
        const remaining = jobs.filter((j) => j._id !== id);
        setJobs(remaining);
        toast.success("Job deleted successfully!");
      } catch (err) {
        const code = err.response?.status;
        if (code === 404) toast.error("Job not found or already deleted.");
        else if (code === 403) toast.error("Unauthorized to delete this job.");
        else toast.error("Failed to delete job. Please try again.");
      }
    }
  };

  // Paginated jobs
  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice(0, page * jobsPerPage);
  }, [filteredJobs, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-gray-600 dark:text-gray-400 text-lg flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaSpinner className="animate-spin" />
          <span>Loading jobs...</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-red-600 dark:text-red-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      <CompanySidebar />
      <div className="flex-grow md:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              Posted Jobs
            </h1>
            <motion.button
              onClick={() => navigate("/company/jobs")}
              className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              <span>Create New Job</span>
            </motion.button>
          </div>
          <Filters filters={filters} setFilters={setFilters} />
          {paginatedJobs.length === 0 ? (
            <motion.div
              className="text-center p-6 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No jobs found.
            </motion.div>
          ) : (
            <>
              <JobListTable
                jobs={paginatedJobs}
                onView={handleView}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
              {paginatedJobs.length < filteredJobs.length && (
                <motion.button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mx-auto block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Load More
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        }
      />
    </div>
  );
};

export default PostedJobsPage;
