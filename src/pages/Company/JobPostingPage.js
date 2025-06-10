import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CompanySidebar from "../../components/Company/CompanySidebar";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Comprehensive list of industries
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

// Currency options for salary field
const currencyOptions = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY"];

// Validation schema using Yup
const schema = yup
  .object()
  .shape({
    jobTitle: yup
      .string()
      .trim()
      .min(5, "Job title must be at least 5 characters long")
      .max(100, "Job title cannot exceed 100 characters")
      .required("Job title is required"),
    description: yup
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters long")
      .required("Description is required"),
    jobType: yup
      .string()
      .oneOf(
        ["Full-time", "Part-time", "Contract", "Internship", "Temporary"],
        "Please select a valid job type"
      )
      .required("Job type is required"),
    location: yup.string().required("Location is required"),
    minSalary: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .min(0, "Minimum salary cannot be negative"),
    maxSalary: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .min(0, "Maximum salary cannot be negative")
      .test(
        "is-greater",
        "Maximum salary must be greater than minimum salary",
        function (value) {
          const { minSalary } = this.parent;
          if (minSalary != null && value != null) {
            return value > minSalary;
          }
          return true;
        }
      ),
    currency: yup.string().nullable(),
    industry: yup
      .string()
      .oneOf(allIndustries, "Please select a valid industry")
      .required("Industry is required"),
    remoteOption: yup
      .boolean()
      .transform((value, originalValue) => originalValue === "true")
      .default(false),
    skills: yup
      .string()
      .nullable()
      .test(
        "skills-format",
        "Each skill must be at least 2 characters long (e.g., 'JavaScript, React')",
        (value) => {
          if (!value) return true;
          const skillsArray = value.split(",").map((s) => s.trim());
          return skillsArray.every((skill) => skill.length >= 2);
        }
      ),
    experienceLevel: yup
      .string()
      .oneOf(
        ["Entry-level", "Mid-level", "Senior", "Executive"],
        "Please select a valid experience level"
      )
      .nullable(),
    applicationDeadline: yup
      .date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : new Date(originalValue)
      )
      .test(
        "deadline-at-least-tomorrow",
        "Application deadline must be at least tomorrow",
        function (value) {
          if (!value) return true;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          return value >= tomorrow;
        }
      )
      .typeError("Please enter a valid date in the format YYYY-MM-DD"),
    benefits: yup.string().trim().nullable(),
    responsibilities: yup.string().trim().nullable(),
    qualifications: yup.string().trim().nullable(),
  })
  .test(
    "salary-range",
    "If any salary field is provided, please fill out minimum salary, maximum salary (with max greater than min) and select a valid currency",
    function (value) {
      const { minSalary, maxSalary, currency } = value;
      if (
        (minSalary === null || isNaN(minSalary)) &&
        (maxSalary === null || isNaN(maxSalary)) &&
        (!currency || currency === "")
      ) {
        return true;
      }
      if (
        minSalary === null ||
        maxSalary === null ||
        !currency ||
        currency === ""
      ) {
        return this.createError({
          message:
            "Please provide both minimum and maximum salary and select a currency",
        });
      }
      if (maxSalary <= minSalary) {
        return this.createError({
          path: "maxSalary",
          message: "Maximum salary must be greater than minimum salary",
        });
      }
      if (!currencyOptions.includes(currency)) {
        return this.createError({
          path: "currency",
          message: "Please select a valid currency",
        });
      }
      return true;
    }
  );

