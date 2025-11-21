import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaBuilding,
  FaGlobe,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function AdminBranches() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    openingHours: "",
    closingHours: "",
    latitude: "",
    longitude: "",
  });

  // Check form validity
  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.openingHours.trim() !== "" &&
      formData.closingHours.trim() !== ""
    );
  };

  useEffect(() => {
    const checkAdminAndFetchBranches = async () => {
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
        await fetchBranches();
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

    checkAdminAndFetchBranches();
  }, [navigate]);

  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get("/api/Branches/GetAll");
      if (res.status === 200) {
        setBranches(res.data);
        setFilteredBranches(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch branches data.",
      });
    }
  };

  // Filter branches based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBranches(branches);
      return;
    }

    const filtered = branches.filter((branch) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        branch.name?.toLowerCase().includes(searchLower) ||
        branch.address?.toLowerCase().includes(searchLower) ||
        branch.phoneNumber?.includes(searchTerm)
      );
    });

    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
        // Update existing branch
        const res = await axiosInstance.put(
          `/api/Branches/Update/${editingId}`,
          formData
        );
        if (res.status === 200) {
          await fetchBranches(); // Refresh the list
          Swal.fire({
            icon: "success",
            title: "Branch Updated",
            text: "Branch has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          resetForm();
        }
      } else {
        // Add new branch
        const res = await axiosInstance.post("/api/Branches/Add", formData);
        if (res.status === 200 || res.status === 201) {
          await fetchBranches(); // Refresh the list
          Swal.fire({
            icon: "success",
            title: "Branch Added",
            text: "New branch has been added successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          resetForm();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save branch.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  };

  const handleEdit = (branch) => {
    setFormData({
      name: branch.name || "",
      address: branch.address || "",
      phoneNumber: branch.phoneNumber || "",
      openingHours: branch.openingHours || "",
      closingHours: branch.closingHours || "",
      latitude: branch.latitude || "",
      longitude: branch.longitude || "",
    });
    setEditingId(branch.id);
    setIsAdding(true);

    // Scroll to form on small screens
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("branch-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleDelete = async (branchId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this branch.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Branches/Delete/${branchId}`);
          setBranches(branches.filter((branch) => branch.id !== branchId));
          Swal.fire({
            title: "Deleted!",
            text: "Branch has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete branch.",
          });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phoneNumber: "",
      openingHours: "",
      closingHours: "",
      latitude: "",
      longitude: "",
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewBranch = () => {
    setIsAdding(true);
    setEditingId(null);

    // Scroll to form on small screens
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("branch-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden">
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
        className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] dark:text-gray-300 border border-[#E41E26]/30 dark:border-gray-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
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
        className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden"
      >
        {/* Header Background */}
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          {/* Header Content */}
          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaBuilding className="text-white text-xl sm:text-2xl md:text-3xl" />
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
              Manage Restaurant Branches
            </motion.p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          {/* Add Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center -mt-6 sm:-mt-7 md:-mt-8 mb-6 sm:mb-8 md:mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewBranch}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>Add New Branch</span>
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
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl sm:rounded-2xl pl-10 pr-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg"
                  placeholder="Search by name, address, or phone..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#E41E26] transition-colors duration-200"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Branches List */}
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {filteredBranches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Branch Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white flex items-center justify-center font-semibold text-base sm:text-lg md:text-xl border-2 border-[#FDB913]">
                          <FaBuilding className="text-sm sm:text-base md:text-lg" />
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2 sm:mb-3">
                          <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg md:text-xl truncate">
                            {branch.name}
                          </h3>
                        </div>

                        <div className="space-y-1 sm:space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                            <span className="truncate">{branch.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                            <span>{branch.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                            <span>
                              {branch.openingHours} - {branch.closingHours}
                            </span>
                          </div>
                          {(branch.latitude || branch.longitude) && (
                            <div className="flex items-center gap-2">
                              <FaGlobe className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                              <span className="text-xs">
                                {branch.latitude && `Lat: ${branch.latitude}`}
                                {branch.longitude &&
                                  `, Lng: ${branch.longitude}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(branch)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(branch.id)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredBranches.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <FaBuilding className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    {searchTerm ? "No branches found" : "No branches found"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Get started by adding your first branch"}
                  </p>
                  {!searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNewBranch}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                    >
                      <FaPlus className="text-xs sm:text-sm" />
                      <span>Add Your First Branch</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Add/Edit Branch Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="branch-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-lg sticky top-4 sm:top-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
                        {editingId ? "Edit Branch" : "Add New Branch"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2"
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Branch Name */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Branch Name *
                        </label>
                        <div className="relative group">
                          <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="Branch name"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Address *
                        </label>
                        <div className="relative group">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="Full address"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Phone Number *
                        </label>
                        <div className="relative group">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>

                      {/* Opening & Closing Hours */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Opening Hours *
                          </label>
                          <div className="relative group">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="openingHours"
                              value={formData.openingHours}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                              placeholder="9:00 AM"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Closing Hours *
                          </label>
                          <div className="relative group">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="closingHours"
                              value={formData.closingHours}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                              placeholder="10:00 PM"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForm}
                          className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] dark:text-[#FDB913] dark:border-[#FDB913] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300 text-sm sm:text-base"
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
                              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FaCheck className="text-xs sm:text-sm" />
                          {editingId ? "Update Branch" : "Add Branch"}
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
