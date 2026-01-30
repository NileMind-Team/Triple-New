import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaShoppingCart,
  FaTruck,
  FaStore,
  FaPrint,
  FaFilter,
  FaListAlt,
  FaUser,
  FaMapMarkerAlt,
  FaBox,
  FaTimes,
  FaEye,
  FaClipboardList,
  FaMoneyBill,
  FaCheckCircle,
  FaClock,
  FaUtensils,
  FaMotorcycle,
  FaCheck,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaCalendarDay,
  FaBuilding,
  FaChevronDown,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import axiosInstance from "../api/axiosInstance";

const showSalesMobileSuccessToast = (message) => {
  if (window.innerWidth < 768) {
    toast.success(message, {
      position: "top-right",
      autoClose: 2500,
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
    });
  }
};

const showSalesMobileAlertToast = (message, type = "info") => {
  if (window.innerWidth < 768) {
    const toastFunc =
      type === "error"
        ? toast.error
        : type === "warning"
          ? toast.warning
          : toast.info;
    toastFunc(message, {
      position: "top-right",
      autoClose: 2500,
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
    });
  }
};

const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/Orders/GetById/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

const formatCurrencyArabic = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "٠٫٠٠ ج.م";
  }

  const toArabicNumbers = (num) => {
    if (num === null || num === undefined) return "٠";
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
  };

  const numberStr = Number(amount).toFixed(2);
  const [wholePart, decimalPart] = numberStr.split(".");
  const arabicWhole = toArabicNumbers(wholePart);
  const arabicDecimal = toArabicNumbers(decimalPart);
  const withCommas = arabicWhole.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");

  return `${withCommas}.${arabicDecimal} ج.م`;
};

const formatNumberArabic = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "٠";
  }

  const toArabicNumbers = (num) => {
    if (num === null || num === undefined) return "٠";
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
  };

  const num = Math.round(number);
  const arabicNum = toArabicNumbers(num);

  return arabicNum.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
};

