import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/status", {
          withCredentials: true,
        });
        if (res.data.loggedIn && res.data.type === "user") {
          navigate("/");
        } else if (res.data.loggedIn && res.data.type === "company") {
          setError("You are logged in as a company. Please log out first.");
          setTimeout(() => navigate("/company/logout"), 2000);
        }
      } catch (err) {
        console.warn("No active user session.");
      }
    };
    checkSession();

    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam === "UserNotRegistered") {
      setError("User not registered. Please register first.");
      setTimeout(() => navigate("/register"), 2000);
    } else if (errorParam === "UserDeactivated") {
      setError("Your account has been deactivated. Please contact support.");
    }
    const verified = params.get("verified");
    if (verified === "true") {
      setInfo("Your email has been successfully verified. Please log in.");
    }
  }, [location, navigate]);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/login", formData, {
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-10 space-y-8 border border-gray-100">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access exclusive job opportunities
          </p>
        </motion.div>

        {info && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 text-green-700 text-sm text-center p-3 rounded-lg"
          >
            {info}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm text-center p-4 rounded-lg ${
              error.includes("deactivated")
                ? "bg-yellow-100 text-yellow-800 border border-yellow-400"
                : "bg-red-50 text-red-700"
            }`}
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm"
          disabled={loading}
        >
          {loading ? (
            <span className="loader"></span>
          ) : (
            <>
              <FcGoogle className="w-6 h-6" />
              <span className="text-sm font-semibold text-gray-800">
                Sign in with Google
              </span>
            </>
          )}
        </motion.button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              required
              className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
              placeholder="Email Address"
            />
            <label className="absolute left-4 top-0.5 text-sm text-gray-600 transition-all transform -translate-y-4 scale-75 origin-top-left peer-placeholder-shown:top-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-0 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:-translate-y-4">
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              required
              className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-transparent transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={loading}
              placeholder="Password"
            />
            <label className="absolute left-4 top-0.5 text-sm text-gray-600 transition-all transform -translate-y-4 scale-75 origin-top-left peer-placeholder-shown:top-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-0 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:-translate-y-4">
              Password
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : "Sign In"}
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Join Now
          </Link>
        </p>
      </div>

      <style>
        {`
          .loader {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-left-color: #ffffff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </motion.div>
  );
}
