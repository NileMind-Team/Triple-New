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
  FaCalendar,
  FaClock,
  FaHamburger,
  FaShippingFast,
  FaUtensils,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [formData, setFormData] = useState({
    menuItemId: "",
    rating: 0,
    deliveryRating: 0,
    comment: "",
  });

  const [menuItems] = useState([
    { id: 1, name: "Classic Fried Chicken" },
    { id: 2, name: "Spicy Chicken Wings" },
    { id: 3, name: "Chicken Burger" },
    { id: 4, name: "Grilled Chicken Sandwich" },
    { id: 5, name: "Chicken Tenders" },
    { id: 6, name: "Chicken Shawarma" },
    { id: 7, name: "Chicken Salad" },
    { id: 8, name: "Family Chicken Bucket" },
    { id: 9, name: "Chicken Wrap" },
    { id: 10, name: "Special Chicken Meal" },
  ]);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const res = await axiosInstance.get("/api/Account/Reviews");
      if (res.status === 200) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      // For demo purposes, using mock data
      setReviews([
        {
          id: 1,
          menuItemName: "Classic Fried Chicken",
          rating: 5,
          deliveryRating: 4,
          comment:
            "Amazing fried chicken! The crust was perfectly crispy and the meat was juicy and flavorful. Highly recommended!",
          createdAt: "2024-01-15T20:45:00",
        },
        {
          id: 2,
          menuItemName: "Spicy Chicken Wings",
          rating: 4,
          deliveryRating: 5,
          comment:
            "Great flavor and nice spice level. The wings were cooked perfectly, but could be a bit crispier next time.",
          createdAt: "2024-01-14T18:30:00",
        },
        {
          id: 3,
          menuItemName: "Chicken Burger",
          rating: 5,
          deliveryRating: 3,
          comment:
            "Best chicken burger I've ever had! The bun was fresh and the chicken patty was massive and delicious.",
          createdAt: "2024-01-12T12:15:00",
        },
      ]);
    } finally {
      setIsLoading(false);
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

  const handleDeliveryRatingChange = (rating) => {
    setFormData({
      ...formData,
      deliveryRating: rating,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing review
        const res = await axiosInstance.put(
          `/api/Account/Reviews/${editingId}`,
          formData
        );
        if (res.status === 200) {
          setReviews(
            reviews.map((review) =>
              review.id === editingId
                ? {
                    ...review,
                    ...formData,
                    menuItemName:
                      menuItems.find(
                        (m) => m.id === parseInt(formData.menuItemId)
                      )?.name || "Unknown Item",
                  }
                : review
            )
          );
          Swal.fire({
            icon: "success",
            title: "Review Updated",
            text: "Your review has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        // Add new review
        const res = await axiosInstance.post("/api/Account/Reviews", formData);
        if (res.status === 201) {
          const selectedMenuItem = menuItems.find(
            (m) => m.id === parseInt(formData.menuItemId)
          );
          const newReview = {
            ...formData,
            id: Date.now(),
            menuItemName: selectedMenuItem?.name || "Unknown Item",
            createdAt: new Date().toISOString(),
          };
          setReviews([newReview, ...reviews]);
          Swal.fire({
            icon: "success",
            title: "Review Added",
            text: "Your review has been added successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save review.",
      });
    }
  };

  const handleEdit = (review) => {
    setFormData({
      menuItemId:
        menuItems.find((m) => m.name === review.menuItemName)?.id || "",
      rating: review.rating,
      deliveryRating: review.deliveryRating || 0,
      comment: review.comment,
    });
    setEditingId(review.id);
    setIsAdding(true);

    // Scroll to form in mobile view
    setTimeout(() => {
      const formElement = document.getElementById("review-form");
      if (formElement && window.innerWidth < 1280) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Account/Reviews/${id}`);
          setReviews(reviews.filter((review) => review.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Your review has been deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete review.",
          });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      menuItemId: "",
      rating: 0,
      deliveryRating: 0,
      comment: "",
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
  };

  const handleAddNewReview = () => {
    setIsAdding(true);

    // Scroll to form in mobile view
    setTimeout(() => {
      const formElement = document.getElementById("review-form");
      if (formElement && window.innerWidth < 1280) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Check if all required fields are filled - REMOVED deliveryRating from required
  const isFormValid = () => {
    const requiredFields = ["menuItemId", "rating", "comment"];
    return requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInHours = Math.floor((now - reviewDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const getDeliveryRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Very Slow";
      case 2:
        return "Slow";
      case 3:
        return "Average";
      case 4:
        return "Fast";
      case 5:
        return "Very Fast";
      default:
        return "Not Rated";
    }
  };

  const renderStars = (
    rating,
    interactive = false,
    onRatingChange = null,
    size = "sm"
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
            } ${
              star <= rating
                ? "text-[#FDB913]"
                : "text-gray-300 dark:text-gray-600"
            }`}
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 bg-white/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] border border-[#E41E26]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
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
        className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        {/* Header Background */}
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          {/* Header Content */}
          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaStar className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                My Reviews
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mb-2 sm:mb-3"
            >
              Share your experience with our menu items
            </motion.p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          {/* Add Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center -mt-6 sm:-mt-7 md:-mt-8 mb-6 sm:mb-8 md:mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewReview}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>Write New Review</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Reviews List */}
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              <AnimatePresence>
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-gray-200/50 transition-all duration-300 hover:shadow-lg dark:bg-gray-700/80 dark:border-gray-600/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] border border-[#FDB913]/30 dark:from-gray-600 dark:to-gray-500">
                            <FaHamburger className="text-[#E41E26] text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base sm:text-lg md:text-xl truncate">
                              {review.menuItemName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                ({review.rating}/5)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Rating Display - IMPROVED TO SINGLE LINE */}
                        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 bg-gradient-to-r from-blue-50 to-blue-100/50 p-2 sm:p-3 rounded-lg border border-blue-200/50 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700/30">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <FaShippingFast className="text-blue-600 text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hidden sm:block">
                              Delivery Speed:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.deliveryRating || 0)}
                            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {getDeliveryRatingText(
                                review.deliveryRating || 0
                              )}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">
                          {review.comment}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <FaCalendar className="text-[#E41E26] text-xs sm:text-sm" />
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaClock className="text-[#E41E26] text-xs sm:text-sm" />
                            <span>{formatTime(review.createdAt)}</span>
                          </div>
                          <div className="text-[#E41E26] font-medium">
                            {getRelativeTime(review.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(review)}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        >
                          <FaEdit className="text-xs sm:text-sm" />
                          <span className="whitespace-nowrap">Edit</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(review.id)}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        >
                          <FaTrash className="text-xs sm:text-sm" />
                          <span className="whitespace-nowrap">Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {reviews.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50"
                >
                  <FaStar className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    Share your experience by reviewing our menu items
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNewReview}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                    <span>Write Your First Review</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Add/Edit Review Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="review-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200/50 shadow-lg sticky top-4 sm:top-6 dark:bg-gray-700/80 dark:border-gray-600/50">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                        {editingId ? "Edit Review" : "Write New Review"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-500 hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2 dark:text-gray-400"
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Menu Item Dropdown */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Menu Item *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown("menuItem")}
                            className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 text-gray-600 hover:border-[#E41E26] transition-all group text-sm sm:text-base dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                          >
                            <div className="flex items-center gap-3">
                              <FaHamburger className="text-[#E41E26] text-sm" />
                              <span>
                                {formData.menuItemId
                                  ? menuItems.find(
                                      (m) =>
                                        m.id === parseInt(formData.menuItemId)
                                    )?.name
                                  : "Select Menu Item"}
                              </span>
                            </div>
                            <motion.div
                              animate={{
                                rotate: openDropdown === "menuItem" ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronDown className="text-[#E41E26]" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {openDropdown === "menuItem" && (
                              <motion.ul
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                              >
                                {menuItems.map((item) => (
                                  <li
                                    key={item.id}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        menuItemId: item.id,
                                      });
                                      setOpenDropdown(null);
                                    }}
                                    className="px-4 py-2.5 sm:py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                                  >
                                    {item.name}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Food Rating - IMPROVED TO SINGLE LINE */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Food Rating *
                        </label>
                        <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#FDB913]/30 dark:from-gray-600 dark:to-gray-500 dark:border-gray-500">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <FaUtensils className="text-[#E41E26] text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hidden sm:block">
                              Food Quality:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(
                              formData.rating,
                              true,
                              handleRatingChange,
                              "lg"
                            )}
                            <span className="text-xs sm:text-sm font-semibold text-[#E41E26] whitespace-nowrap">
                              ({formData.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Rating - IMPROVED TO SINGLE LINE */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Delivery Speed Rating
                        </label>
                        <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-blue-50 to-blue-100/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-200/50 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700/30">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <FaShippingFast className="text-blue-600 text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hidden sm:block">
                              Delivery Speed:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(
                              formData.deliveryRating,
                              true,
                              handleDeliveryRatingChange,
                              "lg"
                            )}
                            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {getDeliveryRatingText(formData.deliveryRating)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          Your Review *
                        </label>
                        <textarea
                          name="comment"
                          value={formData.comment}
                          onChange={handleInputChange}
                          required
                          rows="4"
                          className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-none dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Share your experience with this menu item... (What did you like? How was the taste? Any suggestions?)"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Share your honest feedback about the taste, quality,
                          and overall experience
                        </p>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForm}
                          className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base dark:border-[#E41E26] dark:text-[#E41E26] dark:hover:bg-[#E41E26] dark:hover:text-white"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!isFormValid()}
                          className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                            isFormValid()
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <FaCheck className="text-xs sm:text-sm" />
                          {editingId ? "Update Review" : "Submit Review"}
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
