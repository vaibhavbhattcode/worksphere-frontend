import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/api";

const RESEND_TIMEOUT = 30; // seconds

const CompanyVerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    location.state?.email ||
    new URLSearchParams(window.location.search).get("email");
  const verified = new URLSearchParams(window.location.search).get("verified");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verified) {
      setMessage("Your email has been verified! Redirecting to login...");
      setTimeout(() => navigate("/company/login"), 3000);
    } else {
      setMessage(
        `A verification email has been sent to ${email}. Please check your inbox.`
      );
      setTimer(RESEND_TIMEOUT);
    }
  }, [verified, email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post("/api/company/auth/resend-verification", { email });
      setMessage("Verification email resent. Please check your inbox.");
      setTimer(RESEND_TIMEOUT);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend email.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Verify Your Email
        </h2>
        <p className="mb-4 text-center">{message}</p>
        {!verified && (
          <>
            <button
              onClick={handleResend}
              disabled={loading || timer > 0}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {loading
                ? "Sending..."
                : timer > 0
                ? `Resend Email (${timer}s)`
                : "Resend Verification Email"}
            </button>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Didn’t get the email? Check your spam folder or resend after the
              timer.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyVerifyEmail;
