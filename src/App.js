import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import ResumeBuilderAdvanced from "./pages/ResumeBuilderAdvanced";
import CompanyRegister from "./components/Company/CompanyRegister";
import CompanyLogin from "./components/Company/CompanyLogin";
import CompanyDashboard from "./pages/Company/CompanyDashboard";
import CompanyProfile from "./pages/Company/CompanyProfile";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import JobPostingPage from "./pages/Company/JobPostingPage";
import PostedJobsPage from "./pages/Company/PostedJobsPage";
import JobDetailsPage from "./pages/Company/JobDetailsPage";
import EditJobPage from "./pages/Company/EditJobPage";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import MyJobsPage from "./components/MyJobsPage";
import CompanyApplicationsDashboard from "./pages/Company/CompanyApplicationsDashboard";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyJobsPage from "./pages/CompanyJobsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminCompanyManagement from "./pages/admin/AdminCompanyManagement";
import AdminJobManagement from "./pages/admin/AdminJobManagement";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import CompanyVerifyEmail from "./pages/CompanyVerifyEmail";
import CompanyForgotPassword from "./pages/CompanyForgotPassword";
import CompanyResetPassword from "./pages/CompanyResetPassword";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        {/* User Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute type="user">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute type="user">
              <ResumeBuilderAdvanced />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute type="user">
              <JobList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/:id"
          element={
            <ProtectedRoute type="user">
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute type="user">
              <MyJobsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute type="user">
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute type="user">
              <CompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:companyId"
          element={
            <ProtectedRoute type="user">
              <CompanyJobsPage />
            </ProtectedRoute>
          }
        />
        {/* New route for user viewing full company profile */}
        <Route
          path="/company/profile/:id"
          element={
            <ProtectedRoute type="user">
              <CompanyProfilePage />
            </ProtectedRoute>
          }
        />
        {/* Company Routes */}
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/verify-email" element={<CompanyVerifyEmail />} />
        <Route
          path="/company/forgot-password"
          element={<CompanyForgotPassword />}
        />
        <Route
          path="/company/reset-password"
          element={<CompanyResetPassword />}
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute type="company">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute type="company">
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs"
          element={
            <ProtectedRoute type="company">
              <JobPostingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/posted-jobs"
          element={
            <ProtectedRoute type="company">
              <PostedJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-jobs/:jobId"
          element={
            <ProtectedRoute type="company">
              <JobDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:jobId/edit"
          element={
            <ProtectedRoute type="company">
              <EditJobPage />
            </ProtectedRoute>
          }
        />
        {/* New Company Applications Dashboard */}
        <Route
          path="/company/applications"
          element={
            <ProtectedRoute type="company">
              <CompanyApplicationsDashboard />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUserManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <AdminProtectedRoute>
              <AdminCompanyManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <AdminProtectedRoute>
              <AdminJobManagement />
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminProtectedRoute>
              <AdminAuditLogs />
            </AdminProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
