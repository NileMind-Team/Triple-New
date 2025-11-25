import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUpload,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.productId;
  const productId = location.state?.productId;

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  const [formData, setFormData] = useState({
    Name: "",
    CategoryId: 1,
    BasePrice: "",
    Image: "",
    Description: "",
    IsActive: true,
    MenuItemSchedules: [],
    availabilityType: "always",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const daysOfWeek = [
    { id: 0, name: "الأحد" },
    { id: 1, name: "الإثنين" },
    { id: 2, name: "الثلاثاء" },
    { id: 3, name: "الأربعاء" },
    { id: 4, name: "الخميس" },
    { id: 5, name: "الجمعة" },
    { id: 6, name: "السبت" },
  ];

  const [timeRange, setTimeRange] = useState({
    startTime: "09:00",
    endTime: "22:00",
  });

  // Fetch product data when editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing) return;

      try {
        setIsLoadingProduct(true);
        const response = await axiosInstance.get(
          `/api/MenuItems/Get/${productId}`
        );
        const product = response.data;

        // Transform API data to match form structure
        setFormData({
          Name: product.name || "",
          CategoryId: product.category?.id || 1,
          BasePrice: product.basePrice || "",
          Image: product.imageUrl
            ? `https://restaurant-template.runasp.net/${product.imageUrl}`
            : "",
          Description: product.description || "",
          IsActive: product.isActive !== undefined ? product.isActive : true,
          MenuItemSchedules: product.menuItemSchedules || [],
          availabilityType: product.isAllTime ? "always" : "custom",
        });

        // Set image preview and original URL
        if (product.imageUrl) {
          const imageUrl = `https://restaurant-template.runasp.net/${product.imageUrl}`;
          setImagePreview(imageUrl);
          setOriginalImageUrl(imageUrl);
        }

        // Set availability data if custom schedule
        if (
          !product.isAllTime &&
          product.menuItemSchedules &&
          product.menuItemSchedules.length > 0
        ) {
          const schedule = product.menuItemSchedules[0];
          setSelectedDays(
            product.menuItemSchedules.map((s) => parseInt(s.day))
          );
          setTimeRange({
            startTime: schedule.startTime?.substring(0, 5) || "09:00",
            endTime: schedule.endTime?.substring(0, 5) || "22:00",
          });
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل بيانات المنتج",
          confirmButtonColor: "#E41E26",
        });
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductData();
  }, [isEditing, productId]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل الفئات",
          confirmButtonColor: "#E41E26",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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

    if (type === "always") {
      setSelectedDays([]);
    }
  };

  const handleDayToggle = (dayId) => {
    const newSelectedDays = [...selectedDays];
    const dayIndex = newSelectedDays.indexOf(dayId);

    if (dayIndex > -1) {
      newSelectedDays.splice(dayIndex, 1);
    } else {
      newSelectedDays.push(dayId);
    }

    setSelectedDays(newSelectedDays);
  };

  const handleTimeChange = (field, value) => {
    setTimeRange({
      ...timeRange,
      [field]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "حجم الملف كبير",
          text: "الحد الأقصى لحجم الصورة هو 5MB",
          confirmButtonColor: "#E41E26",
        });
        return;
      }

      // التحقق من نوع الملف
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "نوع ملف غير مدعوم",
          text: "الأنواع المسموح بها: JPG, JPEG, PNG",
          confirmButtonColor: "#E41E26",
        });
        return;
      }

      setHasImageChanged(true); // ← علامة أن الصورة تغيرت

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          Image: reader.result,
        });
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleUploadAreaClick = () => {
    document.getElementById("file-input").click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview("");
    setFormData({ ...formData, Image: "" });
    setImageFile(null);
    setHasImageChanged(true); // ← إضافة هذا السطر
  };

  const isFormValid = () => {
    return (
      formData.Name &&
      formData.BasePrice &&
      formData.Description &&
      formData.Image
    );
  };

  // دالة جديدة لتحويل URL إلى Blob
  const urlToBlob = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error converting URL to blob:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.Name ||
      !formData.BasePrice ||
      !formData.Description ||
      (!isEditing && !formData.Image)
    ) {
      Swal.fire({
        icon: "error",
        title: "معلومات ناقصة",
        text: "يرجى ملء جميع الحقول المطلوبة",
        confirmButtonColor: "#E41E26",
      });
      setIsLoading(false);
      return;
    }

    try {
      let menuItemSchedules = [];
      if (formData.availabilityType !== "always") {
        menuItemSchedules = selectedDays.map((day) => ({
          id: 0,
          day: day.toString(),
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
          isActive: true,
          notes: `متاح يوم ${daysOfWeek.find((d) => d.id === day)?.name}`,
          branchId: 1,
        }));
      }

      const submitData = {
        Name: formData.Name,
        Description: formData.Description,
        BasePrice: parseFloat(formData.BasePrice),
        CategoryId: parseInt(formData.CategoryId),
        IsActive: formData.IsActive,
        MenuItemSchedules: menuItemSchedules,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("Name", submitData.Name);
      formDataToSend.append("Description", submitData.Description);
      formDataToSend.append("BasePrice", submitData.BasePrice.toString());
      formDataToSend.append("CategoryId", submitData.CategoryId.toString());
      formDataToSend.append("IsActive", submitData.IsActive.toString());
      formDataToSend.append(
        "MenuItemSchedules",
        JSON.stringify(submitData.MenuItemSchedules)
      );

      if (isEditing) {
        if (imageFile) {
          // صورة جديدة
          formDataToSend.append("Image", imageFile);
        } else if (formData.Image && !hasImageChanged) {
          // صورة قديمة لم تتغير، حول الـ URL القديم لملف
          try {
            const response = await fetch(formData.Image);
            const blob = await response.blob();
            const filename =
              formData.Image.split("/").pop() || "product-image.jpg";
            formDataToSend.append("Image", blob, filename);
          } catch (error) {
            console.error("Error converting old image URL to file:", error);
            Swal.fire({
              icon: "error",
              title: "خطأ في الصورة",
              text: "فشل في تحميل الصورة القديمة. يرجى إعادة رفع الصورة.",
              confirmButtonColor: "#E41E26",
            });
            setIsLoading(false);
            return;
          }
        } else if (!formData.Image) {
          // تم حذف الصورة
          formDataToSend.append("Image", "");
        }
      } else {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        }
      }

      const endpoint = isEditing
        ? `/api/MenuItems/Update/${productId}`
        : "/api/MenuItems/Add";

      const response = await axiosInstance({
        method: isEditing ? "PUT" : "POST",
        url: endpoint,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 204) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "تم تحديث المنتج!" : "تم إضافة المنتج!",
          text: `${formData.Name} تم ${isEditing ? "تحديثه" : "إضافته"} بنجاح`,
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في حفظ المنتج. يرجى المحاولة مرة أخرى.",
        confirmButtonColor: "#E41E26",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
      dir="rtl"
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
                <FaClock className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
              </div>
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-2xl mb-1.5 xs:mb-2 sm:mb-3"
            >
              {isEditing
                ? "قم بتحديث معلومات المنتج"
                : "قم بإنشاء عنصر قائمة جديد"}
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
                  {/* Right Column */}
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        اسم المنتج *
                      </label>
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="أدخل اسم المنتج"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        الفئة *
                      </label>
                      {isLoadingCategories ? (
                        <div className="text-center py-4 text-gray-500">
                          جاري تحميل الفئات...
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
                          {categories
                            .filter((category) => category.isActive)
                            .map((category) => (
                              <motion.button
                                key={category.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    CategoryId: category.id,
                                  })
                                }
                                className={`flex flex-col items-center gap-1 xs:gap-1.5 sm:gap-2 p-1.5 xs:p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                                  formData.CategoryId === category.id
                                    ? "border-[#E41E26] bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] text-[#E41E26] dark:from-gray-600 dark:to-gray-500"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                                }`}
                              >
                                <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-center leading-tight">
                                  {category.name}
                                </span>
                              </motion.button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        السعر (جنيه) *
                      </label>
                      <input
                        type="number"
                        name="BasePrice"
                        value={formData.BasePrice}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Active Status */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        الحالة
                      </label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="IsActive"
                            checked={formData.IsActive === true}
                            onChange={() =>
                              setFormData({ ...formData, IsActive: true })
                            }
                            className="text-[#E41E26] focus:ring-[#E41E26]"
                          />
                          <span className="text-xs sm:text-sm">نشط</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="IsActive"
                            checked={formData.IsActive === false}
                            onChange={() =>
                              setFormData({ ...formData, IsActive: false })
                            }
                            className="text-[#E41E26] focus:ring-[#E41E26]"
                          />
                          <span className="text-xs sm:text-sm">غير نشط</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Left Column */}
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        صورة المنتج *
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
                              className="absolute top-1 xs:top-2 left-1 xs:left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <FaTimes size={10} className="xs:size-2" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-8 xs:py-10 sm:py-12 md:py-16">
                            <FaUpload className="mx-auto text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-2 xs:mb-3 sm:mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-1.5 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base">
                              انقر لرفع الصورة
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                              PNG, JPG, JPEG (الحد الأقصى 5MB)
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
                        الوصف *
                      </label>
                      <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 resize-none text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="قم بوصف المنتج بالتفصيل..."
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
                      وقت التوفر
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
                        متاح دائمًا
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
                        جدول مخصص
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
                          الأيام المتاحة *
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
                                selectedDays.includes(day.id)
                                  ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white border-transparent shadow-md"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#E41E26] dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-[#E41E26]"
                              }`}
                            >
                              {day.name}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Time Range */}
                      <div className="grid grid-cols-2 gap-3 xs:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                            وقت البدء *
                          </label>
                          <input
                            type="time"
                            value={timeRange.startTime}
                            onChange={(e) =>
                              handleTimeChange("startTime", e.target.value)
                            }
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 xs:py-2.5 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                            وقت الانتهاء *
                          </label>
                          <input
                            type="time"
                            value={timeRange.endTime}
                            onChange={(e) =>
                              handleTimeChange("endTime", e.target.value)
                            }
                            className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 xs:py-2.5 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Schedule Preview */}
                      {selectedDays.length > 0 && (
                        <div className="bg-white/80 rounded-lg p-3 xs:p-4 border border-gray-200 dark:bg-gray-600/80 dark:border-gray-500">
                          <p className="text-xs xs:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            معاينة الجدول:
                          </p>
                          <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                            متاح في{" "}
                            {selectedDays
                              .map(
                                (dayId) =>
                                  daysOfWeek.find((day) => day.id === dayId)
                                    ?.name
                              )
                              .join("، ")}{" "}
                            من {timeRange.startTime} إلى {timeRange.endTime}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
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
                    إلغاء
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
                      ? "جاري الحفظ..."
                      : isEditing
                      ? "تحديث المنتج"
                      : "حفظ المنتج"}
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
