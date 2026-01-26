import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaPrint,
  FaFilter,
  FaListAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaChevronDown,
  FaArrowLeft,
  FaClock,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfDay, endOfDay, addHours, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const fetchOrderShifts = async (branchId, day) => {
  try {
    if (!branchId || !day) {
      return [];
    }

    const params = new URLSearchParams({
      branchId: branchId.toString(),
      day: format(day, "yyyy-MM-dd"),
    });

    const response = await axiosInstance.get(
      `/api/OrderShifts/GetAll?${params.toString()}`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching order shifts:", error);
    throw error;
  }
};

const fetchBranches = async () => {
  try {
    const response = await axiosInstance.get("/api/Branches/GetList");
    return response.data;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

const fetchOrdersWithFilter = async (
  day,
  shiftId,
  branchId,
  pageNumber = 1,
  pageSize = 10,
) => {
  try {
    if (!day || !branchId) {
      throw new Error("يرجى تحديد اليوم والفرع أولاً");
    }

    const requestBody = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      filters: [],
    };

    if (shiftId) {
      requestBody.filters.push({
        propertyName: "orderShift.id",
        propertyValue: shiftId.toString(),
        range: false,
      });
    }

    console.log(
      "Request Body for Orders:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await axiosInstance.post(
      "/api/Orders/GetAllWithPagination",
      requestBody,
    );

    if (
      !response.data ||
      !response.data.data ||
      response.data.data.length === 0
    ) {
      throw new Error("لا توجد بيانات في اليوم المحدد");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

const fetchAllOrdersForPrint = async (day, shiftId, branchId) => {
  try {
    if (!day || !branchId) {
      return [];
    }

    let startDateWithTime = startOfDay(day);
    let endDateWithTime = endOfDay(day);

    const params = new URLSearchParams();

    params.append("shiftId", shiftId.toString());

    console.log(`Fetching print orders with params: ${params.toString()}`);
    console.log(`Start Range: ${startDateWithTime.toISOString()}`);
    console.log(`End Range: ${endDateWithTime.toISOString()}`);
    console.log(`Branch ID: ${branchId}`);
    console.log(`Shift ID: ${shiftId || "Not provided"}`);

    const response = await axiosInstance.get(
      `/api/Orders/GetAll?${params.toString()}`,
    );

    let orders = response.data || [];

    console.log(`تم جلب ${orders.length} طلب للطباعة`);

    return orders;
  } catch (error) {
    console.error("Error fetching all orders for print:", error);
    throw error;
  }
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

const formatTimeTo12Hour = (timeString) => {
  if (!timeString) return "غير محدد";

  try {
    let date;

    if (timeString.includes("T")) {
      date = parseISO(timeString);
    } else if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      return timeString;
    }

    const adjustedDate = addHours(date, 2);

    let formattedTime = format(adjustedDate, "hh:mm a");

    formattedTime = formattedTime.replace(/AM/g, "ص").replace(/PM/g, "م");

    return formattedTime;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

const showMessage = (type, title, text, options = {}) => {
  if (window.innerWidth < 768 && !options.forceSwal) {
    const toastOptions = {
      position: "top-right",
      autoClose: options.timer || 2500,
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

const OrderShiftsReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(null);
  const [shiftId, setShiftId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [orderShifts, setOrderShifts] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [summary, setSummary] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await fetchBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error("Error loading branches:", error);
        showMessage("error", "خطأ", "فشل في تحميل قائمة الفروع");
      }
    };

    loadBranches();

    setSummary({
      day: "لم يتم تحديد اليوم",
    });
  }, []);

  useEffect(() => {
    const loadOrderShifts = async () => {
      if (day && branchId) {
        try {
          const shifts = await fetchOrderShifts(branchId, day);
          setOrderShifts(shifts);

          if (shifts.length > 0 && !shiftId) {
            setShiftId(shifts[0].id.toString());
          } else {
            setShiftId("");
          }
        } catch (error) {
          console.error("Error loading order shifts:", error);
          setOrderShifts([]);
          setShiftId("");
        }
      } else {
        setOrderShifts([]);
        setShiftId("");
      }
    };

    loadOrderShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, branchId]);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleFilter = async (page = 1) => {
    if (!day) {
      showMessage("warning", "اليوم غير محدد", "يرجى تحديد اليوم أولاً");
      return;
    }

    if (!branchId) {
      showMessage("warning", "الفرع غير محدد", "يرجى تحديد الفرع أولاً");
      return;
    }

    if (!shiftId) {
      showMessage(
        "warning",
        "الوردية غير محددة",
        "يرجى تحديد اسم الوردية أولاً",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetchOrdersWithFilter(
        day,
        shiftId || null,
        branchId,
        page,
        10,
      );

      const orders = response.data;
      setReportData(orders);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
      setTotalPrice(response.totalPrice || 0);
      setCurrentPage(response.pageNumber);

      const selectedBranchName =
        branches.find((b) => b.id === parseInt(branchId))?.name ||
        "الفرع المحدد";

      const selectedShiftName = shiftId
        ? orderShifts.find((s) => s.id === parseInt(shiftId))?.name ||
          "الوردية المحددة"
        : "جميع الورديات";

      setSummary({
        day: format(day, "yyyy-MM-dd"),
        branch: selectedBranchName,
        shift: selectedShiftName,
      });

      showMessage("success", "تم بنجاح", "تم تطبيق الفلترة بنجاح");
    } catch (error) {
      console.error("Error fetching report data:", error);

      const errorMessage =
        error.message === "لا توجد بيانات في اليوم المحدد"
          ? "لا توجد بيانات في اليوم المحدد"
          : "فشل في تحميل بيانات التقرير";

      showMessage("info", "لا توجد بيانات", errorMessage);

      setReportData([]);
      setTotalPrice(0);
      setSummary({
        day: day ? format(day, "yyyy-MM-dd") : "لم يتم تحديد اليوم",
      });
      setTotalPages(1);
      setCurrentPage(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00 ج.م";
    }
    return `${Number(amount).toLocaleString("ar-EG")} ج.م`;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    handleFilter(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
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

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      if (!day || !branchId) {
        showMessage(
          "warning",
          "بيانات غير مكتملة",
          "يرجى تحديد اليوم والفرع أولاً",
        );
        setIsPrinting(false);
        return;
      }

      try {
        const allOrders = await fetchAllOrdersForPrint(day, shiftId, branchId);

        if (allOrders.length === 0) {
          showMessage(
            "warning",
            "لا توجد بيانات",
            "لا توجد بيانات لعرضها في التقرير",
          );
          setIsPrinting(false);
          return;
        }

        const printTotalPrice = allOrders.reduce(
          (sum, order) => sum + (order.totalWithFee || 0),
          0,
        );

        const selectedBranchName = branchId
          ? branches.find((b) => b.id === parseInt(branchId))?.name ||
            "الفرع المحدد"
          : "الفرع المحدد";

        const selectedShiftName = shiftId
          ? orderShifts.find((s) => s.id === parseInt(shiftId))?.name ||
            "الوردية المحددة"
          : "جميع الورديات";

        const printDate = new Date();
        const formattedDate = printDate.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        const formattedTime = printDate.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const printFrame = document.createElement("iframe");
        printFrame.style.display = "none";
        printFrame.style.position = "fixed";
        printFrame.style.top = "-10000px";
        printFrame.style.left = "-10000px";
        printFrame.name = "printFrame";
        document.body.appendChild(printFrame);

        const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير الورديات - Triple S</title>
<style>
  @media print {
    @page {
      margin: 3mm 3mm;
      size: auto;
    }
    body {
      margin: 0;
      padding: 2mm;
      width: 100%;
      font-family: 'Arial', sans-serif;
      background: white !important;
      color: black !important;
      direction: rtl;
      font-size: 12px;
      line-height: 1.2;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    .no-print {
      display: none !important;
    }
  }
  
  body {
    margin: 0;
    padding: 2mm;
    width: 100%;
    font-family: 'Arial', sans-serif;
    background: white !important;
    color: black !important;
    direction: rtl;
    font-size: 12px;
    line-height: 1.2;
    max-width: 100%;
  }
  
  .report-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0;
  }
  
  .report-header {
    text-align: center;
    padding-bottom: 5px;
    margin-bottom: 8px;
    border-bottom: 1px solid #000;
  }
  
  .report-header h1 {
    color: #000 !important;
    margin: 0 0 3px 0;
    font-size: 18px;
    font-weight: bold;
    line-height: 1.1;
  }
  
  .report-header h2 {
    color: #333 !important;
    margin: 0 0 5px 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.1;
  }
  
  .company-info {
    text-align: center;
    margin-bottom: 5px;
    padding: 3px;
  }
  
  .company-name {
    font-size: 14px;
    font-weight: bold;
    color: #000;
    margin-bottom: 2px;
    line-height: 1.1;
  }
  
  .report-details {
    margin-bottom: 10px;
    padding: 5px 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    background: white;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
    padding: 2px 5px;
    font-size: 11px;
    line-height: 1.2;
  }
  
  .detail-label {
    font-weight: bold;
    color: #000;
    margin-left: 15px;
    min-width: 85px;
  }
  
  .detail-value {
    color: #000;
    font-weight: normal;
    text-align: left;
    flex: 1;
    margin-right: 10px;
  }
  
  .report-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 8px 0 12px 0;
    font-size: 11px;
    table-layout: fixed;
  }
  
  .report-table th {
    background-color: #f0f0f0 !important;
    color: black !important;
    padding: 5px 4px !important;
    text-align: center !important;
    border: 1px solid #ccc !important;
    font-weight: bold;
    font-size: 11px;
    line-height: 1.2;
  }
  
  .report-table td {
    padding: 5px 4px !important;
    border: 1px solid #ddd !important;
    text-align: center !important;
    color: #000 !important;
    font-size: 11px;
    vertical-align: middle;
    line-height: 1.2;
  }
  
  .report-table tr:nth-child(even) {
    background-color: #f9f9f9 !important;
  }
  
  .bill-number-cell {
    font-weight: bold;
    color: #000;
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }
  
  .amount-cell {
    font-weight: bold;
    color: #000;
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }
  
  .total-section {
    margin-top: 12px;
    padding: 8px 10px;
    background: white;
    border: 1px solid #000;
    border-radius: 3px;
  }
  
  .total-row {
    display: flex;
    justify-between;
    align-items: center;
    margin: 5px 0;
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1.2;
  }
  
  .total-label {
    font-weight: bold;
    color: #000;
    margin-left: 15px;
  }
  
  .total-value {
    font-weight: bold;
    font-size: 13px;
    color: #000;
    font-family: 'Courier New', monospace;
    margin-right: 10px;
  }
  
  .report-footer {
    margin-top: 10px;
    text-align: center;
    padding-top: 5px;
    border-top: 1px solid #ccc;
    color: #666;
    font-size: 9px;
    line-height: 1.1;
  }
  
  .print-date {
    margin: 2px 0;
    font-weight: bold;
    color: #000;
  }
  
  .no-data {
    text-align: center;
    padding: 20px 10px;
    color: #666;
    font-size: 12px;
  }
  
  .single-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .compact {
    margin: 0;
    padding: 0;
  }
  
  .spaced-text {
    padding: 0 5px;
  }
</style>
</head>
<body>
  <div class="report-container compact">
    <div class="report-header compact">
      <div class="company-info compact">
        <div class="company-name single-line">Triple S - تقرير الورديات</div>
      </div>
      <h1 class="single-line">تقرير الورديات</h1>
      <h2 class="single-line spaced-text">${selectedShiftName}</h2>
    </div>
    
    <div class="report-details compact">
      <div class="detail-row single-line">
        <span class="detail-label spaced-text">الفرع:</span>
        <span class="detail-value spaced-text">${selectedBranchName}</span>
      </div>
      <div class="detail-row single-line">
        <span class="detail-label spaced-text">الوردية:</span>
        <span class="detail-value spaced-text">${selectedShiftName}</span>
      </div>
      <div class="detail-row single-line">
        <span class="detail-label spaced-text">التاريخ:</span>
        <span class="detail-value spaced-text">${
          day ? new Date(day).toLocaleDateString("ar-EG") : "غير محدد"
        }</span>
      </div>
      <div class="detail-row single-line">
        <span class="detail-label spaced-text">الوقت:</span>
        <span class="detail-value spaced-text">${formattedTime}</span>
      </div>
      <div class="detail-row single-line">
        <span class="detail-label spaced-text">عدد الفواتير:</span>
        <span class="detail-value spaced-text">${formatNumberArabic(
          allOrders.length,
        )}</span>
      </div>
    </div>
    
    ${
      allOrders.length === 0
        ? `
    <div class="no-data">
      <h3>لا توجد فواتير</h3>
    </div>
    `
        : `
    <table class="report-table">
      <thead>
        <tr>
          <th width="60%">رقم الفاتورة</th>
          <th width="40%">المبلغ</th>
        </tr>
      </thead>
      <tbody>
        ${allOrders
          .map((order) => {
            const orderNumberArabic = order.orderNumber
              ? order.orderNumber.replace(/\d/g, (d) => toArabicNumbers(d))
              : "فاتورة";

            return `
          <tr class="single-line">
            <td class="bill-number-cell single-line spaced-text">${orderNumberArabic}</td>
            <td class="amount-cell single-line spaced-text">${formatCurrencyArabic(
              order.totalWithFee || 0,
            )}</td>
          </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>
    
    <div class="total-section compact">
      <div class="total-row single-line">
        <span class="total-label spaced-text">عدد الفواتير:</span>
        <span class="total-value spaced-text">${formatNumberArabic(
          allOrders.length,
        )}</span>
      </div>
      <div class="total-row single-line">
        <span class="total-label spaced-text">المجموع الكلي:</span>
        <span class="total-value spaced-text">${formatCurrencyArabic(
          printTotalPrice,
        )}</span>
      </div>
    </div>
    `
    }
    
    <div class="report-footer compact">
      <div class="print-date single-line spaced-text">${formattedDate} - ${formattedTime}</div>
      <div class="single-line spaced-text">Triple S © ${toArabicNumbers(
        new Date().getFullYear(),
      )}</div>
    </div>
  </div>
</body>
</html>
        `;

        const printDoc = printFrame.contentWindow || printFrame.contentDocument;
        if (printDoc.document) {
          printDoc.document.open();
          printDoc.document.write(printContent);
          printDoc.document.close();
        } else {
          printDoc.open();
          printDoc.write(printContent);
          printDoc.close();
        }

        setTimeout(() => {
          try {
            printFrame.contentWindow.focus();

            printFrame.contentWindow.print();

            const cleanup = () => {
              if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
              }
              setIsPrinting(false);
            };

            if (printFrame.contentWindow) {
              printFrame.contentWindow.onafterprint = () => {
                setTimeout(cleanup, 100);
              };
            }

            setTimeout(cleanup, 3000);
          } catch (error) {
            console.error("Error during printing:", error);

            printFrame.style.display = "block";
            printFrame.style.position = "fixed";
            printFrame.style.top = "0";
            printFrame.style.left = "0";
            printFrame.style.width = "100%";
            printFrame.style.height = "100%";
            printFrame.style.zIndex = "99999";
            printFrame.style.background = "white";

            const closeButton = document.createElement("button");
            closeButton.textContent = "إغلاق";
            closeButton.style.position = "fixed";
            closeButton.style.top = "20px";
            closeButton.style.right = "20px";
            closeButton.style.zIndex = "100000";
            closeButton.style.padding = "10px 20px";
            closeButton.style.background = "#2E3E88";
            closeButton.style.color = "white";
            closeButton.style.border = "none";
            closeButton.style.borderRadius = "5px";
            closeButton.style.cursor = "pointer";
            closeButton.onclick = () => {
              if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
              }
              if (document.body.contains(closeButton)) {
                document.body.removeChild(closeButton);
              }
              setIsPrinting(false);
            };

            document.body.appendChild(closeButton);

            showMessage(
              "info",
              "جاهز للطباعة",
              "تم تحضير التقرير للطباعة. الرجاء استخدام Ctrl+P للطباعة ثم اضغط على زر إغلاق.",
              {
                showConfirmButton: true,
                confirmButtonText: "تمت الطباعة",
              },
            );
          }
        }, 500);
      } catch (error) {
        console.error("Error in print process:", error);
        showMessage(
          "error",
          "خطأ في تحميل البيانات",
          "فشل في تحميل بيانات الطباعة. يرجى المحاولة مرة أخرى.",
        );
        setIsPrinting(false);
      }
    } catch (error) {
      console.error("Error in handlePrint:", error);
      setIsPrinting(false);
    }
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
                تقرير الورديات
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                تحليل مفصل للطلبات حسب الورديات والفروع
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
                فلترة الورديات
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Day Selection */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2 text-right"
                  style={{ color: "#2E3E88" }}
                >
                  اليوم
                </label>
                <div className="relative group">
                  <FaCalendarAlt
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "#2E3E88" }}
                  />
                  <DatePicker
                    selected={day}
                    onChange={(date) => setDay(date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                    locale="ar"
                    placeholderText="اختر اليوم"
                    showPopperArrow={false}
                  />
                </div>
              </div>

              {/* Branch Dropdown */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2 text-right"
                  style={{ color: "#2E3E88" }}
                >
                  الفرع
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("branch")}
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
                        {branchId
                          ? branches.find((b) => b.id === parseInt(branchId))
                              ?.name || "اختر الفرع"
                          : "اختر الفرع"}
                      </span>
                    </div>
                    <motion.div
                      animate={{
                        rotate: openDropdown === "branch" ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown style={{ color: "#2E3E88" }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openDropdown === "branch" && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden max-h-48 overflow-y-auto text-right"
                      >
                        {branches.map((branch) => (
                          <li
                            key={branch.id}
                            onClick={() => {
                              setBranchId(branch.id.toString());
                              setOpenDropdown(null);
                            }}
                            className="px-4 py-2.5 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-right"
                          >
                            <span className="text-gray-700">{branch.name}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Shift Name Dropdown */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2 text-right"
                  style={{ color: "#2E3E88" }}
                >
                  اسم الوردية
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("shift")}
                    disabled={!day || !branchId || orderShifts.length === 0}
                    className={`w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 transition-all hover:border-[#2E3E88] group text-right ${
                      !day || !branchId || orderShifts.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FaClock
                        className="group-hover:scale-110 transition-transform"
                        style={{ color: "#2E3E88" }}
                      />
                      <span className="font-medium">
                        {shiftId && orderShifts.length > 0
                          ? orderShifts.find((s) => s.id === parseInt(shiftId))
                              ?.name || "اختر الوردية"
                          : day && branchId
                            ? orderShifts.length === 0
                              ? "لا توجد ورديات"
                              : "اختر الوردية"
                            : "اختر اليوم والفرع أولاً"}
                      </span>
                    </div>
                    <motion.div
                      animate={{
                        rotate: openDropdown === "shift" ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown style={{ color: "#2E3E88" }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openDropdown === "shift" &&
                      day &&
                      branchId &&
                      orderShifts.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden max-h-48 overflow-y-auto text-right"
                        >
                          {orderShifts.map((shift, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                setShiftId(shift.id.toString());
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-2.5 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-right"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">
                                  {shift.name}
                                </span>
                                <span
                                  className="text-xs text-left"
                                  style={{ color: "#32B9CC" }}
                                >
                                  {shift.start
                                    ? formatTimeTo12Hour(shift.start)
                                    : "غير محدد"}
                                  {shift.end && (
                                    <span
                                      className="text-[10px] block"
                                      style={{ color: "#FF8E53" }}
                                    >
                                      حتى {formatTimeTo12Hour(shift.end)}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilter(1)}
                disabled={!day || !branchId || !shiftId}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  day && branchId && shiftId
                    ? "shadow-lg hover:shadow-xl cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={
                  day && branchId && shiftId
                    ? {
                        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
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
                      طباعة التقرير
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Orders Table */}
          {reportData && reportData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl overflow-hidden shadow-xl mb-6"
            >
              <div className="px-6 py-4 border-b border-gray-100 text-right">
                <div className="flex items-center gap-2">
                  <FaListAlt className="text-xl" style={{ color: "#2E3E88" }} />
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "#2E3E88" }}
                  >
                    تفاصيل الطلبات حسب الورديات
                  </h3>
                  <span className="text-sm" style={{ color: "#32B9CC" }}>
                    ({totalItems} طلب)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead
                    className="border-b border-gray-100 text-right"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                    }}
                  >
                    <tr>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        رقم الفاتورة
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        الإجمالي
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        اسم الفرع
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        اسم الوردية
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        بداية الوردية
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        نهاية الوردية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-right">
                    {reportData.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td
                          className="px-4 py-3 font-mono text-sm font-bold text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          {order.orderNumber}
                        </td>
                        <td
                          className="px-4 py-3 font-bold text-right"
                          style={{
                            background:
                              "linear-gradient(135deg, #2E3E88, #32B9CC)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {formatCurrency(order.totalWithFee)}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-right"
                          style={{ color: "#32B9CC" }}
                        >
                          {order.branch?.name || "غير محدد"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-right"
                          style={{ color: "#2E3E88" }}
                        >
                          {order.orderShift?.name || "غير محدد"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-right"
                          style={{ color: "#32B9CC" }}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {order.orderShift?.start
                              ? formatTimeTo12Hour(order.orderShift.start)
                              : "غير محدد"}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-right"
                          style={{ color: "#FF8E53" }}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {order.orderShift?.end
                              ? formatTimeTo12Hour(order.orderShift.end)
                              : "غير محدد"}
                          </div>
                        </td>
                      </tr>
                    ))}

                    <tr
                      className="border-t-2 border-gray-100 text-right"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <td
                        colSpan="5"
                        className="px-4 py-3 font-bold text-right"
                        style={{ color: "#2E3E88" }}
                      >
                        الإجمالي الكلي لجميع الفواتير:
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
                          {formatCurrency(totalPrice)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 text-right">
                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.button>

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
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
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
                            </motion.button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(!reportData || reportData.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
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
                يرجى تحديد اليوم والفرع وتطبيق الفلترة لعرض التقرير
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderShiftsReport;
