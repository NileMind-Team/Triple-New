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
  FaBuilding,
  FaChevronDown,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
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
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
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
        background:
          type === "error"
            ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
            : type === "warning"
              ? "linear-gradient(135deg, #FFA726, #FF9800)"
              : "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      },
    });
  }
};

const fetchBranches = async () => {
  try {
    const response = await axiosInstance.get("/api/Branches/GetAll");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};

const fetchAllOrdersForStats = async (startDate, endDate, branchId = null) => {
  try {
    if (!startDate || !endDate) {
      throw new Error("يرجى تحديد تاريخ البداية والنهاية");
    }

    const adjustedStartDate = subDays(startDate, 1);
    const startDateStr = format(adjustedStartDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");

    const startDateISO = `${startDateStr}T22:00:00.000Z`;
    const endDateISO = `${endDateStr}T21:59:59.999Z`;

    const params = {
      rangeStartUtc: startDateISO,
      rangeEndUtc: endDateISO,
      pageNumber: 1,
      pageSize: 1000,
    };

    if (branchId && branchId !== "all") {
      params.branchId = branchId;
    }

    const response = await axiosInstance.get("/api/Orders/GetPeriodReport", {
      params: params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching all orders for stats:", error);
    throw error;
  }
};

const fetchOrdersByDateRange = async (
  startDate,
  endDate,
  branchId = null,
  pageNumber = 1,
  pageSize = 10,
) => {
  try {
    if (!startDate || !endDate) {
      throw new Error("يرجى تحديد تاريخ البداية والنهاية");
    }

    const adjustedStartDate = subDays(startDate, 1);
    const startDateStr = format(adjustedStartDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");

    const startDateISO = `${startDateStr}T22:00:00.000Z`;
    const endDateISO = `${endDateStr}T21:59:59.999Z`;

    const params = {
      rangeStartUtc: startDateISO,
      rangeEndUtc: endDateISO,
      pageNumber: pageNumber,
      pageSize: pageSize,
    };

    if (branchId && branchId !== "all") {
      params.branchId = branchId;
    }

    const response = await axiosInstance.get("/api/Orders/GetPeriodReport", {
      params: params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
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

const calculateSummary = (allOrders, startDate, endDate, totalPrice = 0) => {
  if (!allOrders || allOrders.length === 0) {
    return {
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange:
        startDate && endDate
          ? `${format(startDate, "yyyy-MM-dd")} إلى ${format(
              endDate,
              "yyyy-MM-dd",
            )}`
          : "لم يتم تحديد فترة",
    };
  }

  const totalSales =
    totalPrice > 0
      ? totalPrice
      : allOrders.reduce((sum, order) => sum + (order.totalWithFee || 0), 0);

  const totalOrders = allOrders.length;

  const deliveryOrders = allOrders.filter(
    (order) => order.deliveryFee?.fee > 0,
  ).length;
  const pickupOrders = allOrders.filter(
    (order) => order.deliveryFee?.fee === 0,
  ).length;

  const productSales = {};
  allOrders.forEach((order) => {
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

  return {
    totalSales,
    totalOrders,
    deliveryOrders,
    pickupOrders,
    topProducts,
    dateRange:
      startDate && endDate
        ? `${format(startDate, "yyyy-MM-dd")} إلى ${format(
            endDate,
            "yyyy-MM-dd",
          )}`
        : "لم يتم تحديد فترة",
  };
};

const toArabicNumbers = (num) => {
  if (num === null || num === undefined) return "٠";

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
};

const formatCurrencyArabic = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "٠٫٠٠ ج.م";
  }

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

  const num = Math.round(number);
  const arabicNum = toArabicNumbers(num);

  return arabicNum.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div
          className="p-6 relative"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FaClipboardList className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  تفاصيل الطلب #{order.orderNumber}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                border: "1px solid #2E3E8820",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FaUser style={{ color: "#2E3E88" }} />
                <h3 className="font-bold" style={{ color: "#2E3E88" }}>
                  معلومات العميل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">اسم العميل:</span>
                  <span className="font-medium" style={{ color: "#2E3E88" }}>
                    {getUserFullName()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium" style={{ color: "#32B9CC" }}>
                    {getPhoneNumber()}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                border: "1px solid #2E3E8820",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt style={{ color: "#2E3E88" }} />
                <h3 className="font-bold" style={{ color: "#2E3E88" }}>
                  معلومات التوصيل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع الطلب:</span>
                  <span
                    className="font-medium"
                    style={{
                      color: order.deliveryFee?.fee > 0 ? "#2E3E88" : "#32B9CC",
                    }}
                  >
                    {order.deliveryFee?.areaName ||
                      (order.deliveryFee?.fee > 0 ? "توصيل" : "استلام")}
                  </span>
                </div>
                {order.location?.streetName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">العنوان:</span>
                    <span className="font-medium" style={{ color: "#2E3E88" }}>
                      {order.location.streetName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">تكلفة التوصيل:</span>
                  <span className="font-medium" style={{ color: "#32B9CC" }}>
                    {order.deliveryCost?.toFixed(2) || "0.00"} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBox style={{ color: "#2E3E88" }} />
              <h3 className="font-bold" style={{ color: "#2E3E88" }}>
                المنتجات المطلوبة
              </h3>
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
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
                      className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                      style={{
                        border: "1px solid #2E3E8820",
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {(item.menuItem?.imageUrl ||
                          item.menuItemImageUrlSnapshotAtOrder) && (
                          <div className="md:w-1/4">
                            <div className="relative w-full h-48 md:h-40 rounded-lg overflow-hidden">
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

                        <div
                          className={`${
                            item.menuItem?.imageUrl ||
                            item.menuItemImageUrlSnapshotAtOrder
                              ? "md:w-3/4"
                              : "w-full"
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                              <p
                                className="font-bold text-lg mb-1"
                                style={{ color: "#2E3E88" }}
                              >
                                {item.menuItem?.name ||
                                  item.menuItemNameSnapshotAtOrder ||
                                  "منتج غير معروف"}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.menuItem?.description?.substring(
                                  0,
                                  100,
                                ) ||
                                  item.menuItemDescriptionAtOrder?.substring(
                                    0,
                                    100,
                                  ) ||
                                  "لا يوجد وصف"}
                                {(item.menuItem?.description?.length > 100 ||
                                  item.menuItemDescriptionAtOrder?.length >
                                    100) &&
                                  "..."}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-gray-500 mb-1">
                                الكمية
                              </p>
                              <p
                                className="font-bold text-lg"
                                style={{ color: "#2E3E88" }}
                              >
                                {item.quantity || 1}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-gray-500 mb-1">
                                السعر الأساسي
                              </p>
                              <p
                                className="font-bold text-lg"
                                style={{ color: "#4CAF50" }}
                              >
                                {isPriceBasedOnRequest ? (
                                  <span style={{ color: "#FF8E53" }}>
                                    السعر حسب الطلب
                                  </span>
                                ) : (
                                  `${basePrice.toFixed(2)} ج.م`
                                )}
                              </p>
                            </div>
                          </div>

                          {item.options && item.options.length > 0 && (
                            <div
                              className="mt-4 rounded-lg p-3"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                              }}
                            >
                              <p
                                className="text-sm font-medium mb-2"
                                style={{ color: "#2E3E88" }}
                              >
                                الاضافات المختارة:
                              </p>
                              <div className="space-y-2">
                                {item.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between items-center bg-white px-3 py-2 rounded-md border"
                                    style={{
                                      border: "1px solid #2E3E8820",
                                    }}
                                  >
                                    <span
                                      className="text-sm"
                                      style={{ color: "#2E3E88" }}
                                    >
                                      {option.optionNameAtOrder ||
                                        `إضافة ${optionIndex + 1}`}
                                    </span>
                                    <span
                                      className="text-sm font-medium"
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
                                  className="flex justify-between items-center pt-2 border-t"
                                  style={{ borderColor: "#2E3E8820" }}
                                >
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color: "#2E3E88" }}
                                  >
                                    إجمالي الاضافات:
                                  </span>
                                  <span
                                    className="text-sm font-bold"
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
                            className="mt-4 pt-4 border-t"
                            style={{ borderColor: "#2E3E8820" }}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  السعر
                                </p>
                                <p
                                  className="text-sm font-bold"
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
                                  className="text-sm font-bold"
                                  style={{ color: "#FF6B6B" }}
                                >
                                  {item.totalDiscount?.toFixed(2) || "0.00"} ج.م
                                </p>
                              </div>

                              <div className="text-center col-span-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  الإجمالي النهائي للمنتج
                                </p>
                                <p
                                  className="text-lg font-bold"
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="text-center py-8 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  border: "1px solid #2E3E8820",
                }}
              >
                <FaBox
                  className="mx-auto text-3xl mb-3"
                  style={{ color: "#2E3E88" }}
                />
                <p style={{ color: "#32B9CC" }}>لا توجد منتجات في هذا الطلب</p>
              </div>
            )}
          </div>

          <div
            className="rounded-xl p-4 border mb-6"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              border: "1px solid #2E3E8820",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">الإجمالي بعد الخصم</p>
                <p className="text-xl font-bold" style={{ color: "#2E3E88" }}>
                  {order.totalWithoutFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">إجمالي الخصم</p>
                <p className="text-xl font-bold" style={{ color: "#FF6B6B" }}>
                  {order.totalDiscount?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">المبلغ النهائي</p>
                <p
                  className="text-xl font-bold"
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

          <div
            className="p-4 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              border: "1px solid #2E3E8820",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">حالة الطلب</p>
                <p
                  className="text-lg font-bold"
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
                className="mt-4 p-3 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                }}
              >
                <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                <p style={{ color: "#2E3E88" }}>{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SalesReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [allOrdersForStats, setAllOrdersForStats] = useState([]);
  const [totalPriceFromResponse, setTotalPriceFromResponse] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setSummary({
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange: "لم يتم تحديد فترة",
    });

    const loadBranches = async () => {
      try {
        const branchesData = await fetchBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error("Error loading branches:", error);
      }
    };

    loadBranches();
  }, []);

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
      const response = await fetchOrdersByDateRange(
        startDate,
        endDate,
        selectedBranch !== "all" ? selectedBranch : null,
        page,
        pageSize,
      );

      const orders = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 1;

      setReportData(orders);
      setCurrentPage(page);
      setTotalPages(totalPages);
      setTotalItems(totalItems);

      const allOrdersResponse = await fetchAllOrdersForStats(
        startDate,
        endDate,
        selectedBranch !== "all" ? selectedBranch : null,
      );

      const allOrders = allOrdersResponse?.data || [];
      setAllOrdersForStats(allOrders);
      setTotalPriceFromResponse(allOrdersResponse?.totalPrice || 0);

      const summaryData = calculateSummary(
        allOrders,
        startDate,
        endDate,
        allOrdersResponse?.totalPrice || 0,
      );
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
        errorMessage = "بيانات الطلب غير صحيحة";
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = "فشل في تحميل بيانات التقرير";
      }

      showSalesMobileAlertToast(errorMessage, "info");

      setReportData([]);
      setAllOrdersForStats([]);
      setTotalPriceFromResponse(0);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);

      setSummary({
        totalSales: 0,
        totalOrders: 0,
        deliveryOrders: 0,
        pickupOrders: 0,
        topProducts: [],
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )}`
            : "لم يتم تحديد فترة",
      });
    } finally {
      setLoading(false);
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

  const getOrderBranchName = (order) => {
    if (order.deliveryFee?.branchId) {
      const branch = branches.find((b) => b.id === order.deliveryFee.branchId);
      return branch ? branch.name : `فرع ${order.deliveryFee.branchId}`;
    }
    return "غير محدد";
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00 ج.م";
    }
    return `${Number(amount).toLocaleString("ar-EG")} ج.م`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-xs" />;
      case "Confirmed":
        return <FaCheckCircle className="text-xs" />;
      case "Preparing":
        return <FaUtensils className="text-xs" />;
      case "OutForDelivery":
        return <FaMotorcycle className="text-xs" />;
      case "Delivered":
        return <FaCheck className="text-xs" />;
      case "Cancelled":
        return <FaBan className="text-xs" />;
      default:
        return <FaClock className="text-xs" />;
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gradient-to-r from-[#32B9CC]/10 to-[#2E3E88]/10 text-[#32B9CC]";
      case "Confirmed":
        return "bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 text-[#2E3E88]";
      case "Preparing":
        return "bg-gradient-to-r from-[#FF8E53]/10 to-[#FF6B6B]/10 text-[#FF8E53]";
      case "OutForDelivery":
        return "bg-gradient-to-r from-[#9C27B0]/10 to-[#E41E26]/10 text-[#9C27B0]";
      case "Delivered":
        return "bg-gradient-to-r from-[#4CAF50]/10 to-[#2E3E88]/10 text-[#4CAF50]";
      case "Cancelled":
        return "bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF8E53]/10 text-[#FF6B6B]";
      default:
        return "bg-gradient-to-r from-[#9E9E9E]/10 to-[#607D8B]/10 text-[#9E9E9E]";
    }
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

      if (allOrdersForStats.length === 0) {
        showSalesMobileAlertToast(
          "لا توجد بيانات لعرضها في التقرير",
          "warning",
        );
        setIsPrinting(false);
        return;
      }

      const printSummary = calculateSummary(
        allOrdersForStats,
        startDate,
        endDate,
        totalPriceFromResponse,
      );

      const selectedBranchName =
        selectedBranch === "all"
          ? "جميع الفروع"
          : branches.find((b) => b.id === selectedBranch)?.name ||
            "فرع غير معروف";

      const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير المبيعات - Triple S</title>
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
  <h1>تقرير المبيعات - Triple S</h1>
  <p>نظام إدارة المطاعم</p>
</div>

<div class="print-info">
  <div>تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</div>
  <div>الفرع: ${selectedBranchName}</div>
  ${
    startDate
      ? `<div>من: ${new Date(startDate).toLocaleDateString("ar-EG")}</div>`
      : ""
  }
  ${
    endDate
      ? `<div>إلى: ${new Date(endDate).toLocaleDateString("ar-EG")}</div>`
      : ""
  }
  <div>عدد السجلات: ${formatNumberArabic(allOrdersForStats.length)}</div>
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
  allOrdersForStats.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد طلبات في الفترة المحددة</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="15%">رقم الطلب</th>
        <th width="20%">العميل</th>
        <th width="20%">الهاتف</th>
        <th width="20%">نوع الطلب</th>
        <th width="20%">الفرع</th>
        <th width="15%">المدينة</th>
        <th width="20%">المبلغ النهائي</th>
      </tr>
    </thead>
    <tbody>
      ${allOrdersForStats
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
          const branchName = getOrderBranchName(order);

          return `
          <tr>
            <td class="customer-name">${orderNumberArabic}</td>
            <td>${userName}</td>
            <td>${phoneArabic}</td>
            <td class="${orderTypeClass}">${
              order.deliveryFee?.fee > 0 ? "توصيل" : "استلام"
            }</td>
            <td>${branchName}</td>
            <td>${cityArabic}</td>
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

  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    setIsBranchDropdownOpen(false);
  };

  const getSelectedBranchName = () => {
    if (selectedBranch === "all") {
      return "جميع الفروع";
    }
    const branch = branches.find((b) => b.id === selectedBranch);
    return branch ? branch.name : "اختر فرع";
  };

  // دوال الباجينيشن
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
            className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p className="text-lg font-semibold" style={{ color: "#2E3E88" }}>
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
      dir="rtl"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div
          className="relative py-16 px-4"
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
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-8"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                <FaChartBar className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                تقارير المبيعات
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                تحليل مفصل لأداء المبيعات والفروع
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-10">
        {/* Content Container */}
        <div className="w-full">
          {/* Date Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 mb-6 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <FaCalendarAlt className="text-xl" style={{ color: "#2E3E88" }} />
              <h3 className="text-lg font-bold" style={{ color: "#2E3E88" }}>
                فلترة بتاريخ وفرع
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  من تاريخ
                </label>
                <div className="relative">
                  <FaCalendarAlt
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "#2E3E88" }}
                  />
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pr-10 pl-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                    locale="ar"
                    placeholderText="اختر تاريخ البداية"
                    showPopperArrow={false}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  إلى تاريخ
                </label>
                <div className="relative">
                  <FaCalendarAlt
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                    className="w-full pr-10 pl-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                    locale="ar"
                    placeholderText="اختر تاريخ النهاية"
                    showPopperArrow={false}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  الفرع
                </label>
                <div className="relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsBranchDropdownOpen(!isBranchDropdownOpen)
                      }
                      className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 transition-all hover:border-[#2E3E88] group text-right"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FaBuilding
                          className="group-hover:scale-110 transition-transform"
                          style={{ color: "#2E3E88" }}
                        />
                        <span className="font-medium">
                          {getSelectedBranchName()}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isBranchDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown style={{ color: "#2E3E88" }} />
                      </motion.div>
                    </button>

                    {isBranchDropdownOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                      >
                        <li
                          onClick={() => handleBranchSelect("all")}
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-right"
                        >
                          <span className="text-gray-700">جميع الفروع</span>
                        </li>
                        {branches.map((branch) => (
                          <li
                            key={branch.id}
                            onClick={() => handleBranchSelect(branch.id)}
                            className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-right"
                          >
                            <span className="text-gray-700">{branch.name}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  إجراءات التقرير
                </label>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDateFilter}
                    disabled={!startDate || !endDate}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
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
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
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
                            className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2"
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              {/* Total Sales Card */}
              <div className="bg-white rounded-2xl p-5 shadow-xl text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#32B9CC" }}>
                      إجمالي المبيعات
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {formatCurrency(summary.totalSales)}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaMoneyBill
                      className="text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white rounded-2xl p-5 shadow-xl text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#32B9CC" }}>
                      إجمالي الطلبات
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {summary.totalOrders}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaShoppingCart
                      className="text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Orders */}
              <div className="bg-white rounded-2xl p-5 shadow-xl text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#32B9CC" }}>
                      طلبات التوصيل
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {summary.deliveryOrders}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaTruck
                      className="text-2xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Orders */}
              <div className="bg-white rounded-2xl p-5 shadow-xl text-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#32B9CC" }}>
                      طلبات الاستلام
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{ color: "#2E3E88" }}
                    >
                      {summary.pickupOrders}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaStore
                      className="text-2xl"
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
              className="bg-white rounded-2xl p-6 mb-6 shadow-xl text-right"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaChartBar
                    className="text-xl"
                    style={{ color: "#2E3E88" }}
                  />
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "#2E3E88" }}
                  >
                    المنتجات الأكثر مبيعاً
                  </h3>
                </div>
                <span className="text-sm" style={{ color: "#32B9CC" }}>
                  أعلى 5 منتجات حسب الإيرادات
                </span>
              </div>

              <div className="space-y-3">
                {summary.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:shadow-md transition-all duration-200 text-right"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      border: "1px solid #2E3E8820",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "#2E3E88" }}>
                          {product.name}
                        </p>
                        <p className="text-sm" style={{ color: "#32B9CC" }}>
                          {product.quantity} وحدة مباعة
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold" style={{ color: "#2E3E88" }}>
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
                className="bg-white rounded-2xl overflow-hidden shadow-xl mb-6"
              >
                <div className="px-6 py-4 border-b border-gray-100 text-right">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaListAlt
                        className="text-xl"
                        style={{ color: "#2E3E88" }}
                      />
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        تفاصيل الطلبات
                      </h3>
                    </div>
                    <div className="text-sm" style={{ color: "#32B9CC" }}>
                      إجمالي {totalItems} طلب • صفحة {currentPage} من{" "}
                      {totalPages}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead
                      className="border-b border-gray-100"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <tr>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          رقم الطلب
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          اسم العميل
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          رقم الهاتف
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          نوع الطلب
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          الفرع
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          المدينة
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          الحالة
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          الإجمالي
                        </th>
                        <th
                          className="px-4 py-3 text-right font-semibold"
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
                            className="px-4 py-3 text-right font-mono text-sm font-bold"
                            style={{ color: "#2E3E88" }}
                          >
                            {order.orderNumber}
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm"
                            style={{ color: "#2E3E88" }}
                          >
                            {getCustomerName(order)}
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm"
                            style={{ color: "#32B9CC" }}
                          >
                            {getCustomerPhone(order)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
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
                                  توصيل
                                </>
                              ) : (
                                <>
                                  <FaStore className="text-xs" />
                                  استلام
                                </>
                              )}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm"
                            style={{ color: "#32B9CC" }}
                          >
                            {getOrderBranchName(order)}
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm"
                            style={{ color: "#2E3E88" }}
                          >
                            {getCustomerCity(order)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                order.status,
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 text-right font-bold"
                            style={{
                              background:
                                "linear-gradient(135deg, #2E3E88, #32B9CC)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {formatCurrency(order.totalWithFee)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewOrderDetails(order.id)}
                              disabled={loadingDetails}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 mx-auto"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                color: "white",
                              }}
                            >
                              {loadingDetails &&
                              selectedOrder?.id === order.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaEye />
                              )}
                              عرض التفاصيل
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot
                      className="border-t border-gray-100 text-right"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-3 text-right font-bold"
                          style={{ color: "#2E3E88" }}
                        >
                          المجموع الكلي:
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className="text-xl font-bold"
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
                  className="mt-8 flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 sm:p-3 rounded-xl ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <FaChevronLeft
                        className="text-sm sm:text-base"
                        style={{ color: "#2E3E88" }}
                      />
                    </button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {getPaginationNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span
                              className="px-2 sm:px-3 py-1 sm:py-2"
                              style={{ color: "#32B9CC" }}
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-semibold ${
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
                      className={`p-2 sm:p-3 rounded-xl ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <FaChevronRight
                        className="text-sm sm:text-base"
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
              className="text-center py-12"
              dir="rtl"
            >
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                }}
              >
                <FaChartBar className="text-4xl" style={{ color: "#2E3E88" }} />
              </div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: "#2E3E88" }}
              >
                لا توجد بيانات لعرضها
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: "#32B9CC" }}>
                يرجى تحديد فترة زمنية وتطبيق الفلترة لعرض التقرير
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

export default SalesReports;
