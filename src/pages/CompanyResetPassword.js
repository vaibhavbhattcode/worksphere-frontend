import React, { useState } from "react";
import axios from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";

const CompanyResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const email = params.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/company/auth/reset-password", {
        token,
        email,
        password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/company/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <div className="mt-4 bg-green-100 text-green-700 p-2 rounded text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-2 rounded text-center">
            {error}
          </div>
        )}
        <button
          className="mt-4 text-blue-600 hover:underline w-full"
          onClick={() => navigate("/company/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default CompanyResetPassword;
