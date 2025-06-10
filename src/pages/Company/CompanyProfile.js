// CompanyProfile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CompanySidebar from "../../components/Company/CompanySidebar";
import { FaSave, FaTimes, FaUpload, FaExternalLinkAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const industryOptions = [
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
const companyTypeOptions = ["Public", "Private", "Non-Profit", "Government"];
const companySizeOptions = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001+ employees",
];

const ProfileSchema = Yup.object().shape({
  companyName: Yup.string().min(2, "Too Short!").required("Required"),
  tagline: Yup.string(),
  description: Yup.string(),
  industry: Yup.string()
    .oneOf(industryOptions, "Select a valid industry")
    .required("Required"),
  website: Yup.string().url("Invalid URL").nullable(),
  headquarters: Yup.string(),
  companyType: Yup.string()
    .oneOf(companyTypeOptions, "Select a valid type")
    .required("Required"),
  companySize: Yup.string()
    .oneOf(companySizeOptions, "Select a valid size")
    .required("Required"),
  founded: Yup.string()
    .matches(/^\d{4}$/, "Enter a valid year")
    .nullable(),
  specialties: Yup.string(),
  contactEmail: Yup.string().email("Invalid email").required("Required"),
  contactPhone: Yup.string(),
  mission: Yup.string(),
  vision: Yup.string(),
});

const CompanyProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/company/auth/status`,
          {
            withCredentials: true,
          }
        );
        if (res.data.loggedIn && res.data.type !== "company") {
          setError("Please log in as a company to access this page.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const fetchProfileData = async () => {
          try {
            const response = await axios.get(
              "http://localhost:5000/api/company/profile",
              {
                withCredentials: true,
              }
            );
            setProfileData(response.data);
          } catch (err) {
            setError("Failed to fetch profile data.");
          } finally {
            setLoading(false);
          }
        };
        fetchProfileData();
      } catch (err) {
        navigate("/company/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/company/profile/logo",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProfileData((prev) => ({ ...prev, logo: response.data.logo }));
      toast.success("Logo updated successfully!");
    } catch (error) {
      toast.error("Failed to upload logo.");
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const updatedValues = {
      ...values,
      specialties: values.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };
    try {
      const response = await axios.put(
        "http://localhost:5000/api/company/profile",
        updatedValues,
        { withCredentials: true }
      );
      setProfileData(response.data);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Loading profile...</div>
    );
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  // Check if profile is incomplete
  const isProfileIncomplete =
    !profileData.companyName ||
    !profileData.industry ||
    !profileData.companyType ||
    !profileData.companySize ||
    !profileData.contactEmail;

  const initialValues = {
    companyName: profileData.companyName || "",
    tagline: profileData.tagline || "",
    description: profileData.description || "",
    industry: profileData.industry || "",
    website: profileData.website || "",
    headquarters: profileData.headquarters || "",
    companyType: profileData.companyType || "",
    companySize: profileData.companySize || "",
    founded: profileData.founded || "",
    specialties: profileData.specialties
      ? profileData.specialties.join(", ")
      : "",
    contactEmail: profileData.contactEmail || "",
    contactPhone: profileData.contactPhone || "",
    mission: profileData.mission || "",
    vision: profileData.vision || "",
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <CompanySidebar />
      <div className="flex-1 p-4 md:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Notification if profile is incomplete */}
          {isProfileIncomplete && !editMode && (
            <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md flex items-center justify-between">
              <span>
                Your profile is incomplete. Please complete your profile.
              </span>
              <button
                onClick={() => setEditMode(true)}
                className="ml-4 text-blue-600 underline"
              >
                Complete Profile
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Company Profile
            </h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 text-white rounded-md flex items-center transition-colors ${
                editMode
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {editMode ? (
                <>
                  <FaTimes className="mr-2" /> Cancel
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Edit Profile
                </>
              )}
            </button>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white">
              <div className="flex items-center space-x-6">
                {profileData.logo ? (
                  <img
                    src={profileData.logo}
                    alt={`${profileData.companyName} Logo`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <img
                    src="/demo.png"
                    alt="Default Logo"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                )}
                <div>
                  <h2 className="text-3xl font-bold">
                    {profileData.companyName}
                  </h2>
                  {profileData.tagline && (
                    <p className="text-lg mt-1">{profileData.tagline}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-8">
              {editMode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Formik
                    initialValues={initialValues}
                    validationSchema={ProfileSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form>
                        <div className="mb-6">
                          <label className="block text-gray-700 font-semibold mb-2">
                            Company Logo
                          </label>
                          <div className="flex items-center space-x-4">
                            {profileData.logo ? (
                              <img
                                src={profileData.logo}
                                alt="Company Logo"
                                className="w-24 h-24 rounded-full object-cover"
                              />
                            ) : (
                              <img
                                src="/demo.png"
                                alt="Default Logo"
                                className="w-24 h-24 rounded-full object-cover"
                              />
                            )}
                            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition-colors">
                              <FaUpload className="mr-2" /> Upload Logo
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleLogoUpload}
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label
                              htmlFor="companyName"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Company Name
                            </label>
                            <Field
                              name="companyName"
                              type="text"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="companyName"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="tagline"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Tagline
                            </label>
                            <Field
                              name="tagline"
                              type="text"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="tagline"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                        <div className="mb-6">
                          <label
                            htmlFor="description"
                            className="block text-gray-700 font-semibold mb-1"
                          >
                            Description
                          </label>
                          <Field
                            as="textarea"
                            name="description"
                            rows="4"
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          />
                          <ErrorMessage
                            name="description"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label
                              htmlFor="industry"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Industry
                            </label>
                            <Field
                              as="select"
                              name="industry"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            >
                              <option value="">Select Industry</option>
                              {industryOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="industry"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="website"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Website
                            </label>
                            <Field
                              name="website"
                              type="text"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="website"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="headquarters"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Headquarters
                            </label>
                            <Field
                              name="headquarters"
                              type="text"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="headquarters"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="companyType"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Company Type
                            </label>
                            <Field
                              as="select"
                              name="companyType"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            >
                              <option value="">Select Type</option>
                              {companyTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="companyType"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="companySize"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Company Size
                            </label>
                            <Field
                              as="select"
                              name="companySize"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            >
                              <option value="">Select Size</option>
                              {companySizeOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="companySize"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="founded"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Founded
                            </label>
                            <Field
                              name="founded"
                              type="text"
                              placeholder="e.g., 2010"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="founded"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                        <div className="mb-6">
                          <label
                            htmlFor="specialties"
                            className="block text-gray-700 font-semibold mb-1"
                          >
                            Specialties (comma separated)
                          </label>
                          <Field
                            name="specialties"
                            type="text"
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          />
                          <ErrorMessage
                            name="specialties"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label
                              htmlFor="contactEmail"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Contact Email
                            </label>
                            <Field
                              name="contactEmail"
                              type="email"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="contactEmail"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="contactPhone"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Contact Phone
                            </label>
                            <Field
                              name="contactPhone"
                              type="text"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="contactPhone"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label
                              htmlFor="mission"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Mission
                            </label>
                            <Field
                              as="textarea"
                              name="mission"
                              rows="3"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="mission"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="vision"
                              className="block text-gray-700 font-semibold mb-1"
                            >
                              Vision
                            </label>
                            <Field
                              as="textarea"
                              name="vision"
                              rows="3"
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <ErrorMessage
                              name="vision"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700 transition-colors"
                        >
                          {isSubmitting ? (
                            "Saving..."
                          ) : (
                            <>
                              <FaSave className="mr-2" /> Save Profile
                            </>
                          )}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Overview
                    </h3>
                    <p className="text-gray-600">
                      {profileData.description || "No description provided."}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-gray-500 font-medium">Industry</p>
                      <p className="text-gray-700">
                        {profileData.industry || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Website</p>
                      {profileData.website ? (
                        <a
                          href={profileData.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          {profileData.website}{" "}
                          <FaExternalLinkAlt className="ml-1 text-sm" />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Headquarters</p>
                      <p className="text-gray-700">
                        {profileData.headquarters || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Company Type</p>
                      <p className="text-gray-700">
                        {profileData.companyType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Company Size</p>
                      <p className="text-gray-700">
                        {profileData.companySize || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Founded</p>
                      <p className="text-gray-700">
                        {profileData.founded || "N/A"}
                      </p>
                    </div>
                  </div>
                  {profileData.specialties?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Contact Information
                      </h3>
                      <p className="text-gray-700">
                        <span className="text-gray-500 font-medium">
                          Email:{" "}
                        </span>
                        {profileData.contactEmail || "N/A"}
                      </p>
                      <p className="text-gray-700">
                        <span className="text-gray-500 font-medium">
                          Phone:{" "}
                        </span>
                        {profileData.contactPhone || "N/A"}
                      </p>
                    </div>
                    {(profileData.mission || profileData.vision) && (
                      <div>
                        {profileData.mission && (
                          <>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              Mission
                            </h3>
                            <p className="text-gray-700">
                              {profileData.mission}
                            </p>
                          </>
                        )}
                        {profileData.vision && (
                          <>
                            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                              Vision
                            </h3>
                            <p className="text-gray-700">
                              {profileData.vision}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CompanyProfile;
