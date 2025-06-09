import React, { useEffect, useState } from "react";
import axios from "axios";
import CompanySidebar from "../../components/Company/CompanySidebar";
import CompanyViewProfileModal from "../../components/Company/CompanyViewProfileModal";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaEye,
  FaCalendarCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaFileCsv,
  FaSearch,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";
import "../../App.css";

Modal.setAppElement("#root");

const CompanyApplicationsDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobIds, setExpandedJobIds] = useState([]);
  const [applications, setApplications] = useState({});
  const [interviews, setInterviews] = useState({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState({});
  const [error, setError] = useState("");
  const [viewProfileUserId, setViewProfileUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState(new Date());
  const [interviewNotes, setInterviewNotes] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const applicationTabs = [
    "All",
    "Pending",
    "Interviewed",
    "Hired",
    "Rejected",
  ];
  const [selectedApplications, setSelectedApplications] = useState({});
  const [mainTab, setMainTab] = useState("all");
  const [selectedJobTab, setSelectedJobTab] = useState(null);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [coverLetterModal, setCoverLetterModal] = useState({
    open: false,
    text: "",
  });

  axios.defaults.baseURL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    axios
      .get("/api/jobs/posted", { withCredentials: true })
      .then(async (res) => {
        setJobs(res.data);
        setLoadingJobs(false);
        const appsObj = {};
        for (const job of res.data) {
          try {
            const appRes = await axios.get(
              `/api/company/applications/${job._id}`,
              { withCredentials: true }
            );
            appsObj[job._id] = (appRes.data || []).map((app) => ({
              ...app,
              jobId: job._id,
            }));
          } catch (err) {
            appsObj[job._id] = [];
          }
        }
        setApplications(appsObj);
        setLoadingApplications(false);
      })
      .catch((err) => {
        setError("Failed to load posted jobs.");
        setLoadingJobs(false);
        setLoadingApplications(false);
      });
  }, []);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      jobs.forEach((job) => fetchInterviews(job._id));
    }
  }, [jobs]);

  const handleCancelInterview = async (interviewId, jobId) => {
    if (!interviewId || !jobId) return;
    try {
      await axios.delete(`/api/company/interviews/${interviewId}`, {
        withCredentials: true,
      });
      await fetchInterviews(jobId);
      setScheduleSuccess("Interview cancelled successfully.");
      setTimeout(() => setScheduleSuccess(null), 2000);
    } catch (err) {
      setScheduleError("Failed to cancel interview.");
      setTimeout(() => setScheduleError(null), 2000);
      console.error("Error cancelling interview:", err);
    }
  };

  const fetchInterviews = async (jobId) => {
    setLoadingInterviews((prev) => ({ ...prev, [jobId]: true }));
    try {
      const interviewRes = await axios.get(
        `/api/company/interviews/job/${jobId}`,
        { withCredentials: true }
      );
      console.log(`Fetched interviews for job ${jobId}:`, interviewRes.data);
      setInterviews((prev) => ({ ...prev, [jobId]: interviewRes.data }));
    } catch (err) {
      console.error(`Error fetching interviews for job ${jobId}:`, err);
      setInterviews((prev) => ({ ...prev, [jobId]: [] }));
    } finally {
      setLoadingInterviews((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const toggleJob = async (jobId) => {
    if (expandedJobIds.includes(jobId)) {
      setExpandedJobIds(expandedJobIds.filter((id) => id !== jobId));
      setSearchTerm("");
    } else {
      setExpandedJobIds([...expandedJobIds, jobId]);
      try {
        if (!applications[jobId]) {
          const [appRes] = await Promise.all([
            axios.get(`/api/company/applications/${jobId}`, {
              withCredentials: true,
            }),
            fetchInterviews(jobId),
          ]);
          console.log(`Fetched applications for job ${jobId}:`, appRes.data);
          setApplications((prev) => ({ ...prev, [jobId]: appRes.data }));
        } else {
          await fetchInterviews(jobId);
        }
      } catch (err) {
        console.error("Error fetching applications or interviews:", err);
        setApplications((prev) => ({ ...prev, [jobId]: [] }));
        setInterviews((prev) => ({ ...prev, [jobId]: [] }));
        setLoadingInterviews((prev) => ({ ...prev, [jobId]: false }));
      }
    }
  };

  const handleUpdateStatus = (applicationId, status, jobId) => {
    axios
      .put(
        `/api/company/applications/${applicationId}/status`,
        { status },
        { withCredentials: true }
      )
      .then(() => {
        axios
          .get("/api/jobs/posted", { withCredentials: true })
          .then(async (res) => {
            setJobs(res.data);
            const appsObj = {};
            for (const job of res.data) {
              try {
                const appRes = await axios.get(
                  `/api/company/applications/${job._id}`,
                  { withCredentials: true }
                );
                appsObj[job._id] = (appRes.data || []).map((app) => ({
                  ...app,
                  jobId: job._id,
                }));
              } catch (err) {
                appsObj[job._id] = [];
              }
            }
            setApplications(appsObj);
          });
      })
      .catch((err) => {
        console.error("Error updating status:", err);
      });
  };

  const openScheduleModal = (application, jobId) => {
    if (!application || !jobId) {
      setScheduleError("Cannot schedule: Invalid application or job data");
      return;
    }

    const appUserId = application.userId?._id
      ? application.userId._id.toString()
      : application.userId?.toString();
    if (!appUserId) {
      setScheduleError("Cannot schedule: Invalid user data");
      return;
    }

    const existingInterview = interviews[jobId]?.find((interview) => {
      const interviewJobId = interview.jobId?.toString();
      const interviewUserId = interview.userId?._id
        ? interview.userId._id.toString()
        : interview.userId?.toString();
      console.log("Checking for existing interview in openScheduleModal:", {
        interviewJobId,
        jobId: jobId.toString(),
        interviewUserId,
        appUserId,
        interview,
      });
      return (
        interviewJobId === jobId.toString() && interviewUserId === appUserId
      );
    });

    console.log("Opening schedule modal:", {
      applicationId: application._id,
      jobId,
      userId: appUserId,
      existingInterview: existingInterview
        ? {
            id: existingInterview._id,
            jobId: existingInterview.jobId,
            userId: existingInterview.userId,
          }
        : null,
      isRescheduleMode: !!existingInterview,
    });

    setIsRescheduleMode(!!existingInterview);
    setSelectedApplication({ ...application, jobId });
    setInterviewDate(
      existingInterview ? new Date(existingInterview.date) : new Date()
    );
    setInterviewNotes(existingInterview ? existingInterview.notes : "");
    setScheduleError("");
    setScheduleSuccess("");
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedApplication(null);
    setIsRescheduleMode(false);
    setIsScheduling(false);
    setScheduleError("");
    setScheduleSuccess("");
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate) {
      setScheduleError("Please select a valid date and time");
      return;
    }

    setIsScheduling(true);
    setScheduleError("");
    setScheduleSuccess("");

    const userIdToSend = selectedApplication.userId?._id
      ? selectedApplication.userId._id.toString()
      : selectedApplication.userId?.toString();
    const jobId = selectedApplication.jobId;

    if (!userIdToSend || !jobId) {
      setScheduleError("Invalid user or job data");
      setIsScheduling(false);
      return;
    }

    console.log("Sending interview request:", {
      jobId,
      userId: userIdToSend,
      applicationId: selectedApplication._id,
      date: interviewDate,
      notes: interviewNotes,
      isRescheduleMode,
    });

    try {
      const response = await axios.post(
        "/api/company/interviews",
        {
          jobId: jobId,
          userId: userIdToSend,
          applicationId: selectedApplication._id,
          date: interviewDate,
          notes: interviewNotes,
        },
        { withCredentials: true }
      );

      await fetchInterviews(jobId);
      setScheduleSuccess(
        response.data.isReschedule
          ? "Interview rescheduled successfully."
          : "Interview scheduled successfully."
      );
      setTimeout(() => {
        closeScheduleModal();
      }, 2000);
    } catch (err) {
      const errorMessage = err.response
        ? err.response.data.message || "An error occurred"
        : "Network error";
      setScheduleError(
        `Failed to ${
          isRescheduleMode ? "reschedule" : "schedule"
        } interview: ${errorMessage}`
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const downloadCSV = (jobId) => {
    let apps = [];
    if (jobId === "all") {
      apps = Object.values(applications).flat();
    } else {
      apps = applications[jobId];
    }
    if (!apps || apps.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Cover Letter", "Status"];
    const csvRows = [
      headers.join(","),
      ...apps.map((app) =>
        [
          app.userId?.name || "N/A",
          app.userId?.email || "N/A",
          app.userId?.phone || "N/A",
          `"${app.coverLetter || "N/A"}"`,
          app.status || "Pending",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      jobId === "all" ? `applications_all.csv` : `applications_${jobId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredAndSortedApplications = (jobId) => {
    let apps = applications[jobId] || [];
    if (activeTab !== "All") {
      if (activeTab === "Interviewed") {
        apps = apps.filter((app) =>
          (interviews[jobId] || []).some(
            (interview) =>
              interview.applicationId?.toString() === app._id.toString()
          )
        );
      } else {
        apps = apps.filter(
          (app) => app.status?.toLowerCase() === activeTab.toLowerCase()
        );
      }
    }
    if (searchTerm) {
      apps = apps.filter(
        (app) =>
          app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      apps = [...apps].sort((a, b) => {
        let aValue =
          sortConfig.key === "userId"
            ? a.userId?.name || ""
            : a[sortConfig.key] || "";
        let bValue =
          sortConfig.key === "userId"
            ? b.userId?.name || ""
            : b[sortConfig.key] || "";
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return apps;
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const renderApplications = (jobId) => {
    const apps = filteredAndSortedApplications(jobId);
    if (!applications[jobId] || loadingInterviews[jobId]) {
      return (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    return (
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email"
              className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadCSV(jobId)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              disabled={apps.length === 0}
            >
              <FaFileCsv /> Download CSV
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(jobId, "hired")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              disabled={!(selectedApplications[jobId]?.length > 0)}
            >
              <FaCalendarCheck /> Bulk Hire
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(jobId, "rejected")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              disabled={!(selectedApplications[jobId]?.length > 0)}
            >
              <FaTimes /> Bulk Reject
            </button>
          </div>
        </div>
        {apps.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No applications found for this job.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="overflow-x-auto rounded-2xl shadow-inner">
              <table className="w-full min-w-[900px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-xs md:text-sm">
                <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Job
                    </th>
                    <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Cover Letter
                    </th>
                    <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Resume
                    </th>
                    <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Interview
                    </th>
                    <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loadingApplications ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-400"
                      >
                        Loading applications...
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const allApps =
                        jobs.length > 0
                          ? Object.values(applications)
                              .flat()
                              .filter((app) => {
                                const allJobId =
                                  app.jobId?._id ||
                                  app.jobId ||
                                  app.job?._id ||
                                  app.job;
                                const allJob = jobs.find(
                                  (j) =>
                                    j._id.toString() === allJobId?.toString()
                                );
                                if (!allJob) return false;
                                const search = searchTerm.toLowerCase();
                                return (
                                  app.userId?.name
                                    ?.toLowerCase()
                                    .includes(search) ||
                                  app.userId?.email
                                    ?.toLowerCase()
                                    .includes(search) ||
                                  allJob.jobTitle
                                    ?.toLowerCase()
                                    .includes(search)
                                );
                              })
                          : [];
                      return allApps.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-8 text-gray-400"
                          >
                            No applications found.
                          </td>
                        </tr>
                      ) : (
                        allApps.map((app) => {
                          const allJobId =
                            app.jobId?._id ||
                            app.jobId ||
                            app.job?._id ||
                            app.job;
                          const allJob = jobs.find(
                            (j) => j._id.toString() === allJobId?.toString()
                          );
                          if (!allJob) return null;
                          const allAppUserId = app.userId?._id
                            ? app.userId._id.toString()
                            : app.userId?.toString() || null;
                          const allAppId = app._id.toString();
                          const interview = (interviews[allJobId] || []).find(
                            (i) => i.applicationId?.toString() === allAppId
                          );
                          const interviewStatus = interview?.status || null;
                          return (
                            <tr
                              key={app._id}
                              className="group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors animate-fade-in"
                            >
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[120px] truncate">
                                {allJob.jobTitle}
                              </td>
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[110px] truncate">
                                {app.userId?.name || "N/A"}
                              </td>
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[150px] truncate">
                                {app.userId?.email || "N/A"}
                              </td>
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 max-w-[120px] truncate align-middle">
                                {app.coverLetter &&
                                app.coverLetter.length > 40 ? (
                                  <>
                                    <span className="truncate max-w-[80px] inline-block align-middle">
                                      {app.coverLetter.slice(0, 40)}...
                                    </span>
                                    <button
                                      className="ml-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                      onClick={() =>
                                        setCoverLetterModal({
                                          open: true,
                                          text: app.coverLetter,
                                        })
                                      }
                                    >
                                      View
                                    </button>
                                  </>
                                ) : (
                                  <span className="max-w-[100px] inline-block align-middle">
                                    {app.coverLetter || "N/A"}
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3 text-center align-middle">
                                {app.userId?.resume ? (
                                  <a
                                    href={
                                      app.userId.resume.startsWith("/")
                                        ? `${
                                            process.env.REACT_APP_BACKEND_URL ||
                                            "http://localhost:5000"
                                          }${app.userId.resume}`
                                        : app.userId.resume
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm border-2 border-indigo-400"
                                    style={{
                                      minWidth: "120px",
                                      justifyContent: "center",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    <FaEye className="inline text-lg" />
                                    <span className="tracking-wide">
                                      View Resume
                                    </span>
                                  </a>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-400 font-medium text-xs">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3 text-center align-middle">
                                {interviewStatus ? (
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap
                      ${
                        interviewStatus === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : interviewStatus === "rescheduled"
                          ? "bg-orange-100 text-orange-700"
                          : interviewStatus === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : interviewStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }
                    `}
                                  >
                                    {interviewStatus.charAt(0).toUpperCase() +
                                      interviewStatus.slice(1)}
                                  </span>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500 shadow-sm whitespace-nowrap">
                                    No Interview
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3 align-middle">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    ${
                      app.status === "hired"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                                >
                                  {app.status || "Pending"}
                                </span>
                              </td>
                              <td className="px-2 py-3 align-middle">
                                <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-xs transition-all"
                                    onClick={() =>
                                      setViewProfileUserId(allAppUserId)
                                    }
                                    aria-label={`View profile of ${
                                      app.userId?.name || "applicant"
                                    }`}
                                  >
                                    <FaEye /> View
                                  </button>
                                  <button
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow font-medium text-xs transition-all
                      ${
                        interviewStatus === "scheduled" ||
                        interviewStatus === "rescheduled"
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                    onClick={() =>
                                      openScheduleModal(app, allJobId)
                                    }
                                    aria-label={`${
                                      interviewStatus === "scheduled" ||
                                      interviewStatus === "rescheduled"
                                        ? "Reschedule"
                                        : "Schedule"
                                    } interview for ${
                                      app.userId?.name || "applicant"
                                    }`}
                                    disabled={!app._id || !allJobId}
                                  >
                                    <FaCalendarAlt />
                                    {interviewStatus === "scheduled" ||
                                    interviewStatus === "rescheduled"
                                      ? "Reschedule"
                                      : "Schedule"}
                                  </button>
                                  {interviewStatus &&
                                    interviewStatus !== "cancelled" && (
                                      <button
                                        className="flex items-center gap-1 px-2 py-1 bg-white border border-red-200 text-red-600 rounded-lg shadow hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-xs transition-all"
                                        onClick={() =>
                                          handleCancelInterview(
                                            interview._id,
                                            allJobId
                                          )
                                        }
                                      >
                                        <FaTimes /> Cancel
                                      </button>
                                    )}
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 font-medium text-xs transition-all"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        app._id,
                                        "hired",
                                        allJob._id
                                      )
                                    }
                                    aria-label={`Hire ${
                                      app.userId?.name || "applicant"
                                    }`}
                                  >
                                    <FaCalendarCheck /> Hire
                                  </button>
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-xs transition-all"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        app._id,
                                        "rejected",
                                        allJob._id
                                      )
                                    }
                                    aria-label={`Reject ${
                                      app.userId?.name || "applicant"
                                    }`}
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      );
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <CompanySidebar />
      <div className="flex-1 flex flex-col items-center px-2 md:px-8 py-10 w-full md:ml-64 ml-0 transition-all duration-300">
        <div className="w-full max-w-7xl">
          <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-8 py-3 text-lg font-bold rounded-t-2xl transition-colors duration-200 focus:outline-none shadow-md ${
                mainTab === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
              }`}
              onClick={() => setMainTab("all")}
            >
              All Applications
            </button>
            <button
              className={`px-8 py-3 text-lg font-bold rounded-t-2xl transition-colors duration-200 focus:outline-none shadow-md ${
                mainTab === "jobwise"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
              }`}
              onClick={() => setMainTab("jobwise")}
            >
              Job Wise
            </button>
          </div>
          {mainTab === "all" && (
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 animate-fade-in border border-gray-100 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight">
                All Applications
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                <input
                  type="text"
                  placeholder="Search by applicant name, email, or job title..."
                  className="w-full md:w-1/2 px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={() => downloadCSV("all")}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 flex items-center gap-2 shadow-lg text-base font-semibold transition-all duration-200"
                  disabled={Object.values(applications).flat().length === 0}
                >
                  <FaFileCsv /> Export All CSV
                </button>
              </div>
              <div className="overflow-x-auto rounded-2xl shadow-inner">
                <table className="w-full min-w-[900px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-xs md:text-sm">
                  <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Job
                      </th>
                      <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Email
                      </th>
                      <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Cover Letter
                      </th>
                      <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Resume
                      </th>
                      <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Interview
                      </th>
                      <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loadingApplications ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-8 text-gray-400"
                        >
                          Loading applications...
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        const allApps =
                          jobs.length > 0
                            ? Object.values(applications)
                                .flat()
                                .filter((app) => {
                                  const allJobId =
                                    app.jobId?._id ||
                                    app.jobId ||
                                    app.job?._id ||
                                    app.job;
                                  const allJob = jobs.find(
                                    (j) =>
                                      j._id.toString() === allJobId?.toString()
                                  );
                                  if (!allJob) return false;
                                  const search = searchTerm.toLowerCase();
                                  return (
                                    app.userId?.name
                                      ?.toLowerCase()
                                      .includes(search) ||
                                    app.userId?.email
                                      ?.toLowerCase()
                                      .includes(search) ||
                                    allJob.jobTitle
                                      ?.toLowerCase()
                                      .includes(search)
                                  );
                                })
                            : [];
                        return allApps.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="text-center py-8 text-gray-400"
                            >
                              No applications found.
                            </td>
                          </tr>
                        ) : (
                          allApps.map((app) => {
                            const allJobId =
                              app.jobId?._id ||
                              app.jobId ||
                              app.job?._id ||
                              app.job;
                            const allJob = jobs.find(
                              (j) => j._id.toString() === allJobId?.toString()
                            );
                            if (!allJob) return null;
                            const allAppUserId = app.userId?._id
                              ? app.userId._id.toString()
                              : app.userId?.toString() || null;
                            const allAppId = app._id.toString();
                            const interview = (interviews[allJobId] || []).find(
                              (i) => i.applicationId?.toString() === allAppId
                            );
                            const interviewStatus = interview?.status || null;
                            return (
                              <tr
                                key={app._id}
                                className="group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors animate-fade-in"
                              >
                                <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[120px] truncate">
                                  {allJob.jobTitle}
                                </td>
                                <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[110px] truncate">
                                  {app.userId?.name || "N/A"}
                                </td>
                                <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[150px] truncate">
                                  {app.userId?.email || "N/A"}
                                </td>
                                <td className="px-2 py-3 text-gray-900 dark:text-gray-100 max-w-[120px] truncate align-middle">
                                  {app.coverLetter &&
                                  app.coverLetter.length > 40 ? (
                                    <>
                                      <span className="truncate max-w-[80px] inline-block align-middle">
                                        {app.coverLetter.slice(0, 40)}...
                                      </span>
                                      <button
                                        className="ml-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                        onClick={() =>
                                          setCoverLetterModal({
                                            open: true,
                                            text: app.coverLetter,
                                          })
                                        }
                                      >
                                        View
                                      </button>
                                    </>
                                  ) : (
                                    <span className="max-w-[100px] inline-block align-middle">
                                      {app.coverLetter || "N/A"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center align-middle">
                                  {app.userId?.resume ? (
                                    <a
                                      href={
                                        app.userId.resume.startsWith("/")
                                          ? `${
                                              process.env
                                                .REACT_APP_BACKEND_URL ||
                                              "http://localhost:5000"
                                            }${app.userId.resume}`
                                          : app.userId.resume
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm border-2 border-indigo-400"
                                      style={{
                                        minWidth: "120px",
                                        justifyContent: "center",
                                        letterSpacing: "0.02em",
                                      }}
                                    >
                                      <FaEye className="inline text-lg" />
                                      <span className="tracking-wide">
                                        View Resume
                                      </span>
                                    </a>
                                  ) : (
                                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-400 font-medium text-xs">
                                      N/A
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center align-middle">
                                  {interviewStatus ? (
                                    <span
                                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap
                      ${
                        interviewStatus === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : interviewStatus === "rescheduled"
                          ? "bg-orange-100 text-orange-700"
                          : interviewStatus === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : interviewStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }
                    `}
                                    >
                                      {interviewStatus.charAt(0).toUpperCase() +
                                        interviewStatus.slice(1)}
                                    </span>
                                  ) : (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500 shadow-sm whitespace-nowrap">
                                      No Interview
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 align-middle">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    ${
                      app.status === "hired"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                                  >
                                    {app.status || "Pending"}
                                  </span>
                                </td>
                                <td className="px-2 py-3 align-middle">
                                  <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
                                    <button
                                      className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-xs transition-all"
                                      onClick={() =>
                                        setViewProfileUserId(allAppUserId)
                                      }
                                      aria-label={`View profile of ${
                                        app.userId?.name || "applicant"
                                      }`}
                                    >
                                      <FaEye /> View
                                    </button>
                                    <button
                                      className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow font-medium text-xs transition-all
                      ${
                        interviewStatus === "scheduled" ||
                        interviewStatus === "rescheduled"
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                      onClick={() =>
                                        openScheduleModal(app, allJobId)
                                      }
                                      aria-label={`${
                                        interviewStatus === "scheduled" ||
                                        interviewStatus === "rescheduled"
                                          ? "Reschedule"
                                          : "Schedule"
                                      } interview for ${
                                        app.userId?.name || "applicant"
                                      }`}
                                      disabled={!app._id || !allJobId}
                                    >
                                      <FaCalendarAlt />
                                      {interviewStatus === "scheduled" ||
                                      interviewStatus === "rescheduled"
                                        ? "Reschedule"
                                        : "Schedule"}
                                    </button>
                                    {interviewStatus &&
                                      interviewStatus !== "cancelled" && (
                                        <button
                                          className="flex items-center gap-1 px-2 py-1 bg-white border border-red-200 text-red-600 rounded-lg shadow hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-xs transition-all"
                                          onClick={() =>
                                            handleCancelInterview(
                                              interview._id,
                                              allJobId
                                            )
                                          }
                                        >
                                          <FaTimes /> Cancel
                                        </button>
                                      )}
                                    <button
                                      className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 font-medium text-xs transition-all"
                                      onClick={() =>
                                        handleUpdateStatus(
                                          app._id,
                                          "hired",
                                          allJob._id
                                        )
                                      }
                                      aria-label={`Hire ${
                                        app.userId?.name || "applicant"
                                      }`}
                                    >
                                      <FaCalendarCheck /> Hire
                                    </button>
                                    <button
                                      className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-xs transition-all"
                                      onClick={() =>
                                        handleUpdateStatus(
                                          app._id,
                                          "rejected",
                                          allJob._id
                                        )
                                      }
                                      aria-label={`Reject ${
                                        app.userId?.name || "applicant"
                                      }`}
                                    >
                                      <FaTimes /> Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        );
                      })()
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {mainTab === "jobwise" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Applications by Job
              </h2>
              <div className="flex flex-wrap gap-3 mb-8">
                {jobs.map((job) => (
                  <button
                    key={job._id}
                    className={`px-5 py-2 rounded-lg font-semibold shadow transition border-2 ${
                      selectedJobTab === job._id
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-800"
                    }`}
                    onClick={() => setSelectedJobTab(job._id)}
                  >
                    {job.jobTitle}{" "}
                    <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-full text-xs">
                      {(applications[job._id] &&
                        applications[job._id].length) ||
                        0}
                    </span>
                  </button>
                ))}
              </div>
              {selectedJobTab ? (
                <div className="overflow-x-auto rounded-2xl shadow-inner">
                  <table className="w-full min-w-[900px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-xs md:text-sm">
                    <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Job
                        </th>
                        <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Email
                        </th>
                        <th className="px-2 py-2 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Cover Letter
                        </th>
                        <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Resume
                        </th>
                        <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Interview
                        </th>
                        <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {loadingApplications ||
                      loadingInterviews[selectedJobTab] ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-8 text-gray-400"
                          >
                            Loading applications...
                          </td>
                        </tr>
                      ) : (applications[selectedJobTab] || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center py-8 text-gray-400"
                          >
                            No applications found.
                          </td>
                        </tr>
                      ) : (
                        (applications[selectedJobTab] || []).map((app) => {
                          const job = jobs.find(
                            (j) =>
                              j._id.toString() === selectedJobTab.toString()
                          );
                          if (!job) return null;
                          const appUserId = app.userId?._id
                            ? app.userId._id.toString()
                            : app.userId?.toString() || null;
                          const appId = app._id.toString();
                          const interview = (
                            interviews[selectedJobTab] || []
                          ).find((i) => i.applicationId?.toString() === appId);
                          const interviewStatus = interview?.status || null;
                          return (
                            <tr
                              key={app._id}
                              className="group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors animate-fade-in"
                            >
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[120px] truncate">
                                {job.jobTitle}
                              </td>
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[110px] truncate">
                                {app.userId?.name || "N/A"}
                              </td>
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle max-w-[150px] truncate">
                                {app.userId?.email || "N/A"}
                              </td>
                              <td className="px-2 py-3 text-gray-900 dark:text-gray-100 max-w-[120px] truncate align-middle">
                                {app.coverLetter &&
                                app.coverLetter.length > 40 ? (
                                  <>
                                    <span className="truncate max-w-[80px] inline-block align-middle">
                                      {app.coverLetter.slice(0, 40)}...
                                    </span>
                                    <button
                                      className="ml-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                      onClick={() =>
                                        setCoverLetterModal({
                                          open: true,
                                          text: app.coverLetter,
                                        })
                                      }
                                    >
                                      View
                                    </button>
                                  </>
                                ) : (
                                  <span className="max-w-[100px] inline-block align-middle">
                                    {app.coverLetter || "N/A"}
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3 text-center align-middle">
                                {app.userId?.resume ? (
                                  <a
                                    href={
                                      app.userId.resume.startsWith("/")
                                        ? `${
                                            process.env.REACT_APP_BACKEND_URL ||
                                            "http://localhost:5000"
                                          }${app.userId.resume}`
                                        : app.userId.resume
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm border-2 border-indigo-400"
                                    style={{
                                      minWidth: "120px",
                                      justifyContent: "center",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    <FaEye className="inline text-lg" />
                                    <span className="tracking-wide">
                                      View Resume
                                    </span>
                                  </a>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-400 font-medium text-xs">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3 text-center align-middle">
                                {interviewStatus ? (
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap
                      ${
                        interviewStatus === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : interviewStatus === "rescheduled"
                          ? "bg-orange-100 text-orange-700"
                          : interviewStatus === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : interviewStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }
                    `}
                                  >
                                    {interviewStatus.charAt(0).toUpperCase() +
                                      interviewStatus.slice(1)}
                                  </span>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500 shadow-sm whitespace-nowrap">
                                    No Interview
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3 align-middle">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    ${
                      app.status === "hired"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                                >
                                  {app.status || "Pending"}
                                </span>
                              </td>
                              <td className="px-2 py-3 align-middle">
                                <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-xs transition-all"
                                    onClick={() =>
                                      setViewProfileUserId(appUserId)
                                    }
                                    aria-label={`View profile of ${
                                      app.userId?.name || "applicant"
                                    }`}
                                  >
                                    <FaEye /> View
                                  </button>
                                  <button
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow font-medium text-xs transition-all
                      ${
                        interviewStatus === "scheduled" ||
                        interviewStatus === "rescheduled"
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                    onClick={() =>
                                      openScheduleModal(app, selectedJobTab)
                                    }
                                    aria-label={`${
                                      interviewStatus === "scheduled" ||
                                      interviewStatus === "rescheduled"
                                        ? "Reschedule"
                                        : "Schedule"
                                    } interview for ${
                                      app.userId?.name || "applicant"
                                    }`}
                                    disabled={!app._id || !selectedJobTab}
                                  >
                                    <FaCalendarAlt />{" "}
                                    {interviewStatus === "scheduled" ||
                                    interviewStatus === "rescheduled"
                                      ? "Reschedule Interview"
                                      : "Schedule Interview"}
                                  </button>
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 font-medium text-xs transition-all"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        app._id,
                                        "hired",
                                        selectedJobTab
                                      )
                                    }
                                    aria-label={`Hire ${
                                      app.userId?.name || "applicant"
                                    }`}
                                  >
                                    <FaCalendarCheck /> Hire
                                  </button>
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-xs transition-all"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        app._id,
                                        "rejected",
                                        selectedJobTab
                                      )
                                    }
                                    aria-label={`Reject ${
                                      app.userId?.name || "applicant"
                                    }`}
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-10">
                  Select a job to view its applications.
                </div>
              )}
            </div>
          )}
          {viewProfileUserId && (
            <CompanyViewProfileModal
              userId={viewProfileUserId}
              onClose={() => setViewProfileUserId(null)}
            />
          )}
          <Modal
            isOpen={isScheduleModalOpen}
            onRequestClose={closeScheduleModal}
            className="relative bg-white dark:bg-gray-800 p-0 rounded-3xl shadow-2xl max-w-lg mx-auto my-8 transform transition-all animate-fade-in-up border border-indigo-100 dark:border-gray-700"
            overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          >
            <div className="flex items-center justify-between px-8 pt-8 pb-4 rounded-t-3xl bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-900 dark:to-blue-900 shadow-md">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 dark:bg-gray-900/30">
                  <FaCalendarAlt className="text-white text-2xl" />
                </span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {isRescheduleMode
                    ? "Reschedule Interview"
                    : "Schedule Interview"}
                </h2>
              </div>
              <button
                onClick={closeScheduleModal}
                className="text-white hover:bg-white/10 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="px-8 pb-8 pt-4">
              {scheduleError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2 animate-shake">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {scheduleError}
                </div>
              )}
              {scheduleSuccess && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2 animate-fade-in">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {scheduleSuccess}
                </div>
              )}
              {isRescheduleMode && selectedApplication && (
                <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded animate-fade-in">
                  <div className="font-semibold text-orange-700 mb-1">
                    Current Interview Details
                  </div>
                  <div className="text-gray-800 text-sm">
                    <div>
                      Date:{" "}
                      {selectedApplication.date
                        ? new Date(selectedApplication.date).toLocaleString()
                        : "-"}
                    </div>
                    <div>Notes: {selectedApplication.notes || "-"}</div>
                  </div>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date and Time
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Date Picker */}
                  <div className="relative flex-1">
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-300 z-10" />
                    <DatePicker
                      selected={interviewDate}
                      onChange={(date) => setInterviewDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="block w-full pl-12 pr-4 py-3 border-2 border-indigo-200 dark:border-indigo-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-base font-medium placeholder-gray-400 dark:placeholder-gray-500"
                      minDate={new Date()}
                      popperPlacement="bottom-start"
                      popperClassName="z-50 max-w-[280px] sm:max-w-[300px]"
                      autoComplete="off"
                      placeholderText="Select date"
                      renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                      }) => (
                        <div className="flex items-center justify-between px-4 py-2 bg-indigo-600 dark:bg-indigo-900 text-white rounded-t-lg">
                          <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            className="p-1 hover:bg-indigo-700 rounded-full disabled:opacity-50 focus:outline-none"
                            aria-label="Previous month"
                          >
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
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <div className="flex items-center gap-2">
                            <select
                              value={date.getMonth()}
                              onChange={({ target: { value } }) =>
                                changeMonth(value)
                              }
                              className="bg-indigo-600 dark:bg-indigo-900 text-white font-semibold focus:outline-none border-none appearance-none px-2 py-1 rounded"
                              style={{
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                              }}
                            >
                              {[
                                "January",
                                "February",
                                "March",
                                "April",
                                "May",
                                "June",
                                "July",
                                "August",
                                "September",
                                "October",
                                "November",
                                "December",
                              ].map((month, index) => (
                                <option
                                  key={month}
                                  value={index}
                                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                                >
                                  {month}
                                </option>
                              ))}
                            </select>
                            <select
                              value={date.getFullYear()}
                              onChange={({ target: { value } }) =>
                                changeYear(value)
                              }
                              className="bg-indigo-600 dark:bg-indigo-900 text-white font-semibold focus:outline-none border-none appearance-none px-2 py-1 rounded"
                              style={{
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                              }}
                            >
                              {Array.from(
                                { length: 10 },
                                (_, i) => new Date().getFullYear() + i
                              ).map((year) => (
                                <option
                                  key={year}
                                  value={year}
                                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                                >
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className="p-1 hover:bg-indigo-700 rounded-full disabled:opacity-50 focus:outline-none"
                            aria-label="Next month"
                          >
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
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      calendarClassName="custom-datepicker bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-indigo-200 dark:border-indigo-700 text-gray-900 dark:text-white font-medium overflow-hidden"
                      dayClassName={(date) =>
                        date.toDateString() === new Date().toDateString()
                          ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-full"
                          : date.toDateString() ===
                            interviewDate?.toDateString()
                          ? "bg-indigo-600 dark:bg-indigo-500 text-white rounded-full"
                          : "hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full"
                      }
                      wrapperClassName="w-full"
                      showPopperArrow={false}
                    />
                  </div>
                  {/* Time Picker */}
                  <div className="relative flex-1">
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-300 z-10" />
                    <DatePicker
                      selected={interviewDate}
                      onChange={(date) => setInterviewDate(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="h:mm aa"
                      className="block w-full pl-12 pr-4 py-3 border-2 border-indigo-200 dark:border-indigo-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-base font-medium placeholder-gray-400 dark:placeholder-gray-500"
                      popperPlacement="bottom-end"
                      popperClassName="z-50 max-w-[150px]"
                      timeCaption="Time"
                      autoComplete="off"
                      placeholderText="Select time"
                      timeClassName={() =>
                        "hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg px-2 py-1"
                      }
                      wrapperClassName="w-full"
                      showPopperArrow={false}
                    />
                  </div>
                </div>
              </div>
              <style jsx global>{`
                .custom-datepicker {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                    Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
                    "Helvetica Neue", sans-serif;
                  width: 280px !important;
                }
                .custom-datepicker .react-datepicker__header {
                  background: none;
                  border-bottom: none;
                  padding: 0;
                }
                .custom-datepicker .react-datepicker__day-names {
                  display: flex;
                  justify-content: space-between;
                  padding: 0 8px;
                  margin-top: 8px;
                }
                .custom-datepicker .react-datepicker__day-name {
                  color: #4b5563;
                  font-weight: 600;
                  font-size: 0.75rem;
                  text-transform: uppercase;
                  width: 2.5rem;
                  text-align: center;
                }
                .custom-datepicker .react-datepicker__month {
                  margin: 0.5rem;
                }
                .custom-datepicker .react-datepicker__week {
                  display: flex;
                  justify-content: space-between;
                }
                .custom-datepicker .react-datepicker__day {
                  width: 2.5rem;
                  height: 2.5rem;
                  line-height: 2.5rem;
                  text-align: center;
                  font-size: 0.875rem;
                  margin: 0;
                  transition: background-color 0.2s, color 0.2s;
                }
                .custom-datepicker .react-datepicker__day--disabled {
                  color: #d1d5db;
                  cursor: not-allowed;
                }
                .custom-datepicker .react-datepicker__time-container {
                  border-left: 1px solid #e5e7eb;
                  width: 120px !important;
                }
                .custom-datepicker .react-datepicker__time-box {
                  width: 100% !important;
                }
                .custom-datepicker .react-datepicker__time-list {
                  max-height: 160px;
                  overflow-y: auto;
                  scrollbar-width: thin;
                  scrollbar-color: #4b5563 #e5e7eb;
                }
                .custom-datepicker
                  .react-datepicker__time-list::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-datepicker
                  .react-datepicker__time-list::-webkit-scrollbar-track {
                  background: #e5e7eb;
                }
                .custom-datepicker
                  .react-datepicker__time-list::-webkit-scrollbar-thumb {
                  background: #4b5563;
                  border-radius: 3px;
                }
                .custom-datepicker .react-datepicker__time-list-item {
                  font-size: 0.875rem;
                  padding: 0.5rem 1rem !important;
                  transition: background-color 0.2s;
                }
                .custom-datepicker .react-datepicker__time-list-item--selected {
                  background-color: #4f46e5 !important;
                  color: white !important;
                  font-weight: 500;
                }
                .dark .custom-datepicker .react-datepicker__day-name {
                  color: #9ca3af;
                }
                .dark .custom-datepicker .react-datepicker__day--disabled {
                  color: #6b7280;
                }
                .dark .custom-datepicker .react-datepicker__time-container {
                  border-left-color: #374151;
                }
                .dark .custom-datepicker .react-datepicker__time-list {
                  scrollbar-color: #9ca3af #374151;
                }
                .dark
                  .custom-datepicker
                  .react-datepicker__time-list::-webkit-scrollbar-track {
                  background: #374151;
                }
                .dark
                  .custom-datepicker
                  .react-datepicker__time-list::-webkit-scrollbar-thumb {
                  background: #9ca3af;
                }
                @media (max-width: 640px) {
                  .custom-datepicker {
                    width: 100% !important;
                  }
                  .custom-datepicker .react-datepicker__time-container {
                    width: 100% !important;
                  }
                }
                /* Ensure dropdown options are visible */
                .custom-datepicker select {
                  color: white !important;
                  background-color: transparent !important;
                  opacity: 1 !important;
                  visibility: visible !important;
                  outline: none;
                  cursor: pointer;
                }
                .custom-datepicker select option {
                  background-color: white !important;
                  color: #1f2937 !important;
                }
                .dark .custom-datepicker select option {
                  background-color: #1f2937 !important;
                  color: white !important;
                }
              `}</style>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes{" "}
                  <span className="text-xs text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="mt-1 block w-full p-3 border-2 border-indigo-200 dark:border-indigo-600 rounded-xl dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                  rows="4"
                  placeholder="Add any instructions or details for the candidate"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={closeScheduleModal}
                  className="px-5 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors font-semibold shadow"
                  disabled={isScheduling}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors font-semibold flex items-center gap-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={isScheduling}
                >
                  {isScheduling ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : isRescheduleMode ? (
                    "Reschedule"
                  ) : (
                    "Schedule"
                  )}
                </button>
              </div>
              {isRescheduleMode && selectedApplication && (
                <button
                  className="w-full mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 shadow focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel this interview?"
                      )
                    ) {
                      try {
                        await axios.delete(
                          `/api/company/interviews/${selectedApplication._id}`,
                          {
                            withCredentials: true,
                          }
                        );
                        setScheduleSuccess("Interview cancelled.");
                        await fetchInterviews(selectedApplication.jobId);
                        setTimeout(() => closeScheduleModal(), 1500);
                      } catch (err) {
                        setScheduleError("Failed to cancel interview.");
                      }
                    }
                  }}
                  disabled={isScheduling}
                >
                  <FaTimes /> Cancel Interview
                </button>
              )}
              {isScheduling && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-50 rounded-3xl animate-fade-in">
                  <FaSpinner className="text-indigo-600 dark:text-indigo-400 text-4xl animate-spin mb-3" />
                  <span className="text-indigo-700 dark:text-indigo-200 font-semibold text-lg">
                    Processing...
                  </span>
                </div>
              )}
            </div>
          </Modal>
          {coverLetterModal.open && (
            <Modal
              isOpen={coverLetterModal.open}
              onRequestClose={() =>
                setCoverLetterModal({ open: false, text: "" })
              }
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto my-8 transform transition-all"
              overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Cover Letter
              </h2>
              <div className="mb-6 whitespace-pre-line text-gray-800 dark:text-gray-100 max-h-96 overflow-y-auto border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                {coverLetterModal.text}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setCoverLetterModal({ open: false, text: "" })}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyApplicationsDashboard;
