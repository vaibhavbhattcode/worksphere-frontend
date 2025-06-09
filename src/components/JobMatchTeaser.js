// JobMatchTeaser.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function JobMatchTeaser() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobMatch = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/job-match",
          {
            withCredentials: true,
          }
        );
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job match:", error);
        setJob({
          title: "AI Engineer",
          company: "QuantumLabs",
          salary: "$150,000 - $200,000",
          location: "San Francisco, CA",
          description: "Build cutting-edge AI models for global impact.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchJobMatch();

    gsap.to(".wave-bg", {
      x: "-=100",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 12,
    });
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-gray-800 dark:to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 wave-bg opacity-20 bg-[url('https://svgshare.com/i/1234.svg')] bg-repeat-x bg-bottom" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered Job Matching
          </h2>
          <p className="text-lg mb-8 text-gray-200 dark:text-gray-300">
            Let our AI find opportunities tailored to your skills and goals.
          </p>
          <Link
            to="/job-match"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-glow transition-all"
            aria-label="Find AI-matched jobs"
          >
            Get Started
          </Link>
        </motion.div>
        <motion.div
          className="lg:w-1/2 glassmorphism rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ rotate: 2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {loading ? (
            <div className="h-40 animate-pulse bg-white/20 dark:bg-gray-700/20 rounded-lg" />
          ) : (
            <>
              <h3 className="text-2xl font-semibold mb-2 text-white">
                {job.title}
              </h3>
              <p className="text-lg text-purple-200 dark:text-purple-300">
                {job.company}
              </p>
              <p className="text-sm text-gray-300 dark:text-gray-400 mb-4">
                {job.salary} • {job.location}
              </p>
              <p className="text-gray-200 dark:text-gray-300">
                {job.description}
              </p>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
