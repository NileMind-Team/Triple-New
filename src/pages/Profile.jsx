import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaSave,
  FaKey,
  FaShieldAlt,
  FaBars,
} from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

const translateProfileErrorMessage = (errorData) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.FirstName) {
      errorData.errors.FirstName.forEach((msg) => {
        if (msg.includes("must be between 3 and 100 characters")) {
          const match = msg.match(/You entered (\d+) characters/);
          if (match) {
            errorMessages.push(
              `الاسم الأول يجب أن يكون بين 3 و 100 حرف. أدخلت ${match[1]} حرفاً.`
            );
          } else {
            errorMessages.push("الاسم الأول يجب أن يكون بين 3 و 100 حرف");
          }
        } else if (msg.includes("required")) {
          errorMessages.push("الاسم الأول مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.LastName) {
      errorData.errors.LastName.forEach((msg) => {
        if (msg.includes("must be between 3 and 100 characters")) {
          const match = msg.match(/You entered (\d+) characters/);
          if (match) {
            errorMessages.push(
              `الاسم الأخير يجب أن يكون بين 3 و 100 حرف. أدخلت ${match[1]} حرفاً.`
            );
          } else {
            errorMessages.push("الاسم الأخير يجب أن يكون بين 3 و 100 حرف");
          }
        } else if (msg.includes("required")) {
          errorMessages.push("الاسم الأخير مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.PhoneNumber) {
      errorData.errors.PhoneNumber.forEach((msg) => {
        if (msg.includes("must start with 010, 011, 012, or 015")) {
          errorMessages.push("رقم الهاتف يجب أن يبدأ بـ 010، 011، 012، أو 015");
        } else if (msg.includes("must end with 11 numbers")) {
          errorMessages.push("رقم الهاتف يجب أن ينتهي بـ 11 رقماً");
        } else if (msg.includes("Invalid phone number")) {
          errorMessages.push("رقم الهاتف غير صالح");
        } else if (msg.includes("already exists")) {
          errorMessages.push("رقم الهاتف مسجل بالفعل");
        } else if (msg.includes("required")) {
          errorMessages.push("رقم الهاتف مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (!["FirstName", "LastName", "PhoneNumber"].includes(key)) {
        errorData.errors[key].forEach((msg) => {
          errorMessages.push(msg);
        });
      }
    });

    if (errorMessages.length > 1) {
      const htmlMessages = errorMessages.map(
        (msg) =>
          `<div style="text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative; color: black;">
           ${msg}
           <span style="position: absolute; right: 0; top: 0; color: black;">-</span>
         </div>`
      );
      return htmlMessages.join("");
    } else if (errorMessages.length === 1) {
      return `<div style="text-align: right; color: black;">${errorMessages[0]}</div>`;
    } else {
      return `<div style="text-align: right; color: black;">بيانات غير صالحة</div>`;
    }
  }

  if (Array.isArray(errorData.errors)) {
    const error = errorData.errors[0];
    let translatedMessage = "";

    switch (error.code) {
      case "User.PhoneNumberAlreadyExists":
        translatedMessage = "رقم الهاتف مسجل بالفعل";
        break;
      case "User.InvalidPhoneNumber":
        translatedMessage = "رقم الهاتف غير صالح";
        break;
      case "User.ValidationError":
        translatedMessage = error.description || "خطأ في التحقق من البيانات";
        break;
      default:
        translatedMessage =
          error.description || "حدث خطأ في تحديث الملف الشخصي";
    }

    return `<div style="text-align: right; color: black;">${translatedMessage}</div>`;
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    let translatedMessage = "";

    if (msg.includes("phone") && msg.includes("exist")) {
      translatedMessage = "رقم الهاتف مسجل بالفعل";
    } else if (msg.includes("validation")) {
      translatedMessage = "خطأ في التحقق من البيانات المدخلة";
    } else if (msg.includes("network") || msg.includes("internet")) {
      translatedMessage = "يرجى التحقق من اتصالك بالإنترنت";
    } else if (msg.includes("timeout")) {
      translatedMessage = "انتهت المهلة، يرجى المحاولة مرة أخرى";
    } else {
      translatedMessage = errorData.message;
    }

    return `<div style="text-align: right; color: black;">${translatedMessage}</div>`;
  }

  return `<div style="text-align: right; color: black;">حدث خطأ غير متوقع في تحديث الملف الشخصي</div>`;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/Account/Profile");
        if (res.status === 200) {
          const fixedImageUrl = res.data.imageUrl
            ? `https://restaurant-template.runasp.net/Profiles/${res.data.imageUrl
                .split("/")
                .pop()}`
            : null;

          const userData = {
            ...res.data,
            avatar: fixedImageUrl,
          };

          setUser(userData);
          setFormData({
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            email: res.data.email || "",
            phoneNumber: res.data.phoneNumber || "",
          });

          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch profile data.",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setHasChanges(true);
      setUser({ ...user, avatar: URL.createObjectURL(file) });
    }
  };

  const passwordValidations = {
    length: passwordData.newPassword.length >= 8,
    lowercase: /[a-z]/.test(passwordData.newPassword),
    uppercase: /[A-Z]/.test(passwordData.newPassword),
    specialChar: /[^A-Za-z0-9]/.test(passwordData.newPassword),
  };
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);

  const getValidationItem = (condition, label) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-gray-400 dark:text-gray-500" />
      )}
      <span
        className={
          condition
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400"
        }
      >
        {label}
      </span>
    </div>
  );

  const handleSaveProfile = async () => {
    Swal.fire({
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await axiosInstance.put("/api/Account/UpdateProfile", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });

      if (res.status === 200) {
        let updatedAvatar = user.avatar;

        if (avatarFile) {
          const imageData = new FormData();
          imageData.append("Image", avatarFile);
          const imageRes = await axiosInstance.put(
            "/api/Account/ChangeImage",
            imageData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (imageRes.status === 200) {
            updatedAvatar = `https://restaurant-template.runasp.net/Profiles/${imageRes.data
              .split("/")
              .pop()}`;
          }
        }

        const updatedUser = {
          ...user,
          ...formData,
          avatar: updatedAvatar,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setAvatarFile(null);
        setHasChanges(false);
        setIsEditingProfile(false);

        Swal.fire({
          icon: "success",
          title: "تم تحديث الملف الشخصي",
          text: "تم تحديث ملفك الشخصي بنجاح",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      const errorData = err.response?.data;
      const translatedMessage = translateProfileErrorMessage(errorData);

      Swal.fire({
        title: "حدث خطأ",
        html: translatedMessage,
        icon: "error",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const handleSavePassword = async () => {
    if (!allPasswordValid || !passwordData.oldPassword) return;

    try {
      const res = await axiosInstance.put("/api/Account/ChangePassword", {
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Password Updated",
          text: "Your password has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        setPasswordData({
          oldPassword: "",
          newPassword: "",
        });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        "An error occurred while updating password.";

      if (typeof errorMsg === "object") {
        const messages = [];
        if (Array.isArray(errorMsg)) {
          errorMsg.forEach((e) =>
            messages.push(e.description || JSON.stringify(e))
          );
        } else {
          Object.values(errorMsg).forEach((vals) => {
            if (Array.isArray(vals)) {
              vals.forEach((msg) => messages.push(msg));
            } else {
              messages.push(vals);
            }
          });
        }

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          html: messages.map((m) => `<p>${m}</p>`).join(""),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: errorMsg,
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  const fieldClass =
    "w-full border border-gray-200 bg-white/80 backdrop-blur-sm text-black rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 hover:border-[#E41E26]/50 dark:bg-gray-600/80 dark:border-gray-500 dark:text-white";

  const tabs = [
    {
      id: "profile",
      label: "Profile Information",
      icon: FaUser,
      description: "Manage your personal information",
    },
    {
      id: "security",
      label: "Security Settings",
      icon: FaShieldAlt,
      description: "Update password and security",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 py-4 sm:py-8 relative font-sans overflow-hidden transition-colors duration-300`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -right-20 -bottom-20 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-r from-[#E41E26]/5 to-[#FDB913]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] border border-[#E41E26]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
      >
        <FaArrowLeft
          size={16}
          className="sm:size-[18px] group-hover:scale-110 transition-transform"
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        {/* Header Background */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-6 -right-6 w-24 h-24 sm:w-40 sm:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="relative px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 -mt-12 sm:-mt-16">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-end lg:text-left gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Avatar Section */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative group"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-2xl dark:border-gray-800"
                />
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold border-4 border-white shadow-2xl dark:border-gray-800">
                  {user.firstName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              {isEditingProfile && activeTab === "profile" && (
                <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-[#E41E26] hover:bg-[#FDB913] text-white p-2 sm:p-3 rounded-full shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 group-hover:scale-110">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleAvatarChange}
                    accept="image/*"
                  />
                  <FaCamera size={12} className="sm:size-[16px]" />
                </label>
              )}
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2"
              >
                {user.firstName} {user.lastName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 dark:text-gray-400 flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base"
              >
                <FaEnvelope className="text-[#E41E26] flex-shrink-0" />
                <span className="truncate block max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
                  {user.email}
                </span>
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2 sm:gap-3"
            >
              {activeTab === "profile" && !isEditingProfile ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300 text-sm sm:text-base"
                >
                  <FaEdit className="flex-shrink-0" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </motion.button>
              ) : (
                activeTab === "profile" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-sm sm:text-base ${
                      hasChanges
                        ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <FaSave className="flex-shrink-0" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </motion.button>
                )
              )}
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between bg-gray-100/80 backdrop-blur-sm rounded-2xl p-4 font-semibold transition-all duration-300 dark:bg-gray-700/80 dark:text-gray-200"
            >
              <div className="flex items-center gap-3">
                {tabs.find((tab) => tab.id === activeTab)?.icon &&
                  React.createElement(
                    tabs.find((tab) => tab.id === activeTab).icon,
                    {
                      className: "text-[#E41E26] text-xl",
                    }
                  )}
                <span>{tabs.find((tab) => tab.id === activeTab)?.label}</span>
              </div>
              <FaBars className="text-[#E41E26]" />
            </motion.button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl mt-2 overflow-hidden shadow-lg border border-gray-200/50 dark:bg-gray-700/95 dark:border-gray-600/50"
                >
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                        if (tab.id === "security") {
                          setIsEditingProfile(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] text-[#E41E26] dark:from-gray-600 dark:to-gray-500"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <tab.icon className="text-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold">{tab.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {tab.description}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Tabs Navigation */}
          <div className="hidden lg:flex gap-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 mb-6 sm:mb-8 w-full dark:bg-gray-700/80">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "security") {
                    setIsEditingProfile(false);
                  }
                }}
                className={`flex items-center gap-3 flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 text-left ${
                  activeTab === tab.id
                    ? "bg-white text-[#E41E26] shadow-lg dark:bg-gray-600 dark:text-[#E41E26]"
                    : "text-gray-600 hover:text-[#E41E26] hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-600/50"
                }`}
              >
                <tab.icon className="text-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-lg">{tab.label}</div>
                  <div
                    className={`text-sm mt-1 ${
                      activeTab === tab.id
                        ? "text-[#E41E26]/80 dark:text-[#E41E26]/70"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Tab Content - Responsive */}
          <div className="relative min-h-[300px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile-content"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, type: "spring" }}
                  className="w-full"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg dark:bg-gray-700/80 dark:border-gray-600/50">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                      <FaUser className="text-[#E41E26]" />
                      Personal Information
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          First Name
                        </label>
                        <div className="relative group">
                          <FaUser
                            className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-lg transition-all duration-300 group-focus-within:scale-110 ${
                              isEditingProfile ? "opacity-100" : "opacity-70"
                            }`}
                          />
                          {isEditingProfile ? (
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              className={fieldClass + " pl-10 sm:pl-12"}
                              placeholder="Enter your first name"
                            />
                          ) : (
                            <div className="w-full border border-gray-200 bg-white/50 text-gray-800 text-base sm:text-lg font-medium pl-10 sm:pl-12 py-3 sm:py-3.5 rounded-xl dark:bg-gray-600/50 dark:text-gray-200 dark:border-gray-500">
                              {user.firstName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Last Name
                        </label>
                        <div className="relative group">
                          <FaUser
                            className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-lg transition-all duration-300 group-focus-within:scale-110 ${
                              isEditingProfile ? "opacity-100" : "opacity-70"
                            }`}
                          />
                          {isEditingProfile ? (
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              className={fieldClass + " pl-10 sm:pl-12"}
                              placeholder="Enter your last name"
                            />
                          ) : (
                            <div className="w-full border border-gray-200 bg-white/50 text-gray-800 text-base sm:text-lg font-medium pl-10 sm:pl-12 py-3 sm:py-3.5 rounded-xl dark:bg-gray-600/50 dark:text-gray-200 dark:border-gray-500">
                              {user.lastName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <div className="relative group">
                          <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-lg transition-all duration-300 opacity-70" />
                          <div className="w-full border border-gray-200 bg-gray-100/50 text-gray-800 text-base sm:text-lg font-medium pl-10 sm:pl-12 py-3 sm:py-3.5 rounded-xl truncate dark:bg-gray-600/50 dark:text-gray-200 dark:border-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <div className="relative group">
                          <FaPhone
                            className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-lg transition-all duration-300 group-focus-within:scale-110 ${
                              isEditingProfile ? "opacity-100" : "opacity-70"
                            }`}
                          />
                          {isEditingProfile ? (
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className={fieldClass + " pl-10 sm:pl-12"}
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <div className="w-full border border-gray-200 bg-white/50 text-gray-800 text-base sm:text-lg font-medium pl-10 sm:pl-12 py-3 sm:py-3.5 rounded-xl dark:bg-gray-600/50 dark:text-gray-200 dark:border-gray-500">
                              {user.phoneNumber || "Not provided"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Settings Tab */}
              {activeTab === "security" && (
                <motion.div
                  key="security-content"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, type: "spring" }}
                  className="w-full"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-lg dark:bg-gray-700/80 dark:border-gray-600/50">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
                      <FaKey className="text-[#E41E26]" />
                      Change Password
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <div className="relative group">
                          <FaLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-lg transition-all duration-300 group-focus-within:scale-110 opacity-70" />
                          <input
                            type={showPassword.old ? "text" : "password"}
                            name="oldPassword"
                            placeholder="Enter your current password"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className={
                              fieldClass + " pl-10 sm:pl-12 pr-10 sm:pr-12"
                            }
                          />
                          <div
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                old: !showPassword.old,
                              })
                            }
                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#E41E26] cursor-pointer transition-all duration-200 hover:scale-110 dark:text-gray-400"
                          >
                            {showPassword.old ? <FaEyeSlash /> : <FaEye />}
                          </div>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <div className="relative group">
                          <FaLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-lg transition-all duration-300 group-focus-within:scale-110 opacity-70" />
                          <input
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            placeholder="Enter your new password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={
                              fieldClass + " pl-10 sm:pl-12 pr-10 sm:pr-12"
                            }
                          />
                          <div
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                new: !showPassword.new,
                              })
                            }
                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#E41E26] cursor-pointer transition-all duration-200 hover:scale-110 dark:text-gray-400"
                          >
                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                          </div>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] p-3 sm:p-4 rounded-xl border border-[#FDB913]/30 space-y-2 dark:from-gray-600 dark:to-gray-500 dark:border-gray-500">
                        <p className="text-sm font-semibold text-[#E41E26] mb-2">
                          Password Requirements:
                        </p>
                        <div className="grid grid-cols-1 gap-1 sm:gap-2">
                          {getValidationItem(
                            passwordValidations.length,
                            "At least 8 characters"
                          )}
                          {getValidationItem(
                            passwordValidations.lowercase,
                            "One lowercase letter"
                          )}
                          {getValidationItem(
                            passwordValidations.uppercase,
                            "One uppercase letter"
                          )}
                          {getValidationItem(
                            passwordValidations.specialChar,
                            "One special character"
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSavePassword}
                        disabled={
                          !allPasswordValid || !passwordData.oldPassword
                        }
                        className={`w-full font-semibold py-3 sm:py-3.5 rounded-xl transition-all duration-300 text-base sm:text-lg ${
                          allPasswordValid && passwordData.oldPassword
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Update Password
                      </motion.button>
                    </div>
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