const convertToLocalISO = (date, time) => {
  if (!date) return null;

  try {
    const dateStr = format(date, "yyyy-MM-dd");
    const [hours, minutes] = time.split(":");

    const localDate = new Date(
      `${dateStr}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`,
    );

    const localISOString = localDate.toISOString();

    return localISOString;
  } catch (error) {
    console.error("Error converting to ISO:", error);
    return null;
  }
};

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const BASE_URL = "https://restaurant-template.runasp.net";

  const getUserFullName = () => {
    if (!order.user) return "غير معروف";
    return `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim();
  };

  const getPhoneNumber = () => {
    if (order.location?.phoneNumber) {
      return order.location.phoneNumber;
    }
    if (order.user?.phoneNumber) {
      return order.user.phoneNumber;
    }
    return "غير متوفر";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock style={{ color: "#32B9CC" }} />;
      case "Confirmed":
        return <FaCheckCircle style={{ color: "#2E3E88" }} />;
      case "Preparing":
        return <FaUtensils style={{ color: "#FF8E53" }} />;
      case "OutForDelivery":
        return <FaMotorcycle style={{ color: "#9C27B0" }} />;
      case "Delivered":
        return <FaCheck style={{ color: "#4CAF50" }} />;
      case "Cancelled":
        return <FaBan style={{ color: "#FF6B6B" }} />;
      default:
        return <FaClock style={{ color: "#9E9E9E" }} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "قيد الانتظار";
      case "Confirmed":
        return "تم التأكيد";
      case "Preparing":
        return "قيد التحضير";
      case "OutForDelivery":
        return "قيد التوصيل";
      case "Delivered":
        return "تم التوصيل";
      case "Cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#32B9CC";
      case "Confirmed":
        return "#2E3E88";
      case "Preparing":
        return "#FF8E53";
      case "OutForDelivery":
        return "#9C27B0";
      case "Delivered":
        return "#4CAF50";
      case "Cancelled":
        return "#FF6B6B";
      default:
        return "#9E9E9E";
    }
  };

  const calculateItemFinalPrice = (item) => {
    if (!item) return 0;

    const basePrice = item.menuItem?.basePrice || item.basePriceAtOrder || 0;
    const itemDiscount = item.totalDiscount || 0;
    const optionsTotal =
      item.options?.reduce(
        (sum, option) => sum + (option.optionPriceAtOrder || 0),
        0,
      ) || 0;

    const itemPriceBeforeDiscount =
      (basePrice + optionsTotal) * (item.quantity || 1);
    const itemFinalPrice = itemPriceBeforeDiscount - itemDiscount;

    return Math.max(itemFinalPrice, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl w-full max-w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[90vh] overflow-hidden shadow-2xl mx-2"
      >
        {/* Header */}
        <div
          className="p-4 sm:p-6 relative"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaClipboardList className="text-white text-lg sm:text-xl lg:text-2xl" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">
                  تفاصيل الطلب #{order.orderNumber}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-white text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-70px)] sm:max-h-[calc(90vh-80px)] p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Customer Info */}
            <div
              className="rounded-lg sm:rounded-xl p-3 sm:p-4"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                border: "1px solid #2E3E8820",
              }}
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FaUser
                  className="text-sm sm:text-base"
                  style={{ color: "#2E3E88" }}
                />
                <h3
                  className="font-bold text-sm sm:text-base"
                  style={{ color: "#2E3E88" }}
                >
                  معلومات العميل
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    اسم العميل:
                  </span>
                  <span
                    className="font-medium text-xs sm:text-sm"
                    style={{ color: "#2E3E88" }}
                  >
                    {getUserFullName()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    رقم الهاتف:
                  </span>
                  <span
                    className="font-medium text-xs sm:text-sm"
                    style={{ color: "#32B9CC" }}
                  >
                    {getPhoneNumber()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div
              className="rounded-lg sm:rounded-xl p-3 sm:p-4"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                border: "1px solid #2E3E8820",
              }}
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FaMapMarkerAlt
                  className="text-sm sm:text-base"
                  style={{ color: "#2E3E88" }}
                />
                <h3
                  className="font-bold text-sm sm:text-base"
                  style={{ color: "#2E3E88" }}
                >
                  معلومات التوصيل
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    نوع الطلب:
                  </span>
                  <span
                    className="font-medium text-xs sm:text-sm"
                    style={{
                      color: order.deliveryFee?.fee > 0 ? "#2E3E88" : "#32B9CC",
                    }}
                  >
                    {order.deliveryFee?.areaName ||
                      (order.deliveryFee?.fee > 0 ? "توصيل" : "استلام")}
                  </span>
                </div>
                {order.location?.streetName && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      العنوان:
                    </span>
                    <span
                      className="font-medium text-xs sm:text-sm text-right"
                      style={{ color: "#2E3E88" }}
                    >
                      {order.location.streetName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    تكلفة التوصيل:
                  </span>
                  <span
                    className="font-medium text-xs sm:text-sm"
                    style={{ color: "#32B9CC" }}
                  >
                    {order.deliveryCost?.toFixed(2) || "0.00"} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FaBox
                className="text-sm sm:text-base"
                style={{ color: "#2E3E88" }}
              />
              <h3
                className="font-bold text-sm sm:text-base"
                style={{ color: "#2E3E88" }}
              >
                المنتجات المطلوبة
              </h3>
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, index) => {
                  const itemFinalPrice = calculateItemFinalPrice(item);
                  const basePrice =
                    item.menuItem?.basePrice || item.basePriceAtOrder || 0;
                  const isPriceBasedOnRequest = basePrice === 0;

                  const itemPriceWithOptions = (
                    ((item.menuItem?.basePrice || 0) +
                      (item.options?.reduce(
                        (sum, option) => sum + (option.optionPriceAtOrder || 0),
                        0,
                      ) || 0)) *
                    (item.quantity || 1)
                  ).toFixed(2);

                  return (
                    <div
                      key={index}
                      className="bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200"
                      style={{
                        border: "1px solid #2E3E8820",
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {(item.menuItem?.imageUrl ||
                          item.menuItemImageUrlSnapshotAtOrder) && (
                          <div>
                            <div className="relative w-full h-40 sm:h-48 md:h-40 rounded-lg overflow-hidden">
                              <img
                                src={`${BASE_URL}/${
                                  item.menuItem?.imageUrl ||
                                  item.menuItemImageUrlSnapshotAtOrder
                                }`}
                                alt={
                                  item.menuItem?.name ||
                                  item.menuItemNameSnapshotAtOrder ||
                                  "صورة المنتج"
                                }
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="mb-2">
                            <p
                              className="font-bold text-sm sm:text-base lg:text-lg mb-1"
                              style={{ color: "#2E3E88" }}
                            >
                              {item.menuItem?.name ||
                                item.menuItemNameSnapshotAtOrder ||
                                "منتج غير معروف"}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                              {item.menuItem?.description?.substring(0, 80) ||
                                item.menuItemDescriptionAtOrder?.substring(
                                  0,
                                  80,
                                ) ||
                                "لا يوجد وصف"}
                              {(item.menuItem?.description?.length > 80 ||
                                item.menuItemDescriptionAtOrder?.length > 80) &&
                                "..."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 mb-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">
                                الكمية
                              </p>
                              <p
                                className="font-bold text-sm sm:text-base"
                                style={{ color: "#2E3E88" }}
                              >
                                {item.quantity || 1}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">
                                السعر الأساسي
                              </p>
                              <p
                                className="font-bold text-sm sm:text-base"
                                style={{ color: "#4CAF50" }}
                              >
                                {isPriceBasedOnRequest ? (
                                  <span
                                    style={{
                                      color: "#FF8E53",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    السعر حسب الطلب
                                  </span>
                                ) : (
                                  `${basePrice.toFixed(2)} ج.م`
                                )}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">
                                السعر
                              </p>
                              <p
                                className="font-bold text-sm sm:text-base"
                                style={{ color: "#2E3E88" }}
                              >
                                {itemPriceWithOptions} ج.م
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">
                                خصم المنتج
                              </p>
                              <p
                                className="font-bold text-sm sm:text-base"
                                style={{ color: "#FF6B6B" }}
                              >
                                {item.totalDiscount?.toFixed(2) || "0.00"} ج.م
                              </p>
                            </div>
                          </div>

                          {item.options && item.options.length > 0 && (
                            <div
                              className="mt-3 rounded-lg p-2 sm:p-3 mb-3"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                              }}
                            >
                              <p
                                className="text-xs sm:text-sm font-medium mb-2"
                                style={{ color: "#2E3E88" }}
                              >
                                الاضافات المختارة:
                              </p>
                              <div className="space-y-2">
                                {item.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between items-center bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-md border text-xs sm:text-sm"
                                    style={{
                                      border: "1px solid #2E3E8820",
                                    }}
                                  >
                                    <span style={{ color: "#2E3E88" }}>
                                      {option.optionNameAtOrder ||
                                        `إضافة ${optionIndex + 1}`}
                                    </span>
                                    <span
                                      className="font-medium"
                                      style={{ color: "#4CAF50" }}
                                    >
                                      +
                                      {option.optionPriceAtOrder?.toFixed(2) ||
                                        "0.00"}{" "}
                                      ج.م
                                    </span>
                                  </div>
                                ))}
                                <div
                                  className="flex justify-between items-center pt-2 border-t text-xs sm:text-sm"
                                  style={{ borderColor: "#2E3E8820" }}
                                >
                                  <span
                                    className="font-medium"
                                    style={{ color: "#2E3E88" }}
                                  >
                                    إجمالي الاضافات:
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: "#2E3E88" }}
                                  >
                                    {item.options
                                      .reduce(
                                        (sum, option) =>
                                          sum +
                                          (option.optionPriceAtOrder || 0),
                                        0,
                                      )
                                      .toFixed(2)}{" "}
                                    ج.م
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div
                            className="pt-3 border-t"
                            style={{ borderColor: "#2E3E8820" }}
                          >
                            <div className="text-center">
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                الإجمالي النهائي للمنتج
                              </p>
                              <p
                                className="text-base sm:text-lg font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {itemFinalPrice.toFixed(2)} ج.م
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="text-center py-6 sm:py-8 rounded-lg sm:rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  border: "1px solid #2E3E8820",
                }}
              >
                <FaBox
                  className="mx-auto text-2xl sm:text-3xl mb-2 sm:mb-3"
                  style={{ color: "#2E3E88" }}
                />
                <p
                  className="text-sm sm:text-base"
                  style={{ color: "#32B9CC" }}
                >
                  لا توجد منتجات في هذا الطلب
                </p>
              </div>
            )}
          </div>

          {/* Totals Section */}
          <div
            className="rounded-lg sm:rounded-xl p-3 sm:p-4 border mb-4 sm:mb-6"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              border: "1px solid #2E3E8820",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  الإجمالي بعد الخصم
                </p>
                <p
                  className="text-base sm:text-lg lg:text-xl font-bold"
                  style={{ color: "#2E3E88" }}
                >
                  {order.totalWithoutFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  إجمالي الخصم
                </p>
                <p
                  className="text-base sm:text-lg lg:text-xl font-bold"
                  style={{ color: "#FF6B6B" }}
                >
                  {order.totalDiscount?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  المبلغ النهائي
                </p>
                <p
                  className="text-base sm:text-lg lg:text-xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {order.totalWithFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div
            className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              border: "1px solid #2E3E8820",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  حالة الطلب
                </p>
                <p
                  className="text-sm sm:text-base lg:text-lg font-bold"
                  style={{ color: getStatusColor(order.status) }}
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                </p>
              </div>
            </div>
            {order.notes && (
              <div
                className="mt-3 p-2 sm:p-3 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                }}
              >
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  ملاحظات:
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "#2E3E88" }}>
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TimeDateSalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchesDropdownOpen, setBranchesDropdownOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    setSummary({
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange: "لم يتم تحديد فترة",
    });

    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/Branches/GetList");
      if (response.data && Array.isArray(response.data)) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      showSalesMobileAlertToast("فشل في تحميل قائمة الفروع", "error");
    }
  };

  const fetchReportData = async (isFilterAction = false, page = 1) => {
    if (!startDate || !endDate) {
      if (isFilterAction) {
        showSalesMobileAlertToast(
          "يرجى تحديد تاريخ البداية والنهاية أولاً",
          "warning",
        );
      }
      return;
    }

    if (startDate > endDate) {
      if (isFilterAction) {
        showSalesMobileAlertToast(
          "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
          "error",
        );
      }
      return;
    }

    setLoading(true);
    try {
      const startDateTimeISO = convertToLocalISO(startDate, startTime);
      const endDateTimeISO = convertToLocalISO(endDate, endTime);

      if (!startDateTimeISO || !endDateTimeISO) {
        throw new Error("خطأ في توليد التواريخ");
      }

      const rangeValue = `${startDateTimeISO},${endDateTimeISO}`;

      const apiPageNumber = page;

      const requestBody = {
        pageNumber: apiPageNumber,
        pageSize: pageSize,
        filters: [
          {
            propertyName: "createdAt",
            propertyValue: rangeValue,
            range: true,
          },
        ],
      };

      if (selectedBranch) {
        requestBody.filters.push({
          propertyName: "branchId",
          propertyValue: selectedBranch.id.toString(),
        });
      }

      const response = await axiosInstance.post(
        "/api/Orders/GetAllWithPagination",
        requestBody,
      );

      const responseData = response.data || {};
      const orders = responseData.data || responseData || [];
      const totalItems = responseData.totalItems || 0;
      const totalPages = responseData.totalPages || 1;
      const totalPriceFromResponse = responseData.totalPrice || 0;
      const deliveryOrdersFromResponse = responseData.deliveryOrders || 0;
      const pickupOrdersFromResponse = responseData.pickupOrders || 0;

      setReportData(orders);
      setCurrentPage(page);
      setTotalPages(totalPages);
      setTotalItems(totalItems);
      setTotalPrice(totalPriceFromResponse);

      const totalSales = totalPriceFromResponse;
      const totalOrders = totalItems;

      const productSales = {};
      orders.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            const productName =
              item.menuItem?.name ||
              item.menuItemNameSnapshotAtOrder ||
              "منتج غير معروف";
            if (!productSales[productName]) {
              productSales[productName] = {
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[productName].quantity += item.quantity || 1;
            productSales[productName].revenue += item.totalPrice || 0;
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const summaryData = {
        totalSales,
        totalOrders,
        deliveryOrders: deliveryOrdersFromResponse,
        pickupOrders: pickupOrdersFromResponse,
        topProducts,
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ${startTime} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )} ${endTime}`
            : "لم يتم تحديد فترة",
        branch: selectedBranch ? selectedBranch.name : "جميع الفروع",
      };

      setSummary(summaryData);

      if (isFilterAction) {
        setTimeout(() => {
          showSalesMobileSuccessToast("تم تطبيق الفلترة بنجاح");
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);

      let errorMessage;
      if (error.message === "يرجى تحديد تاريخ البداية والنهاية") {
        errorMessage = "يرجى تحديد تاريخ البداية والنهاية";
      } else if (error.response?.status === 404) {
        errorMessage = "لا توجد بيانات في الفترة المحددة";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "بيانات الطلب غير صحيحة";
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = "فشل في تحميل بيانات التقرير";
      }

      showSalesMobileAlertToast(errorMessage, "info");

      setReportData([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
      setTotalPrice(0);

      setSummary({
        totalSales: 0,
        totalOrders: 0,
        deliveryOrders: 0,
        pickupOrders: 0,
        topProducts: [],
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ${startTime} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )} ${endTime}`
            : "لم يتم تحديد فترة",
        branch: selectedBranch ? selectedBranch.name : "جميع الفروع",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrdersForPrint = async () => {
    if (!startDate || !endDate) {
      return [];
    }

    try {
      const startDateTimeISO = convertToLocalISO(startDate, startTime);
      const endDateTimeISO = convertToLocalISO(endDate, endTime);

      if (!startDateTimeISO || !endDateTimeISO) {
        throw new Error("خطأ في توليد التواريخ");
      }

      const rangeValue = `${startDateTimeISO},${endDateTimeISO}`;

      const requestBody = {
        pageNumber: 1,
        pageSize: totalItems,
        filters: [
          {
            propertyName: "createdAt",
            propertyValue: rangeValue,
            range: true,
          },
        ],
      };

      if (selectedBranch) {
        requestBody.filters.push({
          propertyName: "branchId",
          propertyValue: selectedBranch.id.toString(),
        });
      }

      const response = await axiosInstance.post(
        "/api/Orders/GetAllWithPagination",
        requestBody,
      );

      const responseData = response.data || {};
      return responseData.data || [];
    } catch (error) {
      console.error("Error fetching all orders for print:", error);
      return [];
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const details = await fetchOrderDetails(orderId);
      setOrderDetails(details);
      setSelectedOrder(details);
    } catch (error) {
      showSalesMobileAlertToast("فشل في تحميل تفاصيل الطلب", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const getCustomerName = (order) => {
    if (!order.user) return "غير معروف";
    return `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim();
  };

  const getCustomerPhone = (order) => {
    if (order.location?.phoneNumber) {
      return order.location.phoneNumber;
    }
    if (order.user?.phoneNumber) {
      return order.user.phoneNumber;
    }
    return "غير متوفر";
  };

  const getCustomerCity = (order) => {
    if (order.location?.city?.name) {
      return order.location.city.name;
    }
    return "لا يوجد";
  };

  const getBranchName = (order) => {
    if (order.branch?.name) {
      return order.branch.name;
    }
    return "غير محدد";
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00 ج.م";
    }
    return `${Number(amount).toLocaleString("ar-EG")} ج.م`;
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      if (!startDate || !endDate) {
        showSalesMobileAlertToast(
          "يرجى تحديد تاريخ البداية والنهاية أولاً",
          "warning",
        );
        setIsPrinting(false);
        return;
      }

      const ordersToPrint = await fetchAllOrdersForPrint();

      if (ordersToPrint.length === 0) {
        showSalesMobileAlertToast(
          "لا توجد بيانات لعرضها في التقرير",
          "warning",
        );
        setIsPrinting(false);
        return;
      }

      const totalSalesPrint = totalPrice;
      const totalOrdersPrint = totalItems;

      const response = await axiosInstance.post(
        "/api/Orders/GetAllWithPagination",
        {
          pageNumber: 1,
          pageSize: totalItems,
          filters: [
            {
              propertyName: "createdAt",
              propertyValue: `${convertToLocalISO(startDate, startTime)},${convertToLocalISO(endDate, endTime)}`,
              range: true,
            },
          ],
        },
      );

      const responseData = response.data || {};
      const deliveryOrdersPrint = responseData.deliveryOrders || 0;
      const pickupOrdersPrint = responseData.pickupOrders || 0;

      const productSalesPrint = {};
      ordersToPrint.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            const productName =
              item.menuItem?.name ||
              item.menuItemNameSnapshotAtOrder ||
              "منتج غير معروف";
            if (!productSalesPrint[productName]) {
              productSalesPrint[productName] = {
                quantity: 0,
                revenue: 0,
              };
            }
            productSalesPrint[productName].quantity += item.quantity || 1;
            productSalesPrint[productName].revenue += item.totalPrice || 0;
          });
        }
      });

      const topProductsPrint = Object.entries(productSalesPrint)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const printSummary = {
        totalSales: totalSalesPrint,
        totalOrders: totalOrdersPrint,
        deliveryOrders: deliveryOrdersPrint,
        pickupOrders: pickupOrdersPrint,
        topProducts: topProductsPrint,
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ${startTime} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )} ${endTime}`
            : "لم يتم تحديد فترة",
        branch: selectedBranch ? selectedBranch.name : "جميع الفروع",
      };

      const toArabicNumbers = (num) => {
        if (num === null || num === undefined) return "٠";
        const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return num
          .toString()
          .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
      };

      const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير المبيعات بالوقت والتاريخ - Triple S</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    body {
      margin: 0; padding: 15px;
      font-family: 'Arial', sans-serif;
      background: white !important;
      color: black !important;
      direction: rtl;
      font-size: 15px;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  
  body {
    margin: 0; padding: 15px;
    font-family: 'Arial', sans-serif;
    background: white !important;
    color: black !important;
    direction: rtl;
    font-size: 11px;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }
  
  .print-header h1 {
    color: black !important;
    margin: 0 0 5px 0;
    font-size: 22px;
    font-weight: bold;
  }
  
  .print-header p {
    color: #666 !important;
    margin: 0;
    font-size: 14px;
  }
  
  .print-info {
    margin: 15px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: #f9f9f9;
  }
  
  .print-info div {
    margin: 5px 0;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 15px 0;
    text-align: center;
  }
  
  .stat-card {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    border-radius: 5px;
    padding: 8px;
  }
  
  .stat-card h3 {
    color: #666 !important;
    margin: 0 0 6px 0;
    font-size: 10px;
    font-weight: normal;
  }
  
  .stat-card p {
    color: black !important;
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 9px;
    table-layout: fixed;
  }
  
  .print-table th {
    background-color: #f0f0f0 !important;
    color: black !important;
    padding: 6px 3px;
    text-align: center;
    border: 1px solid #ccc !important;
    font-weight: bold;
    font-size: 9px;
  }
  
  .print-table td {
    padding: 5px 3px;
    border: 1px solid #ddd !important;
    text-align: center;
    color: black !important;
    font-size: 8px;
  }
  
  .print-table tr:nth-child(even) {
    background-color: #f9f9f9 !important;
  }
  
  .customer-name {
    font-weight: bold;
  }
  
  .order-type-delivery {
    color: #1d4ed8 !important;
  }
  
  .order-type-pickup {
    color: #059669 !important;
  }
  
  .total-amount {
    font-weight: bold;
  }
  
  .print-footer {
    margin-top: 20px;
    text-align: center;
    color: #666 !important;
    font-size: 9px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #666 !important;
  }
</style>
</head>
<body>

<div class="print-header">
  <h1>تقرير المبيعات بالوقت والتاريخ - Triple S</h1>
  <p>نظام إدارة المطاعم</p>
  <p>الفرع: ${printSummary.branch}</p>
</div>

<div class="print-info">
  <div>تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</div>
  <div>الفترة الزمنية: ${printSummary.dateRange}</div>
  <div>عدد السجلات: ${formatNumberArabic(ordersToPrint.length)}</div>
</div>

<div class="stats-container">
  <div class="stat-card">
    <h3>إجمالي المبيعات</h3>
    <p>${formatCurrencyArabic(printSummary.totalSales || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>إجمالي الطلبات</h3>
    <p>${formatNumberArabic(printSummary.totalOrders || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>طلبات التوصيل</h3>
    <p>${formatNumberArabic(printSummary.deliveryOrders || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>طلبات الاستلام</h3>
    <p>${formatNumberArabic(printSummary.pickupOrders || 0)}</p>
  </div>
</div>

${
  ordersToPrint.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد طلبات في الفترة المحددة</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="12%">رقم الطلب</th>
        <th width="15%">العميل</th>
        <th width="12%">الهاتف</th>
        <th width="12%">نوع الطلب</th>
        <th width="12%">المدينة</th>
        <th width="15%">الفرع</th>
        <th width="12%">المبلغ النهائي</th>
      </tr>
    </thead>
    <tbody>
      ${ordersToPrint
        .map((order, index) => {
          const userName = order.user
            ? `${order.user.firstName || ""} ${
                order.user.lastName || ""
              }`.trim()
            : "غير معروف";

          const phoneNumber = order.location?.phoneNumber
            ? order.location.phoneNumber
            : order.user?.phoneNumber || "غير متوفر";

          const cityName = order.location?.city?.name || "لا يوجد";
          const branchName = order.branch?.name || "غير محدد";

          const orderTypeClass = `order-type-${
            order.deliveryFee?.fee > 0 ? "delivery" : "pickup"
          }`;
          const orderNumberArabic = order.orderNumber
            ? order.orderNumber.replace(/\d/g, (d) => toArabicNumbers(d))
            : "";
          const phoneArabic = phoneNumber
            ? phoneNumber.replace(/\d/g, (d) => toArabicNumbers(d))
            : "غير متوفر";
          const cityArabic = cityName;
          const branchArabic = branchName;

          return `
          <tr>
            <td class="customer-name">${orderNumberArabic}</td>
            <td>${userName}</td>
            <td>${phoneArabic}</td>
            <td class="${orderTypeClass}">${
              order.deliveryFee?.fee > 0 ? "توصيل" : "استلام"
            }</td>
            <td>${cityArabic}</td>
            <td>${branchArabic}</td>
            <td class="total-amount">${formatCurrencyArabic(
              order.totalWithFee || 0,
            )}</td>
          </tr>
        `;
        })
        .join("")}
      <tr style="background-color: #f0f0f0 !important; font-weight: bold;">
        <td colspan="6" style="text-align: left; padding-right: 20px;">المجموع الكلي:</td>
        <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
          printSummary.totalSales || 0,
        )}</td>
      </tr>
    </tbody>
  </table>
`
}

