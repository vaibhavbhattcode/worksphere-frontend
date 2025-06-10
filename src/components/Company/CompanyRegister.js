// CompanyRegister.js
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBuilding, FaEnvelope, FaPhone } from "react-icons/fa";

const CompanyRegister = () => {
  const navigate = useNavigate();

  const initialValues = {
    companyName: "",
    email: "",
    phone: "",
    companyAddress: "",
    website: "",
    password: "",
    confirmPassword: "",
  };

  // Validation schema with enhanced phone number restriction
  const validationSchema = Yup.object({
    companyName: Yup.string()
      .min(2, "Company name must be at least 2 characters long")
      .max(100, "Company name cannot exceed 100 characters")
      .matches(
        /^[a-zA-Z0-9\s&.,'-]+$/,
        "Company name can only contain letters, numbers, spaces, and &.,'-"
      )
      .required("Company name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email must be a valid format (e.g., company@domain.com)"
      )
      .max(255, "Email cannot exceed 255 characters")
      .required("Email is required"),
    phone: Yup.string()
      .matches(
        /^\+?[0-9]+$/,
        "Phone number must contain only numbers, with an optional leading +"
      )
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number cannot exceed 15 digits")
      .required("Phone number is required"),
    companyAddress: Yup.string()
      .min(5, "Address must be at least 5 characters long")
      .max(500, "Address cannot exceed 500 characters")
      .required("Company address is required"),
    website: Yup.string()
      .url("Please enter a valid URL (e.g., https://www.example.com)")
      .matches(
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
        "Website must be a valid URL starting with http:// or https://"
      )
      .nullable(),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setErrors }
  ) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/company/auth/register`,
        values,
        {
          withCredentials: true,
        }
      );
      // Redirect to verify email page with email in state
      resetForm();
      navigate("/company/verify-email", { state: { email: values.email } });
    } catch (error) {
      setErrors({
        apiError:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
    setSubmitting(false);
  };

  // Handler to allow only numbers and an optional leading +
  const handlePhoneKeyPress = (event) => {
    const charCode = event.charCode;
    // Allow numbers (48-57), and "+" (43) only as the first character
    if (
      (charCode < 48 || charCode > 57) && // Not a number
      !(charCode === 43 && event.target.value === "") // Not a "+" at the start
    ) {
      event.preventDefault();
    }
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

      <div className="relative z-10 max-w-lg w-full bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 md:p-10">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">WorkSphere</h2>
          <p className="text-sm text-gray-600">
            Connecting talent with opportunity
          </p>
        </div>
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Company Registration
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-5">
              {errors.apiError && (
                <div className="bg-red-100 text-red-600 p-3 rounded">
                  {errors.apiError}
                </div>
              )}
              <div className="relative">
                <Field
                  name="companyName"
                  type="text"
                  placeholder="Company Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ErrorMessage
                  name="companyName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="phone"
                    type="text"
                    placeholder="Phone Number (e.g., +12025550123)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={handlePhoneKeyPress} // Restrict input at UI level
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="relative">
                <Field
                  name="companyAddress"
                  type="text"
                  placeholder="Company Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ErrorMessage
                  name="companyAddress"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="relative">
                <Field
                  name="website"
                  type="url"
                  placeholder="Website (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <ErrorMessage
                  name="website"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="relative">
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors"
              >
                Register
              </motion.button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/company/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default CompanyRegister;
