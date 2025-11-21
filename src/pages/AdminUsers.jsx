import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaBuilding,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaSearch,
  FaLock,
  FaLockOpen,
  FaUserSlash,
  FaUserCheck,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roles: ["Restaurant"],
  });

  const [showPassword, setShowPassword] = useState(false);

  const availableRoles = ["Admin", "Restaurant", "User"];

  // Check form validity
  const isFormValid = () => {
    const basicFieldsValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.roles.length > 0;

    // For new user, password is required
    if (!editingId) {
      return basicFieldsValid && formData.password.trim() !== "";
    }

    // For editing, password is optional
    return basicFieldsValid;
  };

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      try {
        // Check if user is admin
        const profileRes = await axiosInstance.get("/api/Account/Profile");
        const userRoles = profileRes.data.roles;

        if (!userRoles || !userRoles.includes("Admin")) {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You don't have permission to access this page.",
            confirmButtonColor: "#E41E26",
          }).then(() => {
            navigate("/");
          });
          return;
        }

        setIsAdmin(true);
        setCurrentUser(profileRes.data); // Set current user
        await fetchUsers();
      } catch (err) {
        console.error("Failed to verify admin access", err);
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Failed to verify your permissions.",
          confirmButtonColor: "#E41E26",
        }).then(() => {
          navigate("/");
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/Users/GetAll");
      if (res.status === 200) {
        setUsers(res.data);
        setFilteredUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users data.",
      });
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.includes(searchTerm)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Sort users with current user first
  const getSortedUsers = () => {
    if (!currentUser) return filteredUsers;

    const sortedUsers = [...filteredUsers];
    sortedUsers.sort((a, b) => {
      if (a.email === currentUser.email) return -1;
      if (b.email === currentUser.email) return 1;
      return 0;
    });

    return sortedUsers;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double check form validity before submission
    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill all required fields.",
        confirmButtonColor: "#E41E26",
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing user
        const res = await axiosInstance.put(
          `/api/Users/Update/${editingId}`,
          formData
        );
        if (res.status === 200) {
          await fetchUsers(); // Refresh the list
          Swal.fire({
            icon: "success",
            title: "User Updated",
            text: "User has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          resetForm();
        }
      } else {
        // Add new user
        const res = await axiosInstance.post("/api/Users/Add", formData);
        if (res.status === 200 || res.status === 201) {
          await fetchUsers(); // Refresh the list
          Swal.fire({
            icon: "success",
            title: "User Added",
            text: "New user has been added successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          resetForm();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save user.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  };

  const handleEdit = (user) => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      password: "", // Don't prefill password for security
      roles: user.roles || ["Restaurant"],
    });
    setEditingId(user.id);
    setIsAdding(true);

    // Scroll to form on small screens
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("user-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleDelete = async (userEmail) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete user: ${userEmail}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Users/Delete/${userEmail}`);
          setUsers(users.filter((user) => user.email !== userEmail));
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete user.",
          });
        }
      }
    });
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? "enable" : "disable";

    Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${action} user: ${user.email}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Here you would call your API to toggle user status
          // For now, we'll simulate the update locally
          const updatedUsers = users.map((u) =>
            u.id === user.id ? { ...u, isActive: newStatus } : u
          );
          setUsers(updatedUsers);

          Swal.fire({
            title: `${action === "enable" ? "Enabled" : "Disabled"}!`,
            text: `User has been ${action}d successfully.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to ${action} user.`,
          });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roles: ["Restaurant"],
    });
    setEditingId(null);
    setIsAdding(false);
    setShowPassword(false);
  };

  const handleAddNewUser = () => {
    setIsAdding(true);
    setEditingId(null);

    // Scroll to form on small screens
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("user-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      case "Restaurant":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <FaUserShield className="text-xs sm:text-sm" />;
      case "Restaurant":
        return <FaBuilding className="text-xs sm:text-sm" />;
      default:
        return <FaUser className="text-xs sm:text-sm" />;
    }
  };

  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold border border-red-200 flex items-center gap-1 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
          <FaLock className="text-xs" />
          Disabled
        </span>
      );
    }
    return (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold border border-green-200 flex items-center gap-1 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
        <FaLockOpen className="text-xs" />
        Enabled
      </span>
    );
  };

  const isCurrentUser = (user) => {
    return currentUser && user.email === currentUser.email;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect from useEffect
  }

  const sortedUsers = getSortedUsers();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 bg-white/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] border border-[#E41E26]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-600"
      >
        <FaArrowLeft
          size={14}
          className="sm:size-4 group-hover:scale-110 transition-transform"
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        {/* Header Background - Increased height for better spacing */}
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          {/* Header Content - More padding at the bottom */}
          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaUserShield className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                Admin Panel
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mb-2 sm:mb-3"
            >
              Manage Users and Permissions
            </motion.p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          {/* Add Button - Better positioned between sections with more spacing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center -mt-6 sm:-mt-7 md:-mt-8 mb-6 sm:mb-8 md:mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewUser}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>Add New User</span>
            </motion.button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="max-w-md mx-auto">
              <div className="relative group">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-200 bg-white text-black rounded-xl sm:rounded-2xl pl-10 pr-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search by name, email, or phone number..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#E41E26] transition-colors duration-200 dark:text-gray-400"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Users List */}
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {sortedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 transition-all duration-300 dark:bg-gray-700/80 ${
                    isCurrentUser(user)
                      ? "border-[#E41E26] shadow-lg hover:shadow-xl dark:border-[#E41E26]"
                      : user.isActive === false
                      ? "border-red-200 shadow-md hover:shadow-lg dark:border-red-700"
                      : "border-gray-200/50 hover:shadow-lg dark:border-gray-600/50"
                  } ${
                    user.isActive === false
                      ? "bg-red-50/50 dark:bg-red-900/20"
                      : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* User Avatar */}
                      <div className="flex-shrink-0 relative">
                        {user.imageUrl ? (
                          <img
                            src={`https://restaurant-template.runasp.net/${user.imageUrl}`}
                            alt="User avatar"
                            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 ${
                              user.isActive === false
                                ? "border-red-300 grayscale dark:border-red-600"
                                : "border-[#FDB913] dark:border-[#FDB913]"
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-semibold text-base sm:text-lg md:text-xl border-2 ${
                              user.isActive === false
                                ? "bg-gray-300 text-gray-500 border-red-300 grayscale dark:bg-gray-600 dark:text-gray-400 dark:border-red-600"
                                : "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white border-[#FDB913] dark:border-[#FDB913]"
                            }`}
                          >
                            {user.firstName?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                        {isCurrentUser(user) && (
                          <div className="absolute -top-1 -right-1 bg-[#E41E26] text-white rounded-full p-1 border-2 border-white dark:border-gray-800">
                            <FaUserShield className="text-xs" />
                          </div>
                        )}
                        {user.isActive === false && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-white dark:border-gray-800">
                            <FaUserSlash className="text-xs" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2 sm:mb-3">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-bold text-base sm:text-lg md:text-xl truncate ${
                                user.isActive === false
                                  ? "text-gray-500 dark:text-gray-400"
                                  : "text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {user.firstName} {user.lastName}
                            </h3>
                            {isCurrentUser(user) && (
                              <span className="bg-[#E41E26] text-white px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                Current User
                              </span>
                            )}
                            {getStatusBadge(user)}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                                  role
                                )} ${
                                  user.isActive === false ? "opacity-60" : ""
                                }`}
                              >
                                {getRoleIcon(role)}
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div
                          className={`space-y-1 sm:space-y-2 text-sm sm:text-base ${
                            user.isActive === false
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaEnvelope
                              className={`flex-shrink-0 text-xs sm:text-sm ${
                                user.isActive === false
                                  ? "text-gray-400 dark:text-gray-500"
                                  : "text-[#E41E26] dark:text-[#E41E26]"
                              }`}
                            />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone
                              className={`flex-shrink-0 text-xs sm:text-sm ${
                                user.isActive === false
                                  ? "text-gray-400 dark:text-gray-500"
                                  : "text-[#E41E26] dark:text-[#E41E26]"
                              }`}
                            />
                            <span>{user.phoneNumber || "Not provided"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(user)}
                        disabled={user.isActive === false}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
                          user.isActive === false
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        }`}
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleStatus(user)}
                        disabled={isCurrentUser(user)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
                          isCurrentUser(user)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500"
                            : user.isActive === false
                            ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                            : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50"
                        }`}
                      >
                        {user.isActive === false ? (
                          <>
                            <FaUserCheck className="text-xs sm:text-sm" />
                            <span className="whitespace-nowrap">Enable</span>
                          </>
                        ) : (
                          <>
                            <FaUserSlash className="text-xs sm:text-sm" />
                            <span className="whitespace-nowrap">Disable</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(user.email)}
                        disabled={isCurrentUser(user)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
                          isCurrentUser(user)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-500"
                            : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        }`}
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {sortedUsers.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50"
                >
                  <FaUserShield className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    {searchTerm ? "No users found" : "No users found"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Get started by adding your first user"}
                  </p>
                  {!searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNewUser}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                    >
                      <FaPlus className="text-xs sm:text-sm" />
                      <span>Add Your First User</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Add/Edit User Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="user-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200/50 shadow-lg sticky top-4 sm:top-6 dark:bg-gray-700/80 dark:border-gray-600/50">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                        {editingId ? "Edit User" : "Add New User"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-500 hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2 dark:text-gray-400 dark:hover:text-[#E41E26]"
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            First Name *
                          </label>
                          <div className="relative group">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder="First name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Last Name *
                          </label>
                          <div className="relative group">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder="Last name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Email *
                        </label>
                        <div className="relative group">
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={!!editingId} // Disable email field when editing
                            className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:disabled:bg-gray-700"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Phone Number
                        </label>
                        <div className="relative group">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Password {!editingId && "*"}
                        </label>
                        <div className="relative group">
                          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <div
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#E41E26] cursor-pointer transition-colors duration-200 text-sm dark:text-gray-400"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={!editingId} // Only required for new users
                            className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pl-9 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            placeholder={
                              editingId
                                ? "Leave blank to keep current"
                                : "Password"
                            }
                          />
                        </div>
                        {editingId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave password blank to keep the current password
                          </p>
                        )}
                      </div>

                      {/* Roles */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Roles *
                        </label>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 dark:bg-gray-600 dark:border-gray-500">
                          {availableRoles.map((role) => (
                            <div key={role} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`role-${role}`}
                                checked={formData.roles.includes(role)}
                                onChange={() => handleRoleToggle(role)}
                                className="w-4 h-4 sm:w-5 sm:h-5 text-[#E41E26] bg-white border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2 dark:bg-gray-500 dark:border-gray-400"
                              />
                              <label
                                htmlFor={`role-${role}`}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                              >
                                <span className="text-sm">
                                  {getRoleIcon(role)}
                                </span>
                                <span>{role}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForm}
                          className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base dark:border-[#E41E26] dark:text-[#E41E26] dark:hover:bg-[#E41E26] dark:hover:text-white"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!isFormValid()}
                          className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                            isFormValid()
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <FaCheck className="text-xs sm:text-sm" />
                          {editingId ? "Update User" : "Add User"}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
