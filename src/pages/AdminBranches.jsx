import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaPlus, FaBuilding } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { useBranches } from "../hooks/useBranches";
import BranchCard from "../components/adminBranchs/BranchCard";
import SearchBar from "../components/adminUsers/SearchBar";
import BranchForm from "../components/adminBranchs/BranchForm";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { translateErrorMessageAdminBranches } from "../utils/ErrorTranslator";

const adjustTimeForBackend = (timeString) => {
  if (!timeString) return "";

  const convert12to24 = (time12) => {
    if (!time12) return "";

    const time = time12.trim();
    let hours, minutes, period;

    if (time.includes("ص") || time.includes("م")) {
      const match = time.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3];
      }
    } else if (time.includes("AM") || time.includes("PM")) {
      const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3].toUpperCase() === "AM" ? "ص" : "م";
      }
    } else {
      const [h, m] = time.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        return time;
      }
    }

    if (isNaN(hours) || isNaN(minutes)) return "";

    if (period === "م" && hours < 12) {
      hours += 12;
    } else if (period === "ص" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const time24 = convert12to24(timeString);
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setHours(date.getHours() - 2);

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const adjustTimeFromBackend = (timeString) => {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  date.setHours(date.getHours() + 2);

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const convert24To12HourFormat = (time24) => {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? "م" : "ص";
  const hours12 = hours % 12 || 12;

  return `${hours12.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

const convert12To24HourFormat = (time12) => {
  if (!time12) return "";

  if (
    time12.includes(":") &&
    !time12.includes("ص") &&
    !time12.includes("م") &&
    !time12.includes("AM") &&
    !time12.includes("PM")
  ) {
    return time12;
  }

  const time = time12.trim();
  let hours, minutes, period;

  if (time.includes("ص") || time.includes("م")) {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      period = match[3];
    }
  } else if (time.includes("AM") || time.includes("PM")) {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      period = match[3].toUpperCase() === "AM" ? "ص" : "م";
    }
  } else {
    return time12;
  }

  if (isNaN(hours) || isNaN(minutes)) return "";

  if (period === "م" && hours < 12) {
    hours += 12;
  } else if (period === "ص" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const convertErrorObjectToText = (errorMessages) => {
  if (!errorMessages || typeof errorMessages !== "object") {
    return "حدث خطأ غير معروف";
  }

  if (Array.isArray(errorMessages)) {
    return errorMessages.join("، ");
  }

  const allMessages = [];

  Object.keys(errorMessages).forEach((field) => {
    const messages = errorMessages[field];
    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        allMessages.push(msg);
      });
    } else if (typeof messages === "string") {
      allMessages.push(messages);
    }
  });

  if (allMessages.length === 0) {
    return "حدث خطأ غير معروف";
  }

  return allMessages.join("، ");
};

const showMobileMessage = (type, title, text) => {
  if (window.innerWidth < 768) {
    const message = text || title;

    if (type === "success") {
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
    } else if (type === "error") {
      toast.error(message, {
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
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "white",
        },
      });
    } else if (type === "info") {
      toast.info(message, {
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
    } else if (type === "warning") {
      toast.warning(message, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "12px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
          background: "linear-gradient(135deg, #FFA726, #FF9800)",
          color: "white",
        },
      });
    }
    return true;
  }
  return false;
};

const showErrorAlert = (errorMessages) => {
  const errorText = convertErrorObjectToText(errorMessages);

  const isMobile = showMobileMessage("error", "خطأ", errorText);

  if (!isMobile) {
    if (!errorMessages || typeof errorMessages !== "object") {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        html: `<div style="text-align: right; direction: rtl; margin-bottom: 8px; padding-right: 15px; position: relative; font-weight: semibold;">
                <span style="position: absolute; right: 0; top: 0;">-</span>
                حدث خطأ غير معروف
              </div>`,
        timer: 2500,
        showConfirmButton: false,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
      return;
    }

    const allMessages = [];

    Object.keys(errorMessages).forEach((field) => {
      const messages = errorMessages[field];
      if (Array.isArray(messages)) {
        messages.forEach((msg) => {
          allMessages.push(msg);
        });
      }
    });

    if (allMessages.length === 0) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        html: `<div style="text-align: right; direction: rtl; margin-bottom: 8px; padding-right: 15px; position: relative; font-weight: semibold;">
                <span style="position: absolute; right: 0; top: 0;">-</span>
                حدث خطأ غير معروف
              </div>`,
        timer: 2500,
        showConfirmButton: false,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
      return;
    }

    const htmlMessages = allMessages.map(
      (msg) => `
      <div style="
        direction: rtl;
        text-align: right;
        margin-bottom: 8px;
        padding-right: 15px;
        position: relative;
        font-weight: semibold;
        color: white;
      ">
        <span style="position: absolute; right: 0; top: 0;">-</span>
        ${msg}
      </div>`,
    );

    Swal.fire({
      icon: "error",
      title: "خطأ في البيانات",
      html: htmlMessages.join(""),
      timer: 2500,
      showConfirmButton: false,
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    });
  }
};

export default function AdminBranches() {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    locationUrl: "",
    status: "Open",
    openingTime: "",
    closingTime: "",
    isActive: true,
    supportsShifts: false,
    cityId: "",
    managerId: "",
    phoneNumbers: [],
  });

  const {
    branches,
    cities,
    managers,
    isLoading: isLoadingData,
    addBranch,
    updateBranch,
    toggleBranchActive,
  } = useBranches();

  const [filteredBranches, setFilteredBranches] = useState([]);

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

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const profileRes = await axiosInstance.get("/api/Account/Profile");
        const userRoles = profileRes.data.roles;

        if (!userRoles || !userRoles.includes("Admin")) {
          const isMobile = showMobileMessage(
            "error",
            "تم الرفض",
            "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
          );

          if (!isMobile) {
            Swal.fire({
              icon: "error",
              title: "تم الرفض",
              text: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
              timer: 2500,
              showConfirmButton: false,
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              color: "white",
            });
          }

          setTimeout(() => {
            navigate("/");
          }, 2500);
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Failed to verify admin access", err);

        const errorObj = translateErrorMessageAdminBranches(err.response?.data);
        const errorText = convertErrorObjectToText(errorObj);

        const isMobile = showMobileMessage(
          "error",
          "تم الرفض",
          errorText || "فشل في التحقق من صلاحياتك.",
        );

        if (!isMobile) {
          Swal.fire({
            icon: "error",
            title: "تم الرفض",
            text: errorText || "فشل في التحقق من صلاحياتك.",
            timer: 2500,
            showConfirmButton: false,
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
          });
        }

        setTimeout(() => {
          navigate("/");
        }, 2500);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAdminAndFetchData();
  }, [navigate]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBranches(branches);
      return;
    }

    const filtered = branches.filter((branch) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        branch.name?.toLowerCase().includes(searchLower) ||
        branch.address?.toLowerCase().includes(searchLower) ||
        branch.email?.toLowerCase().includes(searchLower) ||
        branch.city?.name?.toLowerCase().includes(searchLower) ||
        branch.phoneNumbers?.some((phone) => phone.phone?.includes(searchTerm))
      );
    });

    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const handleAddNewBranch = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      address: "",
      locationUrl: "",
      status: "Open",
      openingTime: "",
      closingTime: "",
      isActive: true,
      supportsShifts: false,
      cityId: "",
      managerId: "",
      phoneNumbers: [],
    });
  };

  const handleEdit = (branch) => {
    const openingTime24 = branch.openingTime
      ? adjustTimeFromBackend(branch.openingTime)
      : "";
    const closingTime24 = branch.closingTime
      ? adjustTimeFromBackend(branch.closingTime)
      : "";

    setFormData({
      name: branch.name || "",
      email: branch.email || "",
      address: branch.address || "",
      locationUrl: branch.locationUrl || "",
      status: branch.status || "Open",
      openingTime: openingTime24,
      closingTime: closingTime24,
      isActive: branch.isActive !== undefined ? branch.isActive : true,
      supportsShifts:
        branch.supportsShifts !== undefined ? branch.supportsShifts : false,
      cityId: branch.city?.id || "",
      managerId: branch.managerId || "",
      phoneNumbers: branch.phoneNumbers
        ? branch.phoneNumbers.map((phone) => ({
            phone: phone.phone,
            type: phone.type,
            isWhatsapp: phone.type === "Mobile" ? phone.isWhatsapp : false,
          }))
        : [],
    });
    setEditingId(branch.id);
    setIsAdding(true);
  };

  const handleToggleActive = async (branchId, currentStatus) => {
    try {
      await toggleBranchActive(branchId);

      const isMobile = showMobileMessage(
        "success",
        "تم تحديث الحالة",
        `تم ${currentStatus ? "تعطيل" : "تفعيل"} الفرع.`,
      );

      if (!isMobile) {
        Swal.fire({
          icon: "success",
          title: "تم تحديث الحالة",
          text: `تم ${currentStatus ? "تعطيل" : "تفعيل"} الفرع.`,
          timer: 2000,
          showConfirmButton: false,
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
        });
      }
    } catch (errorMessages) {
      showErrorAlert(errorMessages);
    }
  };

  const handleSubmit = async (submitData) => {
    const processedData = {
      ...submitData,
      openingTime: submitData.openingTime
        ? adjustTimeForBackend(convert12To24HourFormat(submitData.openingTime))
        : "",
      closingTime: submitData.closingTime
        ? adjustTimeForBackend(convert12To24HourFormat(submitData.closingTime))
        : "",
      phoneNumbers: submitData.phoneNumbers.map((phone) => ({
        phone: phone.phone,
        type: phone.type,
        isWhatsapp: phone.type === "Mobile" ? phone.isWhatsapp : false,
      })),
    };

    if (!processedData.locationUrl.trim()) {
      delete processedData.locationUrl;
    }

    processedData.supportsShifts =
      submitData.supportsShifts !== undefined
        ? submitData.supportsShifts
        : false;

    try {
      if (editingId) {
        await updateBranch(editingId, processedData);

        const isMobile = showMobileMessage(
          "success",
          "تم تحديث الفرع",
          "تم تحديث الفرع بنجاح.",
        );

        if (!isMobile) {
          Swal.fire({
            icon: "success",
            title: "تم تحديث الفرع",
            text: "تم تحديث الفرع بنجاح.",
            timer: 2000,
            showConfirmButton: false,
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
          });
        }
      } else {
        await addBranch(processedData);

        const isMobile = showMobileMessage(
          "success",
          "تم إضافة الفرع",
          "تم إضافة الفرع الجديد بنجاح.",
        );

        if (!isMobile) {
          Swal.fire({
            icon: "success",
            title: "تم إضافة الفرع",
            text: "تم إضافة الفرع الجديد بنجاح.",
            timer: 2000,
            showConfirmButton: false,
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
          });
        }
      }
      resetForm();
    } catch (errorMessages) {
      showErrorAlert(errorMessages);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      locationUrl: "",
      status: "Open",
      openingTime: "",
      closingTime: "",
      isActive: true,
      supportsShifts: false,
      cityId: "",
      managerId: "",
      phoneNumbers: [],
    });
    setEditingId(null);
    setIsAdding(false);
  };

  if (isLoadingAuth || isLoadingData) {
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
            جارٍ التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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
          className="relative py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
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
                <FaBuilding className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                إدارة الفروع
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                إدارة وإضافة وتعديل فروع المطعم بسهولة وأمان
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-10">
        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewBranch}
          className="fixed bottom-6 right-6 z-40 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <FaPlus className="text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden md:inline font-semibold">إضافة فرع جديد</span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="البحث بالاسم، العنوان، البريد الإلكتروني، المدينة، أو رقم الهاتف..."
            />
          </motion.div>

          {/* Branches Grid - 2 branches per row on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBranches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                getPhoneTypeArabic={getPhoneTypeArabic}
                adjustTimeFromBackend={adjustTimeFromBackend}
              />
            ))}

            {filteredBranches.length === 0 && (
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-8 text-center shadow-xl"
                >
                  <div
                    className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <FaBuilding
                      className="text-4xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "#2E3E88" }}
                  >
                    {searchTerm
                      ? "لم يتم العثور على فروع"
                      : "لا توجد فروع حتى الآن"}
                  </h3>
                  <p
                    className="mb-6 max-w-md mx-auto"
                    style={{ color: "#32B9CC" }}
                  >
                    {searchTerm
                      ? "حاول تعديل مصطلحات البحث"
                      : "أضف فرعك الأول للبدء في إدارة فروع المطعم"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddNewBranch}
                      className="px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        color: "white",
                        boxShadow: "0 10px 25px #2E3E8830",
                      }}
                    >
                      إضافة فرع جديد
                    </button>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <BranchForm
              formData={formData}
              setFormData={setFormData}
              cities={cities}
              managers={managers}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              isEditing={!!editingId}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              convert24To12HourFormat={convert24To12HourFormat}
              convert12To24HourFormat={convert12To24HourFormat}
              adjustTimeFromBackend={adjustTimeFromBackend}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
