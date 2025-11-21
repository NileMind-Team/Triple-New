import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUpload,
  FaHamburger,
  FaCoffee,
  FaIceCream,
  FaPlus,
  FaMinus,
  FaChevronDown,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.product;
  const product = location.state?.product || {};

  const [formData, setFormData] = useState({
    id: product.id || Date.now(),
    name: product.name || "",
    category: product.category || "meals",
    price: product.price || "",
    image: product.image || "",
    description: product.description || "",
    ingredients: product.ingredients || [""],
    rating: product.rating || "4.5",
    prepTime: product.prepTime || "",
    calories: product.calories || "",
    availabilityType: product.availabilityType || "always",
    customAvailability: product.customAvailability || {
      days: [],
      startTime: "09:00",
      endTime: "22:00",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(product.image || "");
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  const categories = [
    { id: "meals", name: "Main Courses", icon: <FaHamburger /> },
    { id: "drinks", name: "Beverages", icon: <FaCoffee /> },
    { id: "desserts", name: "Desserts", icon: <FaIceCream /> },
  ];

  const ratings = [
    "4.9",
    "4.8",
    "4.7",
    "4.6",
    "4.5",
    "4.4",
    "4.3",
    "4.2",
    "4.1",
    "4.0",
  ];

  const daysOfWeek = [
    { id: "sunday", name: "Sunday" },
    { id: "monday", name: "Monday" },
    { id: "tuesday", name: "Tuesday" },
    { id: "wednesday", name: "Wednesday" },
    { id: "thursday", name: "Thursday" },
    { id: "friday", name: "Friday" },
    { id: "saturday", name: "Saturday" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAvailabilityTypeChange = (type) => {
    setFormData({
      ...formData,
      availabilityType: type,
    });
  };

  const handleDayToggle = (dayId) => {
    const currentDays = [...formData.customAvailability.days];
    const dayIndex = currentDays.indexOf(dayId);

    if (dayIndex > -1) {
      currentDays.splice(dayIndex, 1);
    } else {
      currentDays.push(dayId);
    }

    setFormData({
      ...formData,
      customAvailability: {
        ...formData.customAvailability,
        days: currentDays,
      },
    });
  };

  const handleTimeChange = (field, value) => {
    setFormData({
      ...formData,
      customAvailability: {
        ...formData.customAvailability,
        [field]: value,
      },
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAreaClick = () => {
    document.getElementById("file-input").click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ""],
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        ingredients: newIngredients,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.name ||
      !formData.price ||
      !formData.description ||
      !formData.image
    ) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in all required fields",
        confirmButtonColor: "#E41E26",
      });
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const existingProducts = JSON.parse(
        localStorage.getItem("products") || "[]"
      );

      if (isEditing) {
        const updatedProducts = existingProducts.map((p) =>
          p.id === formData.id ? formData : p
        );
        localStorage.setItem("products", JSON.stringify(updatedProducts));
      } else {
        const newProduct = {
          ...formData,
          id: Date.now(),
        };
        const updatedProducts = [...existingProducts, newProduct];
        localStorage.setItem("products", JSON.stringify(updatedProducts));
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Product Updated!" : "Product Added!",
        text: `${formData.name} has been ${
          isEditing ? "updated" : "added"
        } successfully`,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save product. Please try again.",
        confirmButtonColor: "#E41E26",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name && formData.price && formData.description && formData.image
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-8 xs:-left-10 sm:-left-20 -top-8 xs:-top-10 sm:-top-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-8 xs:-right-10 sm:-right-20 -bottom-8 xs:-bottom-10 sm:-bottom-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-6xl xl:max-w-5xl mx-auto bg-white/90 backdrop-blur-xl shadow-lg xs:shadow-xl sm:shadow-2xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        {/* Header Background */}
        <div className="relative h-28 xs:h-32 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-3 xs:-top-4 sm:-top-6 -right-3 xs:-right-4 sm:-right-6 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-3 xs:-bottom-4 sm:-bottom-6 -left-3 xs:-left-4 sm:-left-6 w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-2 xs:top-3 sm:top-6 left-2 xs:left-3 sm:left-6 z-50 bg-white/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-1.5 xs:p-2 sm:p-3 text-[#E41E26] border border-[#E41E26]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
          >
            <FaArrowLeft
              size={12}
              className="xs:size-3 sm:size-4 group-hover:scale-110 transition-transform"
            />
          </motion.button>

          {/* Header Content */}
          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-3 xs:px-4 sm:px-6 pb-4 xs:pb-5 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-1.5 xs:mb-2 sm:mb-3"
            >
              <div className="p-1.5 xs:p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl">
                <FaHamburger className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
              </div>
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-2xl mb-1.5 xs:mb-2 sm:mb-3"
            >
              {isEditing
                ? "Update product information"
                : "Create a new menu item"}
            </motion.p>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 pb-3 xs:pb-4 sm:pb-6 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 xs:mt-5 sm:mt-6 md:mt-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 xs:space-y-5 sm:space-y-6"
              >
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Category *
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3">
                        {categories.map((category) => (
                          <motion.button
                            key={category.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                category: category.id,
                              })
                            }
                            className={`flex flex-col items-center gap-1 xs:gap-1.5 sm:gap-2 p-1.5 xs:p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                              formData.category === category.id
                                ? "border-[#E41E26] bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] text-[#E41E26] dark:from-gray-600 dark:to-gray-500"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                            }`}
                          >
                            <span className="text-xs xs:text-sm sm:text-base lg:text-lg">
                              {category.icon}
                            </span>
                            <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-center leading-tight">
                              {category.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Price (EGP) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Preparation Time */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Preparation Time *
                      </label>
                      <input
                        type="text"
                        name="prepTime"
                        value={formData.prepTime}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="e.g., 15-20 mins"
                        required
                      />
                    </div>

                    {/* Calories */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Calories
                      </label>
                      <input
                        type="text"
                        name="calories"
                        value={formData.calories}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="e.g., 420 kcal"
                      />
                    </div>

                    {/* Rating Dropdown */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Rating
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => toggleDropdown("rating")}
                          className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-lg px-3 py-2 xs:py-2.5 sm:py-3 text-gray-600 hover:border-[#E41E26] transition-all group text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                        >
                          <div className="flex items-center gap-2 xs:gap-3">
                            <span className="text-[#E41E26] text-xs sm:text-sm">
                              ⭐
                            </span>
                            <span>{formData.rating} Stars</span>
                          </div>
                          <motion.div
                            animate={{
                              rotate: openDropdown === "rating" ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaChevronDown className="text-[#E41E26] text-xs sm:text-sm" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {openDropdown === "rating" && (
                            <motion.ul
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 mt-1 xs:mt-2 w-full bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden max-h-32 xs:max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                            >
                              {ratings.map((rating) => (
                                <li
                                  key={rating}
                                  onClick={() => {
                                    setFormData({ ...formData, rating });
                                    setOpenDropdown(null);
                                  }}
                                  className="px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-xs sm:text-sm border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                                >
                                  {rating} Stars
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Product Image *
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-2 xs:p-3 sm:p-4 text-center hover:border-[#E41E26] transition-colors duration-200 cursor-pointer dark:border-gray-600"
                        onClick={handleUploadAreaClick}
                      >
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 xs:h-56 sm:h-64 md:h-96 object-cover rounded-lg mb-2 xs:mb-3"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-1 xs:top-2 right-1 xs:right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <FaTimes size={10} className="xs:size-2" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-8 xs:py-10 sm:py-12 md:py-16">
                            <FaUpload className="mx-auto text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-2 xs:mb-3 sm:mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-1.5 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base">
                              Click to upload image
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                              PNG, JPG, JPEG (Max 5MB)
                            </p>
                          </div>
                        )}
                        <input
                          id="file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 resize-none text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Describe the product in detail..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Time */}
                <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 border border-[#FDB913]/30 dark:from-gray-600 dark:to-gray-500 dark:border-gray-500">
                  <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                    <FaClock className="text-[#E41E26] text-base xs:text-lg sm:text-xl" />
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                      Availability Time
                    </h3>
                  </div>

                  {/* Availability Type Selection */}
                  <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-4 xs:mb-5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAvailabilityTypeChange("always")}
                      className={`flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.availabilityType === "always"
                          ? "border-[#E41E26] bg-white text-[#E41E26] shadow-md dark:bg-gray-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                      }`}
                    >
                      <FaClock className="text-xs xs:text-sm" />
                      <span className="text-xs xs:text-sm font-medium">
                        Always Available
                      </span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAvailabilityTypeChange("custom")}
                      className={`flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.availabilityType === "custom"
                          ? "border-[#E41E26] bg-white text-[#E41E26] shadow-md dark:bg-gray-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                      }`}
                    >
                      <FaCalendarAlt className="text-xs xs:text-sm" />
                      <span className="text-xs xs:text-sm font-medium">
                        Custom Schedule
                      </span>
                    </motion.button>
                  </div>

                  {/* Custom Availability Settings */}
                  {formData.availabilityType === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 xs:space-y-5"
                    >
                      {/* Days Selection */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 xs:mb-3">
                          Available Days *
                        </label>
                        <div className="grid grid-cols-4 xs:grid-cols-7 gap-1.5 xs:gap-2">
                          {daysOfWeek.map((day) => (
                            <motion.button
                              key={day.id}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDayToggle(day.id)}
                              className={`p-1.5 xs:p-2 rounded-lg border transition-all duration-200 text-[10px] xs:text-xs font-medium ${
                                formData.customAvailability.days.includes(
                                  day.id
                                )
                                  ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white border-transparent shadow-md"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#E41E26] dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-[#E41E26]"
                              }`}
                            >
                              {day.name.slice(0, 3)}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Time Range */}
                      <div className="grid grid-cols-2 gap-3 xs:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            value={formData.customAvailability.startTime}
                            onChange={(e) =>
                              handleTimeChange("startTime", e.target.value)
                            }
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 xs:py-2.5 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                            End Time *
                          </label>
                          <input
                            type="time"
                            value={formData.customAvailability.endTime}
                            onChange={(e) =>
                              handleTimeChange("endTime", e.target.value)
                            }
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 xs:py-2.5 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Schedule Preview */}
                      {formData.customAvailability.days.length > 0 && (
                        <div className="bg-white/80 rounded-lg p-3 xs:p-4 border border-gray-200 dark:bg-gray-600/80 dark:border-gray-500">
                          <p className="text-xs xs:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Schedule Preview:
                          </p>
                          <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                            Available on{" "}
                            {formData.customAvailability.days
                              .map(
                                (day) =>
                                  daysOfWeek.find((d) => d.id === day)?.name
                              )
                              .join(", ")}{" "}
                            from {formData.customAvailability.startTime} to{" "}
                            {formData.customAvailability.endTime}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2 xs:mb-3">
                    <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                      Ingredients
                    </label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addIngredient}
                      className="flex items-center gap-1 xs:gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      <FaPlus size={10} className="xs:size-2" />
                      Add Ingredient
                    </motion.button>
                  </div>

                  <div className="space-y-1.5 xs:space-y-2 max-h-32 xs:max-h-48 overflow-y-auto">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-1.5 xs:gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) =>
                            handleIngredientChange(index, e.target.value)
                          }
                          className="flex-1 border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder={`Ingredient ${index + 1}`}
                        />
                        {formData.ingredients.length > 1 && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeIngredient(index)}
                            className="bg-red-500 text-white p-1.5 xs:p-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                          >
                            <FaMinus size={10} className="xs:size-2" />
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 xs:gap-3 sm:gap-4 pt-3 xs:pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/")}
                    className="flex-1 py-2 xs:py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 xs:gap-2 dark:border-[#E41E26] dark:text-[#E41E26] dark:hover:bg-[#E41E26] dark:hover:text-white"
                  >
                    <FaTimes size={12} className="xs:size-3 sm:size-4" />
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!isFormValid() || isLoading}
                    className={`flex-1 py-2 xs:py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base ${
                      isFormValid() && !isLoading
                        ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <FaSave size={12} className="xs:size-3 sm:size-4" />
                    {isLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Product"
                      : "Save Product"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductForm;