${
  printSummary?.topProducts && printSummary.topProducts.length > 0
    ? `
<div style="margin-top: 30px;">
  <div style="text-align: center; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">
    <h2 style="margin: 0; font-size: 16px; color: black;">المنتجات الأكثر مبيعاً</h2>
  </div>
  <table class="print-table">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="45%">اسم المنتج</th>
        <th width="20%">الكمية</th>
        <th width="30%">الإيرادات</th>
      </tr>
    </thead>
    <tbody>
      ${printSummary.topProducts
        .map(
          (product, index) => `
        <tr>
          <td style="text-align: center;">${toArabicNumbers(index + 1)}</td>
          <td style="text-align: center;">${product.name}</td>
          <td style="text-align: center;">${formatNumberArabic(
            product.quantity,
          )}</td>
          <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
            product.revenue,
          )}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

<div class="print-footer">
  <p>تم الإنشاء في: ${format(new Date(), "yyyy/MM/dd HH:mm").replace(
    /\d/g,
    (d) => toArabicNumbers(d),
  )}</p>
  <p>الفرع: ${printSummary.branch}</p>
  <p>Triple S © ${toArabicNumbers(new Date().getFullYear())}</p>
</div>

</body>
</html>
          `;

      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      printFrame.style.position = "absolute";
      printFrame.style.top = "-9999px";
      printFrame.style.left = "-9999px";
      document.body.appendChild(printFrame);

      const printWindow = printFrame.contentWindow;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();

          setTimeout(() => {
            document.body.removeChild(printFrame);
            setIsPrinting(false);
          }, 1000);
        }, 500);
      };
    } catch (error) {
      console.error("Error in print process:", error);
      showSalesMobileAlertToast("فشل في تحميل بيانات الطباعة", "error");
      setIsPrinting(false);
    }
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchReportData(true, 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchReportData(false, pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchReportData(false, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      fetchReportData(false, currentPage + 1);
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setBranchesDropdownOpen(false);
  };

  const handleClearBranchFilter = () => {
    setSelectedBranch(null);
    setBranchesDropdownOpen(false);
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

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
            جارٍ تحميل التقرير...
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
          className="relative py-12 sm:py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-6 sm:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 sm:mb-6">
                <FaCalendarDay className="text-white text-3xl sm:text-4xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                تقارير المبيعات
              </h1>
              <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
                تحليل مفصل للمبيعات حسب الفترة الزمنية والفرع
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 -mt-8 sm:-mt-10 relative z-10">
        {/* Content Container */}
        <div className="w-full">
          {/* Date & Time Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <FaCalendar
                className="text-lg sm:text-xl"
                style={{ color: "#2E3E88" }}
              />
              <h3
                className="text-base sm:text-lg font-bold"
                style={{ color: "#2E3E88" }}
              >
                فلترة بالتاريخ والوقت
              </h3>
            </div>

            {/* Filter Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6"
              dir="rtl"
            >
              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  تاريخ من
                </label>
                <div className="relative">
                  <FaCalendarAlt
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-sm sm:text-base"
                    style={{ color: "#2E3E88" }}
                  />
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right text-sm sm:text-base"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                    locale="ar"
                    placeholderText="اختر تاريخ البداية"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  وقت من
                </label>
                <div className="relative">
                  <FaClock
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-sm sm:text-base"
                    style={{ color: "#2E3E88" }}
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right text-sm sm:text-base"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  تاريخ إلى
                </label>
                <div className="relative">
                  <FaCalendarAlt
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-sm sm:text-base"
                    style={{ color: "#2E3E88" }}
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right text-sm sm:text-base"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                    locale="ar"
                    placeholderText="اختر تاريخ النهاية"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  وقت إلى
                </label>
                <div className="relative">
                  <FaClock
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-sm sm:text-base"
                    style={{ color: "#2E3E88" }}
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right text-sm sm:text-base"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  الفرع
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setBranchesDropdownOpen(!branchesDropdownOpen)
                    }
                    className="w-full flex items-center justify-between border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all hover:border-[#2E3E88] group text-right text-sm sm:text-base"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FaBuilding
                        className="group-hover:scale-110 transition-transform text-sm sm:text-base"
                        style={{ color: "#2E3E88" }}
                      />
                      <span className="font-medium truncate">
                        {selectedBranch ? selectedBranch.name : "جميع الفروع"}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: branchesDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown style={{ color: "#2E3E88" }} />
                    </motion.div>
                  </button>

                  {branchesDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 mt-1 sm:mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                    >
                      <li
                        onClick={handleClearBranchFilter}
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-sm sm:text-base"
                      >
                        <span className="text-gray-700">جميع الفروع</span>
                      </li>
                      {branches.map((branch) => (
                        <li
                          key={branch.id}
                          onClick={() => handleBranchSelect(branch)}
                          className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-sm sm:text-base"
                        >
                          <span className="text-gray-700 truncate">
                            {branch.name}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </div>
            </div>

            {/* Filter and Print buttons */}
            <div className="border-t border-gray-100 pt-4 sm:pt-6">
              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                  style={{ color: "#2E3E88" }}
                >
                  إجراءات التقرير
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDateFilter}
                    disabled={!startDate || !endDate}
                    className={`px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                      startDate && endDate
                        ? "shadow-lg hover:shadow-xl cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    style={
                      startDate && endDate
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
                    <FaFilter />
                    تطبيق الفلترة
                  </motion.button>
                  {reportData && reportData.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                        isPrinting
                          ? "opacity-50 cursor-not-allowed"
                          : "shadow-lg hover:shadow-xl cursor-pointer"
                      }`}
                      style={
                        !isPrinting
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
                      {isPrinting ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 mr-2"
                            style={{ borderColor: "white" }}
                          ></div>
                          جاري الطباعة...
                        </>
                      ) : (
                        <>
                          <FaPrint />
                          طباعة
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              {/* Total Sales Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs sm:text-sm mb-1"
                      style={{ color: "#32B9CC" }}
                    >
                      إجمالي المبيعات
                    </p>
                    <p
                      className="text-lg sm:text-xl lg:text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {formatCurrency(summary.totalSales)}
                    </p>
                  </div>
                  <div
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaMoneyBill
                      className="text-xl sm:text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs sm:text-sm mb-1"
                      style={{ color: "#32B9CC" }}
                    >
                      إجمالي الطلبات
                    </p>
                    <p
                      className="text-lg sm:text-xl lg:text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {summary.totalOrders}
                    </p>
                  </div>
                  <div
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaShoppingCart
                      className="text-xl sm:text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Orders */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs sm:text-sm mb-1"
                      style={{ color: "#32B9CC" }}
                    >
                      طلبات التوصيل
                    </p>
                    <p
                      className="text-lg sm:text-xl lg:text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {summary.deliveryOrders}
                    </p>
                  </div>
                  <div
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaTruck
                      className="text-xl sm:text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Orders */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs sm:text-sm mb-1"
                      style={{ color: "#32B9CC" }}
                    >
                      طلبات الاستلام
                    </p>
                    <p
                      className="text-lg sm:text-xl lg:text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {summary.pickupOrders}
                    </p>
                  </div>
                  <div
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaStore
                      className="text-xl sm:text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Products Section */}
          {summary?.topProducts && summary.topProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <FaChartBar
                    className="text-lg sm:text-xl"
                    style={{ color: "#2E3E88" }}
                  />
                  <h3
                    className="text-base sm:text-lg font-bold"
                    style={{ color: "#2E3E88" }}
                  >
                    المنتجات الأكثر مبيعاً
                  </h3>
                </div>
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: "#32B9CC" }}
                >
                  أعلى 5 منتجات حسب الإيرادات
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {summary.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:shadow-md transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      border: "1px solid #2E3E8820",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p
                          className="font-medium text-sm sm:text-base"
                          style={{ color: "#2E3E88" }}
                        >
                          {product.name}
                        </p>
                        <p
                          className="text-xs sm:text-sm"
                          style={{ color: "#32B9CC" }}
                        >
                          {product.quantity} وحدة مباعة
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-sm sm:text-base"
                        style={{ color: "#2E3E88" }}
                      >
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Table */}
          {reportData && reportData.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl mb-4 sm:mb-6"
              >
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <FaListAlt
                        className="text-lg sm:text-xl"
                        style={{ color: "#2E3E88" }}
                      />
                      <h3
                        className="text-base sm:text-lg font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        تفاصيل الطلبات
                      </h3>
                    </div>
                    <div
                      className="text-xs sm:text-sm"
                      style={{ color: "#32B9CC" }}
                    >
                      إجمالي {totalItems} طلب • صفحة {currentPage} من{" "}
                      {totalPages} • الفرع: {summary?.branch || "جميع الفروع"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] sm:min-w-full">
                    <thead
                      className="border-b border-gray-100"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <tr>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          رقم الطلب
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          اسم العميل
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          رقم الهاتف
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          نوع الطلب
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          المدينة
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          الفرع
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          الإجمالي
                        </th>
                        <th
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center font-mono text-xs sm:text-sm font-bold"
                            style={{ color: "#2E3E88" }}
                          >
                            {order.orderNumber}
                          </td>
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm"
                            style={{ color: "#2E3E88" }}
                          >
                            {getCustomerName(order)}
                          </td>
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm"
                            style={{ color: "#32B9CC" }}
                          >
                            {getCustomerPhone(order)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <span
                              className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium"
                              style={
                                order.deliveryFee?.fee > 0
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                                      color: "#2E3E88",
                                    }
                                  : {
                                      background:
                                        "linear-gradient(135deg, #4CAF5010, #2E3E8810)",
                                      color: "#4CAF50",
                                    }
                              }
                            >
                              {order.deliveryFee?.fee > 0 ? (
                                <>
                                  <FaTruck className="text-xs" />
                                  <span className="hidden sm:inline">
                                    توصيل
                                  </span>
                                  <span className="sm:hidden">توص</span>
                                </>
                              ) : (
                                <>
                                  <FaStore className="text-xs" />
                                  <span className="hidden sm:inline">
                                    استلام
                                  </span>
                                  <span className="sm:hidden">است</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm"
                            style={{ color: "#2E3E88" }}
                          >
                            {getCustomerCity(order)}
                          </td>
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm"
                            style={{ color: "#32B9CC" }}
                          >
                            {getBranchName(order)}
                          </td>
                          <td
                            className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm"
                            style={{
                              background:
                                "linear-gradient(135deg, #2E3E88, #32B9CC)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {formatCurrency(order.totalWithFee)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewOrderDetails(order.id)}
                              disabled={loadingDetails}
                              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-300 mx-auto min-w-[80px] sm:min-w-[100px]"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                color: "white",
                              }}
                            >
                              {loadingDetails &&
                              selectedOrder?.id === order.id ? (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaEye className="text-xs sm:text-sm" />
                              )}
                              <span className="hidden sm:inline">
                                عرض التفاصيل
                              </span>
                              <span className="sm:hidden">عرض</span>
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot
                      className="border-t border-gray-100"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <tr>
                        <td
                          colSpan="6"
                          className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-xs sm:text-sm"
                          style={{ color: "#2E3E88" }}
                        >
                          المجموع الكلي:
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <span
                            className="text-base sm:text-lg lg:text-xl font-bold"
                            style={{
                              background:
                                "linear-gradient(135deg, #2E3E88, #32B9CC)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {formatCurrency(summary?.totalSales || 0)}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 sm:mt-8 flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <FaChevronRight
                        className="text-xs sm:text-sm md:text-base"
                        style={{ color: "#2E3E88" }}
                      />
                    </button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {getPaginationNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span
                              className="px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                              style={{ color: "#32B9CC" }}
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm ${
                                currentPage === pageNum
                                  ? "shadow-lg text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                              }`}
                              style={
                                currentPage === pageNum
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                    }
                                  : {
                                      color: "#2E3E88",
                                    }
                              }
                            >
                              {pageNum}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <FaChevronLeft
                        className="text-xs sm:text-sm md:text-base"
                        style={{ color: "#2E3E88" }}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {(!reportData || reportData.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                }}
              >
                <FaChartBar
                  className="text-2xl sm:text-3xl lg:text-4xl"
                  style={{ color: "#2E3E88" }}
                />
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3"
                style={{ color: "#2E3E88" }}
              >
                لا توجد بيانات لعرضها
              </h3>
              <p
                className="mb-4 sm:mb-6 max-w-md mx-auto px-2 text-sm sm:text-base"
                style={{ color: "#32B9CC" }}
              >
                {selectedBranch
                  ? `يرجى تحديد فترة زمنية وتطبيق الفلترة لعرض التقرير للفرع: ${selectedBranch.name}`
                  : "يرجى تحديد فترة زمنية وتطبيق الفلترة لعرض التقرير"}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={orderDetails || selectedOrder}
          onClose={handleCloseOrderDetails}
        />
      )}
    </div>
  );
};

export default TimeDateSalesReport;