// Custom LocationInput Component
const LocationInput = ({ value, onChange, error }) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const API_KEY = "d2014074350f442f9f3721ac8cb68210";

  const formatSuggestion = (suggestion) => {
    const { city, town, village, state, country } = suggestion.components;
    const cityName = city || town || village || "";
    let parts = [];
    if (cityName) parts.push(cityName);
    if (state) parts.push(state);
    if (country) parts.push(country);
    return parts.join(", ");
  };

  useEffect(() => {
    if (query.length < 3 || query === selectedLocation) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            query
          )}&key=${API_KEY}&limit=5`
        );
        if (response.data && response.data.results) {
          setSuggestions(response.data.results);
        }
      } catch (err) {
        console.error("Error fetching location suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedLocation, API_KEY]);

  const handleSelect = (formatted) => {
    onChange(formatted);
    setQuery(formatted);
    setSelectedLocation(formatted);
    setSuggestions([]);
  };

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (selectedLocation && newVal !== selectedLocation) {
      setSelectedLocation("");
    }
    setQuery(newVal);
    onChange(newVal);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
        placeholder="Type location (City, State, Country)"
      />
      {loading && <p className="text-xs text-gray-500 mt-1">Loading...</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((suggestion, index) => {
            const locationStr = formatSuggestion(suggestion);
            return (
              <li
                key={index}
                className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors duration-150"
                onClick={() => handleSelect(locationStr)}
              >
                {locationStr}
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

const JobPostingPage = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      jobTitle: "",
      description: "",
      jobType: "",
      location: "",
      minSalary: "",
      maxSalary: "",
      currency: "",
      industry: "",
      remoteOption: "false",
      skills: "",
      experienceLevel: "",
      applicationDeadline: "",
      benefits: "",
      responsibilities: "",
      qualifications: "",
    },
  });

  const formValues = watch();

  const onSubmit = async (data) => {
    try {
      data.remoteOption = data.remoteOption === "true";
      if (!data.applicationDeadline) {
        data.applicationDeadline = null;
      }
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/jobs`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      toast.success("Job posted successfully!");
      reset();
      navigate("/company/jobs");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to post job. Please try again.";
      toast.error(errorMessage);
    }
  };

  const preventInvalidKeys = (e) => {
    if (["e", "E", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CompanySidebar />
      <div className="flex-grow md:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Post a New Job
            </h1>
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200 shadow-sm"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {/* Job Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Job Post Preview
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-medium">Title:</span>{" "}
                  {formValues.jobTitle || "Untitled Job"}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Description:</span>{" "}
                  {formValues.description || "No description provided"}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Job Type:</span>{" "}
                  {formValues.jobType || "Not specified"}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Location:</span>{" "}
                  {formValues.location || "Not specified"}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Remote Option:</span>{" "}
                  {formValues.remoteOption === "true" ? "Yes" : "No"}
                </p>
                {(formValues.minSalary || formValues.maxSalary) && (
                  <p className="text-gray-700">
                    <span className="font-medium">Salary Range:</span>{" "}
                    {formValues.minSalary || "N/A"} -{" "}
                    {formValues.maxSalary || "N/A"} {formValues.currency || ""}
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-medium">Industry:</span>{" "}
                  {formValues.industry || "Not specified"}
                </p>
                {formValues.skills && (
                  <p className="text-gray-700">
                    <span className="font-medium">Skills:</span>{" "}
                    {formValues.skills}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Job Details
              </h2>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("jobTitle")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.jobTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm resize-vertical"
                  rows="5"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("jobType")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Temporary">Temporary</option>
                </select>
                {errors.jobType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.jobType.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <LocationInput
                      value={field.value}
                      onChange={field.onChange}
                      error={error}
                    />
                  )}
                />
              </div>

              {/* Remote Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remote Option
                </label>
                <select
                  {...register("remoteOption")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Salary Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("minSalary")}
                    onKeyDown={preventInvalidKeys}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                    placeholder="e.g., 50000"
                  />
                  {errors.minSalary && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.minSalary.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("maxSalary")}
                    onKeyDown={preventInvalidKeys}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                    placeholder="e.g., 70000"
                  />
                  {errors.maxSalary && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxSalary.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    {...register("currency")}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                  >
                    <option value="">Select Currency</option>
                    {currencyOptions.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                  {errors.currency && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currency.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("industry")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                >
                  <option value="">Select Industry</option>
                  {allIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (optional, comma-separated)
                </label>
                <input
                  type="text"
                  {...register("skills")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
                {errors.skills && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.skills.message}
                  </p>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  {...register("experienceLevel")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </select>
                {errors.experienceLevel && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experienceLevel.message}
                  </p>
                )}
              </div>

              {/* Application Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline (optional)
                </label>
                <input
                  type="date"
                  {...register("applicationDeadline")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                />
                {errors.applicationDeadline && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.applicationDeadline.message}
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits (optional)
                </label>
                <textarea
                  {...register("benefits")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm resize-vertical"
                  rows="3"
                  placeholder="e.g., Health insurance, 401(k), remote work flexibility..."
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsibilities (optional)
                </label>
                <textarea
                  {...register("responsibilities")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm resize-vertical"
                  rows="4"
                  placeholder="List the main responsibilities..."
                />
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualifications (optional)
                </label>
                <textarea
                  {...register("qualifications")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 shadow-sm resize-vertical"
                  rows="4"
                  placeholder="List the required qualifications..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    "Post Job"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default JobPostingPage;
