import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "../../api/api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed roleFilter state as role filter dropdown is removed
  // const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortBy, setSortBy] = useState(["createdAt"]);
  const [sortOrder, setSortOrder] = useState(["desc"]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  // const limit = 10;

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      toast.error("Please log in as an admin.");
      navigate("/admin/login");
      return;
    }

    try {
      const params = {
        search: searchTerm,
        // role filter removed, always fetch job seekers only
        // role: roleFilter ? roleFilter.value : undefined,
        status: statusFilter ? statusFilter.value : undefined,
        sortBy: sortBy.join(","),
        sortOrder: sortOrder.join(","),
        // page,
        // limit,
      };

      const response = await axios.get("/admin/users", {
        headers: { Authorization: "Bearer " + adminToken },
        withCredentials: true,
        params,
      });

      setUsers(Array.isArray(response.data.users) ? response.data.users : []);
      setTotalUsers(response.data.total || 0);
      // setTotalPages(Math.ceil((response.data.total || 0) / limit));
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again as an admin.");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        toast.error("Failed to fetch users.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkToggleActive = async (isActive) => {
    if (
      !window.confirm(
        `Are you sure you want to ${isActive ? "activate" : "deactivate"} ${
          selectedUserIds.length
        } selected users?`
      )
    )
      return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.patch(
        "/admin/users/bulk-toggle-active",
        { ids: selectedUserIds, isActive },
        {
          headers: { Authorization: "Bearer " + adminToken },
          withCredentials: true,
        }
      );
      toast.success(
        `Selected users ${isActive ? "activated" : "deactivated"} successfully.`
      );
      setSelectedUserIds([]);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update selected users.");
      console.error("Error updating users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    closeConfirmModal();
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axios.delete("/admin/users/" + id, {
        headers: { Authorization: "Bearer " + adminToken },
        withCredentials: true,
      });
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again as an admin.");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        toast.error("Failed to delete user.");
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    closeConfirmModal();
    setTogglingUserId(id);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.patch(
        "/admin/users/" + id + "/toggle-active",
        {},
        {
          headers: { Authorization: "Bearer " + adminToken },
          withCredentials: true,
        }
      );
      const { isActive } = response.data;
      toast.success(
        `User ${isActive ? "activated" : "deactivated"} successfully.`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      if (error.response?.status === 404) {
        toast.error("User not found. It may have been deleted.");
        fetchUsers();
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again as an admin.");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else {
        toast.error("Failed to toggle user status.");
      }
    } finally {
      setTogglingUserId(null);
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
    setIsModalOpen(false);
  };

  const renderProfileField = (label, value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    if (Array.isArray(value)) {
      if (
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0] !== null
      ) {
        if (label === "Education") {
          return (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
              <ul className="list-disc list-inside ml-4 text-gray-600">
                {value.map((item, index) => (
                  <li key={item._id || index}>
                    <div>
                      <strong>{item.degree}</strong> from{" "}
                      <em>{item.institution}</em> ({item.year})
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        } else if (label === "Experience") {
          return (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
              <ul className="list-disc list-inside ml-4 text-gray-600">
                {value.map((item, index) => (
                  <li key={item._id || index}>
                    <div>
                      <strong>{item.position}</strong> at{" "}
                      <em>{item.company}</em> ({item.start} -{" "}
                      {item.end || "Present"})
                    </div>
                    {item.description && <div>{item.description}</div>}
                  </li>
                ))}
              </ul>
            </div>
          );
        } else if (label === "Skills") {
          return (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {value.map((item, index) => (
                  <span
                    key={item._id || index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          );
        }
      }
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <ul className="list-disc list-inside ml-4 text-gray-600">
            {value.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <ul className="list-disc list-inside ml-4 text-gray-600">
            {Object.entries(value).map(([key, val]) => {
              if (!val) return null;
              return (
                <li key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <p className="text-gray-600">{value}</p>
      </div>
    );
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          User Management
        </h1>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or role"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4 items-center">
            {/* Removed role filter dropdown as only job seekers are displayed */}
            {/* <Select
              options={[
                { value: null, label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "jobSeeker", label: "Job Seeker" },
              ]}
              value={roleFilter}
              onChange={(selected) => {
                setRoleFilter(selected);
              }}
              className="w-40"
              placeholder="Filter by Role"
              isClearable
            /> */}
            <Select
              options={[
                { value: null, label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "deactivated", label: "Deactivated" },
              ]}
              value={statusFilter}
              onChange={(selected) => {
                setStatusFilter(selected);
              }}
              className="w-40"
              placeholder="Filter by Status"
              isClearable
            />
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
              title="Clear Filters"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {selectedUserIds.length > 0 && (
          <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-300 mb-4 flex flex-col md:flex-row items-center justify-between rounded gap-2">
            <span className="font-semibold text-gray-700">
              {selectedUserIds.length} selected
            </span>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Are you sure you want to activate ${selectedUserIds.length} selected users?`
                    )
                  )
                    return;
                  try {
                    const adminToken = localStorage.getItem("adminToken");
                    await axios.patch(
                      "/admin/users/bulk-toggle-active",
                      { ids: selectedUserIds, isActive: true },
                      {
                        headers: { Authorization: "Bearer " + adminToken },
                        withCredentials: true,
                      }
                    );
                    toast.success("Selected users activated successfully.");
                    setSelectedUserIds([]);
                    fetchUsers();
                  } catch (error) {
                    toast.error("Failed to activate selected users.");
                    console.error("Error activating users:", error);
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
                      `Are you sure you want to deactivate ${selectedUserIds.length} selected users?`
                    )
                  )
                    return;
                  try {
                    const adminToken = localStorage.getItem("adminToken");
                    await axios.patch(
                      "/admin/users/bulk-toggle-active",
                      { ids: selectedUserIds, isActive: false },
                      {
                        headers: { Authorization: "Bearer " + adminToken },
                        withCredentials: true,
                      }
                    );
                    toast.success("Selected users deactivated successfully.");
                    setSelectedUserIds([]);
                    fetchUsers();
                  } catch (error) {
                    toast.error("Failed to deactivate selected users.");
                    console.error("Error deactivating users:", error);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-center"
              >
                Deactivate Selected
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-600 py-10">No users found.</div>
        ) : (
          <>
          <div className="bg-white rounded-lg shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                  <th className="py-2 px-4 border-b">
                      <input
                        type="checkbox"
                        checked={
                          users.length > 0 &&
                          selectedUserIds.length === users.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds(users.map((user) => user._id));
                          } else {
                            setSelectedUserIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                      Email
                    </th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                      Role
                    </th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                      Registered
                    </th>
                    <th className="py-2 px-4 border-b text-left font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                      Status
                    </th>
                    <th className="py-2 px-4 border-b whitespace-nowrap text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="py-2 px-4 border-b whitespace-nowrap text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Profile
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-xs">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        user.isActive ? "" : "bg-red-50"
                      }`}
                    >
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds((prev) => [...prev, user._id]);
                            } else {
                              setSelectedUserIds((prev) =>
                                prev.filter((id) => id !== user._id)
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="py-2 px-4 border-b text-gray-800 whitespace-nowrap">
                        {user.profile?.name || user.email.split("@")[0]}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600 whitespace-nowrap">
                        {user.isAdmin ? "Admin" : user.role || "User"}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b font-semibold whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-block px-2 py-0.5 rounded text-white bg-green-600 text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-white bg-gray-600 text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b flex gap-2 whitespace-nowrap">
                      {!selectedUserIds.length && (
                        <>
                          <button
                            onClick={() =>
                              handleToggleActive(user._id, user.isActive)
                            }
                            className={`px-2 py-1 rounded text-white text-xs transition-colors duration-200 ${
                              user.isActive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                            disabled={togglingUserId === user._id}
                          >
                            {togglingUserId === user._id
                              ? "Processing..."
                              : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                      <button
                        onClick={() =>
                          openConfirmModal(
                            "Are you sure you want to delete this user? This action cannot be undone.",
                            handleDelete,
                            user._id
                          )
                        }
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs transition-colors duration-200"
                      >
                        Delete
                      </button>
                        </>
                      )}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        <button
                          onClick={() => openProfileModal(user.profile)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs transition-colors duration-200"
                          disabled={!user.profile}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          {/* Pagination */}
          <></>
        </>
      )}
      {isModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
                {selectedProfile.profileImage && (
                  <img
                    src={selectedProfile.profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                )}
                <span>{selectedProfile.name || "User Profile"}</span>
              </h2>
              <button
                onClick={closeProfileModal}
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
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {renderProfileField("Title", selectedProfile.title)}
                {renderProfileField("Location", selectedProfile.location)}
                {renderProfileField("Phone", selectedProfile.phone)}
                {renderProfileField("About", selectedProfile.about)}
                {renderProfileField("Skills", selectedProfile.skills)}
                {renderProfileField(
                  "LinkedIn",
                  selectedProfile.socialLinks?.linkedin
                )}
                {renderProfileField(
                  "GitHub",
                  selectedProfile.socialLinks?.github
                )}
                {renderProfileField(
                  "Twitter",
                  selectedProfile.socialLinks?.twitter
                )}
                {renderProfileField(
                  "Portfolio",
                  selectedProfile.socialLinks?.portfolio
                )}
              </div>
              <div className="space-y-6">
                {selectedProfile.videoIntroduction && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Introduction Video
                    </h3>
                    <video
                      controls
                      src={selectedProfile.videoIntroduction}
                      className="w-full rounded-lg mt-2 shadow-md"
                    />
                  </div>
                )}
                {renderProfileField("Experience", selectedProfile.experience)}
                {renderProfileField("Education", selectedProfile.education)}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={closeProfileModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagement;
