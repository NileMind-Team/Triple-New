import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaCity,
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
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
      position: "top-left",
      autoClose: options.timer || 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        width: "70vw",
        maxWidth: "none",
        minWidth: "200px",
        fontSize: "14px",
        borderRadius: "12px",
        left: "0",
        top: "0",
        margin: "0",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        zIndex: 9999,
        background:
          type === "error"
            ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
            : type === "warning"
              ? "linear-gradient(135deg, #FFA726, #FF9800)"
              : type === "success"
                ? "linear-gradient(135deg, #2E3E88, #32B9CC)"
                : "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
        textAlign: "right",
        direction: "rtl",
      },
      bodyStyle: {
        padding: "12px 16px",
        textAlign: "right",
        direction: "rtl",
        width: "100%",
        overflow: "hidden",
        margin: 0,
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
      confirmButtonColor: options.confirmButtonColor || "#2E3E88",
      timer: options.timer || 2500,
      showConfirmButton:
        options.showConfirmButton !== undefined
          ? options.showConfirmButton
          : false,
      background: "linear-gradient(135deg, #f0f8ff, #e0f7fa)",
      color: "#2E3E88",
      ...options,
    });
  }
};

const translateErrorMessage = (errorData) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (Array.isArray(errorData.errors)) {
    const error = errorData.errors[0];
    switch (error.code) {
      case "User.InvalidCredentials":
        return "اسم المستخدم أو كلمة المرور غير صحيحة";
      default:
        return error.description || "حدث خطأ في المصادقة";
    }
  }

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.Name) {
      errorData.errors.Name.forEach((msg) => {
        if (
          msg.toLowerCase().includes("already used") ||
          msg.toLowerCase().includes("مستخدم") ||
          msg === "name is already used."
        ) {
          errorMessages.push("اسم المدينة مستخدم بالفعل");
        } else if (
          msg.toLowerCase().includes("required") ||
          msg.toLowerCase().includes("مطلوب")
        ) {
          errorMessages.push("اسم المدينة مطلوب");
        } else if (
          msg.toLowerCase().includes("length") ||
          msg.toLowerCase().includes("طول")
        ) {
          errorMessages.push("اسم المدينة يجب أن يكون بين 3 و 100 حرف");
        } else {
          const translated = msg
            .replace("name", "الاسم")
            .replace("is required", "مطلوب")
            .replace("must be", "يجب أن يكون")
            .replace("characters", "حروف")
            .replace("minimum", "الحد الأدنى")
            .replace("maximum", "الحد الأقصى");
          errorMessages.push(translated);
        }
      });
    }

    if (errorData.errors.UserName) {
      errorData.errors.UserName.forEach((msg) => {
        if (msg.includes("letters, numbers, and underscores")) {
          errorMessages.push(
            "اسم المستخدم يجب أن يحتوي فقط على أحرف و أرقام وشرطة سفلية",
          );
        } else if (msg.includes("required")) {
          errorMessages.push("اسم المستخدم مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.Password) {
      errorData.errors.Password.forEach((msg) => {
        if (msg.includes("at least 6 characters")) {
          errorMessages.push("كلمة المرور يجب أن تحتوي على الأقل 6 أحرف");
        } else if (msg.includes("required")) {
          errorMessages.push("كلمة المرور مطلوبة");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (!["Name", "UserName", "Password"].includes(key)) {
        errorData.errors[key].forEach((msg) => {
          const translatedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          const translatedMsg = msg
            .replace("is required", "مطلوب")
            .replace("must be", "يجب أن يكون")
            .replace("invalid", "غير صالح");

          errorMessages.push(`${translatedKey}: ${translatedMsg}`);
        });
      }
    });

    if (errorMessages.length > 1) {
      return errorMessages.join("<br>");
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("invalid") || msg.includes("credentials")) {
      return "اسم المستخدم أو كلمة المرور غير صحيحة";
    }
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    if (msg.includes("timeout") || msg.includes("time out")) {
      return "انتهت المهلة، يرجى المحاولة مرة أخرى";
    }
    if (msg.includes("not found") || msg.includes("404")) {
      return "لم يتم العثور على المدينة المطلوبة";
    }
    if (msg.includes("unauthorized") || msg.includes("401")) {
      return "غير مصرح لك بهذا الإجراء";
    }
    if (msg.includes("forbidden") || msg.includes("403")) {
      return "ليس لديك صلاحية للقيام بهذا الإجراء";
    }
    return errorData.message;
  }

  if (errorData.title) {
    if (errorData.title.includes("validation errors")) {
      return "حدثت أخطاء في التحقق من البيانات";
    }
  }

  return "حدث خطأ غير متوقع";
};

const showErrorAlert = (errorData) => {
  const translatedMessage = translateErrorMessage(errorData);

  if (isMobile()) {
    showMessage("error", "خطأ", translatedMessage);
  } else {
    Swal.fire({
      icon: "error",
      title: "خطأ",
      html: translatedMessage,
      showConfirmButton: false,
      timer: 2500,
      background: "linear-gradient(135deg, #f0f8ff, #e0f7fa)",
      color: "#2E3E88",
    });
  }
};

export default function CitiesManagement() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          setDataLoading(false);
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

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);

        if (!hasAdminOrRestaurantOrBranchRole) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  const fetchCities = async () => {
    setDataLoading(true);
    try {
      const response = await axiosInstance.get("/api/Cities/GetAll");
      if (response.status === 200) {
        setCities(response.data);
        setFilteredCities(response.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      showErrorAlert(error.response?.data);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrRestaurantOrBranch) {
      fetchCities();
    }
  }, [isAdminOrRestaurantOrBranch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showMessage("error", "معلومات ناقصة", "يرجى إدخال اسم المدينة", {
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing city
        await axiosInstance.put(`/api/Cities/Update/${editingId}`, formData);

        await fetchCities();

        showMessage("success", "تم التحديث", "تم تحديث المدينة بنجاح", {
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await axiosInstance.post("/api/Cities/Add", formData);

        await fetchCities();

        showMessage("success", "تم الإضافة", "تم إضافة المدينة بنجاح", {
          timer: 2000,
          showConfirmButton: false,
        });
      }

      resetForm();
    } catch (err) {
      showErrorAlert(err.response?.data);
    }
  };

  const handleEdit = (city) => {
    setFormData({
      name: city.name,
    });
    setEditingId(city.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewCity = () => {
    setIsAdding(true);
  };

  const isFormValid = () => {
    return formData.name.trim() !== "";
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
            جارٍ التحقق من الصلاحيات...
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
      dir="rtl"
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
          className="relative py-12 px-4 md:py-16"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع - موحد لجميع الشاشات */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
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
              className="text-center pt-8 md:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaCity className="text-white text-2xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
                إدارة المدن
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
                إدارة مدن التوصيل المتاحة في نظام المطعم
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-8 -mt-6 md:-mt-10 relative z-10"
        dir="rtl"
      >
        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewCity}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
        >
          <FaPlus className="text-lg md:text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden md:inline font-semibold">
            إضافة مدينة جديدة
          </span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          {/* Cities List */}
          <div>
            {cities.length === 0 && !dataLoading ? (
              <div className="w-full">
                <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-xl">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                    <FaCity
                      className="text-3xl md:text-4xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3"
                    style={{ color: "#2E3E88" }}
                  >
                    لا توجد مدن حتى الآن
                  </h3>
                  <p
                    className="mb-6 max-w-md mx-auto text-sm md:text-base"
                    style={{ color: "#32B9CC" }}
                  >
                    أضف أول مدينة للبدء في إدارة مدن التوصيل
                  </p>
                  <button
                    onClick={handleAddNewCity}
                    className="px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm md:text-base"
                    style={{
                      background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      color: "white",
                      boxShadow: `0 10px 25px #2E3E8830`,
                    }}
                  >
                    إضافة مدينة جديدة
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCities.map((city, index) => (
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    style={{
                      borderTop: "4px solid #2E3E88",
                    }}
                  >
                    <div className="p-4 md:p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                            <FaCity
                              className="text-lg md:text-xl"
                              style={{ color: "#2E3E88" }}
                            />
                          </div>
                          <div>
                            <h4
                              className="font-bold text-base md:text-lg"
                              style={{ color: "#2E3E88" }}
                            >
                              {city.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-xs md:text-sm"
                                style={{ color: "#32B9CC" }}
                              >
                                مدينة التوصيل
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(city)}
                          className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-xs md:text-sm"
                          style={{
                            background: "#32B9CC10",
                            color: "#32B9CC",
                          }}
                        >
                          <FaEdit className="text-xs md:text-sm" />
                          تعديل
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {dataLoading && (
              <div className="w-full">
                <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-xl">
                  <div className="text-center">
                    <div
                      className="animate-spin rounded-full h-16 md:h-20 w-16 md:w-20 border-4 mx-auto mb-4"
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
                      جارٍ تحميل المدن...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit City Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div
                className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {editingId ? (
                    <FaEdit className="text-sm sm:text-base" />
                  ) : (
                    <FaPlus className="text-sm sm:text-base" />
                  )}
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
                    {editingId ? "تعديل المدينة" : "إضافة مدينة جديدة"}
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={14} className="sm:size-16" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* City Name */}
                  <div>
                    <label
                      className="block text-xs sm:text-sm font-semibold mb-2 text-right"
                      style={{ color: "#2E3E88" }}
                    >
                      اسم المدينة
                    </label>
                    <div className="relative group">
                      <FaCity className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right text-sm sm:text-base"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                        placeholder="أدخل اسم المدينة"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="flex-1 py-2.5 sm:py-3.5 border-2 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
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
                      disabled={!isFormValid()}
                      className={`flex-1 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                        isFormValid()
                          ? "shadow-lg hover:shadow-xl cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      style={
                        isFormValid()
                          ? {
                              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                              color: "white",
                            }
                          : {
                              background: "#e5e7eb",
                              color: "#6b7280",
                            }
                      }
                    >
                      <FaSave className="text-sm sm:text-base" />
                      {editingId ? "تحديث المدينة" : "حفظ المدينة"}
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
