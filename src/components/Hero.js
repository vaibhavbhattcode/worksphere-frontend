import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";

const API_URL = "/api/user/overview";

export default function Hero() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [jobsPosted, setJobsPosted] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const response = await fetch(API_URL, { credentials: "include" });
        const data = await response.json();
        setJobsPosted(data.totalJobPostings);
        setTotalCompanies(data.totalCompanies);
        setSuccessRate(data.successRate);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSearch = () => {
    const searchQuery = jobTitle.trim();
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append("search", searchQuery);
    if (location) {
      // Extract city name from input (e.g., "Surat, Gujarat, India" -> "Surat")
      const city = location.split(",")[0].trim();
      queryParams.append("location", city);
    }
    if (jobType) queryParams.append("jobType", jobType);

    console.log("Hero Search Query:", queryParams.toString()); // Debug log
    navigate(`/jobs?${queryParams.toString()}`);
  };

  const fetchLocationSuggestions = async (input) => {
    if (input.length < 3) return;
    setSuggestionLoading(true);
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?key=d2014074350f442f9f3721ac8cb68210&q=${input}`
      );
      const data = await response.json();
      if (data.results) {
        const filteredSuggestions = data.results.filter((result) => {
          const components = result.components;
          return (
            (components.city || components.town) &&
            components.state &&
            components.country
          );
        });
        setSuggestions(filteredSuggestions);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    fetchLocationSuggestions(e.target.value);
  };

  const handleSuggestionSelect = (suggestion) => {
    // Store the city name only
    const city = suggestion.components.city || suggestion.components.town || "";
    setLocation(city);
    setSuggestions([]);
  };

  return (
    <section className="relative bg-gradient-to-br from-indigo-900 to-purple-900 dark:from-gray-800 dark:to-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <span className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm font-medium">
                🚀 Join 50,000+ Successful Hires
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Find Your
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Dream Job
                </span>
                <span className="text-2xl md:text-3xl font-normal text-purple-200 block mt-4">
                  Your Perfect Opportunity Awaits
                </span>
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm shadow-md">
                <div className="text-2xl font-bold">
                  {dashboardLoading ? (
                    <CountUp end={0} duration={2} />
                  ) : (
                    <CountUp end={jobsPosted} duration={3} suffix="+" />
                  )}
                </div>
                <div className="text-sm text-purple-200">Jobs Posted</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm shadow-md">
                <div className="text-2xl font-bold">
                  {dashboardLoading ? (
                    <CountUp end={0} duration={2} />
                  ) : (
                    <CountUp end={totalCompanies} duration={3} suffix="+" />
                  )}
                </div>
                <div className="text-sm text-purple-200">Companies</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm shadow-md">
                <div className="text-2xl font-bold">
                  {dashboardLoading ? (
                    <CountUp end={0} duration={2} />
                  ) : (
                    <CountUp end={successRate} duration={3} suffix="%" />
                  )}
                </div>
                <div className="text-sm text-purple-200">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Start Your Search</h2>
                  <p className="text-purple-200">
                    Find jobs that match your skills and ambitions
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Job title or skills"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/20 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="relative flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2 relative">
                      <input
                        type="text"
                        placeholder="Search location (e.g., Surat)"
                        value={location}
                        onChange={handleLocationChange}
                        className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/20 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      {suggestions.length > 0 && (
                        <ul className="absolute left-0 right-0 mt-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg z-10 max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <li
                              key={
                                suggestion.geometry
                                  ? suggestion.geometry.lat
                                  : suggestion.formatted
                              }
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className="px-5 py-3 text-purple-100 hover:bg-purple-500/20 hover:text-white cursor-pointer transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl border-b border-white/10 last:border-b-0"
                            >
                              {suggestion.components.city ||
                                suggestion.components.town}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="w-full md:w-1/2 relative">
                      <select
                        className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/20 text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                      >
                        <option value="" className="bg-gray-800 text-white">
                          Job Type
                        </option>
                        <option
                          value="Full-time"
                          className="bg-gray-800 text-white"
                        >
                          Full-time
                        </option>
                        <option
                          value="Part-time"
                          className="bg-gray-800 text-white"
                        >
                          Part-time
                        </option>
                        <option
                          value="Contract"
                          className="bg-gray-800 text-white"
                        >
                          Contract
                        </option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                  >
                    Find Jobs Now
                  </button>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-purple-300">Popular searches:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      "Software Engineer",
                      "Product Manager",
                      "Data Scientist",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors cursor-pointer"
                        onClick={() => {
                          setJobTitle(tag);
                          navigate(`/jobs?search=${tag}`);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-90">
          {["Fortune 500", "Tech Startups", "Unicorns"].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 text-purple-200"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              {badge}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
    </section>
  );
}
