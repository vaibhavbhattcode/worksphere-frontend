import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import CompanySidebar from "../../components/Company/CompanySidebar";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// List of industries and currency options (same as in JobPostingPage)
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

const currencyOptions = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY"];

// Yup validation schema for editing a job post with salary validations
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
    location: yup
      .string()
      .trim()
      .min(3, "Location must be at least 3 characters long")
      .required("Location is required"),
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
    currency: yup
      .string()
      .nullable()
      .test(
        "currency-required",
        "Currency is required when salary is provided",
        function (value) {
          const { minSalary, maxSalary } = this.parent;
          if (
            (minSalary != null || maxSalary != null) &&
            (!value || value.trim() === "")
          ) {
            return false;
          }
          return true;
        }
      )
      .oneOf(currencyOptions, "Please select a valid currency"),
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
          const arr = value.split(",").map((s) => s.trim());
          return arr.every((skill) => skill.length >= 2);
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
        originalValue === "" ? null : value
      )
      .min(
        new Date(new Date().setDate(new Date().getDate() + 1)),
        "Application deadline must be at least tomorrow"
      )
      .typeError("Please enter a valid date (e.g., YYYY-MM-DD)"),
    benefits: yup.string().nullable(),
    responsibilities: yup.string().nullable(),
    qualifications: yup.string().nullable(),
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

