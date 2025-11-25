import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
  FaEnvelope,
  FaCity,
  FaUser,
  FaStar,
  FaChevronDown,
  FaGlobe,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function AdminBranches() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [managers, setManagers] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    locationUrl: "",
    status: "Open",
    rating_Avgarage: 0,
    openingTime: "",
    closingTime: "",
    isActive: true,
    cityId: "",
    managerId: "",
  });

  const ratingOptions = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.locationUrl.trim() !== "" &&
      formData.openingTime.trim() !== "" &&
      formData.closingTime.trim() !== "" &&
      formData.cityId !== "" &&
      formData.managerId !== ""
    );
  };

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const profileRes = await axiosInstance.get("/api/Account/Profile");
        const userRoles = profileRes.data.roles;

        if (!userRoles || !userRoles.includes("Admin")) {
          Swal.fire({
            icon: "error",
            title: "تم الرفض",
            text: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
            confirmButtonColor: "#E41E26",
          }).then(() => {
            navigate("/");
          });
          return;
        }

        setIsAdmin(true);
        await Promise.all([fetchBranches(), fetchCities(), fetchManagers()]);
      } catch (err) {
        console.error("Failed to verify admin access", err);
        Swal.fire({
          icon: "error",
          title: "تم الرفض",
          text: "فشل في التحقق من صلاحياتك.",
          confirmButtonColor: "#E41E26",
        }).then(() => {
          navigate("/");
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [navigate]);

  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get("/api/Branches/GetAll");
      if (res.status === 200) {
        setBranches(res.data);
        setFilteredBranches(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات الفروع.",
      });
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axiosInstance.get("/api/Cities/GetAll");
      if (res.status === 200) {
        setCities(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات المدن.",
      });
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axiosInstance.get("/api/Users/GetAll");
      if (res.status === 200) {
        const branchManagers = res.data.filter(
          (user) => user.roles && user.roles.includes("Branch")
        );
        setManagers(branchManagers);
      }
    } catch (err) {
      console.error("Failed to fetch managers", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات المديرين.",
      });
    }
  };

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
        branch.city?.name?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setOpenDropdown(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "نموذج غير مكتمل",
        text: "يرجى ملء جميع الحقول المطلوبة.",
        confirmButtonColor: "#E41E26",
      });
      return;
    }

    try {
      if (editingId) {
        const res = await axiosInstance.put(
          `/api/Branches/Update/${editingId}`,
          formData
        );
        if (res.status === 200 || res.status === 204) {
          await fetchBranches();
          Swal.fire({
            icon: "success",
            title: "تم تحديث الفرع",
            text: "تم تحديث الفرع بنجاح.",
            timer: 2000,
            showConfirmButton: false,
          });
          resetForm();
        }
      } else {
        const res = await axiosInstance.post("/api/Branches/Add", formData);
        if (res.status === 200 || res.status === 201) {
          await fetchBranches();
          Swal.fire({
            icon: "success",
            title: "تم إضافة الفرع",
            text: "تم إضافة الفرع الجديد بنجاح.",
            timer: 2000,
            showConfirmButton: false,
          });
          resetForm();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "فشل في حفظ الفرع.";
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: errorMsg,
      });
    }
  };

  const handleEdit = (branch) => {
    setFormData({
      name: branch.name || "",
      email: branch.email || "",
      address: branch.address || "",
      locationUrl: branch.locationUrl || "",
      status: branch.status || "Open",
      rating_Avgarage: branch.rating_Avgarage || 0,
      openingTime: branch.openingTime || "",
      closingTime: branch.closingTime || "",
      isActive: branch.isActive || true,
      cityId: branch.city?.id || "",
      managerId: branch.managerId || "",
    });
    setEditingId(branch.id);
    setIsAdding(true);

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("branch-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleDelete = async (branchId) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "أنت على وشك حذف هذا الفرع.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Branches/Delete/${branchId}`);
          setBranches(branches.filter((branch) => branch.id !== branchId));
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف الفرع بنجاح.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف الفرع.",
          });
        }
      }
    });
  };

  const handleToggleActive = async (branchId, currentStatus) => {
    try {
      await axiosInstance.put(`/api/Branches/ChangeActiveStatus/${branchId}`);
      await fetchBranches();
      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة",
        text: `تم ${currentStatus ? "تعطيل" : "تفعيل"} الفرع.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة الفرع.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      locationUrl: "",
      status: "Open",
      rating_Avgarage: 0,
      openingTime: "",
      closingTime: "",
      isActive: true,
      cityId: "",
      managerId: "",
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewBranch = () => {
    setIsAdding(true);
    setEditingId(null);

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("branch-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] dark:text-gray-300 border border-[#E41E26]/30 dark:border-gray-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      >
        <FaArrowLeft
          size={14}
          className="sm:size-4 group-hover:scale-110 transition-transform"
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden"
      >
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaBuilding className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                لوحة التحكم
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mb-2 sm:mb-3"
            >
              إدارة فروع المطعم
            </motion.p>
          </div>
        </div>

        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center -mt-6 sm:-mt-7 md:-mt-8 mb-6 sm:mb-8 md:mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewBranch}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>إضافة فرع جديد</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="max-w-md mx-auto">
              <div className="relative group">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl sm:rounded-2xl pl-10 pr-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg"
                  placeholder="البحث بالاسم، العنوان، البريد الإلكتروني، أو المدينة..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#E41E26] transition-colors duration-200"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {filteredBranches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white flex items-center justify-center font-semibold text-base sm:text-lg md:text-xl border-2 border-[#FDB913]">
                          <FaBuilding className="text-sm sm:text-base md:text-lg" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2 sm:mb-3">
                          <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg md:text-xl truncate">
                            {branch.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                branch.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {branch.isActive ? "نشط" : "غير نشط"}
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                branch.status === "Open"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }`}
                            >
                              {branch.status === "Open" ? "مفتوح" : "مغلق"}
                            </div>
                            {branch.rating_Avgarage > 0 && (
                              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
                                <FaStar className="text-yellow-500" />
                                <span>{branch.rating_Avgarage.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 sm:space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                            <span className="truncate">{branch.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                            <span className="truncate">{branch.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                            <span>
                              {branch.openingTime} - {branch.closingTime}
                            </span>
                          </div>
                          {branch.city && (
                            <div className="flex items-center gap-2">
                              <FaCity className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                              <span>{branch.city.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(branch)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">تعديل</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleToggleActive(branch.id, branch.isActive)
                        }
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
                          branch.isActive
                            ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                            : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                        }`}
                      >
                        {branch.isActive ? "تعطيل" : "تفعيل"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(branch.id)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                        <span className="whitespace-nowrap">حذف</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredBranches.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <FaBuilding className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    {searchTerm
                      ? "لم يتم العثور على فروع"
                      : "لم يتم العثور على فروع"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    {searchTerm
                      ? "حاول تعديل مصطلحات البحث"
                      : "ابدأ بإضافة أول فرع لك"}
                  </p>
                  {!searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNewBranch}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                    >
                      <FaPlus className="text-xs sm:text-sm" />
                      <span>أضف أول فرع لك</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="branch-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-lg sticky top-4 sm:top-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
                        {editingId ? "تعديل الفرع" : "إضافة فرع جديد"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2"
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          اسم الفرع *
                        </label>
                        <div className="relative group">
                          <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="اسم الفرع"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          البريد الإلكتروني *
                        </label>
                        <div className="relative group">
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="البريد الإلكتروني"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          العنوان *
                        </label>
                        <div className="relative group">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="العنوان الكامل"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          رابط الموقع *
                        </label>
                        <div className="relative group">
                          <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="url"
                            name="locationUrl"
                            value={formData.locationUrl}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="رابط خرائط جوجل"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            المدينة *
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === "city" ? null : "city"
                                )
                              }
                              className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            >
                              <span className="flex items-center gap-2">
                                <FaCity className="text-[#E41E26]" />
                                {formData.cityId
                                  ? cities.find((c) => c.id === formData.cityId)
                                      ?.name
                                  : "اختر المدينة"}
                              </span>
                              <motion.div
                                animate={{
                                  rotate: openDropdown === "city" ? 180 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaChevronDown className="text-[#E41E26]" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {openDropdown === "city" && (
                                <motion.ul
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                                >
                                  {cities.map((city) => (
                                    <li
                                      key={city.id}
                                      onClick={() =>
                                        handleSelectChange("cityId", city.id)
                                      }
                                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0"
                                    >
                                      {city.name}
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            المدير *
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === "manager" ? null : "manager"
                                )
                              }
                              className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            >
                              <span className="flex items-center gap-2">
                                <FaUser className="text-[#E41E26]" />
                                {formData.managerId
                                  ? managers.find(
                                      (m) => m.id === formData.managerId
                                    )?.firstName +
                                    " " +
                                    managers.find(
                                      (m) => m.id === formData.managerId
                                    )?.lastName
                                  : "اختر المدير"}
                              </span>
                              <motion.div
                                animate={{
                                  rotate: openDropdown === "manager" ? 180 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaChevronDown className="text-[#E41E26]" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {openDropdown === "manager" && (
                                <motion.ul
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                                >
                                  {managers.map((manager) => (
                                    <li
                                      key={manager.id}
                                      onClick={() =>
                                        handleSelectChange(
                                          "managerId",
                                          manager.id
                                        )
                                      }
                                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0"
                                    >
                                      {manager.firstName} {manager.lastName} (
                                      {manager.email})
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            الحالة *
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === "status" ? null : "status"
                                )
                              }
                              className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            >
                              <span>
                                {formData.status === "Open" ? "مفتوح" : "مغلق"}
                              </span>
                              <motion.div
                                animate={{
                                  rotate: openDropdown === "status" ? 180 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaChevronDown className="text-[#E41E26]" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {openDropdown === "status" && (
                                <motion.ul
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                                >
                                  {["Open", "Closed"].map((status) => (
                                    <li
                                      key={status}
                                      onClick={() =>
                                        handleSelectChange("status", status)
                                      }
                                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0"
                                    >
                                      {status === "Open" ? "مفتوح" : "مغلق"}
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            التقييم
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === "rating" ? null : "rating"
                                )
                              }
                              className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            >
                              <span className="flex items-center gap-2">
                                <FaStar className="text-[#E41E26]" />
                                {formData.rating_Avgarage}
                              </span>
                              <motion.div
                                animate={{
                                  rotate: openDropdown === "rating" ? 180 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <FaChevronDown className="text-[#E41E26]" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {openDropdown === "rating" && (
                                <motion.ul
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                                >
                                  {ratingOptions.map((rating) => (
                                    <li
                                      key={rating}
                                      onClick={() =>
                                        handleSelectChange(
                                          "rating_Avgarage",
                                          rating
                                        )
                                      }
                                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0"
                                    >
                                      {rating}
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            وقت الفتح *
                          </label>
                          <div className="relative group">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="openingTime"
                              value={formData.openingTime}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                              placeholder="وقت الفتح"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            وقت الإغلاق *
                          </label>
                          <div className="relative group">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="text"
                              name="closingTime"
                              value={formData.closingTime}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                              placeholder="وقت الإغلاق"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 sm:pt-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#E41E26] bg-gray-100 border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2"
                        />
                        <label
                          htmlFor="isActive"
                          className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          فرع نشط
                        </label>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForm}
                          className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] dark:text-[#FDB913] dark:border-[#FDB913] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300 text-sm sm:text-base"
                        >
                          إلغاء
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!isFormValid()}
                          className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                            isFormValid()
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FaCheck className="text-xs sm:text-sm" />
                          {editingId ? "تحديث الفرع" : "إضافة الفرع"}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
