import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUpload,
  FaClock,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaFire,
  FaList,
  FaEdit,
  FaCog,
  FaTag,
  FaCheckSquare,
  FaSquare,
  FaCheckCircle,
  FaCheck,
  FaLink,
  FaDownload,
  FaImage,
  FaSlidersH,
  FaDollarSign,
  FaQuestionCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [initialFormData, setInitialFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showOptionTypesManager, setShowOptionTypesManager] = useState(false);
  const [optionTypes, setOptionTypes] = useState([]);
  const [editingOptionType, setEditingOptionType] = useState(null);
  const [newOptionType, setNewOptionType] = useState({
    name: "",
    canSelectMultipleOptions: false,
    isSelectionRequired: false,
  });

  const [formData, setFormData] = useState({
    Name: "",
    CategoryId: 1,
    BasePrice: "",
    IsPriceBasedOnRequest: false,
    Image: "",
    Description: "",
    IsActive: true,
    ShowInSlider: false,
    Calories: "",
    PreparationTimeStart: "",
    PreparationTimeEnd: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageInputMode, setImageInputMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [menuItemOptions, setMenuItemOptions] = useState([]);
  const [optionTypesDropdownOpen, setOptionTypesDropdownOpen] = useState(null);

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const translateErrorMessage = (errorData) => {
    if (!errorData) return "حدث خطأ غير معروف";

    if (errorData.errors && typeof errorData.errors === "object") {
      const errorMessages = [];

      Object.keys(errorData.errors).forEach((key) => {
        errorData.errors[key].forEach((msg) => {
          if (msg.includes("required")) {
            errorMessages.push(`${key} مطلوب`);
          } else if (msg.includes("greater than 0")) {
            errorMessages.push(`${key} يجب أن يكون أكبر من صفر`);
          } else if (msg.includes("invalid")) {
            errorMessages.push(`${key} غير صالح`);
          } else {
            errorMessages.push(msg);
          }
        });
      });

      if (errorMessages.length > 0) {
        return errorMessages.join("، ");
      }
    }

    if (typeof errorData.message === "string") {
      const msg = errorData.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        return "بيانات غير صحيحة";
      }
      if (msg.includes("network") || msg.includes("internet")) {
        return "يرجى التحقق من اتصالك بالإنترنت";
      }
      if (msg.includes("timeout") || msg.includes("time out")) {
        return "انتهت المهلة، يرجى المحاولة مرة أخرى";
      }
      return errorData.message;
    }

    return "حدث خطأ غير متوقع";
  };

  const showErrorAlert = (title, message) => {
    const translatedMessage = translateErrorMessage(message);

    if (window.innerWidth < 768) {
      toast.error(translatedMessage || title, {
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
    } else {
      Swal.fire({
        title: title || "حدث خطأ",
        text: translatedMessage,
        icon: "error",
        confirmButtonText: "حاول مرة أخرى",
        timer: 2500,
        showConfirmButton: false,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
    }
  };

  const showSuccessAlert = (title, message) => {
    if (window.innerWidth < 768) {
      toast.success(message || title, {
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
    } else {
      Swal.fire({
        title: title || "تم بنجاح",
        text: message,
        icon: "success",
        showConfirmButton: false,
        timer: 2500,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
    }
  };

  const downloadImageFromUrl = async (url) => {
    if (!url || !isValidUrl(url)) {
      Swal.fire({
        icon: "error",
        title: "رابط غير صالح",
        text: "الرجاء إدخال رابط صحيح للصورة",
        confirmButtonColor: "#2E3E88",
        background: "linear-gradient(135deg, #f0f8ff, #e0f7fa)",
      });
      return null;
    }

    setIsDownloadingImage(true);
    try {
      const response = await fetch(url, {
        mode: "cors",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("الرابط لا يشير إلى صورة صالحة");
      }

      const blob = await response.blob();

      const maxSize = 5 * 1024 * 1024;
      if (blob.size > maxSize) {
        throw new Error(
          `حجم الصورة (${formatBytes(blob.size)}) يتجاوز الحد الأقصى (5MB)`,
        );
      }

      const mimeType = blob.type;
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/jfif",
        "image/heic",
        "image/heif",
        "image/webp",
      ];

      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        const fileType = mimeType.split("/")[1] || "غير معروف";
        throw new Error(
          `صيغة الملف (${fileType}) غير مدعومة. الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC, WebP`,
        );
      }

      const extension = getExtensionFromMimeType(mimeType);
      const filename = `image-${Date.now()}.${extension}`;

      const file = new File([blob], filename, { type: mimeType });

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
      setHasImageChanged(true);
      setImageUrl("");

      showSuccessAlert(
        "تم تحميل الصورة!",
        `تم تحميل الصورة بنجاح (${formatBytes(file.size)})`,
      );

      return file;
    } catch (error) {
      console.error("Error downloading image:", error);
      showErrorAlert(
        "خطأ في تحميل الصورة",
        error.message || "فشل في تحميل الصورة من الرابط المقدم",
      );
      return null;
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const getExtensionFromMimeType = (mimeType) => {
    const mimeToExt = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/jfif": "jfif",
      "image/heic": "heic",
      "image/heif": "heif",
      "image/webp": "webp",
    };
    return mimeToExt[mimeType.toLowerCase()] || "jpg";
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const fetchOptionTypes = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/MenuItemOptionTypes/GetAll",
        );
        setOptionTypes(response.data);
      } catch (error) {
        console.error("Error fetching option types:", error);
        showErrorAlert("خطأ", "فشل في تحميل أنواع الاضافات");
      }
    };

    fetchOptionTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMenuItemOption = () => {
    setMenuItemOptions([
      ...menuItemOptions,
      {
        id: Date.now(),
        typeId: "",
        options: [
          {
            id: Date.now() + 1,
            name: "",
            price: "",
            isAvailableNow: true,
            isActive: true,
          },
        ],
      },
    ]);
  };

  const removeMenuItemOption = (id) => {
    if (menuItemOptions.length > 0) {
      setMenuItemOptions(menuItemOptions.filter((option) => option.id !== id));
    }
  };

  const updateMenuItemOption = (id, field, value) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === id ? { ...optionType, [field]: value } : optionType,
      ),
    );
  };

  const addOptionToType = (typeId) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === typeId
          ? {
              ...optionType,
              options: [
                ...optionType.options,
                {
                  id: Date.now(),
                  name: "",
                  price: "",
                  isAvailableNow: true,
                  isActive: true,
                },
              ],
            }
          : optionType,
      ),
    );
  };

  const removeOptionFromType = (typeId, optionId) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === typeId
          ? {
              ...optionType,
              options: optionType.options.filter(
                (option) => option.id !== optionId,
              ),
            }
          : optionType,
      ),
    );
  };

  const updateOption = (typeId, optionId, field, value) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === typeId
          ? {
              ...optionType,
              options: optionType.options.map((option) =>
                option.id === optionId ? { ...option, [field]: value } : option,
              ),
            }
          : optionType,
      ),
    );
  };

  const handleOpenOptionTypesManager = () => {
    setShowOptionTypesManager(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseOptionTypesManager = () => {
    setShowOptionTypesManager(false);
    setEditingOptionType(null);
    setNewOptionType({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    document.body.style.overflow = "auto";
  };

  const handleEditOptionType = (optionType) => {
    setEditingOptionType({ ...optionType });
    setNewOptionType({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
  };

  const handleSaveOptionType = async () => {
    if (!editingOptionType.name.trim()) {
      showErrorAlert("خطأ", "اسم نوع الإضافة مطلوب");
      return;
    }

    try {
      await axiosInstance.put(
        `/api/MenuItemOptionTypes/Update/${editingOptionType.id}`,
        {
          name: editingOptionType.name,
          canSelectMultipleOptions: editingOptionType.canSelectMultipleOptions,
          isSelectionRequired: editingOptionType.isSelectionRequired,
        },
      );

      setOptionTypes(
        optionTypes.map((type) =>
          type.id === editingOptionType.id ? { ...editingOptionType } : type,
        ),
      );

      setEditingOptionType(null);
      showSuccessAlert("تم التحديث!", "تم تحديث نوع الإضافة بنجاح");
    } catch (error) {
      console.error("Error updating option type:", error);
      showErrorAlert("خطأ", "فشل في تحديث نوع الإضافة");
    }
  };

  const handleAddOptionType = async () => {
    if (!newOptionType.name.trim()) {
      showErrorAlert("خطأ", "اسم نوع الإضافة مطلوب");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/api/MenuItemOptionTypes/Add",
        {
          name: newOptionType.name,
          canSelectMultipleOptions: newOptionType.canSelectMultipleOptions,
          isSelectionRequired: newOptionType.isSelectionRequired,
        },
      );

      const newOptionTypeData = response.data;

      setOptionTypes([...optionTypes, newOptionTypeData]);
      setNewOptionType({
        name: "",
        canSelectMultipleOptions: false,
        isSelectionRequired: false,
      });

      showSuccessAlert("تم الإضافة!", "تم إضافة نوع الإضافة الجديد بنجاح");
    } catch (error) {
      console.error("Error adding option type:", error);
      showErrorAlert("خطأ", "فشل في إضافة نوع الإضافة");
    }
  };

  const handleDeleteOptionType = async (optionTypeId) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#32B9CC",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #f0f8ff, #e0f7fa)",
      color: "#2E3E88",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(
            `/api/MenuItemOptionTypes/Delete/${optionTypeId}`,
          );

          setOptionTypes(
            optionTypes.filter((type) => type.id !== optionTypeId),
          );

          showSuccessAlert("تم الحذف!", "تم حذف نوع الإضافة بنجاح");
        } catch (error) {
          console.error("Error deleting option type:", error);
          showErrorAlert("خطأ", "فشل في حذف نوع الإضافة");
        }
      }
    });
  };

  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing) return;

      try {
        setIsLoadingProduct(true);
        const response = await axiosInstance.get(
          `/api/MenuItems/Get/${productId}`,
        );
        const product = response.data;

        const initialData = {
          Name: product.name || "",
          CategoryId: product.category?.id || 1,
          BasePrice: product.basePrice || "",
          IsPriceBasedOnRequest: product.basePrice === 0,
          Image: product.imageUrl
            ? `https://restaurant-template.runasp.net/${product.imageUrl}`
            : "",
          Description: product.description || "",
          IsActive: product.isActive !== undefined ? product.isActive : true,
          ShowInSlider:
            product.showInSlider !== undefined ? product.showInSlider : false,
          Calories: product.calories || "",
          PreparationTimeStart: product.preparationTimeStart || "",
          PreparationTimeEnd: product.preparationTimeEnd || "",
        };

        setFormData(initialData);
        setInitialFormData(initialData);

        if (product.imageUrl) {
          const imageUrl = `https://restaurant-template.runasp.net/${product.imageUrl}`;
          setImagePreview(imageUrl);
          setImageInputMode("url");
          setImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        showErrorAlert("خطأ", "فشل في تحميل بيانات المنتج");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, productId]);

  useEffect(() => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    if (!initialFormData) return;

    const formDataChanged =
      formData.Name !== initialFormData.Name ||
      formData.CategoryId !== initialFormData.CategoryId ||
      formData.BasePrice !== initialFormData.BasePrice ||
      formData.IsPriceBasedOnRequest !==
        initialFormData.IsPriceBasedOnRequest ||
      formData.Description !== initialFormData.Description ||
      formData.IsActive !== initialFormData.IsActive ||
      formData.ShowInSlider !== initialFormData.ShowInSlider ||
      formData.Calories !== initialFormData.Calories ||
      formData.PreparationTimeStart !== initialFormData.PreparationTimeStart ||
      formData.PreparationTimeEnd !== initialFormData.PreparationTimeEnd ||
      hasImageChanged;

    setHasChanges(formDataChanged);
  }, [formData, initialFormData, hasImageChanged, isEditing]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showErrorAlert("خطأ", "فشل في تحميل الفئات");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || parseFloat(value) >= 0) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePreparationTimeChange = (e) => {
    const { name, value } = e.target;

    if (value === "" || parseFloat(value) >= 0) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePriceTypeChange = (type) => {
    if (type === "fixed") {
      setFormData({
        ...formData,
        IsPriceBasedOnRequest: false,
        BasePrice: formData.BasePrice || "",
      });
    } else {
      setFormData({
        ...formData,
        IsPriceBasedOnRequest: true,
        BasePrice: "0",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showErrorAlert(
          "حجم الملف كبير",
          `حجم الصورة (${formatBytes(file.size)}) يتجاوز الحد الأقصى (5MB)`,
        );
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/jfif",
        "image/heic",
        "image/heif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        const fileType = file.type.split("/")[1] || "غير معروف";
        showErrorAlert(
          "نوع ملف غير مدعوم",
          `صيغة الملف (${fileType}) غير مدعومة. الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC, WebP`,
        );
        return;
      }

      setHasImageChanged(true);

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
    if (imageInputMode === "upload") {
      document.getElementById("file-input").click();
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview("");
    setFormData({ ...formData, Image: "" });
    setImageFile(null);
    setImageUrl("");
    setHasImageChanged(true);
  };

  const handleDownloadFromUrl = async () => {
    if (!imageUrl.trim()) {
      Swal.fire({
        icon: "error",
        title: "رابط فارغ",
        text: "الرجاء إدخال رابط الصورة أولاً",
        confirmButtonColor: "#2E3E88",
        background: "linear-gradient(135deg, #f0f8ff, #e0f7fa)",
      });
      return;
    }

    await downloadImageFromUrl(imageUrl);
  };

  const isFormValid = () => {
    if (formData.IsPriceBasedOnRequest) {
      return (
        formData.Name &&
        formData.CategoryId &&
        formData.Description &&
        formData.Image
      );
    }

    return (
      formData.Name &&
      formData.CategoryId &&
      formData.BasePrice &&
      formData.Description &&
      formData.Image
    );
  };

  const hasRequiredOptionTypes = () => {
    const requiredOptionTypes = menuItemOptions.filter((optionType) => {
      const optionTypeData = optionTypes.find(
        (type) => type.id === optionType.typeId,
      );
      return optionTypeData?.isSelectionRequired === true;
    });

    return requiredOptionTypes.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.Name ||
      !formData.CategoryId ||
      !formData.Description ||
      (!isEditing && !formData.Image)
    ) {
      showErrorAlert("معلومات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
      setIsLoading(false);
      return;
    }

    if (!formData.IsPriceBasedOnRequest && !formData.BasePrice) {
      showErrorAlert("معلومات ناقصة", "يرجى إدخال السعر أو اختيار 'حسب الطلب'");
      setIsLoading(false);
      return;
    }

    if (
      !formData.IsPriceBasedOnRequest &&
      parseFloat(formData.BasePrice) <= 0
    ) {
      showErrorAlert("خطأ في السعر", "السعر يجب أن يكون أكبر من صفر");
      setIsLoading(false);
      return;
    }

    if (
      formData.PreparationTimeStart &&
      formData.PreparationTimeEnd &&
      parseInt(formData.PreparationTimeStart) >=
        parseInt(formData.PreparationTimeEnd)
    ) {
      showErrorAlert(
        "وقت تحضير غير صحيح",
        "وقت البدء يجب أن يكون أقل من وقت الانتهاء في وقت التحضير",
      );
      setIsLoading(false);
      return;
    }

    if (!isEditing) {
      let invalidOptions = [];
      menuItemOptions.forEach((optionType, typeIndex) => {
        if (!optionType.typeId) {
          invalidOptions.push(`نوع الإضافة ${typeIndex + 1} يجب اختيار نوع`);
        }
        optionType.options.forEach((option, optionIndex) => {
          if (!option.name.trim()) {
            invalidOptions.push(
              `اسم الإضافة ${optionIndex + 1} في النوع ${typeIndex + 1} مطلوب`,
            );
          }
          if (!option.price || parseFloat(option.price) < 0) {
            invalidOptions.push(
              `سعر الإضافة ${optionIndex + 1} في النوع ${
                typeIndex + 1
              } يجب أن يكون رقمًا صحيحًا`,
            );
          }
        });
      });

      if (invalidOptions.length > 0) {
        showErrorAlert(
          "خطأ في الإضافات",
          invalidOptions.slice(0, 3).join("\n"),
        );
        setIsLoading(false);
        return;
      }

      if (formData.IsPriceBasedOnRequest && !hasRequiredOptionTypes()) {
        showErrorAlert(
          "خطأ في الإعدادات",
          "المنتج بسعر حسب الطلب يجب أن يحتوي على أنواع إضافات مطلوبة للاختيار",
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.Name);
      formDataToSend.append("Description", formData.Description);

      // إرسال السعر بناءً على نوع السعر
      if (formData.IsPriceBasedOnRequest) {
        formDataToSend.append("BasePrice", "0");
      } else {
        formDataToSend.append(
          "BasePrice",
          parseFloat(formData.BasePrice).toString(),
        );
      }

      formDataToSend.append("CategoryId", formData.CategoryId.toString());
      formDataToSend.append("IsActive", formData.IsActive.toString());
      formDataToSend.append("ShowInSlider", formData.ShowInSlider.toString());

      if (formData.Calories) {
        formDataToSend.append("Calories", formData.Calories.toString());
      }

      if (formData.PreparationTimeStart) {
        formDataToSend.append(
          "PreparationTimeStart",
          formData.PreparationTimeStart.toString(),
        );
      }

      if (formData.PreparationTimeEnd) {
        formDataToSend.append(
          "PreparationTimeEnd",
          formData.PreparationTimeEnd.toString(),
        );
      }

      if (!isEditing && menuItemOptions.length > 0) {
        let optionIndex = 0;
        menuItemOptions.forEach((optionType) => {
          optionType.options.forEach((option) => {
            const prefix = `MenuItemOptions[${optionIndex}]`;
            formDataToSend.append(`${prefix}.name`, option.name);
            formDataToSend.append(
              `${prefix}.price`,
              parseFloat(option.price).toString(),
            );
            formDataToSend.append(
              `${prefix}.isAvailableNow`,
              option.isAvailableNow.toString(),
            );
            formDataToSend.append(
              `${prefix}.isActive`,
              option.isActive.toString(),
            );
            formDataToSend.append(
              `${prefix}.typeId`,
              optionType.typeId.toString(),
            );
            optionIndex++;
          });
        });
      }

      if (isEditing) {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        } else if (formData.Image && !hasImageChanged) {
          try {
            const response = await fetch(formData.Image);
            const blob = await response.blob();
            const filename =
              formData.Image.split("/").pop() || "product-image.jpg";
            formDataToSend.append("Image", blob, filename);
          } catch (error) {
            console.error("Error converting old image URL to file:", error);
            showErrorAlert(
              "خطأ في الصورة",
              "فشل في تحميل الصورة القديمة. يرجى إعادة رفع الصورة.",
            );
            setIsLoading(false);
            return;
          }
        } else if (!formData.Image) {
          formDataToSend.append("Image", "");
        }
      } else {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        } else if (imageInputMode === "url" && !imageFile) {
          const file = await downloadImageFromUrl(imageUrl);
          if (file) {
            formDataToSend.append("Image", file);
          } else {
            showErrorAlert(
              "خطأ في الصورة",
              "يرجى تحميل الصورة من الرابط أولاً أو استخدام صورة أخرى",
            );
            setIsLoading(false);
            return;
          }
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
        showSuccessAlert(
          isEditing ? "تم تحديث المنتج!" : "تم إضافة المنتج!",
          `${formData.Name} تم ${isEditing ? "تحديثه" : "إضافته"} بنجاح`,
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showErrorAlert("خطأ", "فشل في حفظ المنتج. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
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
            جارٍ تحميل المنتج...
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
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div
          className="relative py-12 md:py-16 px-4 sm:px-6"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={18}
                className="md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-6 md:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaClock className="text-white text-3xl md:text-4xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
                {isEditing ? "تعديل المنتج" : "منتج جديد"}
              </h1>
              <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
                {isEditing
                  ? "قم بتحديث معلومات المنتج"
                  : "قم بإنشاء عنصر قائمة جديد"}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8 -mt-8 md:-mt-10 relative z-10">
        {/* Content Container */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl"
          >
            {/* Form Content */}
            <div className="p-4 sm:p-5 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* اسم المنتج */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        اسم المنتج *
                      </label>
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                        }}
                        placeholder="اسم المنتج"
                        required
                      />
                    </div>

                    {/* الفئة */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        الفئة *
                      </label>
                      {isLoadingCategories ? (
                        <div className="text-center py-3 md:py-4 text-gray-500 text-sm sm:text-base">
                          جاري تحميل الفئات...
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3">
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
                                className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                                  formData.CategoryId === category.id
                                    ? "border-[#2E3E88] bg-gradient-to-r from-[#f8f9ff] to-[#e0f7fa] text-[#2E3E88]"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                <span className="text-xs sm:text-sm font-medium text-center leading-tight truncate w-full px-1">
                                  {category.name}
                                </span>
                              </motion.button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* نوع السعر */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label
                          className="block text-sm font-semibold mb-1.5 md:mb-2"
                          style={{ color: "#2E3E88" }}
                        >
                          نوع السعر *
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePriceTypeChange("fixed")}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                              !formData.IsPriceBasedOnRequest
                                ? "border-[#2E3E88] bg-white text-[#2E3E88] shadow-md"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <FaDollarSign className="text-sm sm:text-base" />
                            <span className="text-xs sm:text-sm font-medium">
                              سعر ثابت
                            </span>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePriceTypeChange("request")}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                              formData.IsPriceBasedOnRequest
                                ? "border-[#2E3E88] bg-white text-[#2E3E88] shadow-md"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <FaQuestionCircle className="text-sm sm:text-base" />
                            <span className="text-xs sm:text-sm font-medium">
                              حسب الطلب
                            </span>
                          </motion.button>
                        </div>
                      </div>

                      {/* السعر */}
                      {!formData.IsPriceBasedOnRequest && (
                        <div>
                          <label
                            className="block text-sm font-semibold mb-1.5 md:mb-2"
                            style={{ color: "#2E3E88" }}
                          >
                            السعر (جنيه) *
                          </label>
                          <input
                            type="number"
                            name="BasePrice"
                            value={formData.BasePrice}
                            onChange={handleNumberInputChange}
                            step="0.01"
                            min="0.01"
                            onWheel={(e) => e.target.blur()}
                            className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            }}
                            placeholder="0.00"
                            required={!formData.IsPriceBasedOnRequest}
                          />
                          {formData.IsPriceBasedOnRequest &&
                            !isEditing &&
                            hasRequiredOptionTypes() && (
                              <div
                                className="mt-1.5 sm:mt-2 p-2.5 sm:p-3 rounded-lg md:rounded-xl"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                                  border: "1px solid #FBBF24",
                                }}
                              >
                                <p
                                  className="text-xs"
                                  style={{ color: "#92400E" }}
                                >
                                  <span className="font-semibold">ملاحظة:</span>{" "}
                                  المنتج بسعر حسب الطلب يجب أن يحتوي على أنواع
                                  إضافات مطلوبة للاختيار
                                </p>
                              </div>
                            )}
                        </div>
                      )}

                      {formData.IsPriceBasedOnRequest && (
                        <div
                          className="p-3 sm:p-4 rounded-lg md:rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                            border: "1px solid #3B82F6",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <FaQuestionCircle
                              className="text-sm sm:text-base"
                              style={{ color: "#2E3E88" }}
                            />
                            <div>
                              <p
                                className="text-xs sm:text-sm font-semibold"
                                style={{ color: "#2E3E88" }}
                              >
                                السعر حسب الطلب
                              </p>
                              <p
                                className="text-xs mt-0.5 sm:mt-1"
                                style={{ color: "#32B9CC" }}
                              >
                                سيتم تحديد السعر بناءً على اختيارات العميل من
                                الإضافات.
                                {!isEditing &&
                                  " يجب أن يحتوي المنتج على أنواع إضافات مطلوبة للاختيار."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* السعرات الحرارية */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        السعرات الحرارية
                      </label>
                      <div className="relative group">
                        <FaFire
                          className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type="number"
                          name="Calories"
                          value={formData.Calories}
                          onChange={handleNumberInputChange}
                          min="0"
                          onWheel={(e) => e.target.blur()}
                          className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base pr-8 sm:pr-10"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          placeholder="عدد السعرات الحرارية"
                        />
                      </div>
                    </div>

                    {/* وقت التحضير */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        وقت التحضير (بالدقائق)
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="relative group">
                          <FaClock
                            className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                          <input
                            type="number"
                            name="PreparationTimeStart"
                            value={formData.PreparationTimeStart}
                            onChange={handlePreparationTimeChange}
                            min="0"
                            onWheel={(e) => e.target.blur()}
                            className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base pr-8 sm:pr-10"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            }}
                            placeholder="من"
                          />
                        </div>
                        <div className="relative group">
                          <FaClock
                            className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                          <input
                            type="number"
                            name="PreparationTimeEnd"
                            value={formData.PreparationTimeEnd}
                            onChange={handlePreparationTimeChange}
                            min="0"
                            onWheel={(e) => e.target.blur()}
                            className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base pr-8 sm:pr-10"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            }}
                            placeholder="إلى"
                          />
                        </div>
                      </div>
                      {formData.PreparationTimeStart &&
                        formData.PreparationTimeEnd &&
                        parseInt(formData.PreparationTimeStart) >=
                          parseInt(formData.PreparationTimeEnd) && (
                          <p className="text-red-500 text-xs mt-1">
                            وقت البدء يجب أن يكون أقل من وقت الانتهاء في وقت
                            التحضير
                          </p>
                        )}
                    </div>

                    {/* الحالة */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        الحالة *
                      </label>
                      <div
                        className="flex gap-2 sm:gap-3 rounded-lg md:rounded-xl p-2.5 sm:p-3 border border-gray-200"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                        }}
                      >
                        <label className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer p-2 sm:p-3 rounded-md md:rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3E88]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="IsActive"
                              checked={formData.IsActive === true}
                              onChange={() =>
                                setFormData({ ...formData, IsActive: true })
                              }
                              className="sr-only"
                              required
                            />
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.IsActive === true
                                  ? "border-[#2E3E88] bg-[#2E3E88]"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {formData.IsActive === true && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span
                            className="text-xs sm:text-sm font-medium"
                            style={{ color: "#2E3E88" }}
                          >
                            نشط
                          </span>
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer p-2 sm:p-3 rounded-md md:rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3E88]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="IsActive"
                              checked={formData.IsActive === false}
                              onChange={() =>
                                setFormData({ ...formData, IsActive: false })
                              }
                              className="sr-only"
                              required
                            />
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.IsActive === false
                                  ? "border-[#2E3E88] bg-[#2E3E88]"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {formData.IsActive === false && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span
                            className="text-xs sm:text-sm font-medium"
                            style={{ color: "#2E3E88" }}
                          >
                            غير نشط
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* عرض في السلايدر */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        عرض في السلايدر
                      </label>
                      <div
                        className="flex gap-2 sm:gap-3 rounded-lg md:rounded-xl p-2.5 sm:p-3 border border-gray-200"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                        }}
                      >
                        <label className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer p-2 sm:p-3 rounded-md md:rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3E88]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="ShowInSlider"
                              checked={formData.ShowInSlider === true}
                              onChange={() =>
                                setFormData({ ...formData, ShowInSlider: true })
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.ShowInSlider === true
                                  ? "border-[#2E3E88] bg-[#2E3E88]"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {formData.ShowInSlider === true && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <FaSlidersH
                              className="text-sm sm:text-base"
                              style={{ color: "#2E3E88" }}
                            />
                            <span
                              className="text-xs sm:text-sm font-medium"
                              style={{ color: "#2E3E88" }}
                            >
                              عرض
                            </span>
                          </div>
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer p-2 sm:p-3 rounded-md md:rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3E88]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="ShowInSlider"
                              checked={formData.ShowInSlider === false}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  ShowInSlider: false,
                                })
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.ShowInSlider === false
                                  ? "border-[#2E3E88] bg-[#2E3E88]"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {formData.ShowInSlider === false && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <FaTimes className="text-gray-500 text-sm sm:text-base" />
                            <span
                              className="text-xs sm:text-sm font-medium"
                              style={{ color: "#2E3E88" }}
                            >
                              إخفاء
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* صورة المنتج */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        صورة المنتج *
                      </label>

                      {/* Switch between upload modes */}
                      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setImageInputMode("upload")}
                          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                            imageInputMode === "upload"
                              ? "border-[#2E3E88] bg-white text-[#2E3E88] shadow-md"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <FaUpload className="text-sm sm:text-base" />
                          <span className="text-xs sm:text-sm font-medium">
                            رفع صورة
                          </span>
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setImageInputMode("url")}
                          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 ${
                            imageInputMode === "url"
                              ? "border-[#2E3E88] bg-white text-[#2E3E88] shadow-md"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <FaLink className="text-sm sm:text-base" />
                          <span className="text-xs sm:text-sm font-medium">
                            رابط صورة
                          </span>
                        </motion.button>
                      </div>

                      {imageInputMode === "upload" ? (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg md:rounded-xl p-3 sm:p-4 text-center hover:border-[#2E3E88] transition-colors duration-200 cursor-pointer"
                          onClick={handleUploadAreaClick}
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                        >
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 sm:h-56 md:h-64 object-contain rounded-lg md:rounded-xl mb-2 sm:mb-3"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-colors"
                              >
                                <FaTimes
                                  size={12}
                                  className="sm:w-3.5 sm:h-3.5"
                                />
                              </button>
                            </div>
                          ) : (
                            <div className="py-8 sm:py-10 md:py-12">
                              <FaUpload
                                className="mx-auto text-3xl sm:text-4xl mb-3 sm:mb-4"
                                style={{ color: "#32B9CC" }}
                              />
                              <p
                                className="mb-2 sm:mb-3 text-sm sm:text-base"
                                style={{ color: "#2E3E88" }}
                              >
                                انقر لرفع الصورة
                              </p>
                              <p className="text-gray-500 text-xs sm:text-sm px-2">
                                الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC,
                                WebP (الحد الأقصى 5MB)
                              </p>
                            </div>
                          )}
                          <input
                            id="file-input"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/jfif,image/heic,image/heif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            required={!isEditing && imageInputMode === "upload"}
                          />
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div
                            className="rounded-lg md:rounded-xl p-3 sm:p-4"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div className="mb-3 sm:mb-4">
                              <label
                                className="block text-sm font-semibold mb-1.5 sm:mb-2"
                                style={{ color: "#2E3E88" }}
                              >
                                رابط الصورة
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="url"
                                  value={imageUrl}
                                  onChange={(e) => setImageUrl(e.target.value)}
                                  placeholder="أدخل رابط الصورة"
                                  className="flex-1 border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                  }}
                                />
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleDownloadFromUrl}
                                  disabled={
                                    isDownloadingImage || !imageUrl.trim()
                                  }
                                  className={`px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                                    imageUrl.trim() && !isDownloadingImage
                                      ? "shadow-lg hover:shadow-xl cursor-pointer"
                                      : "opacity-50 cursor-not-allowed"
                                  }`}
                                  style={
                                    imageUrl.trim() && !isDownloadingImage
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
                                  {isDownloadingImage ? (
                                    <>
                                      <div
                                        className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 border-t-2 border-b-2 rounded-full"
                                        style={{ borderColor: "white" }}
                                      ></div>
                                      <span>جاري التحميل...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaDownload className="text-sm sm:text-base" />
                                      <span>تحميل</span>
                                    </>
                                  )}
                                </motion.button>
                              </div>
                              <p className="text-gray-500 text-xs mt-1.5 sm:mt-2">
                                الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC,
                                WebP (الحد الأقصى 5MB)
                              </p>
                            </div>

                            {imagePreview ? (
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-48 sm:h-56 md:h-64 object-contain rounded-lg md:rounded-xl mb-2 sm:mb-3"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <FaTimes
                                    size={12}
                                    className="sm:w-3.5 sm:h-3.5"
                                  />
                                </button>
                              </div>
                            ) : (
                              <div className="py-6 sm:py-8 text-center">
                                <FaImage
                                  className="mx-auto text-3xl sm:text-4xl mb-3 sm:mb-4"
                                  style={{ color: "#32B9CC" }}
                                />
                                <p
                                  className="mb-2 sm:mb-3 text-sm sm:text-base"
                                  style={{ color: "#2E3E88" }}
                                >
                                  سيظهر معاينة الصورة هنا بعد التحميل
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* الوصف */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-1.5 md:mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        الوصف *
                      </label>
                      <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 resize-none text-sm sm:text-base"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                        }}
                        placeholder="قم بوصف المنتج بالتفصيل..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* الإضافات */}
                {!isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      border: "1px solid #2E3E8820",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <FaList
                        style={{
                          color: "#2E3E88",
                          fontSize: "1.1rem sm:1.25rem",
                        }}
                      />
                      <h3
                        className="text-base sm:text-lg font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        الإضافات (خيارات المنتج)
                      </h3>
                      {formData.IsPriceBasedOnRequest && (
                        <div
                          className="ml-auto px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                            color: "#92400E",
                          }}
                        >
                          يجب إضافة أنواع إضافات مطلوبة
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {menuItemOptions.map((optionType, typeIndex) => {
                        const optionTypeData = optionTypes.find(
                          (type) => type.id === optionType.typeId,
                        );
                        const isRequired = optionTypeData?.isSelectionRequired;

                        return (
                          <div
                            key={optionType.id}
                            className="rounded-lg md:rounded-xl p-3 sm:p-4 border"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border:
                                isRequired && formData.IsPriceBasedOnRequest
                                  ? "2px solid #DC2626"
                                  : "1px solid #2E3E8820",
                            }}
                          >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <h4
                                  className="text-xs sm:text-sm font-semibold"
                                  style={{ color: "#2E3E88" }}
                                >
                                  نوع الإضافة {typeIndex + 1}
                                </h4>
                                {isRequired && (
                                  <span
                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #FEE2E2, #FECACA)",
                                      color: "#DC2626",
                                    }}
                                  >
                                    مطلوب
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeMenuItemOption(optionType.id)
                                }
                                className="text-red-500 hover:text-red-700 transition-colors p-0.5"
                              >
                                <FaTrash
                                  size={12}
                                  className="sm:w-3.5 sm:h-3.5"
                                />
                              </button>
                            </div>

                            <div className="mb-3 sm:mb-4">
                              <label
                                className="block text-xs font-semibold mb-1"
                                style={{ color: "#2E3E88" }}
                              >
                                نوع الإضافة *
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOptionTypesDropdownOpen(
                                      optionTypesDropdownOpen === optionType.id
                                        ? null
                                        : optionType.id,
                                    )
                                  }
                                  className="w-full flex items-center justify-between border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-right focus:ring-2 focus:ring-[#2E3E88] transition-all duration-200 text-sm"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                  }}
                                >
                                  <span>
                                    {optionType.typeId
                                      ? optionTypes.find(
                                          (type) =>
                                            type.id === optionType.typeId,
                                        )?.name || "اختر النوع"
                                      : "اختر النوع"}
                                  </span>
                                  <motion.div
                                    animate={{
                                      rotate:
                                        optionTypesDropdownOpen ===
                                        optionType.id
                                          ? 180
                                          : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <FaChevronDown
                                      size={12}
                                      className="sm:w-3.5 sm:h-3.5"
                                      style={{ color: "#2E3E88" }}
                                    />
                                  </motion.div>
                                </button>

                                {optionTypesDropdownOpen === optionType.id && (
                                  <motion.ul
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute z-50 mt-1 sm:mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-lg md:rounded-xl overflow-hidden max-h-40 sm:max-h-48 overflow-y-auto"
                                  >
                                    {optionTypes.map((type) => (
                                      <li
                                        key={type.id}
                                        onClick={() => {
                                          updateMenuItemOption(
                                            optionType.id,
                                            "typeId",
                                            type.id,
                                          );
                                          setOptionTypesDropdownOpen(null);
                                        }}
                                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0"
                                      >
                                        <div className="flex flex-col">
                                          <span
                                            className="text-sm"
                                            style={{ color: "#2E3E88" }}
                                          >
                                            {type.name}
                                          </span>
                                          <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                            <span
                                              className="text-xs"
                                              style={{ color: "#32B9CC" }}
                                            >
                                              {type.canSelectMultipleOptions
                                                ? "✓ متعدد"
                                                : "✗ فردي"}
                                            </span>
                                            <span
                                              className="text-xs"
                                              style={{ color: "#32B9CC" }}
                                            >
                                              {type.isSelectionRequired
                                                ? "✓ مطلوب"
                                                : "✗ اختياري"}
                                            </span>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </motion.ul>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                              {optionType.options.map((option, optionIndex) => (
                                <div
                                  key={option.id}
                                  className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-md md:rounded-lg"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                    border: "1px solid #2E3E8820",
                                  }}
                                >
                                  <div>
                                    <label
                                      className="block text-xs font-semibold mb-1"
                                      style={{ color: "#2E3E88" }}
                                    >
                                      اسم الإضافة *
                                    </label>
                                    <input
                                      type="text"
                                      value={option.name}
                                      onChange={(e) =>
                                        updateOption(
                                          optionType.id,
                                          option.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full border border-gray-200 rounded-lg md:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-xs sm:text-sm"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                      }}
                                      placeholder="اسم الإضافة"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label
                                      className="block text-xs font-semibold mb-1"
                                      style={{ color: "#2E3E88" }}
                                    >
                                      السعر (جنيه) *
                                    </label>
                                    <input
                                      type="number"
                                      value={option.price}
                                      onChange={(e) =>
                                        updateOption(
                                          optionType.id,
                                          option.id,
                                          "price",
                                          e.target.value,
                                        )
                                      }
                                      step="0.01"
                                      min="0"
                                      className="w-full border border-gray-200 rounded-lg md:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-xs sm:text-sm"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                      }}
                                      placeholder="0.00"
                                      required
                                    />
                                  </div>

                                  <div className="flex items-end gap-1.5 sm:gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5 sm:gap-2">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={option.isAvailableNow}
                                            onChange={(e) =>
                                              updateOption(
                                                optionType.id,
                                                option.id,
                                                "isAvailableNow",
                                                e.target.checked,
                                              )
                                            }
                                            className="text-[#2E3E88] focus:ring-[#2E3E88] w-3.5 h-3.5 sm:w-4 sm:h-4"
                                          />
                                          <span
                                            className="text-xs"
                                            style={{ color: "#2E3E88" }}
                                          >
                                            متاح الآن
                                          </span>
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={option.isActive}
                                            onChange={(e) =>
                                              updateOption(
                                                optionType.id,
                                                option.id,
                                                "isActive",
                                                e.target.checked,
                                              )
                                            }
                                            className="text-[#2E3E88] focus:ring-[#2E3E88] w-3.5 h-3.5 sm:w-4 sm:h-4"
                                          />
                                          <span
                                            className="text-xs"
                                            style={{ color: "#2E3E88" }}
                                          >
                                            نشط
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                    {optionType.options.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeOptionFromType(
                                            optionType.id,
                                            option.id,
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700 transition-colors p-0.5 sm:p-1"
                                      >
                                        <FaTrash
                                          size={10}
                                          className="sm:w-3 sm:h-3"
                                        />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => addOptionToType(optionType.id)}
                              className="mt-3 sm:mt-4 w-full py-2 sm:py-3 border border-dashed border-gray-300 rounded-lg md:rounded-xl font-semibold hover:border-[#2E3E88] hover:text-[#2E3E88] transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              }}
                            >
                              <FaPlus size={10} className="sm:w-3 sm:h-3" />
                              إضافة خيار جديد لهذا النوع
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addMenuItemOption}
                      className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg md:rounded-xl font-semibold hover:border-[#2E3E88] hover:text-[#2E3E88] transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <FaPlus size={12} className="sm:w-3.5 sm:h-3.5" />
                      إضافة نوع إضافة جديد
                    </motion.button>

                    {formData.IsPriceBasedOnRequest &&
                      !hasRequiredOptionTypes() && (
                        <div
                          className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg md:rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, #FEE2E2, #FECACA)",
                            border: "1px solid #DC2626",
                          }}
                        >
                          <p
                            className="text-xs sm:text-sm"
                            style={{ color: "#DC2626" }}
                          >
                            <span className="font-semibold">تنبيه:</span> المنتج
                            بسعر حسب الطلب يجب أن يحتوي على أنواع إضافات مطلوبة
                            للاختيار.
                          </p>
                        </div>
                      )}
                  </motion.div>
                )}

                {/* أزرار الحفظ */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-5 md:pt-6 border-t border-gray-100">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/")}
                    className="flex-1 py-2.5 sm:py-3.5 border-2 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                    style={{
                      borderColor: "#2E3E88",
                      color: "#2E3E88",
                      background: "transparent",
                    }}
                  >
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <FaTimes className="text-sm sm:text-base" />
                      إلغاء
                    </div>
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                      !isFormValid() ||
                      isLoading ||
                      (isEditing && !hasChanges) ||
                      (!isEditing &&
                        formData.IsPriceBasedOnRequest &&
                        !hasRequiredOptionTypes())
                    }
                    className={`flex-1 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                      isFormValid() &&
                      !isLoading &&
                      (!isEditing || hasChanges) &&
                      (!formData.IsPriceBasedOnRequest ||
                        hasRequiredOptionTypes() ||
                        isEditing)
                        ? "shadow-lg hover:shadow-xl cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    style={
                      isFormValid() &&
                      !isLoading &&
                      (!isEditing || hasChanges) &&
                      (!formData.IsPriceBasedOnRequest ||
                        hasRequiredOptionTypes() ||
                        isEditing)
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
                    <FaSave className="text-sm sm:text-base" />
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
      </div>

      {/* زر إدارة أنواع الإضافات */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenOptionTypesManager}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group"
        style={{
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
        }}
      >
        <FaCog className="text-lg sm:text-xl group-hover:rotate-90 transition-transform" />
      </motion.button>

      {/* Modal إدارة أنواع الإضافات */}
      <AnimatePresence>
        {showOptionTypesManager && (
          <>
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
                className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Modal Header */}
                <div
                  className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaCog className="text-white text-lg sm:text-xl" />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      إدارة أنواع الإضافات
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseOptionTypesManager}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                  >
                    <FaTimes size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                  {/* إضافة نوع جديد */}
                  <div
                    className="rounded-lg md:rounded-xl lg:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border"
                    style={{
                      background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      border: "1px solid #2E3E8820",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                      <div
                        className="p-2 sm:p-3 rounded-lg md:rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                        }}
                      >
                        <FaPlus
                          style={{ color: "#2E3E88" }}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <h3
                        className="text-base sm:text-lg font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        إضافة نوع إضافة جديد
                      </h3>
                    </div>

                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                      <div>
                        <label
                          className="block text-sm font-semibold mb-1.5 sm:mb-2"
                          style={{ color: "#2E3E88" }}
                        >
                          اسم نوع الإضافة
                        </label>
                        <div className="relative">
                          <FaTag
                            className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-sm sm:text-base"
                            style={{ color: "#2E3E88" }}
                          />
                          <input
                            type="text"
                            value={newOptionType.name}
                            onChange={(e) =>
                              setNewOptionType({
                                ...newOptionType,
                                name: e.target.value,
                              })
                            }
                            placeholder="أدخل اسم نوع الإضافة الجديد..."
                            className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 pr-8 sm:pr-10 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base text-right"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label
                            className="flex items-center gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors duration-200"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={newOptionType.canSelectMultipleOptions}
                                onChange={(e) =>
                                  setNewOptionType({
                                    ...newOptionType,
                                    canSelectMultipleOptions: e.target.checked,
                                  })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                  newOptionType.canSelectMultipleOptions
                                    ? "bg-[#2E3E88] border-[#2E3E88]"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {newOptionType.canSelectMultipleOptions && (
                                  <FaCheck className="text-white text-xs sm:text-sm" />
                                )}
                              </div>
                            </div>
                            <div>
                              <span
                                className="font-semibold block text-sm"
                                style={{ color: "#2E3E88" }}
                              >
                                اختيار متعدد
                              </span>
                              <span
                                className="text-xs sm:text-sm"
                                style={{ color: "#32B9CC" }}
                              >
                                يسمح باختيار أكثر من خيار
                              </span>
                            </div>
                          </label>
                        </div>

                        <div>
                          <label
                            className="flex items-center gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors duration-200"
                            style={{
                              background:
                                "linear-gradient(135deg, #f8f9ff, #ffffff)",
                              border: "1px solid #2E3E8820",
                            }}
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={newOptionType.isSelectionRequired}
                                onChange={(e) =>
                                  setNewOptionType({
                                    ...newOptionType,
                                    isSelectionRequired: e.target.checked,
                                  })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                  newOptionType.isSelectionRequired
                                    ? "bg-[#2E3E88] border-[#2E3E88]"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {newOptionType.isSelectionRequired && (
                                  <FaCheck className="text-white text-xs sm:text-sm" />
                                )}
                              </div>
                            </div>
                            <div>
                              <span
                                className="font-semibold block text-sm"
                                style={{ color: "#2E3E88" }}
                              >
                                اختيار مطلوب
                              </span>
                              <span
                                className="text-xs sm:text-sm"
                                style={{ color: "#32B9CC" }}
                              >
                                يجب على العميل اختيار خيار واحد على الأقل
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start mt-4 sm:mt-5 md:mt-6">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddOptionType}
                        className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 sm:gap-3 shadow-lg text-sm sm:text-base"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                          color: "white",
                        }}
                      >
                        <FaPlus className="text-sm sm:text-base" />
                        إضافة نوع إضافة جديد
                      </motion.button>
                    </div>
                  </div>

                  {/* أنواع الإضافات الحالية */}
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                      <div
                        className="p-2 sm:p-3 rounded-lg md:rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                        }}
                      >
                        <FaList
                          style={{ color: "#2E3E88" }}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <h3
                        className="text-base sm:text-lg font-bold"
                        style={{ color: "#2E3E88" }}
                      >
                        أنواع الإضافات الحالية ({optionTypes.length})
                      </h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {optionTypes.map((optionType) => (
                        <motion.div
                          key={optionType.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg md:rounded-xl lg:rounded-2xl p-4 sm:p-5 md:p-6 border hover:shadow-lg transition-all duration-300 group"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            border: "1px solid #2E3E8820",
                          }}
                        >
                          {editingOptionType &&
                          editingOptionType.id === optionType.id ? (
                            // Edit Mode
                            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                <div>
                                  <label
                                    className="block text-sm font-semibold mb-1.5 sm:mb-2"
                                    style={{ color: "#2E3E88" }}
                                  >
                                    اسم نوع الإضافة
                                  </label>
                                  <input
                                    type="text"
                                    value={editingOptionType.name}
                                    onChange={(e) =>
                                      setEditingOptionType({
                                        ...editingOptionType,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full border border-gray-200 rounded-lg md:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base text-right"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                    }}
                                    dir="rtl"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <label
                                    className="flex items-center gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                      border: "1px solid #2E3E8820",
                                    }}
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={
                                          editingOptionType.canSelectMultipleOptions
                                        }
                                        onChange={(e) =>
                                          setEditingOptionType({
                                            ...editingOptionType,
                                            canSelectMultipleOptions:
                                              e.target.checked,
                                          })
                                        }
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                          editingOptionType.canSelectMultipleOptions
                                            ? "bg-[#2E3E88] border-[#2E3E88]"
                                            : "bg-white border-gray-300"
                                        }`}
                                      >
                                        {editingOptionType.canSelectMultipleOptions && (
                                          <FaCheck className="text-white text-xs sm:text-sm" />
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <span
                                        className="font-semibold block text-sm"
                                        style={{ color: "#2E3E88" }}
                                      >
                                        اختيار متعدد
                                      </span>
                                      <span
                                        className="text-xs sm:text-sm"
                                        style={{ color: "#32B9CC" }}
                                      >
                                        يسمح باختيار أكثر من خيار
                                      </span>
                                    </div>
                                  </label>
                                </div>

                                <div>
                                  <label
                                    className="flex items-center gap-2 sm:gap-3 cursor-pointer p-3 sm:p-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                      border: "1px solid #2E3E8820",
                                    }}
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={
                                          editingOptionType.isSelectionRequired
                                        }
                                        onChange={(e) =>
                                          setEditingOptionType({
                                            ...editingOptionType,
                                            isSelectionRequired:
                                              e.target.checked,
                                          })
                                        }
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                          editingOptionType.isSelectionRequired
                                            ? "bg-[#2E3E88] border-[#2E3E88]"
                                            : "bg-white border-gray-300"
                                        }`}
                                      >
                                        {editingOptionType.isSelectionRequired && (
                                          <FaCheck className="text-white text-xs sm:text-sm" />
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <span
                                        className="font-semibold block text-sm"
                                        style={{ color: "#2E3E88" }}
                                      >
                                        اختيار مطلوب
                                      </span>
                                      <span
                                        className="text-xs sm:text-sm"
                                        style={{ color: "#32B9CC" }}
                                      >
                                        يجب على العميل اختيار خيار واحد على
                                        الأقل
                                      </span>
                                    </div>
                                  </label>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start pt-3 sm:pt-4 border-t border-gray-200">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setEditingOptionType(null)}
                                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg md:rounded-xl font-semibold border-2 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base"
                                  style={{
                                    borderColor: "#2E3E88",
                                    color: "#2E3E88",
                                  }}
                                >
                                  إلغاء التعديل
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleSaveOptionType}
                                  className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                    color: "white",
                                  }}
                                >
                                  <FaSave className="text-sm sm:text-base" />
                                  حفظ التغييرات
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div
                                  className="p-2.5 sm:p-3 rounded-lg md:rounded-xl"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                                  }}
                                >
                                  <FaCog
                                    style={{ color: "#2E3E88" }}
                                    className="text-sm sm:text-base"
                                  />
                                </div>
                                <div>
                                  <h4
                                    className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1"
                                    style={{ color: "#2E3E88" }}
                                    dir={
                                      isArabic(optionType.name) ? "rtl" : "ltr"
                                    }
                                  >
                                    {optionType.name}
                                  </h4>
                                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                    <div
                                      className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 sm:gap-1.5"
                                      style={
                                        optionType.canSelectMultipleOptions
                                          ? {
                                              background:
                                                "linear-gradient(135deg, #DCFCE7, #BBF7D0)",
                                              color: "#166534",
                                            }
                                          : {
                                              background:
                                                "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
                                              color: "#4B5563",
                                            }
                                      }
                                    >
                                      {optionType.canSelectMultipleOptions ? (
                                        <>
                                          <FaCheckSquare className="text-xs" />
                                          متعدد الاختيار
                                        </>
                                      ) : (
                                        <>
                                          <FaSquare className="text-xs" />
                                          اختيار فردي
                                        </>
                                      )}
                                    </div>
                                    <div
                                      className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 sm:gap-1.5"
                                      style={
                                        optionType.isSelectionRequired
                                          ? {
                                              background:
                                                "linear-gradient(135deg, #FEE2E2, #FECACA)",
                                              color: "#DC2626",
                                            }
                                          : {
                                              background:
                                                "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
                                              color: "#4B5563",
                                            }
                                      }
                                    >
                                      {optionType.isSelectionRequired ? (
                                        <>
                                          <FaCheckCircle className="text-xs" />
                                          مطلوب
                                        </>
                                      ) : (
                                        <>
                                          <FaSquare className="text-xs" />
                                          اختياري
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-1.5 sm:gap-2 justify-start md:justify-start mt-3 sm:mt-4 md:mt-0">
                                <motion.button
                                  whileHover={{ scale: 1.1, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleEditOptionType(optionType)
                                  }
                                  className="p-2.5 sm:p-3 rounded-lg md:rounded-xl hover:shadow-lg transition-all shadow-md"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                    color: "white",
                                  }}
                                  title="تعديل نوع الإضافة"
                                >
                                  <FaEdit size={14} className="sm:w-4 sm:h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1, y: -2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleDeleteOptionType(optionType.id)
                                  }
                                  className="p-2.5 sm:p-3 rounded-lg md:rounded-xl hover:shadow-lg transition-all shadow-md"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #DC2626, #EF4444)",
                                    color: "white",
                                  }}
                                  title="حذف نوع الإضافة"
                                >
                                  <FaTrash
                                    size={14}
                                    className="sm:w-4 sm:h-4"
                                  />
                                </motion.button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductForm;
