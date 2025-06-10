// ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, type = "user" }) => {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const url =
          type === "user"
            ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/status`
            : `${process.env.REACT_APP_BACKEND_URL}/api/company/auth/status`;
        const response = await axios.get(url, { withCredentials: true });
        if (response.data.loggedIn && response.data.type === type) {
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("unauthenticated");
        }
      } catch (error) {
        console.error(`Error checking ${type} auth:`, error.message);
        setAuthStatus("unauthenticated");
      }
    };
    checkAuth();
  }, [type]);

  if (authStatus === null) return <div>Loading...</div>;
  if (authStatus === "authenticated") return children;

  const redirectTo = type === "user" ? "/login" : "/company/login";
  return <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
