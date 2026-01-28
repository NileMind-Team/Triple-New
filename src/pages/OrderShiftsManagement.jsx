import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaPlay,
  FaStop,
  FaPause,
  FaPlayCircle,
  FaBusinessTime,
  FaClock,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const isMobile = () => {
  return window.innerWidth < 768;
};

const showMessage = (type, title, text, options = {}) => {
  if (isMobile() && !options.forceSwal) {
    const toastOptions = {
      position: "top-right",
      autoClose: options.timer || 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        width: "90%",
        maxWidth: "350px",
        margin: "10px auto",
        borderRadius: "12px",
        textAlign: "right",
        fontSize: "14px",
        direction: "rtl",
        background:
          type === "error"
            ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
            : type === "warning"
              ? "linear-gradient(135deg, #FFA726, #FF9800)"
              : "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
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
      case "info":
        toast.info(text, toastOptions);
        break;
      default:
        toast(text, toastOptions);
    }
  } else {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      timer: options.timer || 2500,
      showConfirmButton:
        options.showConfirmButton !== undefined
          ? options.showConfirmButton
          : false,
      background:
        type === "error"
          ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
          : type === "warning"
            ? "linear-gradient(135deg, #FFA726, #FF9800)"
            : "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
      ...options,
    });
  }
};

const translateErrorMessage = (errorData) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.Name) {
      errorData.errors.Name.forEach((msg) => {
        if (msg.includes("مطلوب") || msg.includes("required")) {
          errorMessages.push("اسم الوردية مطلوب");
        } else if (msg.includes("مستخدم") || msg.includes("already used")) {
          errorMessages.push("اسم الوردية مستخدم بالفعل");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorMessages.length > 0) {
      return errorMessages.join("، ");
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("unauthorized") || msg.includes("401")) {
      return "غير مصرح لك بهذا الإجراء";
    }
    if (msg.includes("forbidden") || msg.includes("403")) {
      return "ليس لديك صلاحية للقيام بهذا الإجراء";
    }
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    return errorData.message;
  }

  return "حدث خطأ غير متوقع";
};

const showErrorAlert = (errorData) => {
  const translatedMessage = translateErrorMessage(errorData);
  showMessage("error", "خطأ", translatedMessage);
};

const addTwoHoursAndFormatTo12Hour = (timeString) => {
  if (!timeString) return "غير محدد";

  try {
    const timeMatch = timeString.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!timeMatch) return "غير محدد";

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    const dateMatch = timeString.match(/(\d{4})-(\d{2})-(\d{2})T/);
    let dateText = "";

    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const day = parseInt(dateMatch[3]);

      let adjustedHours = hours + 2;
      let adjustedDay = day;
      let adjustedMonth = month;
      let adjustedYear = year;

      if (adjustedHours >= 24) {
        adjustedHours = adjustedHours % 24;
        adjustedDay = adjustedDay + 1;

        const newDate = new Date(adjustedYear, adjustedMonth - 1, adjustedDay);
        adjustedDay = newDate.getDate();
        adjustedMonth = newDate.getMonth() + 1;
        adjustedYear = newDate.getFullYear();
      }

      const arabicNumbers = {
        0: "٠",
        1: "١",
        2: "٢",
        3: "٣",
        4: "٤",
        5: "٥",
        6: "٦",
        7: "٧",
        8: "٨",
        9: "٩",
      };

      const convertToArabicNumbers = (num) => {
        return num
          .toString()
          .split("")
          .map((digit) => arabicNumbers[digit] || digit)
          .join("");
      };

      const arabicYear = convertToArabicNumbers(adjustedYear);
      const arabicMonth = convertToArabicNumbers(adjustedMonth);
      const arabicDay = convertToArabicNumbers(adjustedDay);

      dateText = `${arabicYear}/${arabicMonth}/${arabicDay}`;
    } else {
      const now = new Date();
      const arabicNumbers = {
        0: "٠",
        1: "١",
        2: "٢",
        3: "٣",
        4: "٤",
        5: "٥",
        6: "٦",
        7: "٧",
        8: "٨",
        9: "٩",
      };

      const convertToArabicNumbers = (num) => {
        return num
          .toString()
          .split("")
          .map((digit) => arabicNumbers[digit] || digit)
          .join("");
      };

      const arabicYear = convertToArabicNumbers(now.getFullYear());
      const arabicMonth = convertToArabicNumbers(now.getMonth() + 1);
      const arabicDay = convertToArabicNumbers(now.getDate());

      dateText = `${arabicYear}/${arabicMonth}/${arabicDay}`;
    }

    let newHours = hours + 2;

    if (newHours >= 24) {
      newHours = newHours % 24;
    }

    let period = "ص";
    let displayHours = newHours;

    if (newHours === 0) {
      displayHours = 12;
    } else if (newHours === 12) {
      displayHours = 12;
      period = "م";
    } else if (newHours > 12) {
      displayHours = newHours - 12;
      period = "م";
    } else if (newHours < 12) {
      displayHours = newHours;
      period = "ص";
    }

    const arabicNumbers = {
      0: "٠",
      1: "١",
      2: "٢",
      3: "٣",
      4: "٤",
      5: "٥",
      6: "٦",
      7: "٧",
      8: "٨",
      9: "٩",
    };

    const convertToArabicNumbers = (num) => {
      return num
        .toString()
        .split("")
        .map((digit) => arabicNumbers[digit] || digit)
        .join("");
    };

    const formattedHours = convertToArabicNumbers(displayHours);
    const formattedMinutes = convertToArabicNumbers(
      minutes.toString().padStart(2, "0"),
    );

    return `${dateText} الساعة ${formattedHours}:${formattedMinutes} ${period}`;
  } catch (error) {
    console.error("Error processing time:", error, timeString);
    return "غير محدد";
  }
};

