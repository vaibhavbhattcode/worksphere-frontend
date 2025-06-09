import React, { useEffect, useState, useCallback } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import AdminLayout from "../../components/AdminLayout";
import axios from "../../api/api";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, companies: 0, jobs: 0 });
  const [userGrowth, setUserGrowth] = useState([]);
  const [jobTrends, setJobTrends] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [filteredCompanyStats, setFilteredCompanyStats] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [unmatchedIndustries, setUnmatchedIndustries] = useState([]);
  const [error, setError] = useState(null);
  const [loadingJobTrends, setLoadingJobTrends] = useState(false);
  const [userGrowthInterval, setUserGrowthInterval] = useState("monthly");
  const [jobTrendsInterval, setJobTrendsInterval] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs().year());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedDay, setSelectedDay] = useState(dayjs().format("YYYY-MM-DD"));
  const [showZeroCounts, setShowZeroCounts] = useState(true);

  // Debug: log userGrowth data
  React.useEffect(() => {
    console.log("User Growth Data:", userGrowth);
  }, [userGrowth]);

  const handleIntervalChange = useCallback(
    async (type, interval) => {
      const adminToken = localStorage.getItem("adminToken");
      if (type === "userGrowth") {
        setUserGrowthInterval(interval);
        let url = `/admin/user-growth?interval=${interval}`;
        if (interval === "monthly") {
          url += `&month=${selectedMonth}&year=${selectedMonthYear}`;
        } else if (interval === "yearly") {
          url += `&year=${selectedYear}`;
        } else if (interval === "hourly") {
          url += `&date=${selectedDay}`;
        }
        try {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          });
          setUserGrowth(response.data);
        } catch (err) {
          console.error("Error fetching user growth:", err);
          setError("Failed to load user growth data");
        }
      } else if (type === "jobTrends") {
        setJobTrendsInterval(interval);
        setLoadingJobTrends(true);
        let url = `/admin/job-trends?interval=${interval}`;
        if (interval === "monthly") {
          url += `&month=${selectedMonth}&year=${selectedMonthYear}`;
        } else if (interval === "yearly") {
          url += `&year=${selectedYear}`;
        } else if (interval === "hourly") {
          url += `&date=${selectedDay}`;
        }
        try {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          });
          setJobTrends(response.data);
        } catch (error) {
          setError("Failed to load job trends data. Please try again later.");
        } finally {
          setLoadingJobTrends(false);
        }
      }
    },
    [selectedMonth, selectedMonthYear, selectedYear, selectedDay]
  );

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    const fetchStats = async () => {
      try {
        const [
          statsRes,
          growthRes,
          jobTrendsRes,
          jobStatsRes,
          companyStatsRes,
        ] = await Promise.all([
          axios.get("/admin/stats", {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          }),
          axios.get("/admin/user-growth", {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          }),
          axios.get("/admin/job-trends", {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          }),
          axios.get("/admin/job-stats", {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          }),
          axios.get("/admin/company-stats", {
            headers: { Authorization: `Bearer ${adminToken}` },
            withCredentials: true,
          }),
        ]);

        setStats(statsRes.data);
        setUserGrowth(growthRes.data);
        setJobTrends(jobTrendsRes.data);
        setJobStats(jobStatsRes.data);

        // Process company stats
        const industryStats = companyStatsRes.data.industryStats || [];
        const totalCompaniesCount = industryStats.reduce(
          (sum, item) => sum + item.count,
          0
        );

        const industryStatsWithPercentage = industryStats
          .map((item) => ({
            ...item,
            percentage: totalCompaniesCount
              ? Number(((item.count / totalCompaniesCount) * 100).toFixed(2))
              : 0,
          }))
          .sort(
            (a, b) => b.count - a.count || a.industry.localeCompare(b.industry)
          );

        setCompanyStats(industryStatsWithPercentage);
        setFilteredCompanyStats(industryStatsWithPercentage);
        setUnmatchedIndustries(companyStatsRes.data.unmatchedIndustries || []);

        setTopCompanies(
          (companyStatsRes.data.topCompanies || []).map((company) => ({
            name: company.name,
            jobCount: company.jobCount,
          }))
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (showZeroCounts) {
      setFilteredCompanyStats(companyStats);
    } else {
      setFilteredCompanyStats(companyStats.filter((stat) => stat.count > 0));
    }
  }, [showZeroCounts, companyStats]);

  const intervalOptions = [
    { value: "hourly", label: "Hourly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const formatLabels = (data, interval) => {
    if (!data || data.length === 0) return [];
    if (interval === "hourly") return data.map((item) => `${item.interval}:00`);
    if (interval === "yearly")
      return data.map((item) => item.interval.toString());
    if (interval === "monthly") {
      return data.map((item) =>
        dayjs(`${selectedMonthYear}-${selectedMonth}-${item.interval}`).format(
          "DD MMM"
        )
      );
    }
    return data.map((item) => `${item.interval}`);
  };

  const barData = {
    labels: formatLabels(userGrowth, userGrowthInterval),
    datasets: [
      {
        label: "User Growth",
        data: userGrowth.map((data) => data.count),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: ["Users", "Companies", "Jobs"],
    datasets: [
      {
        data: [stats.users, stats.companies, stats.jobs],
        backgroundColor: ["#EF4444", "#10B981", "#3B82F6"],
        borderColor: ["#FFF", "#FFF", "#FFF"],
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: formatLabels(jobTrends, jobTrendsInterval),
    datasets: [
      {
        label: "Job Postings",
        data: jobTrends.map((data) => data.count),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#7C3AED",
        pointRadius: 4,
      },
    ],
  };

  const jobStatsData = {
    labels: jobStats?.map((data) => data._id) || [],
    datasets: [
      {
        label: "Job Statistics",
        data: jobStats?.map((data) => data.count) || [],
        backgroundColor: ["#F59E0B", "#10B981", "#3B82F6"],
        borderColor: ["#FFF", "#FFF", "#FFF"],
        borderWidth: 2,
      },
    ],
  };

  const getColorGradient = (index, total) => {
    const hue = (index / total) * 240;
    return `hsl(${hue}, 70%, 65%)`;
  };

  const companyStatsBarData = {
    labels: filteredCompanyStats.map((data) => data.industry),
    datasets: [
      {
        label: "Number of Companies",
        data: filteredCompanyStats.map((data) => data.count),
        backgroundColor: filteredCompanyStats.map((_, index) =>
          getColorGradient(index, filteredCompanyStats.length)
        ),
        borderColor: filteredCompanyStats.map((_, index) =>
          getColorGradient(index, filteredCompanyStats.length)
        ),
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartHeight = Math.min(
    Math.max(filteredCompanyStats.length * 24, 300),
    500
  );

  const totalCompanies = filteredCompanyStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );

  const totalUnmatched = unmatchedIndustries.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <AdminLayout>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="p-6 bg-gray-100 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {dayjs().format("dddd, MMMM D, YYYY")}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 font-medium">
                Welcome back, Administrator
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 shadow">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold opacity-90">
                    Total Users
                  </h2>
                  <p className="text-3xl font-bold mt-2">{stats.users}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span>
                    Last 30 days:{" "}
                    {userGrowth.reduce((sum, item) => sum + item.count, 0)} new
                    users
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold opacity-90">
                    Total Companies
                  </h2>
                  <p className="text-3xl font-bold mt-2">{stats.companies}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>
                    {topCompanies.length > 0
                      ? topCompanies[0].name
                      : "No companies"}{" "}
                    has the most job postings
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold opacity-90">
                    Total Jobs
                  </h2>
                  <p className="text-3xl font-bold mt-2">{stats.jobs}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    Active job postings:{" "}
                    {jobStats.find((j) => j._id === "active")?.count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  User Growth
                </h2>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={userGrowthInterval}
                    onChange={(e) =>
                      handleIntervalChange("userGrowth", e.target.value)
                    }
                  >
                    {intervalOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {userGrowthInterval === "monthly" && (
                    <>
                      <select
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(Number(e.target.value));
                          handleIntervalChange("userGrowth", "monthly");
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {dayjs().month(i).format("MMMM")}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedMonthYear}
                        onChange={(e) => {
                          setSelectedMonthYear(Number(e.target.value));
                          handleIntervalChange("userGrowth", "monthly");
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[...Array(6)].map((_, i) => (
                          <option key={i} value={dayjs().year() - i}>
                            {dayjs().year() - i}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {userGrowthInterval === "yearly" && (
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        handleIntervalChange("userGrowth", "yearly");
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[...Array(6)].map((_, i) => (
                        <option key={i} value={dayjs().year() - i}>
                          {dayjs().year() - i}
                        </option>
                      ))}
                    </select>
                  )}
                  {userGrowthInterval === "hourly" && (
                    <input
                      type="date"
                      value={selectedDay}
                      onChange={(e) => {
                        setSelectedDay(e.target.value);
                        handleIntervalChange("userGrowth", "hourly");
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={dayjs().format("YYYY-MM-DD")}
                    />
                  )}
                </div>
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(255,255,255,0.9)",
                        titleColor: "#1F2937",
                        bodyColor: "#1F2937",
                        borderColor: "#E5E7EB",
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 4,
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: "#6B7280" },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0,0,0,0.05)" },
                        ticks: { color: "#6B7280" },
                      },
                    },
                  }}
                  height={300}
                />
              </div>
            </div>

            {/* Overall Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
                Platform Distribution
              </h2>
              <div className="h-[300px] flex items-center justify-center">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(255,255,255,0.9)",
                        titleColor: "#1F2937",
                        bodyColor: "#1F2937",
                        borderColor: "#E5E7EB",
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 4,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Job Postings Over Time */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  Job Postings Trend
                </h2>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={jobTrendsInterval}
                    onChange={(e) =>
                      handleIntervalChange("jobTrends", e.target.value)
                    }
                  >
                    {intervalOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {jobTrendsInterval === "monthly" && (
                    <>
                      <select
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(Number(e.target.value));
                          handleIntervalChange("jobTrends", "monthly");
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {dayjs().month(i).format("MMMM")}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedMonthYear}
                        onChange={(e) => {
                          setSelectedMonthYear(Number(e.target.value));
                          handleIntervalChange("jobTrends", "monthly");
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {[...Array(6)].map((_, i) => (
                          <option key={i} value={dayjs().year() - i}>
                            {dayjs().year() - i}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {jobTrendsInterval === "yearly" && (
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        handleIntervalChange("jobTrends", "yearly");
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {[...Array(6)].map((_, i) => (
                        <option key={i} value={dayjs().year() - i}>
                          {dayjs().year() - i}
                        </option>
                      ))}
                    </select>
                  )}
                  {jobTrendsInterval === "hourly" && (
                    <input
                      type="date"
                      value={selectedDay}
                      onChange={(e) => {
                        setSelectedDay(e.target.value);
                        handleIntervalChange("jobTrends", "hourly");
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      max={dayjs().format("YYYY-MM-DD")}
                    />
                  )}
                </div>
              </div>
              {loadingJobTrends ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <Line
                    data={lineData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(255,255,255,0.9)",
                          titleColor: "#1F2937",
                          bodyColor: "#1F2937",
                          borderColor: "#E5E7EB",
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 4,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: "#6B7280" },
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: "rgba(0,0,0,0.05)" },
                          ticks: { color: "#6B7280" },
                        },
                      },
                    }}
                    height={300}
                  />
                </div>
              )}
            </div>

            {/* Job Statistics */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Job Status Distribution
              </h2>
              <div className="h-[300px] flex items-center justify-center">
                <Pie
                  data={jobStatsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(255,255,255,0.9)",
                        titleColor: "#1F2937",
                        bodyColor: "#1F2937",
                        borderColor: "#E5E7EB",
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 4,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Industry and Companies Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Companies */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Top Companies by Job Postings
              </h2>
              {topCompanies.length > 0 ? (
                <div className="space-y-4">
                  {topCompanies.slice(0, 5).map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow transition-all"
                    >
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-500 font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        <p className="text-gray-600">
                          {company.jobCount} job postings
                        </p>
                      </div>
                      <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-gray-500 mt-4">
                    No company data available
                  </p>
                </div>
              )}
            </div>

            {/* Company Statistics */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-cyan-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Company Distribution by Industry
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    Total: {totalCompanies} companies
                  </span>
                  <label className="flex items-center space-x-2">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        checked={showZeroCounts}
                        onChange={() => setShowZeroCounts(!showZeroCounts)}
                        className="sr-only"
                        id="toggle"
                      />
                      <div
                        className={`block w-10 h-6 rounded-full ${
                          showZeroCounts ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          showZeroCounts ? "transform translate-x-4" : ""
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">Show all</span>
                  </label>
                </div>
              </div>

              {unmatchedIndustries.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm text-yellow-800 font-medium">
                        Unmatched Industries Found
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {unmatchedIndustries
                            .slice(0, 3)
                            .map((item, index) => (
                              <li key={index}>
                                {item.industry === "Missing"
                                  ? "Missing Industry"
                                  : item.industry}
                                :
                                <span className="font-semibold">
                                  {" "}
                                  {item.count} companies
                                </span>
                              </li>
                            ))}
                          {unmatchedIndustries.length > 3 && (
                            <li>+ {unmatchedIndustries.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {filteredCompanyStats.length > 0 ? (
                <div
                  className="overflow-hidden"
                  style={{ height: `${chartHeight}px` }}
                >
                  <Bar
                    data={companyStatsBarData}
                    options={{
                      indexAxis: "y",
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const stat =
                                filteredCompanyStats[context.dataIndex];
                              return `${stat.industry}: ${stat.count} companies (${stat.percentage}%)`;
                            },
                          },
                          backgroundColor: "rgba(255,255,255,0.95)",
                          titleColor: "#1F2937",
                          bodyColor: "#1F2937",
                          borderColor: "#E5E7EB",
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 4,
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Number of Companies",
                            font: { size: 12, weight: "bold" },
                            color: "#4B5563",
                          },
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                            color: "#6B7280",
                          },
                          grid: { color: "rgba(0,0,0,0.05)" },
                        },
                        y: {
                          ticks: {
                            color: "#4B5563",
                            font: { size: 12 },
                          },
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-gray-500 mt-4">
                    No industry data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
