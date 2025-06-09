import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBriefcase,
  FaRegUser,
  FaMoon,
  FaSun,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import axios from "axios";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // User data
  const [userType, setUserType] = useState(null); // "user" or null
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userDropdownTimeout, setUserDropdownTimeout] = useState(null);
  const [notificationsTimeout, setNotificationsTimeout] = useState(null);

  const displayName = user?.name || "";

  // Check and set dark mode from localStorage
  useEffect(() => {
    const dark = localStorage.getItem("darkMode") === "true";
    setDarkMode(dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  // Fetch user session info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const userRes = await axios.get(
          "http://localhost:5000/api/auth/status",
          { withCredentials: true }
        );
        if (userRes.data.loggedIn) {
          setUserType("user");
          setUser(userRes.data.user);
        } else {
          setUser(null);
          setUserType(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setUserType(null);
      }
    };
    fetchSession();
  }, []);

  // Fetch full user profile if needed
  useEffect(() => {
    if (userType === "user" && user && !user.name) {
      axios
        .get("http://localhost:5000/api/user/profile", {
          withCredentials: true,
        })
        .then((res) => {
          setUser((prevUser) => ({ ...prevUser, ...res.data }));
        })
        .catch((error) => console.error("Error fetching user profile:", error));
    }
  }, [userType, user]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          withCredentials: true,
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (userType === "user") {
      fetchNotifications();
    }
  }, [userType, user]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      if (newMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return newMode;
    });
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setUserType(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Job seeker navigation links
  const navLinks = [
    { name: "Home", path: "/", aria: "Navigate to home page" },
    { name: "Find Jobs", path: "/jobs", aria: "Browse job listings" },
    { name: "Companies", path: "/companies", aria: "View companies" },
    { name: "Career Tips", path: "/blog", aria: "Career resources" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <nav className="container mx-auto px-4 py-3" aria-label="Main navigation">
        <div className="flex flex-wrap justify-between items-center">
          {/* Brand / Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 group"
            aria-label="WorkSphere Home"
          >
            <FaBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 transition-transform group-hover:scale-110" />
            <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              Work<span className="text-blue-600">Sphere</span>
            </span>
          </Link>

          {/* Large-screen navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <ul className="flex space-x-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md transition-colors font-medium text-sm"
                    aria-label={link.aria}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-4 ml-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="w-5 h-5" />
                ) : (
                  <FaMoon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (notificationsTimeout) clearTimeout(notificationsTimeout);
                  setShowNotifications(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(
                    () => setShowNotifications(false),
                    200
                  );
                  setNotificationsTimeout(timeout);
                }}
              >
                <button
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="View notifications"
                >
                  <FaBell className="w-5 h-5" />
                </button>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 transition-all duration-200 ease-in-out">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div
                          key={notification.id || index}
                          className="px-4 py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                        >
                          <Link
                            key={notification._id || index}
                            to={`/job/${
                              notification.job?._id || notification.job
                            }`}
                            className={`block px-4 py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                              notification.isRead
                                ? ""
                                : "bg-blue-50 dark:bg-gray-700"
                            }`}
                            onClick={async () => {
                              try {
                                if (!notification.isRead) {
                                  await axios.patch(
                                    `http://localhost:5000/api/notifications/${notification._id}/read`,
                                    {},
                                    { withCredentials: true }
                                  );
                                  setNotifications((prev) =>
                                    prev.map((n) =>
                                      n._id === notification._id
                                        ? { ...n, isRead: true }
                                        : n
                                    )
                                  );
                                }
                              } catch (err) {
                                console.error(
                                  "❌ Failed to mark notification as read:",
                                  err
                                );
                              }
                            }}
                          >
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No notifications
                        </p>
                      </div>
                    )}
                    <div className="px-4 py-2">
                      <Link
                        to="/notifications"
                        className="block text-blue-600 dark:text-blue-400 text-center text-sm hover:underline"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (userDropdownTimeout) clearTimeout(userDropdownTimeout);
                  setIsUserDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(
                    () => setIsUserDropdownOpen(false),
                    200
                  );
                  setUserDropdownTimeout(timeout);
                }}
              >
                {user ? (
                  <>
                    <div
                      className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md transition-colors cursor-pointer"
                      aria-label="User menu"
                    >
                      <FaRegUser className="w-5 h-5" />
                      <span className="text-sm font-medium">{displayName}</span>
                    </div>
                    <div
                      className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 transform transition-all duration-200 ease-in-out ${
                        isUserDropdownOpen
                          ? "opacity-100 scale-100 visible"
                          : "opacity-0 scale-95 invisible pointer-events-none"
                      }`}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/my-jobs"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                      >
                        My Jobs
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Login or register account"
                  >
                    <FaRegUser className="w-4 h-4" />
                    <span className="text-sm font-medium">Login/Register</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="flex items-center space-x-2 lg:hidden mt-2 sm:mt-0">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="w-5 h-5" />
              ) : (
                <FaMoon className="w-5 h-5" />
              )}
            </button>
            <div className="relative">
              <button
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="View notifications"
              >
                <FaBell className="w-5 h-5" />
              </button>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div
          id="mobile-menu"
          className={`lg:hidden ${
            isMenuOpen ? "block" : "hidden"
          } transition-all duration-300`}
        >
          <ul className="pt-4 pb-2 space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={link.aria}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {user && (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Your Profile"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-jobs"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="My Jobs"
                  >
                    My Jobs
                  </Link>
                </li>
              </>
            )}
            <li>
              {user ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 mt-2"
                  aria-label="Mobile logout button"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Mobile login button"
                >
                  Login/Register
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
