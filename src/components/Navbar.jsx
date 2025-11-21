import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaTrash,
  FaStar,
  FaShoppingCart,
  FaClipboardList,
  FaTimes,
  FaUsers,
  FaUserShield,
  FaBuilding,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import logoDark from "../assets/logo.png";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");

  const authLinks = [
    { path: "/login", label: "Sign In" },
    { path: "/register", label: "Create Account" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    setIsSidebarOpen(false);
    setIsDropdownOpen(false);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete your account? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete("/api/Account/DeleteAccount");

        Swal.fire({
          title: "Deleted!",
          text: "Your account has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#E41E26",
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
      } catch (error) {
        console.error("Failed to delete account", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete account. Please try again.",
          icon: "error",
          confirmButtonColor: "#E41E26",
        });
      }
    }
  };

  const handleAuthClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const handleProfileClick = () => {
    setIsSidebarOpen(false);
    navigate("/profile");
  };

  const handleAddressesClick = () => {
    setIsSidebarOpen(false);
    navigate("/addresses");
  };

  const handleReviewsClick = () => {
    setIsSidebarOpen(false);
    navigate("/reviews");
  };

  const handleOrdersClick = () => {
    setIsSidebarOpen(false);
    navigate("/my-orders");
  };

  const handleCartClick = () => {
    setIsSidebarOpen(false);
    navigate("/cart");
  };

  const handleHomeClick = () => {
    setIsSidebarOpen(false);
    navigate("/");
  };

  const handleAdminUsersClick = () => {
    setIsSidebarOpen(false);
    navigate("/admin/users");
  };

  const handleAdminBranchesClick = () => {
    setIsSidebarOpen(false);
    navigate("/admin/branches");
  };

  // Close sidebar and dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/Account/Profile");
        if (res.status === 200) {
          const fixedImageUrl = res.data.imageUrl
            ? `https://restaurant-template.runasp.net/${res.data.imageUrl}`
            : null;

          const userDataWithAvatar = { ...res.data, avatar: fixedImageUrl };
          setUser(userDataWithAvatar);

          const isAdminUser =
            res.data.roles && res.data.roles.includes("Admin");
          setIsAdmin(isAdminUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...userDataWithAvatar,
              roles: res.data.roles,
            })
          );
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isLoggedIn]);

  const getInitial = (name) => (!name ? "?" : name.charAt(0).toUpperCase());

  // Loading Screen - Same design as Home component
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <>
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg py-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 border-b border-[#E41E26]/20 dark:border-gray-700 transition-colors duration-300">
        {/* Logo Section - Now clickable and responsive */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Logo as Link */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-200"
          >
            <img
              src={darkMode ? logoDark : logo}
              alt="Chicken One Logo"
              className="w-14 h-12 object-contain"
            />
            {/* Restaurant Name - Hidden on small screens, visible on medium and up */}
            <h1 className="hidden md:block text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent dark:from-[#FDB913] dark:to-[#E41E26]">
              Chicken One
            </h1>
          </Link>
        </motion.div>

        {/* Links */}
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          {/* Dark Mode Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode} // ✅ تم ربط الزر بالدالة الممررة كـ prop
            className="p-2.5 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700 rounded-xl border border-[#FDB913]/30 dark:border-gray-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <FaSun className="text-yellow-500 text-lg" />
            ) : (
              <FaMoon className="text-gray-700 text-lg" />
            )}
          </motion.button>

          {/* Auth Section */}
          {isLoggedIn ? (
            <motion.div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsSidebarOpen(true)}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-[#FDB913]/30 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover border border-[#FDB913]/50 dark:border-gray-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E41E26] text-white flex items-center justify-center font-semibold border border-[#FDB913]/50 dark:border-gray-500">
                    {getInitial(userData.firstName)}
                  </div>
                )}
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {userData.firstName || "User"}
                </span>
              </div>
            </motion.div>
          ) : (
            // Not Logged In - Dropdown (with arrow)
            <div className="relative" ref={dropdownRef}>
              <motion.div
                className="flex items-center gap-2 sm:gap-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] px-4 sm:px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300">
                  <span>Get Started</span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaChevronDown className="text-white text-sm" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Dropdown for non-logged in users */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-[#E41E26]/20 dark:border-gray-600 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Join Chicken One
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Start your journey
                        </p>
                      </div>

                      {authLinks.map((link) => (
                        <motion.div
                          key={link.path}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={() => handleAuthClick(link.path)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-lg ${
                              location.pathname === link.path
                                ? "bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 text-[#E41E26] dark:text-[#FDB913]"
                                : ""
                            }`}
                          >
                            <span>{link.label}</span>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Overlay - Only for logged in users */}
      <AnimatePresence>
        {isLoggedIn && isSidebarOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-md z-[60]"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar - Responsive width */}
            <motion.div
              ref={sidebarRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="fixed top-0 right-0 h-full w-72 sm:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-l border-[#E41E26]/20 dark:border-gray-700 z-[70] overflow-y-auto transition-colors duration-300"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 absolute top-3 right-3 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-full transition-colors duration-200"
                >
                  <FaTimes className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                </motion.button>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="User avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#FDB913] dark:border-[#E41E26]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#E41E26] text-white flex items-center justify-center font-semibold text-lg border-2 border-[#FDB913] dark:border-[#E41E26]">
                        {getInitial(userData.firstName)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {userData.email}
                      </p>
                      {isAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                          <FaUserShield className="text-[#E41E26] dark:text-[#FDB913] text-xs" />
                          <span className="text-xs text-[#E41E26] dark:text-[#FDB913] font-semibold">
                            Admin
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <div className="space-y-1">
                  {/* Home Link added to sidebar */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleHomeClick}
                      className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                    >
                      <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                        <FaHome className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                      </div>
                      <span className="text-lg">Home</span>
                    </button>
                  </motion.div>

                  {/* Admin Panel Section - Only show for admin users */}
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                          Admin Panel
                        </p>

                        {/* Admin Users */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={handleAdminUsersClick}
                            className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                          >
                            <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                              <FaUsers className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                            </div>
                            <span className="text-lg">Manage Users</span>
                          </button>
                        </motion.div>

                        {/* Admin Branches */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={handleAdminBranchesClick}
                            className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                          >
                            <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                              <FaBuilding className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                            </div>
                            <span className="text-lg">Manage Branches</span>
                          </button>
                        </motion.div>
                      </div>
                    </>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                    >
                      <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                        <FaUser className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                      </div>
                      <span className="text-lg">My Profile</span>
                    </button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleOrdersClick}
                      className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                    >
                      <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                        <FaClipboardList className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                      </div>
                      <span className="text-lg">My Orders</span>
                    </button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleCartClick}
                      className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                    >
                      <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                        <FaShoppingCart className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                      </div>
                      <span className="text-lg">My Cart</span>
                    </button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleAddressesClick}
                      className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                    >
                      <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                        <FaMapMarkerAlt className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                      </div>
                      <span className="text-lg">My Addresses</span>
                    </button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={handleReviewsClick}
                      className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#FDB913]/30 dark:hover:border-gray-500"
                    >
                      <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                        <FaStar className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                      </div>
                      <span className="text-lg">My Reviews</span>
                    </button>
                  </motion.div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-red-200 dark:hover:border-red-800"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <FaTrash className="text-red-500 dark:text-red-400 text-lg" />
                        </div>
                        <span className="text-lg">Delete Account</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-4 px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[#E41E26] dark:hover:text-[#FDB913] transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-[#E41E26]/30 dark:hover:border-[#FDB913]/30"
                      >
                        <div className="p-2 bg-[#E41E26]/10 dark:bg-[#FDB913]/20 rounded-lg">
                          <FaSignOutAlt className="text-[#E41E26] dark:text-[#FDB913] text-lg" />
                        </div>
                        <span className="text-lg">Sign Out</span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
