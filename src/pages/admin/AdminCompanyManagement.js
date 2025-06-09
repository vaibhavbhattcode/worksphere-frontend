import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "../../api/api";
import CompanyAnalyticsCharts from "../../components/admin/CompanyAnalyticsCharts";
import toast, { Toaster } from "react-hot-toast";

const AdminCompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [togglingCompanyId, setTogglingCompanyId] = useState(null);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  // const limit = 10;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/admin/companies", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("adminToken"),
        },
        params: {
          // page,
          // limit,
        },
      });
      setCompanies(response.data.companies || []);
      setTotalCompanies(response.data.total || 0);
      // setTotalPages(Math.ceil((response.data.total || 0) / limit));
    } catch (error) {
      setError("Error fetching companies");
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/admin/companies/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("adminToken"),
        },
      });
      toast.success("Company deleted successfully.");
      fetchCompanies();
    } catch (error) {
      setError("Error deleting company");
      toast.error("Failed to delete company.");
      console.error("Error deleting company:", error);
    }
  };

  const handleToggleStatus = async (company) => {
    const confirmToggle = window.confirm(
      `Are you sure you want to ${
        company.isActive ? "deactivate" : "activate"
      } this company?`
    );
    if (!confirmToggle) return;

    setTogglingCompanyId(company._id);
    try {
      const response = await axios.patch(
        `/admin/companies/${company._id}/toggle-active`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("adminToken"),
          },
        }
      );
      const { isActive } = response.data;
      toast.success(
        `Company ${isActive ? "activated" : "deactivated"} successfully.`
      );
      setCompanies(
        companies.map((c) =>
          c._id === company._id ? { ...c, isActive: isActive } : c
        )
      );
    } catch (error) {
      setError("Error updating company status");
      toast.error("Failed to update company status.");
      console.error("Error updating company status:", error);
    } finally {
      setTogglingCompanyId(null);
    }
  };

  const fetchCompanyAnalytics = async (companyId) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await axios.get(
        `/admin/companies/${companyId}/details`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("adminToken"),
          },
        }
      );
      setSelectedCompany(response.data);
      setShowAnalyticsModal(true);
    } catch (error) {
      setAnalyticsError("Error fetching company analytics");
      console.error("Error fetching company analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      (company.companyName &&
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.email &&
        company.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const closeModal = () => {
    setShowAnalyticsModal(false);
    setSelectedCompany(null);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-6">Company Management</h1>

      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-full md:w-1/3"
      />

      {loading && <p>Loading companies...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {selectedCompanyIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-300 mb-4 flex flex-col md:flex-row items-center justify-between rounded gap-2">
          <span className="font-semibold text-gray-700">
            {selectedCompanyIds.length} selected
          </span>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={async () => {
                if (
                  !window.confirm(
                    `Are you sure you want to activate ${selectedCompanyIds.length} selected companies?`
                  )
                )
                  return;
                try {
                  const adminToken = localStorage.getItem("adminToken");
                  await axios.patch(
                    "/admin/companies/bulk-toggle-active",
                    { ids: selectedCompanyIds, isActive: true },
                    {
                      headers: { Authorization: "Bearer " + adminToken },
                      withCredentials: true,
                    }
                  );
                  toast.success("Selected companies activated successfully.");
                  setSelectedCompanyIds([]);
                  fetchCompanies();
                } catch (error) {
                  toast.error("Failed to activate selected companies.");
                  console.error("Error activating companies:", error);
                }
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              Activate Selected
            </button>
            <button
              onClick={async () => {
                if (
                  !window.confirm(
                    `Are you sure you want to deactivate ${selectedCompanyIds.length} selected companies?`
                  )
                )
                  return;
                try {
                  const adminToken = localStorage.getItem("adminToken");
                  await axios.patch(
                    "/admin/companies/bulk-toggle-active",
                    { ids: selectedCompanyIds, isActive: false },
                    {
                      headers: { Authorization: "Bearer " + adminToken },
                      withCredentials: true,
                    }
                  );
                  toast.success("Selected companies deactivated successfully.");
                  setSelectedCompanyIds([]);
                  fetchCompanies();
                } catch (error) {
                  toast.error("Failed to deactivate selected companies.");
                  console.error("Error deactivating companies:", error);
                }
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-center"
            >
              Deactivate Selected
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">
              <input
                type="checkbox"
                checked={
                  selectedCompanyIds.length > 0 &&
                  selectedCompanyIds.length === companies.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCompanyIds(companies.map((c) => c._id));
                  } else {
                    setSelectedCompanyIds([]);
                  }
                }}
              />
            </th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
            <th className="py-2 px-4 border-b">Analytics</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company._id}>
              <td className="py-2 px-4 border-b">
                <input
                  type="checkbox"
                  checked={selectedCompanyIds.includes(company._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCompanyIds((prev) => [...prev, company._id]);
                    } else {
                      setSelectedCompanyIds((prev) =>
                        prev.filter((id) => id !== company._id)
                      );
                    }
                  }}
                />
              </td>
              <td className="py-2 px-4 border-b">
                {company.companyName || company.email}
              </td>
              <td className="py-2 px-4 border-b">{company.email}</td>
              <td className="py-2 px-4 border-b">
                <span
                  className={`inline-block px-3 py-1 rounded text-white ${
                    company.isActive ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  {company.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-2 px-4 border-b flex gap-2">
                {!selectedCompanyIds.length && (
                  <>
                    <button
                      onClick={() => handleToggleStatus(company)}
                      disabled={togglingCompanyId === company._id}
                      className={`px-3 py-1 rounded text-white ${
                        company.isActive
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      } transition-colors duration-200`}
                    >
                      {togglingCompanyId === company._id
                        ? "Processing..."
                        : company.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(company._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
              <td className="py-2 px-4 border-b whitespace-nowrap">
                <button
                  onClick={() => fetchCompanyAnalytics(company._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Analytics
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAnalyticsModal && selectedCompany && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                {selectedCompany.companyProfile?.logo ? (
                  <img
                    src={selectedCompany.companyProfile.logo}
                    alt={`${selectedCompany.companyProfile.companyName} Logo`}
                    className="w-16 h-16 object-contain rounded"
                  />
                ) : null}
                <h2 className="text-2xl font-bold">
                  {selectedCompany.companyProfile?.companyName ||
                    "Company Analytics"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Company Profile Summary</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded text-sm text-gray-700">
                <div>
                  <strong>Company Name:</strong>{" "}
                  {selectedCompany.companyProfile?.companyName || "N/A"}
                </div>
                <div>
                  <strong>Tagline:</strong>{" "}
                  {selectedCompany.companyProfile?.tagline || "N/A"}
                </div>
                <div>
                  <strong>Phone:</strong>{" "}
                  {selectedCompany.companyProfile?.phone || "N/A"}
                </div>
                <div>
                  <strong>Address:</strong>{" "}
                  {selectedCompany.companyProfile?.companyAddress || "N/A"}
                </div>
                <div>
                  <strong>Website:</strong>{" "}
                  {selectedCompany.companyProfile?.website ? (
                    <a
                      href={selectedCompany.companyProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedCompany.companyProfile.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div>
                  <strong>Industry:</strong>{" "}
                  {selectedCompany.companyProfile?.industry || "N/A"}
                </div>
                <div>
                  <strong>Company Type:</strong>{" "}
                  {selectedCompany.companyProfile?.companyType || "N/A"}
                </div>
                <div>
                  <strong>Company Size:</strong>{" "}
                  {selectedCompany.companyProfile?.companySize || "N/A"}
                </div>
                <div>
                  <strong>Founded:</strong>{" "}
                  {selectedCompany.companyProfile?.founded || "N/A"}
                </div>
                <div>
                  <strong>Specialties:</strong>{" "}
                  {selectedCompany.companyProfile?.specialties?.join(", ") ||
                    "N/A"}
                </div>
                <div className="col-span-2">
                  <strong>Description:</strong>{" "}
                  {selectedCompany.companyProfile?.description || "N/A"}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Hiring Summary</h3>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Total Posted Jobs:</strong>{" "}
                  {selectedCompany.jobs.length}
                </p>
                <p>
                  <strong>Active Jobs:</strong>{" "}
                  {selectedCompany.hiringData?.activeJobsCount || 0}
                </p>
                <p>
                  <strong>Total Interviews:</strong>{" "}
                  {selectedCompany.hiringData?.totalInterviews || 0}
                </p>
              </div>
            </div>
            <CompanyAnalyticsCharts
              jobs={selectedCompany.jobs}
              interviews={selectedCompany.interviews}
              hiringData={selectedCompany.hiringData}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCompanyManagement;
