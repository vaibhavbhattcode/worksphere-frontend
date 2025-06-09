// CompanyLogin.js
import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const RESEND_TIMEOUT = 30; // seconds

const CompanyLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = new URLSearchParams(location.search).get("verified");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [showResendSection, setShowResendSection] = useState(false);
  const [loginError, setLoginError] = useState("");
  const timerRef = useRef();

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/company/auth/status",
          {
            withCredentials: true,
          }
        );
        if (res.data.loggedIn && res.data.type === "company") {
          navigate("/company");
        }
      } catch (err) {
        // No active session; do nothing.
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleResendVerification = async (email) => {
    setResendLoading(true);
    setResendSuccess("");
    setResendError("");
    try {
      await axios.post("/api/company/auth/resend-verification", { email });
      setResendSuccess("Verification email resent! Please check your inbox.");
      setShowResend(false);
      setResendTimer(RESEND_TIMEOUT);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setShowResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      setResendError(
        e.response?.data?.message || "Failed to resend verification email."
      );
    }
    setResendLoading(false);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setResendSuccess("");
    setResendError("");
    setLoginError("");
    try {
      await axios.post("http://localhost:5000/api/company/auth/login", values, {
        withCredentials: true,
      });
      navigate("/company");
    } catch (error) {
      let errMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      if (errMessage.toLowerCase().includes("verify your email")) {
        setShowResendSection(true);
        setLoginError(errMessage);
      } else {
        setShowResendSection(false);
        setLoginError(errMessage);
      }
    }
    setSubmitting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 overflow-hidden"
      style={{ backgroundImage: "url(/images/register-bg.jpg)" }}
    >
      {/* Decorative Blurry Shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-300 opacity-30 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-300 opacity-30 rounded-full filter blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-md w-full bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 md:p-10">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">WorkSphere</h2>
          <p className="text-sm text-gray-600">
            Connecting talent with opportunity
          </p>
        </div>
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Company Login
        </h3>
        {verified && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center font-semibold">
            Your email has been verified! You can now log in.
          </div>
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {loginError && (
                <div className="bg-red-100 text-red-600 p-3 rounded text-center font-semibold">
                  {loginError}
                </div>
              )}
              <div className="relative">
                <Field
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="relative">
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors"
              >
                Login
              </motion.button>
              {showResendSection && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <button
                    type="button"
                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={resendLoading || resendTimer > 0}
                    onClick={async () =>
                      handleResendVerification(
                        document.querySelector('input[name="email"]').value
                      )
                    }
                  >
                    {resendLoading
                      ? "Sending..."
                      : resendTimer > 0
                      ? `Resend Verification Email (${resendTimer}s)`
                      : "Resend Verification Email"}
                  </button>
                  {resendSuccess && (
                    <div className="w-full bg-green-100 text-green-700 p-2 rounded text-center text-sm font-medium animate-fade-in">
                      {resendSuccess}
                    </div>
                  )}
                  {resendError && (
                    <div className="w-full bg-red-100 text-red-700 p-2 rounded text-center text-sm font-medium animate-fade-in">
                      {resendError}
                    </div>
                  )}
                  {!resendLoading && resendTimer > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Please wait {resendTimer}s before resending.
                    </div>
                  )}
                </div>
              )}
            </Form>
          )}
        </Formik>
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="mt-4 md:mt-0 text-sm text-gray-600">
            <span
              onClick={() => navigate("/company/forgot-password")}
              className="text-blue-600 cursor-pointer hover:underline mr-2"
            >
              Forgot Password?
            </span>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/company/register")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyLogin;
