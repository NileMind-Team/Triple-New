import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingBag,
  FaFilter,
  FaChevronDown,
  FaTrash,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaReceipt,
  FaBox,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaPrint,
  FaStore,
  FaEnvelope,
  FaEye,
  FaCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const BASE_URL = "https://restaurant-template.runasp.net/";
  const wsRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [isAdminOrRestaurant, setIsAdminOrRestaurant] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [wsStatus, setWsStatus] = useState("🔌 Connecting...");
  const [expandedSections, setExpandedSections] = useState({
    customerInfo: true,
    deliveryInfo: true,
    orderItems: true,
    orderSummary: true,
  });

  const showMessage = (type, title, text) => {
    if (window.innerWidth < 768) {
      const toastOptions = {
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
              : type === "success"
                ? "linear-gradient(135deg, #2E3E88, #32B9CC)"
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
        title: title,
        html: text,
        icon: type,
        confirmButtonText: "حسنًا",
        timer: 2500,
        showConfirmButton: false,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
    }
  };

  const formatShortArabicDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);

    const year = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      year: "numeric",
      numberingSystem: "arab",
    });

    const month = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      month: "short",
      numberingSystem: "arab",
    });

    const day = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      day: "numeric",
      numberingSystem: "arab",
    });

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "م" : "ص";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const hoursStr = hours
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");
    const minutesStr = minutes
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");

    return `${day} ${month} ${year} ${hoursStr}:${minutesStr} ${ampm}`;
  };

  const calculateItemFinalPrice = (item) => {
    if (!item) return 0;

    const basePrice =
      item.menuItemBasePriceSnapshotAtOrder > 0
        ? item.menuItemBasePriceSnapshotAtOrder
        : item.basePriceSnapshot ||
          item.menuItem?.basePrice ||
          item.basePriceAtOrder ||
          item.BasePriceSnapshot ||
          0;

    const optionsTotal =
      item.options?.reduce(
        (sum, option) => sum + (option.optionPriceAtOrder || 0),
        0,
      ) || 0;

    const itemDiscount = item.totalDiscount || item.TotalDiscount || 0;

    const itemPriceBeforeDiscount =
      (basePrice + optionsTotal) * (item.quantity || item.Quantity || 1);
    const itemFinalPrice = itemPriceBeforeDiscount - itemDiscount;

    return Math.max(itemFinalPrice, 0);
  };

  const calculatePricesFromOrderDetails = (orderDetails) => {
    if (
      !orderDetails ||
      !orderDetails.items ||
      orderDetails.items.length === 0
    ) {
      return {
        subtotal:
          orderDetails?.totalWithoutFee || orderDetails?.TotalWithoutFee || 0,
        totalAdditions: 0,
        totalDiscount:
          orderDetails?.totalDiscount || orderDetails?.TotalDiscount || 0,
        totalBeforeDiscount:
          orderDetails?.totalWithoutFee || orderDetails?.TotalWithoutFee || 0,
        totalAfterDiscountBeforeDelivery:
          (orderDetails?.totalWithoutFee ||
            orderDetails?.TotalWithoutFee ||
            0) -
          (orderDetails?.totalDiscount || orderDetails?.TotalDiscount || 0),
        deliveryFee:
          orderDetails?.deliveryCost ||
          orderDetails?.deliveryFee?.fee ||
          orderDetails?.DeliveryFee?.Fee ||
          orderDetails?.DeliveryCost ||
          0,
        totalWithFee:
          orderDetails?.totalWithFee || orderDetails?.TotalWithFee || 0,
      };
    }

    let subtotal = 0;
    let totalAdditions = 0;
    let totalDiscount = 0;

    orderDetails.items.forEach((item) => {
      const basePrice =
        item.menuItemBasePriceSnapshotAtOrder > 0
          ? item.menuItemBasePriceSnapshotAtOrder
          : item.basePriceSnapshot ||
            item.menuItem?.basePrice ||
            item.BasePriceSnapshot ||
            0;

      subtotal += basePrice * (item.quantity || item.Quantity || 1);

      if (item.options && item.options.length > 0) {
        item.options.forEach((option) => {
          totalAdditions +=
            (option.optionPriceAtOrder || 0) *
            (item.quantity || item.Quantity || 1);
        });
      }

      if (
        (item.totalDiscount && item.totalDiscount > 0) ||
        (item.TotalDiscount && item.TotalDiscount > 0)
      ) {
        totalDiscount += item.totalDiscount || item.TotalDiscount || 0;
      }
    });

    const totalBeforeDiscount = subtotal + totalAdditions;
    const totalAfterDiscountBeforeDelivery =
      totalBeforeDiscount - totalDiscount;
    const deliveryFee =
      orderDetails.deliveryCost ||
      orderDetails.deliveryFee?.fee ||
      orderDetails.DeliveryFee?.Fee ||
      orderDetails.DeliveryCost ||
      0;
    const totalWithFee = totalAfterDiscountBeforeDelivery + deliveryFee;

    return {
      subtotal,
      totalAdditions,
      totalDiscount,
      totalBeforeDiscount,
      totalAfterDiscountBeforeDelivery,
      deliveryFee,
      totalWithFee,
    };
  };

  const getFinalTotal = (order) => {
    return order.totalWithFee || order.TotalWithFee || 0;
  };

  const formatDateForApi = (dateString, isStart = true) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isStart) {
      date.setDate(date.getDate() - 1);
    }

    date.setHours(date.getHours() + 2);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (isStart) {
      return `${year}-${month}-${day}T22:00:00.000Z`;
    } else {
      return `${year}-${month}-${day}T21:59:59.999Z`;
    }
  };

  const buildFiltersArray = () => {
    const filtersArray = [];

    if (filter && filter !== "all") {
      filtersArray.push({
        propertyName: "status",
        propertyValue: filter,
        range: false,
      });
    }

    if (isAdminOrRestaurantOrBranch && selectedUserId) {
      filtersArray.push({
        propertyName: "userId",
        propertyValue: selectedUserId,
        range: false,
      });
    }

    if (dateRange.start || dateRange.end) {
      if (dateRange.start && dateRange.end) {
        const startDate = formatDateForApi(dateRange.start, true);
        const endDate = formatDateForApi(dateRange.end, false);
        filtersArray.push({
          propertyName: "createdAt",
          propertyValue: `${startDate},${endDate}`,
          range: true,
        });
      } else if (dateRange.start) {
        const startDate = formatDateForApi(dateRange.start, true);
        const endDate = formatDateForApi(dateRange.start, false);
        filtersArray.push({
          propertyName: "createdAt",
          propertyValue: `${startDate},${endDate}`,
          range: true,
        });
      } else if (dateRange.end) {
        const endDate = formatDateForApi(dateRange.end, false);
        filtersArray.push({
          propertyName: "createdAt",
          propertyValue: `${endDate},${endDate}`,
          range: true,
        });
      }
    }

    if (selectedBranchId) {
      filtersArray.push({
        propertyName: "branchId",
        propertyValue: selectedBranchId,
        range: false,
      });
    }

    return filtersArray;
  };

  const fetchOrders = async () => {
    if (isInitialLoad) {
      return;
    }

    try {
      setFetchingOrders(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setOrders([]);
        setFetchingOrders(false);
        return;
      }

      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        filters: buildFiltersArray(),
      };

      let url = "/api/Orders/GetAllWithPagination";
      let params = {};

      if (!isAdminOrRestaurantOrBranch) {
        url = "/api/Orders/GetAllForUser";
        if (filter !== "all") {
          params.status = filter;
        }
      }

      let response;
      if (isAdminOrRestaurantOrBranch) {
        response = await axiosInstance.post(url, requestBody);
      } else {
        response = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        });
      }

      const responseData = response.data;

      if (isAdminOrRestaurantOrBranch) {
        const ordersData = responseData.data || [];
        setOrders(ordersData);
        setTotalPages(responseData.totalPages || 1);
        setTotalItems(responseData.totalItems || 0);
        setCurrentPage(responseData.pageNumber || 1);
        setPageSize(responseData.pageSize || 10);
      } else {
        setOrders(responseData || []);
        setTotalPages(1);
        setTotalItems(responseData?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!selectedOrder) {
        showMessage(
          "error",
          "خطأ",
          "فشل تحميل الطلبات. يرجى المحاولة مرة أخرى.",
        );
      }
      setOrders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setFetchingOrders(false);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = "wss://proxyserver.runasp.net/ws";
    const tenant = "Chicken_One";
    const joinGroup = `${tenant}-orders`;

    setWsStatus("🔌 Connecting...");

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.addEventListener("open", () => {
      setWsStatus("✅ Connected");
      console.log("WebSocket connection established");

      const joinMessage = `JOIN:${tenant}:${joinGroup}`;
      wsRef.current.send(joinMessage);
      console.log("Joined group:", joinMessage);
    });

    wsRef.current.addEventListener("message", (event) => {
      console.log("📦 WebSocket message received:", event.data);

      try {
        const wsOrder = JSON.parse(event.data);
        const normalizedOrder = normalizeWebSocketOrder(wsOrder);

        setOrders((prevOrders) => {
          const existingOrderIndex = prevOrders.findIndex(
            (o) =>
              o.id === normalizedOrder.id ||
              o.orderNumber === normalizedOrder.orderNumber,
          );

          if (existingOrderIndex === -1) {
            return [normalizedOrder, ...prevOrders];
          } else {
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = {
              ...updatedOrders[existingOrderIndex],
              ...normalizedOrder,
            };
            return updatedOrders;
          }
        });

        setTotalItems((prev) => prev + 1);

        if (normalizedOrder.orderNumber) {
          showMessage(
            "info",
            "طلب جديد",
            `تم استلام طلب جديد #${normalizedOrder.orderNumber}`,
          );
        }
      } catch (err) {
        console.error("❌ WebSocket JSON Error:", err, event.data);
      }
    });

    wsRef.current.addEventListener("close", () => {
      setWsStatus("⚠️ Disconnected");
      console.log("WebSocket disconnected");

      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          console.log("Attempting to reconnect WebSocket...");
          connectWebSocket();
        }
      }, 5000);
    });

    wsRef.current.addEventListener("error", (err) => {
      console.error("❌ WebSocket Error:", err);
      setWsStatus("❌ Connection Error");
    });
  };

  const normalizeWebSocketOrder = (wsOrder) => {
    let createdAt = wsOrder.CreatedAt || wsOrder.createdAt;
    let updatedAt = wsOrder.UpdatedAt || wsOrder.updatedAt;
    let deliveredAt = wsOrder.DeliveredAt || wsOrder.deliveredAt;

    if (createdAt && createdAt.includes("T")) {
      const date = new Date(createdAt);
      date.setHours(date.getHours() - 2);
      createdAt = date.toISOString();
    }

    if (updatedAt && updatedAt.includes("T")) {
      const date = new Date(updatedAt);
      date.setHours(date.getHours() - 2);
      updatedAt = date.toISOString();
    }

    if (deliveredAt && deliveredAt.includes("T")) {
      const date = new Date(deliveredAt);
      date.setHours(date.getHours() - 2);
      deliveredAt = date.toISOString();
    }

    return {
      id: wsOrder.Id,
      orderNumber: wsOrder.OrderNumber || wsOrder.orderNumber,
      status: wsOrder.Status,
      userId: wsOrder.UserId,
      user: wsOrder.User
        ? {
            id: wsOrder.User.Id,
            firstName: wsOrder.User.FirstName,
            lastName: wsOrder.User.LastName,
            email: wsOrder.User.Email,
            phoneNumber: wsOrder.User.PhoneNumber,
            imageUrl: wsOrder.User.ImageUrl,
          }
        : null,
      deliveryFee: wsOrder.DeliveryFee
        ? {
            id: wsOrder.DeliveryFee.Id,
            areaName: wsOrder.DeliveryFee.AreaName,
            fee: wsOrder.DeliveryFee.Fee,
            estimatedTimeMin: wsOrder.DeliveryFee.EstimatedTimeMin,
            estimatedTimeMax: wsOrder.DeliveryFee.EstimatedTimeMax,
            branchId: wsOrder.DeliveryFee.BranchId,
          }
        : wsOrder.deliveryFee,
      location: wsOrder.Location
        ? {
            id: wsOrder.Location.Id,
            userId: wsOrder.Location.UserId,
            phoneNumber: wsOrder.Location.PhoneNumber,
            streetName: wsOrder.Location.StreetName,
            buildingNumber: wsOrder.Location.BuildingNumber,
            floorNumber: wsOrder.Location.FloorNumber,
            flatNumber: wsOrder.Location.FlatNumber,
            detailedDescription: wsOrder.Location.DetailedDescription,
            city: wsOrder.Location.City,
          }
        : wsOrder.location,
      branch: wsOrder.Branch
        ? {
            id: wsOrder.Branch.Id,
            name: wsOrder.Branch.Name,
            email: wsOrder.Branch.Email,
            address: wsOrder.Branch.Address,
            status: wsOrder.Branch.Status,
          }
        : wsOrder.branch,
      totalDiscount: wsOrder.TotalDiscount || wsOrder.totalDiscount,
      totalWithoutFee: wsOrder.TotalWithoutFee || wsOrder.totalWithoutFee,
      deliveryCost: wsOrder.DeliveryCost || wsOrder.deliveryCost,
      totalWithFee: wsOrder.TotalWithFee || wsOrder.totalWithFee,
      notes: wsOrder.Notes || wsOrder.notes,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deliveredAt: deliveredAt,
      items: wsOrder.Items
        ? wsOrder.Items.map((item) => ({
            id: item.Id,
            quantity: item.Quantity,
            note: item.Note,
            menuItem: item.MenuItem
              ? {
                  id: item.MenuItem.Id,
                  name: item.MenuItem.Name,
                  description: item.MenuItem.Description,
                  basePrice: item.MenuItem.BasePrice,
                  imageUrl: item.MenuItem.ImageUrl,
                }
              : item.menuItem,
            options: item.Options
              ? item.Options.map((opt) => ({
                  optionNameAtOrder:
                    opt.OptionNameAtOrder || opt.optionNameAtOrder,
                  optionPriceAtOrder:
                    opt.OptionPriceAtOrder || opt.optionPriceAtOrder,
                }))
              : item.options,
            nameSnapshot: item.NameSnapshot || item.nameSnapshot,
            descriptionSnapshot:
              item.DescriptionSnapshot || item.descriptionSnapshot,
            basePriceSnapshot: item.BasePriceSnapshot || item.basePriceSnapshot,
            imageUrlSnapshot: item.ImageUrlSnapshot || item.imageUrlSnapshot,
            totalPrice: item.TotalPrice || item.totalPrice,
            totalDiscount: item.TotalDiscount || item.totalDiscount,
          }))
        : wsOrder.items || [],
    };
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    setSelectedOrderForStatus(orders.find((order) => order.id === orderId));
    setNewStatus(currentStatus || "");
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedOrderForStatus || !newStatus) {
      showMessage("warning", "تحذير", "يرجى اختيار حالة جديدة");
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem("token");

      const response = await axiosInstance.put(
        `/api/Orders/UpdateStatus/${selectedOrderForStatus.id}`,
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 204) {
        closeStatusModal();

        showMessage(
          "success",
          "تم بنجاح!",
          `تم تحديث حالة الطلب #${
            selectedOrderForStatus.orderNumber
          } إلى "${getStatusText(newStatus)}"`,
        );

        setOrders(
          orders.map((order) =>
            order.id === selectedOrderForStatus.id
              ? { ...order, status: newStatus }
              : order,
          ),
        );

        if (selectedOrder?.id === selectedOrderForStatus.id && orderDetails) {
          setOrderDetails((prev) => ({
            ...prev,
            status: newStatus,
          }));
        }

        await fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      let errorMessage = "فشل تحديث حالة الطلب. يرجى المحاولة مرة أخرى.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      showMessage("error", "خطأ", errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async (orderId, e) => {
    if (e) {
      e.stopPropagation();
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد إلغاء هذا الطلب؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، إلغِه!",
      cancelButtonText: "لا",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        await axiosInstance.put(
          `/api/Orders/UpdateStatus/${orderId}`,
          { orderStatus: "Cancelled" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "Cancelled",
                }
              : order,
          ),
        );

        if (selectedOrder?.id === orderId && orderDetails) {
          setOrderDetails((prev) => ({
            ...prev,
            status: "Cancelled",
          }));
        }

        showMessage("success", "تم الإلغاء!", "تم إلغاء الطلب بنجاح.");

        setTimeout(() => {
          fetchOrders();
        }, 500);
      } catch (error) {
        console.error("Error cancelling order:", error);
        showMessage("error", "خطأ", "فشل إلغاء الطلب. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const handleReprintOrder = async (orderId, e) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axiosInstance.get(
        `/api/Orders/ReprintOrder/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        showMessage("success", "تم بنجاح!", "تم إرسال طلب إعادة الطباعة بنجاح");
      }
    } catch (error) {
      console.error("Error reprinting order:", error);
      showMessage(
        "error",
        "خطأ",
        "فشل إرسال طلب إعادة الطباعة. يرجى المحاولة مرة أخرى.",
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownOpen &&
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target) &&
        !event.target.closest(".status-dropdown-trigger")
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusDropdownOpen]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setIsAdminOrRestaurant(false);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        const hasAdminOrRestaurantRole =
          userRoles.includes("Admin") || userRoles.includes("Restaurant");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
        setIsAdminOrRestaurant(hasAdminOrRestaurantRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
        setIsAdminOrRestaurant(false);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    if (isAdminOrRestaurantOrBranch) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const token = localStorage.getItem("token");

          if (!token) {
            setUsers([]);
            return;
          }

          const response = await axiosInstance.get("/api/Users/GetAll", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUsers(response.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isAdminOrRestaurantOrBranch]);

  useEffect(() => {
    if (isAdminOrRestaurant) {
      const fetchBranches = async () => {
        try {
          setLoadingBranches(true);
          const token = localStorage.getItem("token");

          if (!token) {
            setBranches([]);
            return;
          }

          const response = await axiosInstance.get("/api/Branches/GetList", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setBranches(response.data || []);
        } catch (error) {
          console.error("Error fetching branches:", error);
          setBranches([]);
        } finally {
          setLoadingBranches(false);
        }
      };

      fetchBranches();
    }
  }, [isAdminOrRestaurant]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    dateRange,
    selectedUserId,
    selectedBranchId,
    isAdminOrRestaurantOrBranch,
    isInitialLoad,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    if (!isInitialLoad) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoad]);

  const mapStatus = (apiStatus) => {
    const statusMap = {
      Pending: "pending",
      Confirmed: "confirmed",
      Preparing: "preparing",
      OutForDelivery: "out_for_delivery",
      Delivered: "delivered",
      Cancelled: "cancelled",
    };
    return statusMap[apiStatus] || "pending";
  };

  const getStatusText = (apiStatus) => {
    const textMap = {
      Pending: "قيد الانتظار",
      Confirmed: "تم التأكيد",
      Preparing: "قيد التحضير",
      OutForDelivery: "قيد التوصيل",
      Delivered: "تم التوصيل",
      Cancelled: "ملغي",
    };
    return textMap[apiStatus] || apiStatus;
  };

  const getStatusColor = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIconForOption = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return <FaCheckCircle className="text-green-500 w-4 h-4" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-500 w-4 h-4" />;
      case "pending":
        return <FaClock className="text-yellow-500 w-4 h-4" />;
      case "preparing":
        return <FaClock className="text-orange-500 w-4 h-4" />;
      case "out_for_delivery":
        return <FaShoppingBag className="text-purple-500 w-4 h-4" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500 w-4 h-4" />;
      default:
        return <FaClock className="text-gray-500 w-4 h-4" />;
    }
  };

  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);
    // إعادة تعيين الحالة الممتدة للأقسام
    setExpandedSections({
      customerInfo: true,
      deliveryInfo: true,
      orderItems: true,
      orderSummary: true,
    });

    try {
      const token = localStorage.getItem("token");
      let details;

      if (isAdminOrRestaurantOrBranch) {
        const response = await axiosInstance.get(
          `/api/Orders/GetById/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        details = response.data;
      } else {
        const response = await axiosInstance.get(
          `/api/Orders/GetByIdForUser/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        details = response.data;
      }

      if (details && details.items) {
        details.items = details.items.map((item) => ({
          ...item,
          menuItemImageUrlSnapshotAtOrder:
            item.menuItemImageUrlSnapshotAtOrder ||
            item.imageUrlSnapshot ||
            (item.menuItem ? item.menuItem.imageUrl : null),
          menuItemNameSnapshotAtOrder:
            item.menuItemNameSnapshotAtOrder ||
            item.nameSnapshot ||
            (item.menuItem ? item.menuItem.name : "عنصر غير معروف"),
          menuItemDescriptionAtOrder:
            item.menuItemDescriptionAtOrder ||
            item.descriptionSnapshot ||
            (item.menuItem ? item.menuItem.description : ""),
          menuItemBasePriceSnapshotAtOrder:
            item.menuItemBasePriceSnapshotAtOrder > 0
              ? item.menuItemBasePriceSnapshotAtOrder
              : item.basePriceSnapshot || item.menuItem?.basePrice || 0,
          totalPrice:
            item.totalPrice < 0 ? Math.abs(item.totalPrice) : item.totalPrice,
        }));
      }

      if (details) {
        const calculatedPrices = calculatePricesFromOrderDetails(details);
        details.calculatedPrices = calculatedPrices;
      }

      setOrderDetails(details);
    } catch (error) {
      console.error("Error fetching order details:", error);
      showMessage("error", "خطأ", "فشل تحميل تفاصيل الطلب.");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrderForStatus(null);
    setNewStatus("");
    setStatusDropdownOpen(false);
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilter("all");
    setDateRange({ start: "", end: "" });
    setSelectedUserId("");
    setSelectedBranchId("");
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollToTop();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 1) return [1];

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

  const statusOptions = [
    { value: "Pending", label: "قيد الانتظار" },
    { value: "Confirmed", label: "تم التأكيد" },
    { value: "Preparing", label: "قيد التحضير" },
    { value: "OutForDelivery", label: "قيد التوصيل" },
    { value: "Delivered", label: "تم التوصيل" },
    { value: "Cancelled", label: "ملغي" },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading && isInitialLoad) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: `linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)`,
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
            جارٍ تحميل الطلبات...
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
        <div className="relative bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] py-16 px-4">
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
                <FaShoppingBag className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {isAdminOrRestaurantOrBranch ? "جميع الطلبات" : "طلباتي"}
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                {isAdminOrRestaurantOrBranch
                  ? "إدارة جميع الطلبات وتتبع حالاتها"
                  : "تتبع وإدارة طلباتك وتفاصيل كل طلب"}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-10">
        {/* Content Container */}
        <div className="w-full">
          {/* Filter Section - تصميم على سطرين */}
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
              {/* الصف الأول */}
              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#2E3E88" }}
                  >
                    حالة الطلب
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "status" ? null : "status",
                        )
                      }
                      className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                      style={{
                        background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FaFilter className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                        <span className="font-medium">
                          {filter === "all"
                            ? "جميع الحالات"
                            : getStatusText(filter)}
                        </span>
                      </div>
                      <motion.div
                        animate={{
                          rotate: openDropdown === "status" ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-[#2E3E88]" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openDropdown === "status" && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                        >
                          {[
                            { value: "all", label: "جميع الحالات" },
                            { value: "Pending", label: "قيد الانتظار" },
                            { value: "Confirmed", label: "تم التأكيد" },
                            { value: "Preparing", label: "قيد التحضير" },
                            {
                              value: "OutForDelivery",
                              label: "قيد التوصيل",
                            },
                            { value: "Delivered", label: "تم التوصيل" },
                            { value: "Cancelled", label: "ملغي" },
                          ].map((item) => (
                            <li
                              key={item.value}
                              onClick={() => {
                                setFilter(item.value);
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                            >
                              {item.label}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* User Filter - Only for admin users */}
                {isAdminOrRestaurantOrBranch && (
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      المستخدم
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "user" ? null : "user",
                          )
                        }
                        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <FaUser className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                          <span className="font-medium">
                            {selectedUserId
                              ? users.find((u) => u.id === selectedUserId)
                                  ?.firstName +
                                " " +
                                users.find((u) => u.id === selectedUserId)
                                  ?.lastName
                              : "جميع المستخدمين"}
                          </span>
                        </div>
                        <motion.div
                          animate={{
                            rotate: openDropdown === "user" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown className="text-[#2E3E88]" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openDropdown === "user" && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                          >
                            <li
                              onClick={() => {
                                setSelectedUserId("");
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b"
                            >
                              جميع المستخدمين
                            </li>
                            {loadingUsers ? (
                              <li className="px-4 py-3 text-center text-gray-500">
                                جاري تحميل المستخدمين...
                              </li>
                            ) : (
                              users.map((user) => (
                                <li
                                  key={user.id}
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setCurrentPage(1);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                      {user.imageUrl &&
                                      user.imageUrl !==
                                        "Profiles/Default-Image.jpg" ? (
                                        <img
                                          src={`${BASE_URL}${user.imageUrl}`}
                                          alt={user.firstName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white text-xs">
                                          {user.firstName?.charAt(0)}
                                          {user.lastName?.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* الصف الثاني */}
              <div className="space-y-4">
                {/* Branch Filter - Only for Admin and Restaurant roles */}
                {isAdminOrRestaurant && (
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      الفرع
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "branch" ? null : "branch",
                          )
                        }
                        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <FaStore className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                          <span className="font-medium">
                            {selectedBranchId
                              ? branches.find(
                                  (b) => b.id.toString() === selectedBranchId,
                                )?.name || "فرع غير معروف"
                              : "جميع الفروع"}
                          </span>
                        </div>
                        <motion.div
                          animate={{
                            rotate: openDropdown === "branch" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown className="text-[#2E3E88]" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openDropdown === "branch" && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                          >
                            <li
                              onClick={() => {
                                setSelectedBranchId("");
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b"
                            >
                              جميع الفروع
                            </li>
                            {loadingBranches ? (
                              <li className="px-4 py-3 text-center text-gray-500">
                                جاري تحميل الفروع...
                              </li>
                            ) : (
                              branches.map((branch) => (
                                <li
                                  key={branch.id}
                                  onClick={() => {
                                    setSelectedBranchId(branch.id.toString());
                                    setCurrentPage(1);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] flex items-center justify-center text-white text-xs font-bold">
                                      {branch.name.charAt(0)}
                                    </div>
                                    <div className="font-medium">
                                      {branch.name}
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Date Range Filter */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#2E3E88" }}
                  >
                    التاريخ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          handleDateRangeChange("start", e.target.value);
                        }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                      />
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          handleDateRangeChange("end", e.target.value);
                        }}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                      />
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filter !== "all" ||
              dateRange.start ||
              dateRange.end ||
              selectedUserId ||
              selectedBranchId) && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, #FF6B6B, #FF8E53)`,
                    color: "white",
                  }}
                >
                  <FaTrash />
                  مسح جميع الفلاتر
                </button>
              </div>
            )}
          </div>

          {/* Loading State when fetching orders */}
          {fetchingOrders && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl mb-6">
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
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#2E3E88" }}
                >
                  جارٍ تحميل الطلبات...
                </p>
              </div>
            </div>
          )}

          {/* Orders List */}
          <div>
            {!fetchingOrders && orders.length === 0 ? (
              <div className="w-full">
                <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                    <FaShoppingBag
                      className="text-4xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "#2E3E88" }}
                  >
                    لا توجد طلبات
                  </h3>
                  <p
                    className="mb-6 max-w-md mx-auto"
                    style={{ color: "#32B9CC" }}
                  >
                    {filter !== "all" ||
                    dateRange.start ||
                    dateRange.end ||
                    selectedUserId ||
                    selectedBranchId
                      ? "حاول تعديل معايير التصفية"
                      : "لم تقم بوضع أي طلبات بعد"}
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      color: "white",
                      boxShadow: `0 10px 25px #2E3E8830`,
                    }}
                  >
                    ابدأ التسوق
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order, index) => {
                  const finalTotal = getFinalTotal(order);

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col"
                      style={{
                        borderTop: "4px solid #2E3E88",
                        minHeight: "320px",
                      }}
                    >
                      {/* Header Section - Fixed Height */}
                      <div className="p-6 pb-4 flex-grow-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                              <FaReceipt
                                className="text-xl"
                                style={{ color: "#2E3E88" }}
                              />
                            </div>
                            <div>
                              <h4
                                className="font-bold text-lg"
                                style={{ color: "#2E3E88" }}
                              >
                                طلب #{order.orderNumber}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                                >
                                  {getStatusText(order.status)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatShortArabicDate(order.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details Section - بدون اسكرول */}
                      <div className="px-6 pb-4 flex-grow">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt
                              className="mt-1 flex-shrink-0"
                              style={{ color: "#2E3E88" }}
                            />
                            <div className="flex-1">
                              <span className="text-sm text-gray-500">
                                العنوان
                              </span>
                              <p className="font-medium text-gray-700 line-clamp-1">
                                {order.location
                                  ? order.location.streetName ||
                                    "لم يتم تحديد العنوان"
                                  : "الاستلام من المطعم"}
                              </p>
                            </div>
                          </div>

                          {order.location?.phoneNumber && (
                            <div className="flex items-start gap-3">
                              <FaPhone
                                className="mt-1 flex-shrink-0"
                                style={{ color: "#2E3E88" }}
                              />
                              <div>
                                <span className="text-sm text-gray-500">
                                  الهاتف
                                </span>
                                <p className="font-medium line-clamp-1">
                                  {order.location.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <FaBox
                              className="mt-1 flex-shrink-0"
                              style={{ color: "#2E3E88" }}
                            />
                            <div>
                              <span className="text-sm text-gray-500">
                                الإجمالي
                              </span>
                              <p
                                className="font-bold text-lg"
                                style={{ color: "#2E3E88" }}
                              >
                                ج.م {finalTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {order.totalDiscount > 0 && (
                            <div className="flex items-start gap-3">
                              <FaTag
                                className="mt-1 flex-shrink-0"
                                style={{ color: "#2E3E88" }}
                              />
                              <div>
                                <span className="text-sm text-gray-500">
                                  الخصم
                                </span>
                                <p className="font-medium text-green-600 line-clamp-1">
                                  -ج.م {order.totalDiscount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Section - Fixed at Bottom */}
                      <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex-shrink-0">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                            style={{
                              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                              color: "white",
                            }}
                          >
                            <FaEye />
                            التفاصيل
                          </button>

                          {isAdminOrRestaurantOrBranch && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.id, order.status);
                              }}
                              className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                              style={{
                                background: "#32B9CC10",
                                color: "#32B9CC",
                              }}
                            >
                              <FaSyncAlt />
                              تغيير الحالة
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {isAdminOrRestaurantOrBranch && totalPages > 1 && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-gray-600">
                    عرض {orders.length} من أصل {totalItems} طلب
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 text-[#2E3E88] hover:bg-gradient-to-r hover:from-[#2E3E88]/20 hover:to-[#32B9CC]/20"
                      }`}
                    >
                      <FaChevronRight />
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {getPaginationNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span className="px-2 text-gray-400">...</span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
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
                      className={`p-2 rounded-full transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 text-[#2E3E88] hover:bg-gradient-to-r hover:from-[#2E3E88]/20 hover:to-[#32B9CC]/20"
                      }`}
                    >
                      <FaChevronLeft />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div
                className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <FaReceipt className="text-white text-xl" />
                  <h3 className="text-lg font-bold text-white">
                    تفاصيل الطلب #{selectedOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={closeOrderDetails}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingOrderDetails ? (
                  <div className="text-center py-12">
                    <div
                      className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
                      style={{
                        borderTopColor: "#2E3E88",
                        borderRightColor: "#32B9CC",
                        borderBottomColor: "#2E3E88",
                        borderLeftColor: "transparent",
                      }}
                    ></div>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: "#2E3E88" }}
                    >
                      جارٍ تحميل التفاصيل...
                    </p>
                  </div>
                ) : orderDetails ? (
                  <div className="space-y-4">
                    {/* Order Status and Info */}
                    <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            حالة الطلب
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(orderDetails.status)}`}
                            >
                              {getStatusText(orderDetails.status)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            تاريخ الطلب
                          </p>
                          <p className="font-medium text-gray-700 line-clamp-1">
                            {formatShortArabicDate(orderDetails.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information - Accordion Style */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("customerInfo")}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FaUser style={{ color: "#2E3E88" }} />
                          <h4
                            className="font-bold"
                            style={{ color: "#2E3E88" }}
                          >
                            معلومات العميل
                          </h4>
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedSections.customerInfo ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown style={{ color: "#2E3E88" }} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {expandedSections.customerInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-3">
                              {orderDetails.user?.firstName && (
                                <div className="flex items-center gap-3">
                                  <FaUser className="text-gray-400" />
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      الاسم
                                    </p>
                                    <p className="font-medium text-gray-700">
                                      {orderDetails.user.firstName}{" "}
                                      {orderDetails.user.lastName || ""}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.user?.email && (
                                <div className="flex items-center gap-3">
                                  <FaEnvelope className="text-gray-400" />
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      البريد الإلكتروني
                                    </p>
                                    <p className="font-medium text-gray-700 line-clamp-1">
                                      {orderDetails.user.email}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.user?.phoneNumber && (
                                <div className="flex items-center gap-3">
                                  <FaPhone className="text-gray-400" />
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      رقم الهاتف
                                    </p>
                                    <p className="font-medium text-gray-700">
                                      {orderDetails.user.phoneNumber}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Delivery Information - Accordion Style */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("deliveryInfo")}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FaMapMarkerAlt style={{ color: "#2E3E88" }} />
                          <h4
                            className="font-bold"
                            style={{ color: "#2E3E88" }}
                          >
                            معلومات التوصيل
                          </h4>
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedSections.deliveryInfo ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown style={{ color: "#2E3E88" }} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {expandedSections.deliveryInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4">
                              {orderDetails.location ? (
                                <div className="space-y-2">
                                  <p className="font-medium text-gray-700">
                                    {orderDetails.location.streetName}، مبنى{" "}
                                    {orderDetails.location.buildingNumber}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {orderDetails.location.city?.name || ""} -
                                    الطابق {orderDetails.location.floorNumber}،
                                    شقة {orderDetails.location.flatNumber}
                                  </p>
                                  {orderDetails.location
                                    .detailedDescription && (
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                      {
                                        orderDetails.location
                                          .detailedDescription
                                      }
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="font-medium text-gray-700">
                                  الاستلام من المطعم
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Order Items - Accordion Style */}
                    {orderDetails.items && orderDetails.items.length > 0 && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleSection("orderItems")}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FaBox style={{ color: "#2E3E88" }} />
                            <h4
                              className="font-bold"
                              style={{ color: "#2E3E88" }}
                            >
                              العناصر المطلوبة ({orderDetails.items.length})
                            </h4>
                          </div>
                          <motion.div
                            animate={{
                              rotate: expandedSections.orderItems ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaChevronDown style={{ color: "#2E3E88" }} />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.orderItems && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 space-y-3">
                                {orderDetails.items.map((item, index) => {
                                  const itemFinalPrice =
                                    calculateItemFinalPrice(item);
                                  const imageUrl =
                                    item.menuItemImageUrlSnapshotAtOrder;
                                  const itemName =
                                    item.menuItemNameSnapshotAtOrder ||
                                    "عنصر غير معروف";

                                  return (
                                    <div
                                      key={index}
                                      className="border border-gray-200 rounded-xl p-4"
                                    >
                                      <div className="flex items-start gap-4">
                                        {imageUrl ? (
                                          <img
                                            src={`${BASE_URL}${imageUrl}`}
                                            alt={itemName}
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "";
                                            }}
                                          />
                                        ) : (
                                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <FaBox className="text-gray-400 text-xl" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-gray-800 line-clamp-1">
                                            {itemName}
                                          </h5>
                                          <p className="text-sm text-gray-600 mt-1">
                                            الكمية: {item.quantity}
                                          </p>
                                          {item.note && (
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                              {item.note}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p className="font-bold text-gray-800">
                                            ج.م {itemFinalPrice.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Order Summary - Accordion Style */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("orderSummary")}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FaReceipt style={{ color: "#2E3E88" }} />
                          <h4
                            className="font-bold"
                            style={{ color: "#2E3E88" }}
                          >
                            ملخص الطلب
                          </h4>
                        </div>
                        <motion.div
                          animate={{
                            rotate: expandedSections.orderSummary ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown style={{ color: "#2E3E88" }} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {expandedSections.orderSummary && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  المجموع الجزئي
                                </span>
                                <span className="font-medium">
                                  ج.م{" "}
                                  {orderDetails.totalWithoutFee?.toFixed(2) ||
                                    "0.00"}
                                </span>
                              </div>
                              {orderDetails.totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                  <span className="flex items-center gap-1">
                                    <FaTag />
                                    الخصم
                                  </span>
                                  <span className="font-medium">
                                    -ج.م {orderDetails.totalDiscount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  رسوم التوصيل
                                </span>
                                <span className="font-medium">
                                  ج.م{" "}
                                  {orderDetails.deliveryCost?.toFixed(2) ||
                                    "0.00"}
                                </span>
                              </div>
                              <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center font-bold text-lg">
                                  <span>الإجمالي النهائي</span>
                                  <span style={{ color: "#2E3E88" }}>
                                    ج.م{" "}
                                    {orderDetails.totalWithFee?.toFixed(2) ||
                                      "0.00"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Admin Actions */}
                    {isAdminOrRestaurantOrBranch && (
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            handleUpdateStatus(
                              orderDetails.id,
                              orderDetails.status,
                            );
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <FaSyncAlt />
                          تغيير الحالة
                        </motion.button>
                        {orderDetails.status !== "Cancelled" &&
                          orderDetails.status !== "Delivered" && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) =>
                                handleCancelOrder(orderDetails.id, e)
                              }
                              className="flex-1 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <FaTrash />
                              إلغاء الطلب
                            </motion.button>
                          )}
                        {isAdminOrRestaurantOrBranch && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) =>
                              handleReprintOrder(orderDetails.id, e)
                            }
                            className="flex-1 py-3 bg-gradient-to-r from-[#32B9CC] to-[#2E3E88] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <FaPrint />
                            إعادة طباعة
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      فشل تحميل التفاصيل
                    </h3>
                    <p className="text-gray-600">يرجى المحاولة مرة أخرى</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Modal - بدون اسكرول */}
      <AnimatePresence>
        {showStatusModal && selectedOrderForStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col"
              style={{ maxHeight: "90vh" }}
            >
              {/* Modal Header */}
              <div
                className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <FaSyncAlt className="text-white text-xl" />
                  <h3 className="text-lg font-bold text-white">
                    تغيير حالة الطلب
                  </h3>
                </div>
                <button
                  onClick={closeStatusModal}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Modal Content - بدون overflow-y-auto */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">
                      طلب #{selectedOrderForStatus.orderNumber}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-500">
                        الحالة الحالية:
                      </span>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrderForStatus.status)}`}
                      >
                        {getStatusText(selectedOrderForStatus.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      اختر الحالة الجديدة
                    </label>
                    <div className="space-y-2">
                      {statusOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => setNewStatus(option.value)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            newStatus === option.value
                              ? "bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 border border-[#2E3E88]/20"
                              : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                          }`}
                        >
                          {getStatusIconForOption(option.value)}
                          <span className="font-medium">{option.label}</span>
                          {newStatus === option.value && (
                            <FaCheck className="text-[#2E3E88] ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeStatusModal}
                      className="flex-1 py-3 border-2 rounded-xl font-semibold transition-all duration-300"
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
                      onClick={submitStatusUpdate}
                      disabled={updatingStatus || !newStatus}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        updatingStatus || !newStatus
                          ? "opacity-50 cursor-not-allowed"
                          : "shadow-lg hover:shadow-xl cursor-pointer"
                      }`}
                      style={
                        updatingStatus || !newStatus
                          ? {
                              background: "#e5e7eb",
                              color: "#6b7280",
                            }
                          : {
                              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                              color: "white",
                            }
                      }
                    >
                      {updatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          تحديث الحالة
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
