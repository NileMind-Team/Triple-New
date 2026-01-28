import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPercent,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
  FaHamburger,
  FaTag,
  FaClock,
  FaChevronDown,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";

const translateOfferErrorMessage = (errorData, useHTML = true) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (Array.isArray(errorData.errors)) {
    const errorMessages = errorData.errors.map((error) => {
      switch (error.code) {
        case "ItemOffer.ItemOfferAlreadyExists":
          return "هناك عرض نشط لهذا العنصر بالفعل.";
        case "ItemOffer.StartDateMustBeInFuture":
          return "تاريخ البداية يجب أن يكون في المستقبل.";
        case "ItemOffer.EndDateMustBeAfterStartDate":
          return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.";
        case "ItemOffer.InvalidDiscountValue":
          return "قيمة الخصم غير صالحة.";
        case "ItemOffer.DiscountPercentageOutOfRange":
          return "نسبة الخصم يجب أن تكون بين 0 و 100.";
        case "ItemOffer.MenuItemNotFound":
          return "العنصر المحدد غير موجود.";
        case "ItemOffer.BranchNotFound":
          return "أحد الفروع المحددة غير موجود.";
        case "ItemOffer.OfferNotFound":
          return "العرض المطلوب غير موجود.";
        case "ItemOffer.OfferAlreadyActive":
          return "العرض نشط بالفعل.";
        case "ItemOffer.OfferAlreadyInactive":
          return "العرض غير نشط بالفعل.";
        case "ItemOffer.CannotUpdateMenuItem":
          return "لا يمكن تغيير العنصر أثناء التعديل.";
        default:
          return error.description || error.code;
      }
    });

    if (errorMessages.length > 1) {
      if (useHTML) {
        const htmlMessages = errorMessages.map(
          (msg) =>
            `<div style="direction: rtl; text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;">•</span>
           </div>`,
        );
        return htmlMessages.join("");
      } else {
        return errorMessages.join(" - ");
      }
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (
      errorData.errors.DiscountValue &&
      Array.isArray(errorData.errors.DiscountValue)
    ) {
      errorData.errors.DiscountValue.forEach((msg) => {
        if (msg.toLowerCase().includes("greater than 0")) {
          errorMessages.push("قيمة الخصم يجب أن تكون أكبر من الصفر");
        } else if (msg.toLowerCase().includes("required")) {
          errorMessages.push("قيمة الخصم مطلوبة");
        } else if (
          msg.toLowerCase().includes("percentage") &&
          msg.toLowerCase().includes("100")
        ) {
          errorMessages.push(
            "قيمة الخصم بالنسبة المئوية يجب أن تكون بين 0 و 100",
          );
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.EndDate && Array.isArray(errorData.errors.EndDate)) {
      errorData.errors.EndDate.forEach((msg) => {
        if (msg.toLowerCase().includes("after start date")) {
          errorMessages.push("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
        } else if (msg.toLowerCase().includes("required")) {
          errorMessages.push("تاريخ النهاية مطلوب");
        } else if (msg.toLowerCase().includes("future")) {
          errorMessages.push("تاريخ النهاية يجب أن يكون في المستقبل");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (
      errorData.errors.StartDate &&
      Array.isArray(errorData.errors.StartDate)
    ) {
      errorData.errors.StartDate.forEach((msg) => {
        if (msg.toLowerCase().includes("required")) {
          errorMessages.push("تاريخ البداية مطلوب");
        } else if (msg.toLowerCase().includes("future")) {
          errorMessages.push("تاريخ البداية يجب أن يكون في المستقبل");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (
      errorData.errors.MenuItemId &&
      Array.isArray(errorData.errors.MenuItemId)
    ) {
      errorData.errors.MenuItemId.forEach((msg) => {
        if (msg.toLowerCase().includes("required")) {
          errorMessages.push("العنصر مطلوب");
        } else if (
          msg.toLowerCase().includes("exist") ||
          msg.toLowerCase().includes("not found")
        ) {
          errorMessages.push("العنصر المحدد غير موجود");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (
      errorData.errors.BranchesIds &&
      Array.isArray(errorData.errors.BranchesIds)
    ) {
      errorData.errors.BranchesIds.forEach((msg) => {
        if (
          msg.toLowerCase().includes("required") ||
          msg.toLowerCase().includes("at least")
        ) {
          errorMessages.push("يجب اختيار فرع واحد على الأقل");
        } else if (
          msg.toLowerCase().includes("exist") ||
          msg.toLowerCase().includes("not found")
        ) {
          errorMessages.push("أحد الفروع المحددة غير موجود");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (
        ![
          "DiscountValue",
          "EndDate",
          "StartDate",
          "MenuItemId",
          "BranchesIds",
        ].includes(key)
      ) {
        const errorValue = errorData.errors[key];
        if (Array.isArray(errorValue)) {
          errorValue.forEach((msg) => {
            errorMessages.push(msg);
          });
        } else if (typeof errorValue === "string") {
          errorMessages.push(errorValue);
        } else if (errorValue && typeof errorValue === "object") {
          Object.values(errorValue).forEach((nestedMsg) => {
            if (typeof nestedMsg === "string") {
              errorMessages.push(nestedMsg);
            }
          });
        }
      }
    });

    if (errorMessages.length > 1) {
      if (useHTML) {
        const htmlMessages = errorMessages.map(
          (msg, index) =>
            `<div style="direction: rtl; text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;">${index + 1}</span>
           </div>`,
        );
        return htmlMessages.join("");
      } else {
        return errorMessages.join(" - ");
      }
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    if (msg.includes("timeout") || msg.includes("time out")) {
      return "انتهت المهلة، يرجى المحاولة مرة أخرى";
    }
    if (msg.includes("unauthorized") || msg.includes("forbidden")) {
      return "ليس لديك صلاحية للقيام بهذا الإجراء";
    }
    if (msg.includes("conflict")) {
      return "هناك تعارض في البيانات. قد يكون هناك عرض نشط للعنصر بالفعل.";
    }
    return errorData.message;
  }

  return "حدث خطأ غير متوقع أثناء حفظ العرض";
};

const adjustTimeForAPI = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  date.setTime(date.getTime() - 2 * 60 * 60 * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

const adjustTimeFromAPI = (dateString) => {
  if (!dateString) return new Date();

  const date = new Date(dateString);
  date.setTime(date.getTime() + 2 * 60 * 60 * 1000);

  return date;
};

const showOfferMessage = (type, title, text, options = {}) => {
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
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
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
      default:
        toast.info(text, toastOptions);
    }
  }
};

export default function ItemOffersManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [offers, setOffers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  const selectedProductId = location.state?.selectedProductId || "";
  const selectedOfferId = location.state?.selectedOfferId || null;

  const [formData, setFormData] = useState({
    menuItemId: selectedProductId.toString() || "",
    isPercentage: true,
    discountValue: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isEnabled: true,
    branchesIds: [],
  });

  useEffect(() => {
    const checkUserRoleAndFetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const userResponse = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = userResponse.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);

        if (!hasAdminOrRestaurantOrBranchRole) {
          navigate("/");
          return;
        }

        const branchesResponse = await axiosInstance.get(
          "/api/Branches/GetList",
        );
        setBranches(branchesResponse.data);

        await fetchOffers(branchesResponse.data);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          setIsAdminOrRestaurantOrBranch(false);
          navigate("/");
          return;
        }

        showOfferMessage(
          "error",
          "خطأ في الاتصال",
          "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.",
        );
      } finally {
        setLoading(false);
      }
    };

    checkUserRoleAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (selectedProductId && !loading) {
      handleAddNewOffer();
    }

    if (selectedOfferId && offers.length > 0) {
      const existingOffer = offers.find(
        (offer) => offer.id === selectedOfferId,
      );
      if (existingOffer) {
        handleEdit(existingOffer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, selectedOfferId, loading, offers]);

  useEffect(() => {
    if (selectedProductId) {
      setFormData((prev) => ({
        ...prev,
        menuItemId: selectedProductId.toString(),
      }));
    }
  }, [selectedProductId]);

  const fetchOffers = async (branchesList = branches) => {
    try {
      const response = await axiosInstance.get("/api/ItemOffers/GetAll");
      const offersData = response.data;

      const offersWithDetails = await Promise.all(
        offersData.map(async (offer) => {
          try {
            const menuItemResponse = await axiosInstance.get(
              `/api/MenuItems/Get/${offer.menuItemId}`,
            );

            const adjustedStartDate = adjustTimeFromAPI(offer.startDate);
            const adjustedEndDate = adjustTimeFromAPI(offer.endDate);

            let branchNames = [];
            if (offer.branchesIds && offer.branchesIds.length > 0) {
              branchNames = offer.branchesIds.map((branchId) => {
                const branch = branchesList.find((b) => b.id === branchId);
                return branch ? branch.name : `فرع #${branchId}`;
              });
            } else {
              branchNames = branchesList.map((b) => b.name);
            }

            return {
              ...offer,
              menuItem: menuItemResponse.data,
              branchNames: branchNames,
              startDate: adjustedStartDate,
              endDate: adjustedEndDate,
            };
          } catch (error) {
            console.error(`خطأ في جلب العنصر ${offer.menuItemId}:`, error);
            return {
              ...offer,
              menuItem: null,
              branchNames: [],
              startDate: adjustTimeFromAPI(offer.startDate),
              endDate: adjustTimeFromAPI(offer.endDate),
            };
          }
        }),
      );

      setOffers(offersWithDetails);
    } catch (error) {
      console.error("خطأ في جلب العروض:", error);
      showOfferMessage("error", "خطأ", "فشل في تحميل بيانات العروض");
    }
  };

  const fetchMenuItems = async () => {
    setLoadingItems(true);
    try {
      const response = await axiosInstance.get(
        "/api/MenuItems/GetAllWithoutPagination",
      );

      const itemsWithoutActiveOffers = response.data.filter((item) => {
        if (!item.itemOffer) return true;

        const offer = item.itemOffer;
        const now = new Date();
        const startDate = adjustTimeFromAPI(offer.startDate);
        const endDate = adjustTimeFromAPI(offer.endDate);

        return !(offer.isEnabled && startDate <= now && endDate >= now);
      });

      setMenuItems(itemsWithoutActiveOffers);
    } catch (error) {
      console.error("خطأ في جلب العناصر:", error);
      showOfferMessage("error", "خطأ", "فشل في تحميل العناصر");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError(null);
  };

  const handleBranchesChange = (branchId) => {
    setFormData((prev) => {
      if (prev.branchesIds.includes(branchId)) {
        return {
          ...prev,
          branchesIds: prev.branchesIds.filter((id) => id !== branchId),
        };
      } else {
        return {
          ...prev,
          branchesIds: [...prev.branchesIds, branchId],
        };
      }
    });
    setError(null);
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setOpenDropdown(null);
    setError(null);
  };

  const formatDateTimeForAPI = (date, time) => {
    if (!date) return "";

    const dateObj = new Date(date);

    if (time) {
      const [hours, minutes] = time.split(":");
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      dateObj.setHours(0, 0, 0, 0);
    }

    return adjustTimeForAPI(dateObj.toISOString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.menuItemId ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      showOfferMessage(
        "error",
        "معلومات ناقصة",
        "يرجى ملء جميع الحقول المطلوبة",
      );
      return;
    }

    if (formData.branchesIds.length === 0) {
      showOfferMessage(
        "error",
        "لم يتم اختيار فروع",
        "يرجى اختيار فرع واحد على الأقل",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const offerData = {
        menuItemId: parseInt(formData.menuItemId),
        isPercentage: formData.isPercentage,
        discountValue: parseFloat(formData.discountValue),
        startDate: formatDateTimeForAPI(formData.startDate, formData.startTime),
        endDate: formatDateTimeForAPI(formData.endDate, formData.endTime),
        isEnabled: formData.isEnabled,
        branchesIds: formData.branchesIds.map((id) => parseInt(id)),
      };

      console.log("إرسال بيانات العرض:", offerData);

      if (editingId) {
        const res = await axiosInstance.put(
          `/api/ItemOffers/Update/${editingId}`,
          offerData,
        );
        if (res.status === 200 || res.status === 204) {
          showOfferMessage(
            "success",
            "تم تحديث العرض",
            "تم تحديث عرض العنصر بنجاح.",
          );
        }
      } else {
        const res = await axiosInstance.post("/api/ItemOffers/Add", offerData);
        if (res.status === 200 || res.status === 201) {
          showOfferMessage(
            "success",
            "تم إضافة العرض",
            "تم إضافة عرض العنصر الجديد بنجاح.",
          );
        }
      }

      resetForm();
      fetchOffers();
      fetchMenuItems();
    } catch (err) {
      console.error("خطأ في حفظ العرض:", err);

      setError(err.response?.data);

      const translatedMessage = translateOfferErrorMessage(
        err.response?.data,
        false,
      );

      showOfferMessage("error", "حدث خطأ", translatedMessage, { timer: 2500 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    const startDateObj = new Date(offer.startDate);
    const endDateObj = new Date(offer.endDate);

    const currentBranchesIds =
      offer.branchesIds && offer.branchesIds.length > 0
        ? offer.branchesIds
        : branches.map((branch) => branch.id);

    setFormData({
      menuItemId: offer.menuItemId.toString(),
      isPercentage: offer.isPercentage,
      discountValue: offer.discountValue.toString(),
      startDate: startDateObj.toISOString().split("T")[0],
      startTime: startDateObj.toTimeString().slice(0, 5),
      endDate: endDateObj.toISOString().split("T")[0],
      endTime: endDateObj.toTimeString().slice(0, 5),
      isEnabled: offer.isEnabled,
      branchesIds: currentBranchesIds,
    });
    setEditingId(offer.id);
    setIsAdding(true);
    fetchMenuItems();
    setError(null);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/ItemOffers/Delete/${id}`);
          fetchOffers();
          showOfferMessage("success", "تم الحذف!", "تم حذف عرض العنصر.");
          fetchMenuItems();
        } catch (err) {
          showOfferMessage("error", "خطأ", "فشل في حذف عرض العنصر.", {
            timer: 2500,
          });
        }
      }
    });
  };

  const handleToggleActive = async (id, e) => {
    e.stopPropagation();

    const offer = offers.find((o) => o.id === id);
    if (!offer) return;

    const offerData = {
      menuItemId: offer.menuItemId,
      isPercentage: offer.isPercentage,
      discountValue: offer.discountValue,
      startDate: adjustTimeForAPI(offer.startDate),
      endDate: adjustTimeForAPI(offer.endDate),
      isEnabled: !offer.isEnabled,
      branchesIds: offer.branchesIds || branches.map((branch) => branch.id),
    };

    try {
      const response = await axiosInstance.put(
        `/api/ItemOffers/Update/${id}`,
        offerData,
      );
      if (response.status === 200 || response.status === 204) {
        fetchOffers();
        showOfferMessage(
          "success",
          "تم تحديث الحالة!",
          `تم ${offer.isEnabled ? "تعطيل" : "تفعيل"} عرض العنصر`,
          { timer: 1500 },
        );
        fetchMenuItems();
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة العرض:", error);
      showOfferMessage("error", "خطأ", "فشل في تحديث حالة العرض", {
        timer: 2500,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      menuItemId: selectedProductId.toString() || "",
      isPercentage: true,
      discountValue: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      isEnabled: true,
      branchesIds: [],
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
    setError(null);
  };

  const handleAddNewOffer = () => {
    fetchMenuItems();
    setIsAdding(true);
    setError(null);
  };

  const isFormValid = () => {
    return (
      formData.menuItemId.trim() !== "" &&
      formData.discountValue !== "" &&
      formData.startDate !== "" &&
      formData.endDate !== ""
    );
  };

  const getStatusColor = (offer) => {
    if (!offer.isEnabled) return "#FF6B6B";
    if (new Date(offer.endDate) < new Date()) return "#9E9E9E";
    if (new Date(offer.startDate) > new Date()) return "#32B9CC";
    return "#4CAF50";
  };

  const getStatusText = (offer) => {
    if (!offer.isEnabled) return "غير نشط";
    if (new Date(offer.endDate) < new Date()) return "منتهي";
    if (new Date(offer.startDate) > new Date()) return "قادم";
    return "نشط";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            جارٍ تحميل العروض...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdminOrRestaurantOrBranch) {
    return null;
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
          className="relative py-12 md:py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-8 md:pt-10"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaTag className="text-white text-2xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-2">
                عروض العناصر
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
                إدارة وتنظيم العروض والخصومات على المنتجات
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8 -mt-8 md:-mt-10 relative z-10">
        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewOffer}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
          style={{
            fontSize: "14px",
          }}
        >
          <FaPlus className="text-lg md:text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden sm:inline font-semibold">إنشاء عرض جديد</span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          {/* Offers List */}
          <div>
            {offers.length === 0 ? (
              <div className="w-full">
                <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-xl">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaTag
                      className="text-2xl md:text-3xl lg:text-4xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold mb-2 md:mb-3"
                    style={{ color: "#2E3E88" }}
                  >
                    لا توجد عروض حتى الآن
                  </h3>
                  <p
                    className="mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base"
                    style={{ color: "#32B9CC" }}
                  >
                    قم بإنشاء أول عرض للبدء في إدارة الخصومات
                  </p>
                  <button
                    onClick={handleAddNewOffer}
                    className="px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm md:text-base"
                    style={{
                      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                      color: "white",
                      boxShadow: "0 10px 25px #2E3E8830",
                    }}
                  >
                    إنشاء أول عرض
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                {offers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col"
                    style={{
                      borderTop: "4px solid #2E3E88",
                    }}
                  >
                    <div className="p-4 md:p-6 flex-grow">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                            {offer.isPercentage ? (
                              <FaPercent
                                className="text-lg md:text-xl lg:text-2xl"
                                style={{ color: "#2E3E88" }}
                              />
                            ) : (
                              <FaMoneyBillWave
                                className="text-lg md:text-xl lg:text-2xl"
                                style={{ color: "#2E3E88" }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className="font-bold text-base md:text-lg lg:text-xl mb-1 truncate"
                              style={{ color: "#2E3E88" }}
                            >
                              {offer.menuItem?.name ||
                                `عنصر #${offer.menuItemId}`}
                            </h4>
                            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                              <span
                                className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                style={{
                                  background: getStatusColor(offer) + "20",
                                  color: getStatusColor(offer),
                                }}
                              >
                                {getStatusText(offer)}
                              </span>
                              {offer.menuItem?.basePrice === 0 && (
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                  style={{
                                    background: "#FF8E5320",
                                    color: "#FF8E53",
                                  }}
                                >
                                  السعر حسب الطلب
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div
                              className="p-1.5 md:p-2 rounded-md md:rounded-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                              }}
                            >
                              {offer.isPercentage ? (
                                <FaPercent
                                  className="text-base md:text-lg"
                                  style={{ color: "#2E3E88" }}
                                />
                              ) : (
                                <FaMoneyBillWave
                                  className="text-base md:text-lg"
                                  style={{ color: "#2E3E88" }}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-xs mb-1 truncate"
                                style={{ color: "#32B9CC" }}
                              >
                                قيمة الخصم
                              </p>
                              <p
                                className="font-bold text-sm md:text-base truncate"
                                style={{ color: "#2E3E88" }}
                              >
                                {offer.isPercentage
                                  ? `${offer.discountValue}%`
                                  : `ج.م ${offer.discountValue}`}
                              </p>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div
                              className="p-1.5 md:p-2 rounded-md md:rounded-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                              }}
                            >
                              <FaHamburger
                                className="text-base md:text-lg"
                                style={{ color: "#2E3E88" }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-xs mb-1 truncate"
                                style={{ color: "#32B9CC" }}
                              >
                                السعر الأصلي
                              </p>
                              <p
                                className="font-bold text-sm md:text-base truncate"
                                style={{ color: "#2E3E88" }}
                              >
                                {offer.menuItem?.basePrice === 0 ? (
                                  <span style={{ color: "#FF8E53" }}>
                                    حسب الطلب
                                  </span>
                                ) : (
                                  `ج.م ${offer.menuItem?.basePrice || "غير متاح"}`
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div
                            className="p-2 md:p-3 rounded-lg md:rounded-xl"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                              <FaCalendarAlt
                                className="text-sm md:text-base"
                                style={{ color: "#2E3E88" }}
                              />
                              <p
                                className="text-xs font-semibold truncate"
                                style={{ color: "#2E3E88" }}
                              >
                                من
                              </p>
                            </div>
                            <p
                              className="text-xs md:text-sm font-bold truncate"
                              style={{ color: "#32B9CC" }}
                            >
                              {formatDateTime(offer.startDate)}
                            </p>
                          </div>

                          <div
                            className="p-2 md:p-3 rounded-lg md:rounded-xl"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                              <FaCalendarAlt
                                className="text-sm md:text-base"
                                style={{ color: "#2E3E88" }}
                              />
                              <p
                                className="text-xs font-semibold truncate"
                                style={{ color: "#2E3E88" }}
                              >
                                إلى
                              </p>
                            </div>
                            <p
                              className="text-xs md:text-sm font-bold truncate"
                              style={{ color: "#32B9CC" }}
                            >
                              {formatDateTime(offer.endDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Branches */}
                      <div className="mb-4 md:mb-6">
                        <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                          <FaStore
                            className="text-sm md:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                          <p
                            className="text-xs md:text-sm font-semibold truncate"
                            style={{ color: "#2E3E88" }}
                          >
                            الفروع المطبق عليها
                          </p>
                        </div>
                        {offer.branchNames && offer.branchNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {offer.branchNames
                              .slice(0, 3)
                              .map((branchName, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 truncate max-w-[120px] md:max-w-none"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                                    color: "#2E3E88",
                                    border: "1px solid #2E3E8820",
                                  }}
                                >
                                  <FaStore
                                    className="text-xs"
                                    style={{ color: "#32B9CC" }}
                                  />
                                  <span className="truncate">{branchName}</span>
                                </span>
                              ))}
                            {offer.branchNames.length > 3 && (
                              <span
                                className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                                  color: "#32B9CC",
                                  border: "1px solid #2E3E8820",
                                }}
                              >
                                +{offer.branchNames.length - 3} أكثر
                              </span>
                            )}
                          </div>
                        ) : (
                          <p
                            className="text-xs md:text-sm truncate"
                            style={{ color: "#32B9CC" }}
                          >
                            جميع الفروع
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 md:gap-3 pt-4 md:pt-6 border-t border-gray-100">
                        <button
                          onClick={(e) => handleToggleActive(offer.id, e)}
                          className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                          style={{
                            background: offer.isEnabled
                              ? "#FF6B6B10"
                              : "#4CAF5010",
                            color: offer.isEnabled ? "#FF6B6B" : "#4CAF50",
                          }}
                        >
                          {offer.isEnabled ? (
                            <FaTimesCircle className="text-sm md:text-base" />
                          ) : (
                            <FaCheckCircle className="text-sm md:text-base" />
                          )}
                          <span>{offer.isEnabled ? "تعطيل" : "تفعيل"}</span>
                        </button>
                        <button
                          onClick={() => handleEdit(offer)}
                          className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                          style={{
                            background: "#32B9CC10",
                            color: "#32B9CC",
                          }}
                        >
                          <FaEdit className="text-sm md:text-base" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                          style={{
                            background: "#FF6B6B10",
                            color: "#FF6B6B",
                          }}
                        >
                          <FaTrash className="text-sm md:text-base" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Offer Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col mx-2"
            >
              {/* Modal Header */}
              <div
                className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  {editingId ? (
                    <FaEdit className="text-sm md:text-base" />
                  ) : (
                    <FaPlus className="text-sm md:text-base" />
                  )}
                  <h3 className="text-base md:text-lg font-bold text-white">
                    {editingId ? "تعديل العرض" : "إنشاء عرض جديد"}
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1.5 md:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={14} className="md:size-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 md:space-y-4"
                >
                  {/* Menu Item Dropdown */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-1.5 md:mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      العنصر
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (editingId) return;
                          setOpenDropdown(
                            openDropdown === "menuItem" ? null : "menuItem",
                          );
                          if (
                            !menuItems.length &&
                            openDropdown !== "menuItem"
                          ) {
                            fetchMenuItems();
                          }
                        }}
                        disabled={editingId !== null}
                        className="w-full flex items-center justify-between border border-gray-200 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 transition-all hover:border-[#2E3E88] group text-right disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                        }}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <FaHamburger
                            className="group-hover:scale-110 transition-transform text-sm md:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                          <span className="font-medium truncate text-right">
                            {formData.menuItemId
                              ? (() => {
                                  const selectedItem = menuItems.find(
                                    (item) =>
                                      item.id.toString() ===
                                      formData.menuItemId,
                                  );
                                  return selectedItem
                                    ? `${selectedItem.name} - ${
                                        selectedItem.basePrice === 0
                                          ? "السعر حسب الطلب"
                                          : `ج.م ${selectedItem.basePrice}`
                                      }${
                                        selectedItem.category
                                          ? ` (${selectedItem.category.name})`
                                          : ""
                                      }`
                                    : "اختر عنصر";
                                })()
                              : "اختر عنصر"}
                          </span>
                        </div>
                        <motion.div
                          animate={{
                            rotate: openDropdown === "menuItem" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {loadingItems ? (
                            <FaSpinner
                              className="animate-spin text-sm md:text-base"
                              style={{ color: "#2E3E88" }}
                            />
                          ) : (
                            <FaChevronDown
                              className="text-sm md:text-base"
                              style={{ color: "#2E3E88" }}
                            />
                          )}
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {openDropdown === "menuItem" && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 mt-1 md:mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-lg md:rounded-xl overflow-hidden max-h-48 md:max-h-64 overflow-y-auto"
                          >
                            {loadingItems ? (
                              <div className="flex items-center justify-center py-3 md:py-4">
                                <FaSpinner
                                  className="animate-spin text-base md:text-lg mr-1 md:mr-2"
                                  style={{ color: "#2E3E88" }}
                                />
                                <span
                                  className="text-sm md:text-base"
                                  style={{ color: "#2E3E88" }}
                                >
                                  جاري تحميل العناصر...
                                </span>
                              </div>
                            ) : menuItems.length === 0 ? (
                              <div className="px-3 md:px-4 py-2 md:py-3 text-center">
                                <p
                                  className="text-xs md:text-sm"
                                  style={{ color: "#32B9CC" }}
                                >
                                  {editingId
                                    ? "لا يمكن تغيير العنصر أثناء التعديل"
                                    : "لا توجد عناصر متاحة أو جميع العناصر لديها عروض نشطة بالفعل"}
                                </p>
                              </div>
                            ) : (
                              <div>
                                {menuItems.map((item) => (
                                  <li
                                    key={item.id}
                                    onClick={() => {
                                      handleSelectChange(
                                        "menuItemId",
                                        item.id.toString(),
                                      );
                                      setOpenDropdown(null);
                                    }}
                                    className="px-3 md:px-4 py-2 md:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-right text-sm md:text-base"
                                  >
                                    <div
                                      className="font-medium truncate"
                                      style={{ color: "#2E3E88" }}
                                    >
                                      {item.name}
                                    </div>
                                    <div
                                      className="text-xs mt-0.5 md:mt-1 truncate"
                                      style={{ color: "#32B9CC" }}
                                    >
                                      {item.basePrice === 0
                                        ? "السعر حسب الطلب"
                                        : `ج.م ${item.basePrice}`}
                                      {item.category &&
                                        ` • ${item.category.name}`}
                                    </div>
                                  </li>
                                ))}
                              </div>
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                    {editingId && (
                      <p
                        className="text-xs mt-1 text-right"
                        style={{ color: "#32B9CC" }}
                      >
                        لا يمكن تغيير العنصر أثناء تعديل عرض موجود
                      </p>
                    )}
                  </div>

                  {/* Discount Type and Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        نوع الخصم
                      </label>
                      <div className="space-y-1.5 md:space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                          <input
                            type="radio"
                            name="isPercentage"
                            checked={formData.isPercentage}
                            onChange={() =>
                              setFormData({ ...formData, isPercentage: true })
                            }
                            style={{ accentColor: "#2E3E88" }}
                          />
                          <span style={{ color: "#2E3E88" }}>
                            نسبة مئوية (%)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                          <input
                            type="radio"
                            name="isPercentage"
                            checked={!formData.isPercentage}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                isPercentage: false,
                              })
                            }
                            style={{ accentColor: "#2E3E88" }}
                          />
                          <span style={{ color: "#2E3E88" }}>
                            مبلغ ثابت (ج.م)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        قيمة الخصم
                      </label>
                      <div className="relative group">
                        {formData.isPercentage ? (
                          <FaPercent
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                        ) : (
                          <FaMoneyBillWave
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                        )}
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max={formData.isPercentage ? "100" : ""}
                          step={formData.isPercentage ? "1" : "0.01"}
                          className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          placeholder={formData.isPercentage ? "0-100" : "0.00"}
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Start Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        تاريخ البداية
                      </label>
                      <div className="relative group">
                        <FaCalendarAlt
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        وقت البداية
                      </label>
                      <div className="relative group">
                        <FaClock
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        تاريخ النهاية
                      </label>
                      <div className="relative group">
                        <FaCalendarAlt
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                          min={formData.startDate}
                          className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        وقت النهاية
                      </label>
                      <div className="relative group">
                        <FaClock
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm md:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branches */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-1.5 md:mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      الفروع المطبق عليها
                    </label>
                    <div
                      className="border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 max-h-40 md:max-h-48 overflow-y-auto"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      {branches.length === 0 ? (
                        <div className="text-center py-3 md:py-4">
                          <FaStore
                            className="mx-auto text-lg md:text-xl lg:text-2xl mb-1 md:mb-2"
                            style={{ color: "#2E3E88" }}
                          />
                          <p
                            className="text-sm md:text-base"
                            style={{ color: "#32B9CC" }}
                          >
                            لا توجد فروع متاحة
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 md:space-y-2">
                          {branches.map((branch) => (
                            <label
                              key={branch.id}
                              className="flex items-center gap-2 md:gap-3 cursor-pointer p-1.5 md:p-2 hover:bg-gray-50 rounded-md md:rounded-lg transition-colors duration-200 text-sm md:text-base"
                            >
                              <input
                                type="checkbox"
                                checked={formData.branchesIds.includes(
                                  branch.id,
                                )}
                                onChange={() => handleBranchesChange(branch.id)}
                                style={{ accentColor: "#2E3E88" }}
                              />
                              <div className="flex items-center gap-1.5 md:gap-2 flex-1 justify-between">
                                <span
                                  className="truncate"
                                  style={{ color: "#2E3E88" }}
                                >
                                  {branch.name}
                                </span>
                                <FaStore
                                  className="text-sm md:text-base"
                                  style={{ color: "#32B9CC" }}
                                />
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 text-right"
                      style={{ color: "#32B9CC" }}
                    >
                      اختر فرع واحد على الأقل للعرض
                    </p>
                  </div>

                  {/* Active Status */}
                  <div
                    className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg md:rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                      border: "1px solid #2E3E8820",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isEnabled"
                      checked={formData.isEnabled}
                      onChange={handleInputChange}
                      style={{ accentColor: "#2E3E88" }}
                    />
                    <label
                      className="text-sm md:text-base"
                      style={{ color: "#2E3E88" }}
                    >
                      نشط (متاح للاستخدام)
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="flex-1 py-2.5 md:py-3.5 border-2 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-sm md:text-base"
                      style={{
                        borderColor: "#2E3E88",
                        color: "#2E3E88",
                        background: "transparent",
                      }}
                    >
                      إلغاء
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={
                        !isFormValid() ||
                        formData.branchesIds.length === 0 ||
                        isSubmitting
                      }
                      className={`flex-1 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base ${
                        isFormValid() &&
                        formData.branchesIds.length > 0 &&
                        !isSubmitting
                          ? "shadow-lg hover:shadow-xl cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      style={
                        isFormValid() &&
                        formData.branchesIds.length > 0 &&
                        !isSubmitting
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
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin text-sm md:text-base" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <FaSave className="text-sm md:text-base" />
                          {editingId ? "تحديث" : "إنشاء"}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
