import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ErrorBoundary from "../components/ErrorBoundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsSectionContent = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const chartRef = useRef(null);
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Detect dark mode by checking document's class list
  const isDarkMode = document.documentElement.classList.contains("dark");

  useEffect(() => {
    // For demonstration, use dummy data:
    setAnalyticsData({
      profileViews: 123,
      interactions: 45,
      jobMatchRank: 8, // Dummy job match rank (8/10)
      viewsOverTime: [
        { date: "2025-02-01", views: 10 },
        { date: "2025-02-02", views: 15 },
        { date: "2025-02-03", views: 20 },
        { date: "2025-02-04", views: 25 },
        { date: "2025-02-05", views: 30 },
      ],
    });

    // Uncomment below to fetch data from your backend:
    /*
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/analytics`, {
          withCredentials: true,
        });
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      }
    };
    fetchAnalytics();
    */
  }, [API_BASE_URL]);

  if (!analyticsData) return <div>Loading analytics...</div>;

  // Create a gradient for the line chart dataset if the chart canvas is ready
  let gradient = null;
  if (chartRef.current) {
    const ctx = chartRef.current.ctx;
    gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(75,192,192,0.4)");
    gradient.addColorStop(1, "rgba(75,192,192,0)");
  }

  const lineChartData = {
    labels: analyticsData.viewsOverTime.map((item) => item.date),
    datasets: [
      {
        label: "Profile Views Over Time",
        data: analyticsData.viewsOverTime.map((item) => item.views),
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: gradient || "rgba(75,192,192,0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#fff" : "#000",
          font: { size: 14, family: "Inter, sans-serif" },
        },
      },
      title: {
        display: true,
        text: "Profile Views Over Time",
        color: isDarkMode ? "#fff" : "#000",
        font: { size: 18, family: "Inter, sans-serif" },
      },
      tooltip: {
        backgroundColor: isDarkMode
          ? "rgba(255,255,255,0.7)"
          : "rgba(0,0,0,0.7)",
        titleColor: isDarkMode ? "#000" : "#fff",
        bodyColor: isDarkMode ? "#000" : "#fff",
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? "#fff" : "#000",
          font: { family: "Inter, sans-serif", size: 12 },
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? "#fff" : "#000",
          font: { family: "Inter, sans-serif", size: 12 },
        },
      },
    },
  };

  // Framer Motion variants for stat cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5 },
    }),
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8 my-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Advanced Analytics
      </h2>
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition duration-300"
        >
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Total Profile Views
          </p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {analyticsData.profileViews}
          </p>
        </motion.div>
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="p-6 bg-green-50 dark:bg-green-900 rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition duration-300"
        >
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            Total Interactions
          </p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {analyticsData.interactions}
          </p>
        </motion.div>
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition duration-300"
        >
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            Job Match Rank
          </p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {analyticsData.jobMatchRank} / 10
          </p>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-80"
      >
        <ErrorBoundary>
          <Line data={lineChartData} options={options} ref={chartRef} />
        </ErrorBoundary>
      </motion.div>
    </section>
  );
};

export default function AnalyticsSection() {
  return (
    <ErrorBoundary>
      <AnalyticsSectionContent />
    </ErrorBoundary>
  );
}
