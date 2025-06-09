// client/pages/NotificationsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaTrash,
  FaCheckCircle,
  FaBriefcase,
  FaCheck,
  FaClock,
} from "react-icons/fa";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `/api/notifications/${id}/read`,
        {},
        {
          withCredentials: true,
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications`, {
        data: { id },
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete("/api/notifications", {
        withCredentials: true,
      });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        🔔 All Notifications
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications yet.</p>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={clearAll}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start justify-between p-4 border rounded-md shadow transition ${
                  n.isRead ? "bg-gray-100" : "bg-white"
                }`}
              >
                <div>
                  <p className="text-gray-800 text-sm mb-1 flex items-center gap-2">
                    <FaBriefcase className="text-blue-600" />
                    {n.message}
                  </p>
                  <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                  {n.job && (
                    <Link
                      to={`/job/${n.job._id || n.job}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Job
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-green-600 hover:text-green-700"
                      title="Mark as read"
                    >
                      <FaCheckCircle />
                    </button>
                  )}
                  {n.isRead && (
                    <span
                      className="text-green-500 text-xs font-semibold flex items-center gap-1"
                      title="Read"
                    >
                      <FaCheck className="text-sm" /> Read
                    </span>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
