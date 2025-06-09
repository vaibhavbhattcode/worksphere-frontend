// Profile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import WorkExperienceSection from "../components/WorkExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import CertificationsSection from "../components/CertificationsSection";
import ResumeSection from "../components/ResumeSection";
import VideoIntroSection from "../components/VideoIntroSection";
import CareerGrowthSuggestions from "../components/CareerGrowthSuggestions";

import AnalyticsSection from "../components/AnalyticsSection";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Animation Variants
const messageVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4, ease: "easeIn" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const bannerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.5, ease: "easeIn" },
  },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    about: "",
    skills: [],
    experience: [],
    education: [],
    linkedin: "",
    github: "",
    twitter: "",
    portfolio: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [generatingAbout, setGeneratingAbout] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState({
    isComplete: false,
    missingFields: [],
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initial theme detection with fallback
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  // Detect theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
      console.log("Theme changed to:", e.matches ? "dark" : "light"); // Debug log
    };
    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  // Fetch session & profile data
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/status`, {
          withCredentials: true,
        });
        if (res.data.loggedIn && res.data.type !== "user") {
          setError("Please log in as a user to access this page.");
          setTimeout(() => navigate("/company/logout"), 2000);
          return;
        }
      } catch {
        // No active user session
      }

      const fetchProfile = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/user/profile`, {
            withCredentials: true,
          });
          const data = {
            ...response.data,
            education: response.data.education || [],
            experience: response.data.experience || [],
            skills: response.data.skills || [],
            about: response.data.about || "",
            profileImage: response.data.profileImage || "",
            resume: response.data.resume || "",
            videoIntroduction: response.data.videoIntroduction || "",
            certificates: response.data.certificates || [],
            socialLinks: response.data.socialLinks || {},
          };
          setProfileData(data);
          checkProfileCompletion(data);
        } catch (err) {
          if (err.response && err.response.status === 401) {
            navigate("/", { state: { message: "Please login first" } });
            return;
          }
          setError("Failed to load profile.");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    };
    checkSession();
  }, [navigate]);

  // Clear messages after 5s
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Profile Completion Check
  const checkProfileCompletion = (data) => {
    const missingFields = [];
    const requiredFields = {
      "Full Name": data.name?.trim(),
      "Job Title": data.title?.trim(),
      Location: data.location?.trim(),
      "Phone Number": data.phone?.trim(),
      "About Me": data.about?.trim(),
      Skills: data.skills?.length > 0,
      "Work Experience": data.experience?.length > 0,
      Education: data.education?.length > 0,
      "Profile Photo": data.profileImage?.trim(),
      Resume: data.resume?.trim(),
      Certificates: data.certificates?.length > 0,
      "Video Introduction": data.videoIntroduction?.trim(),
      "Social Links":
        data.socialLinks &&
        (data.socialLinks.linkedin?.trim() ||
          data.socialLinks.github?.trim() ||
          data.socialLinks.twitter?.trim() ||
          data.socialLinks.portfolio?.trim()),
    };

    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value) missingFields.push(field);
    });

    setProfileCompletion({
      isComplete: missingFields.length === 0,
      missingFields,
    });
  };

  // Handlers
  const handleEditToggle = () => {
    setError("");
    setSuccessMessage("");
    if (!editMode && profileData) {
      setEditData({
        name: profileData.name || "",
        title: profileData.title || "",
        location: profileData.location || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        about: profileData.about || "",
        skills: profileData.skills || [],
        experience: profileData.experience || [],
        education: profileData.education || [],
        linkedin: profileData.socialLinks?.linkedin || "",
        github: profileData.socialLinks?.github || "",
        twitter: profileData.socialLinks?.twitter || "",
        portfolio: profileData.socialLinks?.portfolio || "",
      });
      setValidationErrors({});
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!editData.name.trim()) errors.name = "Name is required.";
    if (profileData?.authMethod !== "google") {
      if (!editData.email.trim()) errors.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email))
        errors.email = "Invalid email address.";
    }
    if (!editData.phone.trim()) {
      errors.phone = "Phone is required.";
    } else if (!/^\+[1-9]\d{1,14}$/.test(editData.phone)) {
      errors.phone = "Phone must be in E.164 format (e.g., +12345678901)";
    }
    if (!editData.title.trim()) errors.title = "Job title is required.";
    if (!editData.location.trim()) errors.location = "Location is required.";
    return errors;
  };

  const handleGenerateAbout = async () => {
    if (!editData.title.trim()) {
      setError("Job title is required to generate About Me.");
      return;
    }
    if (!editData.skills || editData.skills.length === 0) {
      setError("At least one skill is required to generate About Me.");
      return;
    }
    setGeneratingAbout(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/generate-about`,
        {
          jobTitle: editData.title,
          skills: editData.skills,
          currentAbout: editData.about || "",
          tone: "professional",
          formatting: "insertAsteriskBetweenSolveAndGenerate",
        },
        { withCredentials: true }
      );
      const enhancedAbout = response.data.about.replace(
        /solve\s+generate/gi,
        "solve * generate"
      );
      if (!editMode) setEditMode(true);
      setEditData((prev) => ({ ...prev, about: enhancedAbout }));
      setSuccessMessage("About Me text generated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to generate About Me text."
      );
    } finally {
      setGeneratingAbout(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    const payload = { ...editData };
    delete payload.email;

    if (payload.experience) {
      payload.experience = payload.experience
        .map(({ id, ...rest }) => ({
          company: rest.company || "",
          position: rest.position || "",
          start: rest.start || "",
          end: rest.end || "",
          description: rest.description || "",
        }))
        .filter(
          (exp) =>
            exp.company.trim() ||
            exp.position.trim() ||
            exp.start.trim() ||
            exp.end.trim() ||
            exp.description.trim()
        );
    }

    if (payload.education) {
      payload.education = payload.education
        .map(({ id, ...rest }) => ({
          institution: rest.institution || "",
          degree: rest.degree || "",
          year: rest.year || "",
        }))
        .filter(
          (edu) =>
            edu.institution.trim() || edu.degree.trim() || edu.year.trim()
        );
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/profile`,
        payload,
        {
          withCredentials: true,
        }
      );
      const updatedData = {
        ...response.data,
        education: response.data.education || [],
        experience: response.data.experience || [],
        skills: response.data.skills || [],
        about: response.data.about || "",
        profileImage: profileData.profileImage || "",
        resume: profileData.resume || "",
        videoIntroduction: profileData.videoIntroduction || "",
        certificates: response.data.certificates || [],
        socialLinks: response.data.socialLinks || {},
      };
      setProfileData(updatedData);
      setEditMode(false);
      setValidationErrors({});
      setSuccessMessage("Profile updated successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleSkillsChange = (selectedOptions) =>
    setEditData((prev) => ({
      ...prev,
      skills: selectedOptions.map((opt) => opt.label),
    }));

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...editData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setEditData((prev) => ({ ...prev, experience: newExperience }));
  };
  const handleAddExperience = () =>
    setEditData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          company: "",
          position: "",
          start: "",
          end: "",
          description: "",
        },
      ],
    }));
  const handleRemoveExperience = (index) =>
    setEditData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...editData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEditData((prev) => ({ ...prev, education: newEducation }));
  };
  const handleAddEducation = () =>
    setEditData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now(), institution: "", degree: "", year: "" },
      ],
    }));
  const handleRemoveEducation = (index) =>
    setEditData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePhoto", file);
    try {
      setUploadingPhoto(true);
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/upload-photo`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const updatedData = {
        ...profileData,
        profileImage: response.data.profileImage,
      };
      setProfileData(updatedData);
      setSuccessMessage("Photo uploaded successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      setUploadingResume(true);
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/upload-resume`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const updatedData = {
        ...profileData,
        resume: response.data.resume,
        resumeName: response.data.resumeName,
      };
      setProfileData(updatedData);
      setSuccessMessage("Resume uploaded successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove resume.");
    } finally {
      setUploadingResume(false);
    }
  };
  const handleResumeRemove = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/user/profile/resume`, {
        withCredentials: true,
      });
      const updatedData = { ...profileData, resume: null, resumeName: null };
      setProfileData(updatedData);
      setSuccessMessage("Resume removed successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove resume.");
    }
  };

  const handleCertificateUpload = async (title, file) => {
    const formData = new FormData();
    formData.append("certificate", file);
    formData.append("title", title);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/upload-certificate`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const updatedData = {
        ...profileData,
        certificates: [
          ...(profileData.certificates || []),
          response.data.certificate,
        ],
      };
      setProfileData(updatedData);
      setSuccessMessage("Certificate uploaded successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Certificate upload failed.");
    }
  };
  const handleCertificateDelete = async (certificateId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/user/profile/certificate/${certificateId}`,
        {
          withCredentials: true,
        }
      );
      const updatedData = {
        ...profileData,
        certificates: profileData.certificates.filter(
          (cert) => cert._id !== certificateId
        ),
      };
      setProfileData(updatedData);
      setSuccessMessage("Certificate removed successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove certificate.");
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("videoIntro", file);
    try {
      setUploadingVideo(true);
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/upload-video-intro`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const updatedData = {
        ...profileData,
        videoIntroduction: response.data.videoIntroduction,
      };
      setProfileData(updatedData);
      setSuccessMessage("Video uploaded successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };
  const handleVideoRemove = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/user/profile/video-intro`, {
        withCredentials: true,
      });
      const updatedData = { ...profileData, videoIntroduction: "" };
      setProfileData(updatedData);
      setSuccessMessage("Video removed successfully.");
      checkProfileCompletion(updatedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove video.");
    }
  };

  // Skeleton Loading with Default Colors in Light Mode (Matching HomePage.js)
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton
                  circle
                  width={120}
                  height={120}
                  baseColor={isDarkMode ? "#374151" : undefined} // Use default in light mode, gray-700 in dark mode
                  highlightColor={isDarkMode ? "#4b5563" : undefined} // Use default in light mode, gray-600 in dark mode
                />
                <div className="flex-1 space-y-3">
                  <Skeleton
                    width="60%"
                    height={28}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <Skeleton
                    width="40%"
                    height={20}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <Skeleton
                    width="50%"
                    height={16}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <Skeleton
                    width="30%"
                    height={16}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <div className="flex gap-2">
                    {Array(3)
                      .fill()
                      .map((_, idx) => (
                        <Skeleton
                          key={idx}
                          width={24}
                          height={24}
                          baseColor={isDarkMode ? "#374151" : undefined}
                          highlightColor={isDarkMode ? "#4b5563" : undefined}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <Skeleton
                    width="30%"
                    height={24}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <div className="mt-4 space-y-2">
                    <Skeleton
                      width="100%"
                      height={16}
                      count={3}
                      baseColor={isDarkMode ? "#374151" : undefined}
                      highlightColor={isDarkMode ? "#4b5563" : undefined}
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <Skeleton
                    width="30%"
                    height={24}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <div className="mt-4 space-y-2">
                    <Skeleton
                      width="100%"
                      height={16}
                      count={3}
                      baseColor={isDarkMode ? "#374151" : undefined}
                      highlightColor={isDarkMode ? "#4b5563" : undefined}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <Skeleton
                    width="40%"
                    height={24}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <div className="mt-4">
                    <Skeleton
                      width="100%"
                      height={60}
                      baseColor={isDarkMode ? "#374151" : undefined}
                      highlightColor={isDarkMode ? "#4b5563" : undefined}
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <Skeleton
                    width="40%"
                    height={24}
                    baseColor={isDarkMode ? "#374151" : undefined}
                    highlightColor={isDarkMode ? "#4b5563" : undefined}
                  />
                  <div className="mt-4">
                    <Skeleton
                      width="100%"
                      height={60}
                      baseColor={isDarkMode ? "#374151" : undefined}
                      highlightColor={isDarkMode ? "#4b5563" : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          No profile data available
        </div>
      </div>
    );
  }

  // Premium Layout with Profile Completion Banner
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-16 relative overflow-hidden">
        <AnimatePresence>
          {error && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-lg w-full border border-red-400"
            >
              <span className="text-xl">⚠</span>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-lg w-full border border-green-400"
            >
              <span className="text-xl">✓</span>
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Profile Completion Banner */}
            {!editMode && !profileCompletion.isComplete && (
              <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg shadow-md p-6 border border-blue-100 dark:border-indigo-800 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Your profile is incomplete!
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {profileCompletion.missingFields.length > 3
                        ? "Add more details to stand out to employers."
                        : `You're missing: ${profileCompletion.missingFields.join(
                            ", "
                          )}.`}{" "}
                      Complete your profile to increase your visibility!
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
                >
                  Update Profile Now
                </button>
              </motion.div>
            )}

            {/* Profile Header */}
            <motion.div variants={sectionVariants}>
              <ProfileHeader
                profileData={profileData}
                editMode={editMode}
                editData={editData}
                validationErrors={validationErrors}
                handleInputChange={handleInputChange}
                handlePhotoUpload={handlePhotoUpload}
                uploadingPhoto={uploadingPhoto}
                handleEditToggle={handleEditToggle}
                onTitleChange={(selectedOption) =>
                  setEditData((prev) => ({
                    ...prev,
                    title: selectedOption ? selectedOption.value : "",
                  }))
                }
                onLocationChange={(selectedOption) =>
                  setEditData((prev) => ({
                    ...prev,
                    location: selectedOption ? selectedOption.value : "",
                  }))
                }
              />
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
              {/* Left Column */}
              <div className="lg:col-span-3 space-y-6">
                <motion.div variants={sectionVariants}>
                  <AboutSection
                    editMode={editMode}
                    generatingAbout={generatingAbout}
                    editData={editData}
                    profileData={profileData}
                    handleGenerateAbout={handleGenerateAbout}
                    handleInputChange={handleInputChange}
                  />
                </motion.div>
                <motion.div variants={sectionVariants}>
                  <WorkExperienceSection
                    editMode={editMode}
                    editExperience={editData.experience || []}
                    profileExperience={profileData.experience || []}
                    handleAddExperience={handleAddExperience}
                    handleExperienceChange={handleExperienceChange}
                    handleRemoveExperience={handleRemoveExperience}
                  />
                </motion.div>
                <motion.div variants={sectionVariants}>
                  <EducationSection
                    editMode={editMode}
                    editEducation={editData.education || []}
                    profileEducation={profileData.education || []}
                    handleAddEducation={handleAddEducation}
                    handleEducationChange={handleEducationChange}
                    handleRemoveEducation={handleRemoveEducation}
                  />
                </motion.div>
              </div>

              {/* Right Column (Sticky Sidebar) */}
              <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 lg:h-fit">
                <motion.div variants={sectionVariants}>
                  <SkillsSection
                    editMode={editMode}
                    skillsValue={editData.skills || []}
                    profileSkills={profileData.skills || []}
                    onSkillsChange={handleSkillsChange}
                  />
                </motion.div>
                <motion.div variants={sectionVariants}>
                  <CertificationsSection
                    editMode={editMode}
                    profileCertificates={profileData.certificates || []}
                    onCertificateUpload={handleCertificateUpload}
                    onCertificateDelete={handleCertificateDelete}
                  />
                </motion.div>
                <motion.div variants={sectionVariants}>
                  <ResumeSection
                    profileResume={profileData.resume || ""}
                    resumeName={profileData.resumeName || ""}
                    uploadingResume={uploadingResume}
                    handleResumeUpload={handleResumeUpload}
                    handleResumeRemove={handleResumeRemove}
                  />
                </motion.div>
              

                <motion.div variants={sectionVariants}>
                  <VideoIntroSection
                    videoIntro={profileData.videoIntroduction || ""}
                    uploadingVideo={uploadingVideo}
                    handleVideoUpload={handleVideoUpload}
                    handleVideoRemove={handleVideoRemove}
                  />
                </motion.div>
              </div>
            </div>

            {/* Save Button */}
            {editMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 flex justify-end"
              >
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-indigo-800 font-semibold text-lg"
                >
                  Save Changes
                </button>
              </motion.div>
            )}
            {/* Career Suggestions */}
            {profileData && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="mt-10"
              >
                <CareerGrowthSuggestions
                  skills={profileData.skills || []}
                  experience={profileData.experience || []}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
