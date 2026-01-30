import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaCity,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMap,
  FaTimes,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCommentAlt,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaGlobeAmericas,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Branches = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showReviews, setShowReviews] = useState({});

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
        case "info":
          toast.info(text, toastOptions);
          break;
        default:
          toast(text, toastOptions);
      }
    } else {
      Swal.fire({
        title: title,
        html: text,
        icon: type,
        confirmButtonText: "حسنًا",
        timer: options.timer || 2500,
        showConfirmButton: options.showConfirmButton || false,
      });
    }
  };

  useEffect(() => {
    const fetchBranchesAndCities = async () => {
      try {
        const [branchesRes] = await Promise.all([
          axiosInstance.get("/api/Branches/GetAll"),
        ]);

        if (branchesRes.status === 200) {
          setBranches(branchesRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        showMessage("error", "حدث خطأ", "فشل في تحميل بيانات الفروع", {
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranchesAndCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const convertToArabicNumbers = (number) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return number.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const formatTimeTo12HourArabic = (timeString) => {
    if (!timeString) return "";

    try {
      const [hours, minutes] = timeString.split(":");
      let hour = parseInt(hours);
      const minute = minutes || "00";

      const period = hour >= 12 ? "م" : "ص";
      hour = hour % 12 || 12;

      const arabicHour = convertToArabicNumbers(hour);
      const arabicMinute = convertToArabicNumbers(minute);

      return `${arabicHour}:${arabicMinute} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const getStatusText = (status) => {
    return status === "Open" ? "مفتوح الآن" : "مغلق حالياً";
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive) return "bg-red-500 text-white";
    return status === "Open"
      ? "bg-green-500 text-white"
      : "bg-yellow-500 text-white";
  };

  const getStatusIcon = (status, isActive) => {
    if (!isActive) return <FaTimesCircle className="text-red-500" />;
    return status === "Open" ? (
      <FaCheckCircle className="text-green-500" />
    ) : (
      <FaTimesCircle className="text-yellow-500" />
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return formatTimeTo12HourArabic(timeString.substring(0, 5));
  };

  const getPhoneTypeArabic = (type) => {
    switch (type) {
      case "Mobile":
        return "موبايل";
      case "Landline":
        return "أرضي";
      case "Other":
        return "آخر";
      default:
        return type;
    }
  };

  const handleViewOnMap = (branch) => {
    setSelectedBranch(branch);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
  };

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBranch(null);
  };

  const toggleReviews = (branchId) => {
    setShowReviews((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar key={i} className="text-yellow-500 text-sm sm:text-base" />,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className="text-yellow-500 text-sm sm:text-base"
          />,
        );
      } else {
        stars.push(
          <FaRegStar key={i} className="text-gray-300 text-sm sm:text-base" />,
        );
      }
    }
    return stars;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    const cleanPath = imagePath.trim();

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    const baseUrl = "https://restaurant-template.runasp.net/";

    const normalizedPath = cleanPath.startsWith("/")
      ? cleanPath.substring(1)
      : cleanPath;

    return `${baseUrl}${normalizedPath}`;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: `linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)`,
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p
            className="text-base sm:text-lg font-semibold"
            style={{ color: "#2E3E88" }}
          >
            جارٍ تحميل الفروع...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background: `linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)`,
        backgroundAttachment: "fixed",
      }}
      dir="rtl"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع - في الشمال (اليسار) */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:left-8 bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={16}
                className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-6 sm:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 sm:mb-6">
                <FaBuilding className="text-white text-2xl sm:text-3xl md:text-4xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                فروعنا
              </h1>
              <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
                اكتشف فروعنا القريبة منك وتعرّف على تفاصيل كل فرع وتقييمات
                العملاء
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 -mt-6 sm:-mt-8 md:-mt-10 relative z-10">
        {/* Content Container */}
        <div className="w-full">
          {/* Branches List */}
          {branches.length === 0 ? (
            <div className="w-full">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                  <FaBuilding
                    className="text-2xl sm:text-3xl md:text-4xl"
                    style={{ color: "#2E3E88" }}
                  />
                </div>
                <h3
                  className="text-xl sm:text-2xl md:text-2xl font-bold mb-2 sm:mb-3"
                  style={{ color: "#2E3E88" }}
                >
                  لا توجد فروع حتى الآن
                </h3>
                <p
                  className="text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto"
                  style={{ color: "#32B9CC" }}
                >
                  لا توجد فروع متاحة حالياً
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleBranchClick(branch)}
                  className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                  style={{
                    borderTop: branch.isActive
                      ? "4px solid #2E3E88"
                      : "4px solid #FF6B6B",
                  }}
                >
                  <div className="p-4 sm:p-5 md:p-6 flex-grow">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                          <FaBuilding
                            className="text-base sm:text-lg md:text-xl"
                            style={{ color: "#2E3E88" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className="font-bold text-sm sm:text-base md:text-lg truncate"
                            style={{ color: "#2E3E88" }}
                          >
                            {branch.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <div
                              className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(branch.status, branch.isActive)}`}
                            >
                              {getStatusText(branch.status)}
                            </div>
                            {branch.isActive && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white">
                                نشط
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-1 sm:p-2 rounded-full flex-shrink-0"
                        style={{ color: "#2E3E88" }}
                      >
                        <FaEye className="text-sm sm:text-base" />
                      </div>
                    </div>

                    {/* Branch Details */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <FaCity
                          className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm text-gray-500">
                            المدينة
                          </span>
                          <p className="font-medium text-sm sm:text-base truncate">
                            {branch.city?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3">
                        <FaMapMarkerAlt
                          className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm text-gray-500">
                            العنوان
                          </span>
                          <p className="font-medium text-gray-700 text-sm sm:text-base line-clamp-2">
                            {branch.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3">
                        <FaClock
                          className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm text-gray-500">
                            ساعات العمل
                          </span>
                          <p className="font-medium text-sm sm:text-base">
                            {formatTime(branch.openingTime)} -{" "}
                            {formatTime(branch.closingTime)}
                          </p>
                        </div>
                      </div>

                      {branch.rating_Avgarage > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center gap-1">
                            {renderStars(branch.rating_Avgarage)}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600">
                            ({branch.rating_Avgarage.toFixed(1)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                    <button
                      className="w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                        color: "white",
                      }}
                    >
                      <FaEye className="text-xs sm:text-sm" />
                      عرض التفاصيل
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Branch Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2"
            >
              {/* Modal Header */}
              <div
                className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaBuilding className="text-white text-base sm:text-lg md:text-xl" />
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white truncate max-w-[70vw] sm:max-w-none">
                    تفاصيل فرع {selectedBranch.name}
                  </h3>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors flex-shrink-0"
                >
                  <FaTimes size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Branch Status */}
                    <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center">
                          <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">
                            حالة الفرع
                          </p>
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            {getStatusIcon(
                              selectedBranch.status,
                              selectedBranch.isActive,
                            )}
                            <div
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(selectedBranch.status, selectedBranch.isActive)}`}
                            >
                              {selectedBranch.isActive ? "نشط" : "غير نشط"}
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">
                            ساعات العمل
                          </p>
                          <p className="font-bold text-gray-800 text-sm sm:text-base md:text-lg">
                            {formatTime(selectedBranch.openingTime)} -{" "}
                            {formatTime(selectedBranch.closingTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2 sm:space-y-3">
                      <h4
                        className="text-base sm:text-lg font-bold flex items-center gap-1 sm:gap-2"
                        style={{ color: "#2E3E88" }}
                      >
                        <FaMapMarkerAlt className="text-sm sm:text-base" />
                        العنوان
                      </h4>
                      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <p className="text-gray-700 text-sm sm:text-base">
                          {selectedBranch.address}
                        </p>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                          <FaCity
                            className="text-sm sm:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                          <span className="text-gray-600 text-sm sm:text-base">
                            {selectedBranch.city?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4
                        className="text-base sm:text-lg font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        معلومات التواصل
                      </h4>

                      {/* Email */}
                      {selectedBranch.email && (
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 flex-shrink-0">
                            <FaEnvelope
                              className="text-base sm:text-lg md:text-xl"
                              style={{ color: "#2E3E88" }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">
                              البريد الإلكتروني
                            </p>
                            <p className="font-medium text-gray-700 text-sm sm:text-base truncate">
                              {selectedBranch.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Phone Numbers */}
                      {selectedBranch.phoneNumbers &&
                        selectedBranch.phoneNumbers.length > 0 && (
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 flex-shrink-0">
                                <FaPhone
                                  className="text-base sm:text-lg md:text-xl"
                                  style={{ color: "#2E3E88" }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                                  أرقام الهاتف
                                </p>
                                <div className="space-y-1 sm:space-y-2">
                                  {selectedBranch.phoneNumbers.map(
                                    (phone, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3"
                                      >
                                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                          <span className="font-medium text-gray-700 text-sm sm:text-base truncate">
                                            {phone.phone}
                                          </span>
                                          <span className="text-xs bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                                            {getPhoneTypeArabic(phone.type)}
                                          </span>
                                        </div>
                                        {phone.isWhatsapp && (
                                          <FaWhatsapp className="text-green-500 text-base sm:text-lg md:text-xl flex-shrink-0" />
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Right Column - Map & Rating */}
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Rating */}
                    {selectedBranch.rating_Avgarage > 0 && (
                      <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                        <h4
                          className="text-base sm:text-lg font-bold mb-2 sm:mb-3"
                          style={{ color: "#2E3E88" }}
                        >
                          التقييم العام
                        </h4>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                          {renderStars(selectedBranch.rating_Avgarage)}
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">
                          {selectedBranch.rating_Avgarage.toFixed(1)} / 5
                        </p>
                      </div>
                    )}

                    {/* Map Button */}
                    {selectedBranch.locationUrl && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          closeDetailsModal();
                          handleViewOnMap(selectedBranch);
                        }}
                        className="w-full py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                      >
                        <FaMap className="text-xs sm:text-sm" />
                        <span>عرض الموقع على الخريطة</span>
                        <FaExternalLinkAlt className="text-xs sm:text-sm" />
                      </motion.button>
                    )}

                    {/* Reviews Section */}
                    {selectedBranch.reviews &&
                      selectedBranch.reviews.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                          <div
                            className="flex items-center justify-between cursor-pointer p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={() => toggleReviews(selectedBranch.id)}
                          >
                            <h4
                              className="text-base sm:text-lg font-bold flex items-center gap-1 sm:gap-2"
                              style={{ color: "#2E3E88" }}
                            >
                              <FaCommentAlt className="text-sm sm:text-base" />
                              <span className="truncate">تقييمات العملاء</span>
                              <span className="text-xs sm:text-sm font-normal text-gray-600 flex-shrink-0">
                                ({selectedBranch.reviews.length})
                              </span>
                            </h4>
                            <div>
                              {showReviews[selectedBranch.id] ? (
                                <FaChevronUp
                                  className="text-sm sm:text-base"
                                  style={{ color: "#2E3E88" }}
                                />
                              ) : (
                                <FaChevronDown
                                  className="text-sm sm:text-base"
                                  style={{ color: "#2E3E88" }}
                                />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {showReviews[selectedBranch.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 sm:space-y-3"
                              >
                                {selectedBranch.reviews.map((review, index) => (
                                  <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gray-50 rounded-lg sm:rounded-xl p-3"
                                  >
                                    {/* User Info */}
                                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                                      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                          {review.user?.imageUrl ? (
                                            <img
                                              src={getImageUrl(
                                                review.user.imageUrl,
                                              )}
                                              alt={`${review.user?.firstName || ""} ${review.user?.lastName || ""}`}
                                              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "";
                                                e.target.className = "hidden";
                                              }}
                                            />
                                          ) : (
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] flex items-center justify-center">
                                              <FaUserCircle className="text-white text-sm sm:text-base" />
                                            </div>
                                          )}
                                        </div>

                                        {/* User Details */}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                            {review.user?.firstName}{" "}
                                            {review.user?.lastName}
                                          </p>
                                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                                            {review.user?.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex-shrink-0">
                                        <div
                                          className="flex items-center gap-0.5"
                                          dir="ltr"
                                        >
                                          {renderStars(review.rating)}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                      <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3">
                                        <div className="flex items-start gap-1 sm:gap-2">
                                          <FaCommentAlt
                                            className="mt-0.5 flex-shrink-0 text-xs sm:text-sm"
                                            style={{ color: "#2E3E88" }}
                                          />
                                          <p className="text-xs sm:text-sm text-gray-700">
                                            {review.comment}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && selectedBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2"
            >
              {/* Modal Header */}
              <div
                className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaGlobeAmericas className="text-white text-base sm:text-lg md:text-xl" />
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white truncate max-w-[70vw] sm:max-w-none">
                    موقع فرع {selectedBranch.name}
                  </h3>
                </div>
                <button
                  onClick={closeMapModal}
                  className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors flex-shrink-0"
                >
                  <FaTimes size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <p className="text-gray-600 text-sm sm:text-base">
                    {selectedBranch.address}
                  </p>
                </div>

                {selectedBranch.locationUrl ? (
                  <div className="rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-gray-200">
                    <iframe
                      src={selectedBranch.locationUrl}
                      width="100%"
                      height="300"
                      className="w-full"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`خريطة فرع ${selectedBranch.name}`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 sm:h-56 md:h-64 bg-gradient-to-r from-[#f0f8ff] to-[#e0f7fa] rounded-lg sm:rounded-xl md:rounded-2xl">
                    <div className="text-center">
                      <FaMap className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">
                        رابط الخريطة غير متوفر لهذا الفرع
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Branches;
