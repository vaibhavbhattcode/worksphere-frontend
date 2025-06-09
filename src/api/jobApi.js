import axios from "../axiosInstance";

export const fetchJobs = async () => {
  try {
    const response = await axios.get("/api/jobs"); // Ensure the API is correct
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export const fetchJobById = async (jobId) => {
  try {
    const response = await axios.get(`/api/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job details:", error);
    return null;
  }
};
