import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaStar,
  FaHome,
  FaBuilding,
  FaBriefcase,
  FaCheck,
  FaTimes,
  FaUser,
  FaPhone,
  FaCity,
  FaGlobe,
  FaRoad,
  FaBuilding as FaBuildingIcon,
  FaChevronDown,
  FaTag,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function Addresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    country: "Egypt",
    city: "",
    street: "",
    buildingNumber: "",
    floor: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  // Sample data for dropdowns
  const cities = [
    "Cairo",
    "Giza",
    "Alexandria",
    "Luxor",
    "Aswan",
    "Hurghada",
    "Sharm El Sheikh",
    "Port Said",
    "Suez",
    "Mansoura",
    "Tanta",
    "Ismailia",
    "Faiyum",
    "Zagazig",
    "Damietta",
  ];

  const countries = [
    "Egypt",
    "Saudi Arabia",
    "United Arab Emirates",
    "Kuwait",
    "Qatar",
    "Oman",
    "Bahrain",
    "Jordan",
    "Lebanon",
  ];

  // Check dark mode from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Listen for dark mode changes from Navbar
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically (fallback for same-tab changes)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const res = await axiosInstance.get("/api/Account/Addresses");
      if (res.status === 200) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
      // For demo purposes, using mock data with new fields
      setAddresses([
        {
          id: 1,
          title: "Home",
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "+201234567890",
          street: "123 Main Street",
          buildingNumber: "15A",
          floor: "4th Floor",
          city: "Cairo",
          country: "Egypt",
          addressType: "home",
          isDefault: true,
        },
        {
          id: 2,
          title: "Work",
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "+201234567891",
          street: "456 Business District",
          buildingNumber: "Sky Tower",
          floor: "8th Floor",
          city: "Giza",
          country: "Egypt",
          addressType: "work",
          isDefault: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing address
        const res = await axiosInstance.put(
          `/api/Account/Addresses/${editingId}`,
          formData
        );
        if (res.status === 200) {
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingId ? { ...addr, ...formData } : addr
            )
          );
          Swal.fire({
            icon: "success",
            title: "Address Updated",
            text: "Your address has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        // Add new address
        const res = await axiosInstance.post(
          "/api/Account/Addresses",
          formData
        );
        if (res.status === 201) {
          setAddresses([...addresses, { ...formData, id: Date.now() }]);
          Swal.fire({
            icon: "success",
            title: "Address Added",
            text: "Your new address has been added successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save address.",
      });
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setIsAdding(true);

    // Scroll to form in mobile view
    setTimeout(() => {
      const formElement = document.getElementById("address-form");
      if (formElement && window.innerWidth < 1280) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Account/Addresses/${id}`);
          setAddresses(addresses.filter((addr) => addr.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Your address has been deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete address.",
          });
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/api/Account/Addresses/${id}/set-default`);
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      Swal.fire({
        icon: "success",
        title: "Default Address Updated",
        text: "Your default address has been changed.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to set default address.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      country: "Egypt",
      city: "",
      street: "",
      buildingNumber: "",
      floor: "",
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
  };

  const handleAddNewAddress = () => {
    setIsAdding(true);

    // Scroll to form in mobile view
    setTimeout(() => {
      const formElement = document.getElementById("address-form");
      if (formElement && window.innerWidth < 1280) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = [
      "title",
      "firstName",
      "lastName",
      "phoneNumber",
      "country",
      "city",
      "street",
      "buildingNumber",
      "floor",
    ];

    return requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home":
        return <FaHome className="text-[#E41E26]" />;
      case "work":
        return <FaBriefcase className="text-[#E41E26]" />;
      default:
        return <FaBuilding className="text-[#E41E26]" />;
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case "home":
        return "from-blue-500/10 to-blue-600/10 border-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 dark:border-blue-700";
      case "work":
        return "from-purple-500/10 to-purple-600/10 border-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 dark:border-purple-700";
      default:
        return "from-gray-500/10 to-gray-600/10 border-gray-200 dark:from-gray-500/20 dark:to-gray-600/20 dark:border-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "dark bg-gray-900"
            : "bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4]"
        } px-4`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "dark bg-gray-900"
          : "bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4]"
      } px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
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
        className={`fixed top-3 sm:top-4 left-3 sm:left-4 z-50 ${
          darkMode
            ? "bg-gray-800/80 text-white border-gray-600 hover:bg-[#E41E26]"
            : "bg-white/80 text-[#E41E26] border-[#E41E26]/30 hover:bg-[#E41E26] hover:text-white"
        } backdrop-blur-md rounded-full p-2 sm:p-3 border shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group`}
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
        className={`max-w-7xl mx-auto ${
          darkMode
            ? "bg-gray-800/90 border-gray-700"
            : "bg-white/90 border-white/50"
        } backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border relative overflow-hidden transition-colors duration-300`}
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
                <FaMapMarkerAlt className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                My Addresses
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mb-2 sm:mb-3"
            >
              Manage your delivery addresses
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
              onClick={handleAddNewAddress}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>Add New Address</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Address List */}
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              <AnimatePresence>
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${
                      darkMode
                        ? "bg-gray-700/80 border-gray-600"
                        : "bg-white/80 border-gray-200/50"
                    } backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 transition-all duration-300 hover:shadow-lg ${
                      address.isDefault
                        ? `border-[#E41E26] ${
                            darkMode
                              ? "bg-gradient-to-r from-gray-800 to-gray-700"
                              : "bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4]"
                          }`
                        : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div
                            className={`p-1 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${getAddressTypeColor(
                              address.addressType
                            )} border`}
                          >
                            {getAddressTypeIcon(address.addressType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-bold ${
                                darkMode ? "text-white" : "text-gray-800"
                              } text-base sm:text-lg md:text-xl truncate`}
                            >
                              {address.title}
                              {address.isDefault && (
                                <span className="ml-1 sm:ml-2 bg-[#E41E26] text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                  Default
                                </span>
                              )}
                            </h3>
                            <p
                              className={`${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              } text-xs sm:text-sm capitalize truncate`}
                            >
                              {address.addressType}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`space-y-1 sm:space-y-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } text-sm sm:text-base`}
                        >
                          <p className="font-semibold truncate">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="truncate">{address.phoneNumber}</p>
                          <p className="truncate">
                            {address.street}, Building {address.buildingNumber}
                          </p>
                          {address.floor && (
                            <p className="truncate">{address.floor}</p>
                          )}
                          <p className="truncate">
                            {address.city}, {address.country}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                        {!address.isDefault && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSetDefault(address.id)}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                              darkMode
                                ? "bg-green-900/50 text-green-300 hover:bg-green-800"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                          >
                            <FaStar className="text-xs sm:text-sm" />
                            <span className="whitespace-nowrap hidden xs:inline">
                              Set Default
                            </span>
                            <span className="whitespace-nowrap xs:hidden">
                              Default
                            </span>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(address)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                            darkMode
                              ? "bg-blue-900/50 text-blue-300 hover:bg-blue-800"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                        >
                          <FaEdit className="text-xs sm:text-sm" />
                          <span className="whitespace-nowrap">Edit</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(address.id)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                            darkMode
                              ? "bg-red-900/50 text-red-300 hover:bg-red-800"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                        >
                          <FaTrash className="text-xs sm:text-sm" />
                          <span className="whitespace-nowrap">Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {addresses.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 sm:py-10 md:py-12 ${
                    darkMode
                      ? "bg-gray-700/80 border-gray-600"
                      : "bg-white/80 border-gray-200/50"
                  } backdrop-blur-sm rounded-xl sm:rounded-2xl border`}
                >
                  <FaMapMarkerAlt
                    className={`mx-auto text-3xl sm:text-4xl md:text-5xl ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    } mb-3 sm:mb-4`}
                  />
                  <h3
                    className={`text-lg sm:text-xl md:text-2xl font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } mb-2 sm:mb-3`}
                  >
                    No addresses yet
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto`}
                  >
                    Add your first address to get started
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNewAddress}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                    <span>Add Your First Address</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Add/Edit Address Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="address-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-700/80 border-gray-600"
                        : "bg-white/80 border-gray-200/50"
                    } backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border shadow-lg sticky top-4 sm:top-6 transition-colors duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3
                        className={`text-base sm:text-lg md:text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-800"
                        } truncate`}
                      >
                        {editingId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className={`${
                          darkMode
                            ? "text-gray-400 hover:text-[#FDB913]"
                            : "text-gray-500 hover:text-[#E41E26]"
                        } transition-colors duration-200 flex-shrink-0 ml-2`}
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Title Input */}
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          Address Title *
                        </label>
                        <div className="relative group">
                          <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className={`w-full border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-black"
                            } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                            placeholder="e.g., Home, Work, Main House"
                          />
                        </div>
                      </div>

                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
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
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="First name"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
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
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="Last name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
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
                            className={`w-full border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-black"
                            } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>

                      {/* Country Dropdown */}
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          Country *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown("country")}
                            className={`w-full flex items-center justify-between border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-[#E41E26]"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[#E41E26]"
                            } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 transition-all group text-sm sm:text-base`}
                          >
                            <div className="flex items-center gap-3">
                              <FaGlobe className="text-[#E41E26] text-sm" />
                              <span>{formData.country}</span>
                            </div>
                            <motion.div
                              animate={{
                                rotate: openDropdown === "country" ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronDown className="text-[#E41E26]" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {openDropdown === "country" && (
                              <motion.ul
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute z-10 mt-2 w-full ${
                                  darkMode
                                    ? "bg-gray-800 border-gray-600"
                                    : "bg-white border-gray-200"
                                } border shadow-xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto`}
                              >
                                {countries.map((country) => (
                                  <li
                                    key={country}
                                    onClick={() => {
                                      setFormData({ ...formData, country });
                                      setOpenDropdown(null);
                                    }}
                                    className={`px-4 py-2.5 sm:py-3 ${
                                      darkMode
                                        ? "hover:bg-gray-700 text-gray-300 border-gray-600"
                                        : "hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] text-gray-700 border-gray-100"
                                    } cursor-pointer transition-all text-sm sm:text-base border-b last:border-b-0`}
                                  >
                                    {country}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* City Dropdown */}
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          City *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown("city")}
                            className={`w-full flex items-center justify-between border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-[#E41E26]"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[#E41E26]"
                            } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 transition-all group text-sm sm:text-base`}
                          >
                            <div className="flex items-center gap-3">
                              <FaCity className="text-[#E41E26] text-sm" />
                              <span>{formData.city || "Select City"}</span>
                            </div>
                            <motion.div
                              animate={{
                                rotate: openDropdown === "city" ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronDown className="text-[#E41E26]" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {openDropdown === "city" && (
                              <motion.ul
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute z-10 mt-2 w-full ${
                                  darkMode
                                    ? "bg-gray-800 border-gray-600"
                                    : "bg-white border-gray-200"
                                } border shadow-xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto`}
                              >
                                {cities.map((city) => (
                                  <li
                                    key={city}
                                    onClick={() => {
                                      setFormData({ ...formData, city });
                                      setOpenDropdown(null);
                                    }}
                                    className={`px-4 py-2.5 sm:py-3 ${
                                      darkMode
                                        ? "hover:bg-gray-700 text-gray-300 border-gray-600"
                                        : "hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] text-gray-700 border-gray-100"
                                    } cursor-pointer transition-all text-sm sm:text-base border-b last:border-b-0`}
                                  >
                                    {city}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Street */}
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          Street *
                        </label>
                        <div className="relative group">
                          <FaRoad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            required
                            className={`w-full border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-black"
                            } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                            placeholder="Street name"
                          />
                        </div>
                      </div>

                      {/* Building Number & Floor */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
                            Building Number *
                          </label>
                          <div className="relative group">
                            <FaBuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="buildingNumber"
                              value={formData.buildingNumber}
                              onChange={handleInputChange}
                              required
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="Building no."
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
                            Floor *
                          </label>
                          <div className="relative group">
                            <FaBuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="floor"
                              value={formData.floor}
                              onChange={handleInputChange}
                              required
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="Floor"
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
                          className={`flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base`}
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
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaCheck className="text-xs sm:text-sm" />
                          {editingId ? "Update" : "Save"}
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
