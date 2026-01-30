import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUser,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
              `الاسم الأول يجب أن يكون بين 3 و 100 حرف. أدخلت ${match[1]} حرفاً.`,
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
              `الاسم الأخير يجب أن يكون بين 3 و 100 حرف. أدخلت ${match[1]} حرفاً.`,
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

    if (errorData.errors.NewPassword) {
      errorData.errors.NewPassword.forEach((msg) => {
        if (msg.includes("cannot be same as the current password")) {
          errorMessages.push(
            "كلمة المرور الجديدة لا يمكن أن تكون مماثلة لكلمة المرور الحالية",
          );
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (
        !["FirstName", "LastName", "PhoneNumber", "NewPassword"].includes(key)
      ) {
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
         </div>`,
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
    } else if (msg.includes("cannot be same")) {
      translatedMessage =
        "كلمة المرور الجديدة لا يمكن أن تكون مماثلة لكلمة المرور الحالية";
    } else {
      translatedMessage = errorData.message;
    }

    return `<div style="text-align: right; color: black;">${translatedMessage}</div>`;
  }

  return `<div style="text-align: right; color: black;">حدث خطأ غير متوقع في تحديث الملف الشخصي</div>`;
};

const showProfileMessage = (type, title, text, options = {}) => {
  const { showButtons = false, ...otherOptions } = options;

  if (window.innerWidth >= 768) {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      showConfirmButton: showButtons,
      timer: showButtons ? undefined : otherOptions.timer || 2500,
      showCancelButton: showButtons,
      confirmButtonText: showButtons ? "نعم" : undefined,
      cancelButtonText: showButtons ? "لا" : undefined,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      ...otherOptions,
    });
  } else {
    const toastOptions = {
      position: "top-right",
      autoClose: otherOptions.timer || 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        width: "70%",
        margin: "10px",
        borderRadius: "12px",
        textAlign: "right",
        fontSize: "14px",
        direction: "rtl",
      },
    };

    switch (type) {
      case "success":
        toast.success(text, toastOptions);
        break;
      case "error":
        toast.error(text, toastOptions);
        break;
      case "warning":
        toast.warning(text, toastOptions);
        break;
      default:
        toast.info(text, toastOptions);
    }
  }
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

  const [menuItems] = useState([
    {
      id: "profile",
      label: "الملف الشخصي",
      icon: FaUser,
      description: "إدارة معلوماتك الشخصية",
      color: "#2E3E88",
      bgColor: "#2E3E8810",
    },
    {
      id: "security",
      label: "الأمان",
      icon: FaShieldAlt,
      description: "تغيير كلمة المرور",
      color: "#32B9CC",
      bgColor: "#32B9CC10",
    },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/Account/Profile");
        if (res.status === 200) {
          const fixedImageUrl = res.data.imageUrl
            ? `https://restaurant-template.runasp.net/profiles/${res.data.imageUrl
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
        showProfileMessage("error", "خطأ", "فشل في جلب بيانات الملف الشخصي");
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
        <FaTimesCircle className="text-gray-400" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-500"}>
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
            { headers: { "Content-Type": "multipart/form-data" } },
          );

          if (imageRes.status === 200) {
            updatedAvatar = `https://restaurant-template.runasp.net/profiles/${imageRes.data
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

        Swal.close();

        showProfileMessage(
          "success",
          "تم التحديث",
          "تم تحديث ملفك الشخصي بنجاح",
        );
      }
    } catch (err) {
      const errorData = err.response?.data;
      const translatedMessage = translateProfileErrorMessage(errorData);

      Swal.close();

      if (window.innerWidth < 768) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = translatedMessage;
        const textContent =
          tempDiv.textContent || tempDiv.innerText || "حدث خطأ";
        showProfileMessage("error", "خطأ", textContent);
      } else {
        Swal.fire({
          title: "حدث خطأ",
          html: translatedMessage,
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
        });
      }
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
        showProfileMessage(
          "success",
          "تم التحديث",
          "تم تحديث كلمة المرور بنجاح",
        );
        setPasswordData({
          oldPassword: "",
          newPassword: "",
        });
      }
    } catch (err) {
      const errorData = err.response?.data;
      const translatedMessage = translateProfileErrorMessage(errorData);

      if (window.innerWidth < 768) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = translatedMessage;
        const textContent =
          tempDiv.textContent || tempDiv.innerText || "حدث خطأ";
        showProfileMessage("error", "خطأ", textContent);
      } else {
        Swal.fire({
          title: "فشل التحديث",
          html: translatedMessage,
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
        });
      }
    }
  };

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p className="text-lg font-semibold" style={{ color: "#2E3E88" }}>
            جارٍ تحميل الملف الشخصي...
          </p>
        </div>
      </div>
    );
  }

  const fieldClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right text-sm md:text-base";

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div
          className="relative py-8 md:py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={16}
                className="md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-6 md:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaUser className="text-white text-2xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                الملف الشخصي
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
                إدارة معلومات حسابك وإعدادات الأمان
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8 -mt-8 md:-mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* User Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden"
            >
              <div
                className="relative h-24 md:h-32"
                style={{
                  background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                }}
              >
                <div className="absolute -bottom-12 md:-bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative group">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="الصورة الشخصية"
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl md:shadow-2xl"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full text-white flex items-center justify-center text-4xl md:text-5xl font-bold border-4 border-white shadow-xl md:shadow-2xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        }}
                      >
                        {user.firstName?.charAt(0).toUpperCase() || "م"}
                      </div>
                    )}

                    {isEditingProfile && activeTab === "profile" && (
                      <label
                        className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white p-2 md:p-3 rounded-full shadow-xl md:shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 group-hover:scale-110"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                          color: "white",
                        }}
                      >
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleAvatarChange}
                          accept="image/*"
                        />
                        <FaCamera size={14} className="md:w-4 md:h-4" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-16 md:pt-20 pb-4 md:pb-6 px-4 md:px-6 text-center">
                <h2
                  className="text-xl md:text-2xl font-bold mb-1 md:mb-2 truncate px-2"
                  style={{ color: "#2E3E88" }}
                >
                  {user.firstName} {user.lastName}
                </h2>
                <p
                  className="mb-4 md:mb-6 text-sm md:text-base truncate px-2"
                  style={{ color: "#32B9CC" }}
                >
                  {user.email}
                </p>

                {activeTab === "profile" && !isEditingProfile ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                    style={{
                      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                      color: "white",
                    }}
                  >
                    <FaEdit className="md:w-4 md:h-4" />
                    <span>تعديل الملف الشخصي</span>
                  </motion.button>
                ) : (
                  activeTab === "profile" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      disabled={!hasChanges}
                      className={`w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg transition-all duration-300 text-sm md:text-base ${
                        hasChanges
                          ? "shadow-lg hover:shadow-xl cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      style={
                        hasChanges
                          ? {
                              background:
                                "linear-gradient(135deg, #2E3E88, #32B9CC)",
                              color: "white",
                            }
                          : {
                              background: "#e5e7eb",
                              color: "#6b7280",
                            }
                      }
                    >
                      <FaSave className="md:w-4 md:h-4" />
                      <span>حفظ التغييرات</span>
                    </motion.button>
                  )
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Navigation Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6"
            >
              <h3
                className="text-lg md:text-xl font-bold mb-3 md:mb-4"
                style={{ color: "#2E3E88" }}
              >
                القائمة الرئيسية
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "security") {
                        setIsEditingProfile(false);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                      activeTab === item.id ? "shadow-lg" : "hover:shadow-md"
                    }`}
                    style={
                      activeTab === item.id
                        ? {
                            background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                            color: "white",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            border: "1px solid #2E3E8820",
                            color: item.color,
                          }
                    }
                  >
                    <item.icon className="text-xl md:text-2xl mb-1 md:mb-2" />
                    <span className="font-semibold text-sm md:text-base">
                      {item.label}
                    </span>
                    <span className="text-xs mt-0.5 md:mt-1 opacity-80">
                      {item.description}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <h3
                        className="text-lg md:text-xl font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        المعلومات الشخصية
                      </h3>
                      <div className="flex items-center gap-2">
                        <FaUser
                          className="md:w-5 md:h-5"
                          style={{ color: "#2E3E88" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {/* First Name */}
                      <div>
                        <label
                          className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          الاسم الأول
                        </label>
                        <div className="relative">
                          {isEditingProfile ? (
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              className={fieldClass}
                              placeholder="أدخل اسمك الأول"
                              dir="rtl"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              }}
                            />
                          ) : (
                            <div
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 md:py-3.5 text-right truncate"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                color: "#2E3E88",
                              }}
                            >
                              {user.firstName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label
                          className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          الاسم الأخير
                        </label>
                        <div className="relative">
                          {isEditingProfile ? (
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              className={fieldClass}
                              placeholder="أدخل اسمك الأخير"
                              dir="rtl"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              }}
                            />
                          ) : (
                            <div
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 md:py-3.5 text-right truncate"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                color: "#2E3E88",
                              }}
                            >
                              {user.lastName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label
                          className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          البريد الإلكتروني
                        </label>
                        <div className="relative">
                          <div
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 md:py-3.5 text-right truncate"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              color: "#2E3E88",
                            }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="md:col-span-2">
                        <label
                          className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          رقم الهاتف
                        </label>
                        <div className="relative">
                          {isEditingProfile ? (
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className={fieldClass}
                              placeholder="أدخل رقم هاتفك"
                              dir="rtl"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              }}
                            />
                          ) : (
                            <div
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 md:py-3.5 text-right truncate"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                color: "#2E3E88",
                              }}
                            >
                              {user.phoneNumber || "غير متوفر"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <h3
                        className="text-lg md:text-xl font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        إعدادات الأمان
                      </h3>
                      <div className="flex items-center gap-2">
                        <FaShieldAlt
                          className="md:w-5 md:h-5"
                          style={{ color: "#2E3E88" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      {/* Current Password */}
                      <div>
                        <label
                          className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          كلمة المرور الحالية
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.old ? "text" : "password"}
                            name="oldPassword"
                            placeholder="أدخل كلمة المرور الحالية"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className={fieldClass + " pr-10 md:pr-12"}
                            dir="rtl"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            }}
                          />
                          <button
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                old: !showPassword.old,
                              })
                            }
                            className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
                            style={{ color: "#2E3E88" }}
                          >
                            {showPassword.old ? (
                              <FaEyeSlash className="w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                              <FaEye className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label
                          className="block text-xs md:text-sm font-semibold mb-1 md:mb-2 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            placeholder="أدخل كلمة المرور الجديدة"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={fieldClass + " pr-10 md:pr-12"}
                            dir="rtl"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            }}
                          />
                          <button
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                new: !showPassword.new,
                              })
                            }
                            className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
                            style={{ color: "#2E3E88" }}
                          >
                            {showPassword.new ? (
                              <FaEyeSlash className="w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                              <FaEye className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div
                        className="p-3 md:p-4 rounded-lg md:rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          border: "1px solid #2E3E8820",
                        }}
                      >
                        <p
                          className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          متطلبات كلمة المرور:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                          {getValidationItem(
                            passwordValidations.length,
                            "8 أحرف على الأقل",
                          )}
                          {getValidationItem(
                            passwordValidations.lowercase,
                            "حرف صغير واحد على الأقل",
                          )}
                          {getValidationItem(
                            passwordValidations.uppercase,
                            "حرف كبير واحد على الأقل",
                          )}
                          {getValidationItem(
                            passwordValidations.specialChar,
                            "رمز خاص واحد على الأقل",
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
                        className={`w-full font-semibold py-2.5 md:py-3.5 rounded-lg md:rounded-xl transition-all duration-300 text-sm md:text-lg ${
                          allPasswordValid && passwordData.oldPassword
                            ? "shadow-lg hover:shadow-xl cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        style={
                          allPasswordValid && passwordData.oldPassword
                            ? {
                                background:
                                  "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                color: "white",
                              }
                            : {
                                background: "#e5e7eb",
                                color: "#6b7280",
                              }
                        }
                      >
                        تحديث كلمة المرور
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
