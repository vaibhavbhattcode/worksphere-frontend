// SalaryExplorer.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Registering ArcElement for pie/doughnut charts
} from "chart.js";
import { FaDollarSign } from "react-icons/fa";
import axios from "axios";
import ErrorBoundary from "../components/ErrorBoundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Explicitly register ArcElement
);

// Chart.js plugin to set canvas background color
const chartBackgroundPlugin = {
  id: "customCanvasBackground",
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.fillStyle = document.documentElement.classList.contains("dark")
      ? "#1f2937"
      : "#ffffff";
    ctx.fillRect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top
    );
    ctx.restore();
  },
};

// Ensure the chart instance is destroyed before re-creating it
const destroyChartInstance = (chartRef) => {
  if (chartRef.current) {
    chartRef.current.destroy();
    chartRef.current = null; // Reset the reference
  }
};

export default function SalaryExplorer() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salaryData, setSalaryData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/salaries", {
        params: { jobTitle, location },
      });
      const { chartData, insights } = response.data;
      setSalaryData({
        labels: chartData.labels || ["Entry", "Mid", "Senior"],
        datasets: [
          {
            label: "Salary ($)",
            data: chartData.data || [95000, 115000, 135000],
            backgroundColor: "rgba(99, 102, 241, 0.7)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1,
          },
        ],
      });
      setInsights(
        insights || {
          median: "$115,000",
          percentile25: "$95,000",
          percentile75: "$135,000",
          demand: "Very High",
        }
      );
    } catch (error) {
      console.error("Error fetching salary data:", error);
      setSalaryData({
        labels: ["Entry", "Mid", "Senior"],
        datasets: [
          {
            label: "Salary ($)",
            data: [95000, 115000, 135000],
            backgroundColor: "rgba(99, 102, 241, 0.7)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1,
          },
        ],
      });
      setInsights({
        median: "$115,000",
        percentile25: "$95,000",
        percentile75: "$135,000",
        demand: "Very High",
      });
    } finally {
      setLoading(false);
    }
  };

  // Call destroyChartInstance before rendering a new chart
  useEffect(() => {
    destroyChartInstance(chartRef); // Ensure the chart is destroyed before rendering a new one
  }, [salaryData]);

  // Dynamic chart options based on theme
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#1f2937",
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: "Salary Ranges",
        color: document.documentElement.classList.contains("dark")
          ? "#e5e7eb"
          : "#1f2937",
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#374151"
          : "#ffffff",
        titleColor: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#1f2937",
        bodyColor: document.documentElement.classList.contains("dark")
          ? "#e5e7eb"
          : "#4b5563",
      },
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#1f2937",
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "#4b5563"
            : "#e5e7eb",
        },
      },
      y: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#1f2937",
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "#4b5563"
            : "#e5e7eb",
        },
      },
    },
  };

  return (
    <ErrorBoundary>
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Explore Salaries
          </motion.h2>
          <div className="max-w-4xl mx-auto glassmorphism rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <motion.input
                type="text"
                placeholder="Job Title (e.g., Software Engineer)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-xl neumorphic dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                aria-label="Job title input"
              />
              <motion.input
                type="text"
                placeholder="Location (e.g., Seattle, WA)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-5 py-4 rounded-xl neumorphic dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                aria-label="Location input"
              />
              <motion.button
                onClick={fetchSalaryData}
                className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-glow flex items-center gap-2 disabled:opacity-50"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                disabled={loading}
                aria-label="Explore salaries"
              >
                <FaDollarSign /> {loading ? "Loading..." : "Explore"}
              </motion.button>
            </div>
            {salaryData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                  className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg min-h-[400px]"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <ErrorBoundary>
                    <Bar
                      data={salaryData}
                      options={chartOptions}
                      plugins={[chartBackgroundPlugin]}
                      ref={chartRef}
                    />
                  </ErrorBoundary>
                </motion.div>
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, staggerChildren: 0.2 }}
                >
                  {insights && (
                    <>
                      <motion.div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-xl p-4">
                        <p className="text-sm text-indigo-700 dark:text-indigo-200">
                          Median Salary
                        </p>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-white">
                          {insights.median}
                        </p>
                      </motion.div>
                      <motion.div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-xl p-4">
                        <p className="text-sm text-indigo-700 dark:text-indigo-200">
                          25th Percentile
                        </p>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-white">
                          {insights.percentile25}
                        </p>
                      </motion.div>
                      <motion.div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-xl p-4">
                        <p className="text-sm text-indigo-700 dark:text-indigo-200">
                          Job Demand
                        </p>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-white">
                          {insights.demand}
                        </p>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
