import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaStore,
  FaCommentAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    branchId: "",
    rating: 0,
    comment: "",
  });

  const showMobileMessage = (type, title, text) => {
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
        case "info":
          toast.info(text, toastOptions);
          break;
        case "warning":
          toast.warning(text, toastOptions);
          break;
        default:
          toast(text, toastOptions);
      }
      return true;
    }
    return false;
  };

  const showMessage = (type, title, text) => {
    if (window.innerWidth < 768) {
      showMobileMessage(type, title, text);
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

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  useEffect(() => {
    fetchReviews();
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/api/Reviews/GetAllForUser");
      if (res.status === 200) {
        const reviewsWithBranchNames = await Promise.all(
          res.data.map(async (review) => {
            try {
              const branchRes = await axiosInstance.get(
                `/api/Branches/Get/${review.branchId}`,
              );
              if (branchRes.status === 200) {
                return {
                  ...review,
                  branchName: branchRes.data.name,
                };
              }
            } catch (err) {
              console.error(`Failed to fetch branch ${review.branchId}`, err);
            }
            return {
              ...review,
              branchName: `فرع ${review.branchId}`,
            };
          }),
        );
        setReviews(reviewsWithBranchNames);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      showMessage("error", "خطأ", "فشل في تحميل التقييمات.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get("/api/Branches/GetList");
      if (res.status === 200) {
        setBranches(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating: rating,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing review
        const res = await axiosInstance.put(
          `/api/Reviews/Update/${editingId}`,
          formData,
        );
        if (res.status === 200 || res.status === 204) {
          await fetchReviews();
          showMessage("success", "تم بنجاح", "تم تحديث تقييمك بنجاح.");
        }
      } else {
        // Add new review
        const res = await axiosInstance.post("/api/Reviews/Add", formData);
        if (res.status === 200 || res.status === 201) {
          await fetchReviews();
          showMessage("success", "تم بنجاح", "تم إضافة تقييمك بنجاح.");
        }
      }

      resetForm();
    } catch (err) {
      showMessage(
        "error",
        "خطأ",
        err.response?.data?.message || "فشل في حفظ التقييم.",
      );
    }
  };

  const handleEdit = (review) => {
    setFormData({
      branchId: review.branchId.toString(),
      rating: review.rating,
      comment: review.comment,
    });
    setEditingId(review.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Reviews/Delete/${id}`);
          await fetchReviews();
          showMessage("success", "تم الحذف", "تم حذف تقييمك بنجاح.");
        } catch (err) {
          showMessage("error", "خطأ", "فشل في حذف التقييم.");
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      branchId: "",
      rating: 0,
      comment: "",
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
  };

  const handleAddNewReview = () => {
    setIsAdding(true);
  };

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReview(null);
  };

  const isFormValid = () => {
    const requiredFields = ["branchId", "rating", "comment"];
    return requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== "",
    );
  };

  const renderStars = (
    rating,
    interactive = false,
    onRatingChange = null,
    size = "sm",
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "div"}
            onClick={() => interactive && onRatingChange(star)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default"
            } ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
          >
            <FaStar
              className={`${
                size === "lg" ? "text-base sm:text-lg" : "text-xs sm:text-sm"
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
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
            جارٍ تحميل التقييمات...
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
                <FaStar className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                تقييماتي
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                شارك تجربتك مع فروعنا وساعد الآخرين في اختيار الأفضل
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
          onClick={handleAddNewReview}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
        >
          <FaPlus className="text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden md:inline font-semibold">
            إضافة تقييم جديد
          </span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          {/* Reviews List */}
          <div>
            {reviews.length === 0 ? (
              <div className="w-full">
                <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                    <FaStar className="text-4xl" style={{ color: "#2E3E88" }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "#2E3E88" }}
                  >
                    لا توجد تقييمات حتى الآن
                  </h3>
                  <p
                    className="mb-6 max-w-md mx-auto"
                    style={{ color: "#32B9CC" }}
                  >
                    شارك تجربتك مع فروعنا من خلال إضافة أول تقييم لك
                  </p>
                  <button
                    onClick={handleAddNewReview}
                    className="px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      color: "white",
                      boxShadow: `0 10px 25px #2E3E8830`,
                    }}
                  >
                    إضافة تقييم جديد
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleReviewClick(review)}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col cursor-pointer"
                    style={{
                      borderTop: "4px solid #2E3E88",
                      minHeight: "200px",
                    }}
                  >
                    <div className="p-6 flex-grow">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                            <FaStore
                              className="text-xl"
                              style={{ color: "#2E3E88" }}
                            />
                          </div>
                          <div>
                            <h4
                              className="font-bold text-lg"
                              style={{ color: "#2E3E88" }}
                            >
                              {review.branchName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600">
                                  ({review.rating}/5)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Preview */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <FaCommentAlt
                            className="mt-1 flex-shrink-0"
                            style={{ color: "#2E3E88" }}
                          />
                          <p className="text-gray-700 line-clamp-3">
                            {review.comment}
                          </p>
                        </div>

                        {review.createdAt && (
                          <div className="flex items-start gap-3">
                            <FaCalendarAlt
                              className="mt-1 flex-shrink-0"
                              style={{ color: "#2E3E88" }}
                            />
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(review);
                          }}
                          className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                          style={{
                            background: "#32B9CC10",
                            color: "#32B9CC",
                          }}
                        >
                          <FaEdit />
                          تعديل
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(review.id);
                          }}
                          className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                          style={{
                            background: "#FF6B6B10",
                            color: "#FF6B6B",
                          }}
                        >
                          <FaTrash />
                          حذف
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

      {/* Add/Edit Review Form Modal */}
      <AnimatePresence>
        {isAdding && (
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
                  {editingId ? <FaEdit /> : <FaPlus />}
                  <h3 className="text-lg font-bold text-white">
                    {editingId ? "تعديل التقييم" : "إضافة تقييم جديد"}
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Branch Dropdown */}
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
                        onClick={() => toggleDropdown("branch")}
                        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <FaStore className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                          <span className="font-medium">
                            {formData.branchId
                              ? branches.find(
                                  (b) => b.id === parseInt(formData.branchId),
                                )?.name
                              : "اختر الفرع"}
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
                            {branches.map((branch) => (
                              <li
                                key={branch.id}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    branchId: branch.id,
                                  });
                                  setOpenDropdown(null);
                                }}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                              >
                                {branch.name}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      التقييم
                    </label>
                    <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 p-4 rounded-xl border border-[#2E3E88]/20">
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="font-medium text-gray-700">
                          التقييم العام:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(
                          formData.rating,
                          true,
                          handleRatingChange,
                          "lg",
                        )}
                        <span
                          className="font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          ({formData.rating}/5)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      تقييمك
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 resize-none"
                      style={{
                        background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                      }}
                      placeholder="شارك تجربتك مع هذا الفرع... (كيف كانت الخدمة؟ جودة الطعام؟ التجربة العامة؟)"
                      dir="rtl"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="flex-1 py-3.5 border-2 rounded-xl font-semibold transition-all duration-300"
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
                      className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
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
                      <FaCheck />
                      {editingId ? "تحديث التقييم" : "حفظ التقييم"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedReview && (
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
                  <FaStar className="text-white text-xl" />
                  <h3 className="text-lg font-bold text-white">
                    تفاصيل التقييم
                  </h3>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Review Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Branch Info */}
                    <div className="flex items-start gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                        <FaStore
                          className="text-2xl"
                          style={{ color: "#2E3E88" }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4
                          className="text-xl font-bold"
                          style={{ color: "#2E3E88" }}
                        >
                          {selectedReview.branchName}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {renderStars(selectedReview.rating)}
                          </div>
                          <span className="font-semibold text-gray-700">
                            ({selectedReview.rating}/5)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-3">
                      <h4
                        className="text-lg font-bold flex items-center gap-2"
                        style={{ color: "#2E3E88" }}
                      >
                        <FaCommentAlt />
                        التقييم
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedReview.comment}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    {selectedReview.createdAt && (
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt style={{ color: "#2E3E88" }} />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            تاريخ التقييم
                          </p>
                          <p className="font-medium text-gray-700">
                            {formatDate(selectedReview.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Actions */}
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-xl p-4 text-center">
                      <h4
                        className="text-lg font-bold mb-3"
                        style={{ color: "#2E3E88" }}
                      >
                        التقييم العام
                      </h4>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {renderStars(selectedReview.rating)}
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {selectedReview.rating} / 5
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          closeDetailsModal();
                          handleEdit(selectedReview);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <FaEdit />
                        تعديل التقييم
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          closeDetailsModal();
                          handleDelete(selectedReview.id);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <FaTrash />
                        حذف التقييم
                      </motion.button>
                    </div>
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