export default function OrderShiftsManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    customName: "",
  });

  const shiftTypes = [
    { value: "صباحي", label: "صباحي" },
    { value: "مسائي", label: "مسائي" },
  ];

  const checkActiveShift = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/OrderShifts/GetAvailableShifts",
      );

      if (response.data && response.data.length > 0) {
        const activeShiftData = response.data.find(
          (shift) => shift.end === null,
        );

        if (activeShiftData) {
          setActiveShift({
            id: activeShiftData.id,
            name: activeShiftData.name,
            start: activeShiftData.start,
            isActive: activeShiftData.isActive,
            branchId: activeShiftData.branchId,
          });
        } else {
          setActiveShift(null);
        }
      } else {
        setActiveShift(null);
      }
    } catch (error) {
      console.error("Error checking active shift:", error);
      setActiveShift(null);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get("/api/Account/Profile");
      if (response.data && response.data.roles) {
        setUserRoles(response.data.roles);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const canStartShift = () => {
    return !(userRoles.includes("Admin") || userRoles.includes("Restaurant"));
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        await fetchUserProfile();
        await checkActiveShift();
      } catch (error) {
        console.error("Error loading page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStartShift = async () => {
    if (!formData.name.trim()) {
      showMessage(
        "error",
        "معلومات ناقصة",
        "يرجى اختيار أو كتابة اسم الوردية",
        {
          timer: 2000,
          showConfirmButton: false,
        },
      );
      return;
    }

    try {
      const shiftName =
        formData.name === "custom" ? formData.customName : formData.name;

      const response = await axiosInstance.post("/api/OrderShifts/StartShift", {
        name: shiftName,
      });

      // eslint-disable-next-line no-unused-vars
      const shiftData = response.data;

      await checkActiveShift();

      showMessage("success", "تم البدء", "تم بدء الوردية بنجاح", {
        timer: 2000,
        showConfirmButton: false,
      });

      resetForm();
    } catch (err) {
      showErrorAlert(err.response?.data);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    Swal.fire({
      title: "إنهاء الوردية",
      text: "هل أنت متأكد من إنهاء الوردية الحالية؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، أنهِ الوردية",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.put(
            `/api/OrderShifts/EndShift/${activeShift.id}`,
          );

          await checkActiveShift();

          showMessage("success", "تم الإنهاء", "تم إنهاء الوردية بنجاح", {
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          showErrorAlert(err.response?.data);
        }
      }
    });
  };

  const handleToggleShiftStatus = async () => {
    if (!activeShift) return;

    const action = activeShift.isActive ? "تعطيل" : "تفعيل";
    const actionText = activeShift.isActive ? "تعطيل الوردية" : "تفعيل الوردية";
    const confirmText = activeShift.isActive
      ? "هل أنت متأكد من تعطيل الوردية الحالية؟"
      : "هل أنت متأكد من تفعيل الوردية الحالية؟";

    Swal.fire({
      title: actionText,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.put(
            `/api/OrderShifts/ChangeStatus/${activeShift.id}`,
          );

          await checkActiveShift();

          showMessage("success", `تم ${action}`, `تم ${action} الوردية بنجاح`, {
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          showErrorAlert(err.response?.data);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      customName: "",
    });
  };

  const isFormValid = () => {
    if (formData.name === "custom") {
      return formData.customName.trim() !== "";
    }
    return formData.name.trim() !== "";
  };

  const canUserStartShift = canStartShift();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p
            className="text-base md:text-lg font-semibold"
            style={{ color: "#2E3E88" }}
          >
            جارٍ التحميل...
          </p>
        </div>
      </div>
    );
  }

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
          <div className="container mx-auto px-4">
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
                size={18}
                className="md:text-xl group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-6 md:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaBusinessTime className="text-white text-3xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
                إدارة الورديات
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
                إدارة ورديات الطلبات بشكل فعال ومنظم
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8 -mt-6 md:-mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl"
        >
          {/* Card Header */}
          <div
            className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 md:p-3 rounded-lg md:rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                }}
              >
                <FaClock
                  className="text-lg md:text-xl"
                  style={{ color: "#2E3E88" }}
                />
              </div>
              <div>
                <h3
                  className="text-base md:text-lg font-bold"
                  style={{ color: "#2E3E88" }}
                >
                  {activeShift ? "تفاصيل الوردية الحالية" : "بدء وردية جديدة"}
                </h3>
                <p className="text-xs md:text-sm" style={{ color: "#32B9CC" }}>
                  {activeShift
                    ? "الوردية قيد التشغيل"
                    : "ابدأ وردية جديدة للطلبات"}
                </p>
              </div>
            </div>
            {activeShift && (
              <div className="flex items-center gap-2 mt-1 md:mt-0">
                <span
                  className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold"
                  style={
                    activeShift.isActive
                      ? {
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                          color: "white",
                        }
                      : {
                          background:
                            "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                          color: "white",
                        }
                  }
                >
                  {activeShift.isActive ? "نشطة" : "معطلة"}
                </span>
                {!activeShift.isActive && (
                  <span
                    className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                      color: "#2E3E88",
                    }}
                  >
                    غير مفعلة
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4 md:p-6">
            {activeShift ? (
              <div className="space-y-4 md:space-y-6">
                <div
                  className="p-4 md:p-6 rounded-lg md:rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    border: "1px solid #2E3E8820",
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center md:text-right">
                      <p
                        className="text-xs md:text-sm mb-1 md:mb-2"
                        style={{ color: "#32B9CC" }}
                      >
                        اسم الوردية
                      </p>
                      <p
                        className="text-lg md:text-xl font-bold break-words"
                        style={{ color: "#2E3E88" }}
                      >
                        {activeShift.name}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <p
                        className="text-xs md:text-sm mb-1 md:mb-2"
                        style={{ color: "#32B9CC" }}
                      >
                        بدأت منذ
                      </p>
                      <p
                        className="text-lg md:text-xl font-bold break-words"
                        style={{ color: "#2E3E88" }}
                      >
                        {addTwoHoursAndFormatTo12Hour(activeShift.start)}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <p
                        className="text-xs md:text-sm mb-1 md:mb-2"
                        style={{ color: "#32B9CC" }}
                      >
                        حالة الوردية
                      </p>
                      <p
                        className="text-lg md:text-xl font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        {activeShift.isActive ? "مفعلة" : "معطلة"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToggleShiftStatus}
                    className={`w-full py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 ${
                      activeShift.isActive
                        ? "shadow-lg hover:shadow-xl cursor-pointer"
                        : "shadow-lg hover:shadow-xl cursor-pointer"
                    }`}
                    style={
                      activeShift.isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                            color: "white",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #2E3E88, #32B9CC)",
                            color: "white",
                          }
                    }
                  >
                    {activeShift.isActive ? (
                      <>
                        <FaPause className="text-sm md:text-base" />
                        <span className="text-sm md:text-base">
                          تعطيل الوردية
                        </span>
                      </>
                    ) : (
                      <>
                        <FaPlayCircle className="text-sm md:text-base" />
                        <span className="text-sm md:text-base">
                          تفعيل الوردية
                        </span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEndShift}
                    className="w-full py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                      color: "white",
                    }}
                  >
                    <FaStop className="text-sm md:text-base" />
                    <span className="text-sm md:text-base">
                      إنهاء الوردية الحالية
                    </span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label
                    className="block text-sm md:text-base font-semibold mb-3 md:mb-4"
                    style={{ color: "#2E3E88" }}
                  >
                    نوع الوردية
                  </label>
                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {shiftTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              name: type.value,
                              customName: "",
                            })
                          }
                          className={`p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-200 ${
                            formData.name === type.value
                              ? "shadow-lg"
                              : "hover:shadow-md"
                          }`}
                          style={
                            formData.name === type.value
                              ? {
                                  background:
                                    "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                  color: "white",
                                  border: "none",
                                }
                              : {
                                  background:
                                    "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                  border: "1px solid #2E3E8820",
                                  color: "#2E3E88",
                                }
                          }
                        >
                          <span className="text-sm md:text-base">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            name: "custom",
                            customName: formData.customName || "",
                          })
                        }
                        className={`w-full p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-200 ${
                          formData.name === "custom"
                            ? "shadow-lg"
                            : "hover:shadow-md"
                        }`}
                        style={
                          formData.name === "custom"
                            ? {
                                background:
                                  "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                color: "white",
                                border: "none",
                              }
                            : {
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                border: "1px solid #2E3E8820",
                                color: "#2E3E88",
                              }
                        }
                      >
                        <span className="text-sm md:text-base">اسم مخصص</span>
                      </button>

                      {formData.name === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 md:mt-4"
                        >
                          <div className="relative group">
                            <input
                              type="text"
                              name="customName"
                              value={formData.customName}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 border text-sm md:text-base"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                border: "1px solid #2E3E8820",
                                color: "#2E3E88",
                              }}
                              placeholder="أدخل اسم الوردية المخصص"
                              dir="rtl"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetForm}
                    className="py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 border-2 text-sm md:text-base"
                    style={{
                      borderColor: "#2E3E88",
                      color: "#2E3E88",
                      background: "transparent",
                    }}
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartShift}
                    disabled={!isFormValid() || !canUserStartShift}
                    className={`py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base ${
                      isFormValid() && canUserStartShift
                        ? "shadow-lg hover:shadow-xl cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    style={
                      isFormValid() && canUserStartShift
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
                    <FaPlay className="text-sm md:text-base" />
                    <span>
                      {!canUserStartShift
                        ? "غير مسموح ببدء الوردية"
                        : "بدء الوردية"}
                    </span>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
