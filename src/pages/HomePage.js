// HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Hero from "../components/Hero";
import JobCategories from "../components/JobCategories";
import FeaturedCompanies from "../components/FeaturedCompanies";
import SuccessStories from "../components/SuccessStories";
import SalaryExplorer from "../components/SalaryExplorer";
import JobMatchTeaser from "../components/JobMatchTeaser";
import TrendingSkills from "../components/TrendingSkills";
import CommunityHub from "../components/CommunityHub";
import Footer from "../components/Footer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/status",
          {
            withCredentials: true,
          }
        );
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.warn("No active session found. User is browsing as guest.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header user={null} />
        <main className="max-w-6xl mx-auto pt-20 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Skeleton height={40} width="50%" />
            <Skeleton height={20} width="70%" className="mt-2" />
            <Skeleton height={300} className="mt-4 rounded-md" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-10">
              <Skeleton height={30} width="40%" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                <Skeleton height={120} className="rounded-md" />
                <Skeleton height={120} className="rounded-md" />
                <Skeleton height={120} className="rounded-md" />
              </div>
            </div>
          ))}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header user={user} />
      <main>
        <Hero user={user} />
        <SuccessStories />
        <JobCategories />
        <SalaryExplorer />
        <JobMatchTeaser />
        <TrendingSkills />
        <FeaturedCompanies />
        <CommunityHub />
      </main>
      <Footer />
    </div>
  );
}