// Custom LocationInput Component using OpenCage Geocoding API (same as in JobPostingPage)
const LocationInput = ({ value, onChange, error }) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const API_KEY = "d2014074350f442f9f3721ac8cb68210"; // Replace with your OpenCage API key

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
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        placeholder="Type location (City, State, Country)"
      />
      {loading && <p className="text-xs text-gray-500">Loading...</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-sm max-h-40 overflow-auto">
          {suggestions.map((suggestion, index) => {
            const locationStr = formatSuggestion(suggestion);
            return (
              <li
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
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

// Prevent entry of invalid characters in salary fields
const preventInvalidKeys = (e) => {
  if (["e", "E", "-"].includes(e.key)) {
    e.preventDefault();
  }
};

const EditJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loadingJob, setLoadingJob] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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

  // Fetch the existing job data and pre-populate the form
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/jobs/${jobId}`,
          {
            withCredentials: true,
          }
        );
        const job = response.data;
        setValue("jobTitle", job.jobTitle);
        setValue("description", job.description);
        setValue("jobType", job.jobType);
        setValue("location", job.location);
        if (job.salary) {
          setValue("minSalary", job.salary.min);
          setValue("maxSalary", job.salary.max);
          setValue("currency", job.salary.currency);
        }
        setValue("industry", job.industry);
        setValue("remoteOption", job.remoteOption.toString());
        setValue("skills", job.skills ? job.skills.join(", ") : "");
        setValue("experienceLevel", job.experienceLevel);
        setValue(
          "applicationDeadline",
          job.applicationDeadline
            ? new Date(job.applicationDeadline).toISOString().slice(0, 10)
            : ""
        );
        setValue("benefits", job.benefits ? job.benefits.join("\n") : "");
        setValue(
          "responsibilities",
          job.responsibilities ? job.responsibilities.join("\n") : ""
        );
        setValue(
          "qualifications",
          job.qualifications ? job.qualifications.join("\n") : ""
        );
      } catch (error) {
        toast.error("Failed to fetch job details.");
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [jobId, setValue]);

  const onSubmit = async (data) => {
    try {
      data.remoteOption = data.remoteOption === "true";
      if (!data.applicationDeadline) data.applicationDeadline = null;
      await axios.put(`http://localhost:5000/api/jobs/${jobId}`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      toast.success("Job updated successfully!");
      reset();
      setTimeout(() => {
        navigate("/company/posted-jobs");
      }, 2000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update job. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (loadingJob) return <div className="text-center p-4">Loading...</div>;

  const formValues = watch();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <CompanySidebar />
      <div className="flex-grow md:ml-64 p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Job</h1>
          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            {showPreview ? "Hide Preview" : "Preview Changes"}
          </button>
        </div>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm"
          >
            <h2 className="text-xl font-bold mb-2">Job Preview</h2>
            <p>
              <strong>Title:</strong> {formValues.jobTitle || "[Job Title]"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {formValues.description || "[Description]"}
            </p>
            <p>
              <strong>Job Type:</strong> {formValues.jobType || "[Job Type]"}
            </p>
            <p>
              <strong>Location:</strong> {formValues.location || "[Location]"}
            </p>
            {(formValues.minSalary !== "" || formValues.maxSalary !== "") && (
              <p>
                <strong>Salary Range:</strong> {formValues.currency}{" "}
                {formValues.minSalary} - {formValues.currency}{" "}
                {formValues.maxSalary}
              </p>
            )}
            {formValues.industry && (
              <p>
                <strong>Industry:</strong> {formValues.industry}
              </p>
            )}
            <p>
              <strong>Remote Option:</strong>{" "}
              {formValues.remoteOption === "true" ? "Yes" : "No"}
            </p>
            {formValues.skills && (
              <p>
                <strong>Skills:</strong> {formValues.skills}
              </p>
            )}
            {formValues.experienceLevel && (
              <p>
                <strong>Experience Level:</strong> {formValues.experienceLevel}
              </p>
            )}
            {formValues.applicationDeadline && (
              <p>
                <strong>Application Deadline:</strong>{" "}
                {new Date(formValues.applicationDeadline).toLocaleDateString()}
              </p>
            )}
            {formValues.benefits && (
              <p>
                <strong>Benefits:</strong> {formValues.benefits}
              </p>
            )}
            {formValues.responsibilities && (
              <p>
                <strong>Responsibilities:</strong> {formValues.responsibilities}
              </p>
            )}
            {formValues.qualifications && (
              <p>
                <strong>Qualifications:</strong> {formValues.qualifications}
              </p>
            )}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Job Title *
              </label>
              <input
                type="text"
                {...register("jobTitle")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Description *
              </label>
              <textarea
                {...register("description")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                rows="4"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Job Type *
              </label>
              <select
                {...register("jobType")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Location *
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
              <label className="block text-gray-700 font-semibold mb-1">
                Remote Option
              </label>
              <select
                {...register("remoteOption")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            {/* Salary Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("minSalary")}
                  onKeyDown={preventInvalidKeys}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="e.g., 50000"
                />
                {errors.minSalary && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.minSalary.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("maxSalary")}
                  onKeyDown={preventInvalidKeys}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="e.g., 70000"
                />
                {errors.maxSalary && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maxSalary.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Currency
                </label>
                <select
                  {...register("currency")}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Industry *
              </label>
              <select
                {...register("industry")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Skills (optional, comma-separated)
              </label>
              <input
                type="text"
                {...register("skills")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Experience Level (optional)
              </label>
              <select
                {...register("experienceLevel")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
              <label className="block text-gray-700 font-semibold mb-1">
                Application Deadline (optional)
              </label>
              <input
                type="date"
                {...register("applicationDeadline")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {errors.applicationDeadline && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.applicationDeadline.message}
                </p>
              )}
            </div>
            {/* Benefits */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Benefits (optional)
              </label>
              <textarea
                {...register("benefits")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                rows="2"
                placeholder="List benefits, each on a new line"
              />
            </div>
            {/* Responsibilities */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Responsibilities (optional)
              </label>
              <textarea
                {...register("responsibilities")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                rows="3"
                placeholder="List responsibilities, each on a new line"
              />
            </div>
            {/* Qualifications */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Qualifications (optional)
              </label>
              <textarea
                {...register("qualifications")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                rows="3"
                placeholder="List qualifications, each on a new line"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? "Updating..." : "Update Job"}
            </button>
          </form>
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditJobPage;
