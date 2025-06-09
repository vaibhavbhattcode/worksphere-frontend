import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  console.log("AdminProtectedRoute: Validating admin token and user");
  const adminToken = localStorage.getItem("adminToken");
  console.log("AdminProtectedRoute: Token:", adminToken);
  const admin = JSON.parse(localStorage.getItem("admin"));
  console.log("AdminProtectedRoute: Admin:", admin);

  if (!adminToken) {
    console.log("AdminProtectedRoute: No token found, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  if (!admin || admin.isAdmin !== true) {
    console.log(
      "AdminProtectedRoute: Invalid or missing isAdmin field, redirecting to login"
    );
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
