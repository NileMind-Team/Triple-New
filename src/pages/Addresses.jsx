import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaMapMarkerAlt,
  FaStar,
  FaCheck,
  FaTimes,
  FaPhone,
  FaCity,
  FaRoad,
  FaBuilding as FaBuildingIcon,
  FaChevronDown,
  FaTag,
  FaMap,
  FaExternalLinkAlt,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTrashAlt,
  FaGlobeAmericas,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "16px",
};

const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357,
};

const libraries = ["places"];

// وظائف الترجمات والتنبيهات كما هي
const translateAddressErrorMessage = (errorData) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.PhoneNumber) {
      errorData.errors.PhoneNumber.forEach((msg) => {
        if (msg.includes("must start with 010, 011, 012, or 015")) {
          errorMessages.push("رقم الهاتف يجب أن يبدأ بـ 010، 011، 012، أو 015");
        } else if (msg.includes("must be 11 digits long")) {
          errorMessages.push("رقم الهاتف يجب أن يكون 11 رقمًا");
        } else if (msg.includes("Invalid phone number")) {
          errorMessages.push("رقم الهاتف غير صالح");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.CityId) {
      errorData.errors.CityId.forEach((msg) => {
        if (msg.includes("required")) {
          errorMessages.push("المدينة مطلوبة");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.StreetName) {
      errorData.errors.StreetName.forEach((msg) => {
        if (msg.includes("required")) {
          errorMessages.push("اسم الشارع مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.BuildingNumber) {
      errorData.errors.BuildingNumber.forEach((msg) => {
        if (msg.includes("required")) {
          errorMessages.push("رقم المبنى مطلوب");
        } else if (msg.includes("greater than 0")) {
          errorMessages.push("رقم المبنى يجب أن يكون أكبر من صفر");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.FloorNumber) {
      errorData.errors.FloorNumber.forEach((msg) => {
        if (msg.includes("required")) {
          errorMessages.push("رقم الدور مطلوب");
        } else if (msg.includes("greater than 0")) {
          errorMessages.push("رقم الدور يجب أن يكون أكبر من صفر");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.FlatNumber) {
      errorData.errors.FlatNumber.forEach((msg) => {
        if (msg.includes("required")) {
          errorMessages.push("رقم الشقة مطلوب");
        } else if (msg.includes("greater than 0")) {
          errorMessages.push("رقم الشقة يجب أن يكون أكبر من صفر");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.DetailedDescription) {
      errorData.errors.DetailedDescription.forEach((msg) => {
        if (msg.includes("required")) {
          errorMessages.push("التفاصيل الإضافية مطلوبة");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (
        ![
          "PhoneNumber",
          "CityId",
          "StreetName",
          "BuildingNumber",
          "FloorNumber",
          "FlatNumber",
          "DetailedDescription",
        ].includes(key)
      ) {
        errorData.errors[key].forEach((msg) => {
          errorMessages.push(msg);
        });
      }
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

const showAddressErrorAlert = (errorData) => {
  const translatedMessage = translateAddressErrorMessage(errorData);

  if (window.innerWidth < 768) {
    toast.error(translatedMessage, {
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
      title: "حدث خطأ",
      html: translatedMessage,
      icon: "error",
      confirmButtonText: "حاول مرة أخرى",
      timer: 2500,
      showConfirmButton: false,
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    });
  }
};

const showAddressSuccessAlert = (message) => {
  if (window.innerWidth < 768) {
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
  } else {
    Swal.fire({
      title: "تم بنجاح",
      text: message,
      icon: "success",
      showConfirmButton: false,
      timer: 2500,
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    });
  }
};

export default function Addresses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [darkMode, setDarkMode] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedMaps, setExpandedMaps] = useState({});

  const [formData, setFormData] = useState({
    cityId: "",
    locationUrl: "",
    streetName: "",
    phoneNumber: "",
    buildingNumber: "",
    floorNumber: "",
    flatNumber: "",
    detailedDescription: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  const toggleMapVisibility = (addressId) => {
    setExpandedMaps((prev) => ({
      ...prev,
      [addressId]: !prev[addressId],
    }));
  };

  const arabicToEnglishNumbers = (str) => {
    if (!str) return str;

    const arabicToEngMap = {
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    };

    return str
      .toString()
      .split("")
      .map((char) => arabicToEngMap[char] || char)
      .join("");
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchCities();
  }, []);

  useEffect(() => {
    if (location.state?.fromCart) {
      console.log("Came from cart page");
    }
  }, [location.state]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/api/Locations/GetAllForUser");
      if (res.status === 200) {
        setAddresses(res.data);
        const initialExpandedState = {};
        res.data.forEach((address) => {
          initialExpandedState[address.id] = false;
        });
        setExpandedMaps(initialExpandedState);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
      showAddressErrorAlert(err.response?.data);
    } finally {
      setIsLoading(false);
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
      showAddressErrorAlert(err.response?.data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      let cleanedValue = value;
      if (value.startsWith("+")) {
        cleanedValue = "+" + value.slice(1).replace(/[^0-9٠-٩]/g, "");
      } else {
        cleanedValue = value.replace(/[^0-9٠-٩]/g, "");
      }

      setFormData({
        ...formData,
        [name]: cleanedValue,
      });
    } else if (
      name === "buildingNumber" ||
      name === "floorNumber" ||
      name === "flatNumber"
    ) {
      const cleanedValue = value.replace(/[^0-9٠-٩]/g, "");
      const englishNumber = arabicToEnglishNumbers(cleanedValue);
      const numValue = parseInt(englishNumber || 0);

      if (cleanedValue === "" || numValue > 0) {
        setFormData({
          ...formData,
          [name]: cleanedValue,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const generateEmbedUrl = (lat, lng) => {
    const apiKey = "AIzaSyC9UUx3lHra53Dbx5rcZdWSBsSxUaPZDa4";
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=18`;
  };

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setSelectedLocation({ lat, lng });

    const embedUrl = generateEmbedUrl(lat, lng);

    setFormData((prev) => ({
      ...prev,
      locationUrl: embedUrl,
    }));

    showAddressSuccessAlert("تم اختيار الموقع: تم إضافة رابط الخريطة تلقائياً");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = { ...formData };

      const fieldsToConvert = [
        "buildingNumber",
        "floorNumber",
        "flatNumber",
        "phoneNumber",
      ];

      fieldsToConvert.forEach((field) => {
        if (submitData[field]) {
          submitData[field] = arabicToEnglishNumbers(submitData[field]);
        }
      });

      const phoneNumber = submitData.phoneNumber;
      if (phoneNumber) {
        if (phoneNumber.startsWith("0")) {
          if (phoneNumber.length !== 11) {
            showAddressErrorAlert({
              errors: {
                PhoneNumber: ["رقم الهاتف يجب أن يكون 11 رقمًا"],
              },
            });
            return;
          }

          const validPrefixes = ["010", "011", "012", "015"];
          const prefix = phoneNumber.substring(0, 3);
          if (!validPrefixes.includes(prefix)) {
            showAddressErrorAlert({
              errors: {
                PhoneNumber: [
                  "رقم الهاتف يجب أن يبدأ بـ 010، 011، 012، أو 015",
                ],
              },
            });
            return;
          }
        }
      }

      if (!submitData.locationUrl || submitData.locationUrl.trim() === "") {
        delete submitData.locationUrl;
      }

      const formattedData = {
        ...submitData,
        cityId: parseInt(arabicToEnglishNumbers(submitData.cityId) || 0),
        buildingNumber: parseInt(submitData.buildingNumber) || 0,
        floorNumber: parseInt(submitData.floorNumber) || 0,
        flatNumber: parseInt(submitData.flatNumber) || 0,
      };

      if (editingId) {
        const res = await axiosInstance.put(
          `/api/Locations/Update/${editingId}`,
          formattedData,
        );
        if (res.status === 200 || res.status === 204) {
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingId ? { ...addr, ...formattedData } : addr,
            ),
          );
          showAddressSuccessAlert("تم تحديث العنوان: تم تحديث عنوانك بنجاح");
        }
      } else {
        const res = await axiosInstance.post(
          "/api/Locations/Add",
          formattedData,
        );
        if (res.status === 200) {
          fetchAddresses();
          showAddressSuccessAlert(
            "تم إضافة العنوان: تم إضافة عنوانك الجديد بنجاح",
          );

          if (location.state?.fromCart) {
            setTimeout(() => {
              navigate("/cart", { state: { addressAdded: true } });
            }, 1500);
            return;
          }
        }
      }

      resetForm();
    } catch (err) {
      showAddressErrorAlert(err.response?.data);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      cityId: address.city.id.toString(),
      locationUrl: address.locationUrl || "",
      streetName: address.streetName || "",
      phoneNumber: address.phoneNumber || "",
      buildingNumber: address.buildingNumber?.toString() || "",
      floorNumber: address.floorNumber?.toString() || "",
      flatNumber: address.flatNumber?.toString() || "",
      detailedDescription: address.detailedDescription || "",
    });
    setEditingId(address.id);
    setIsAdding(true);
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Locations/Delete/${id}`);
          setAddresses(addresses.filter((addr) => addr.id !== id));
          showAddressSuccessAlert("تم الحذف: تم حذف عنوانك");
        } catch (err) {
          showAddressErrorAlert(err.response?.data);
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/api/Locations/ChangeDefaultLocation/${id}`);
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefaultLocation: addr.id === id,
        })),
      );

      showAddressSuccessAlert(
        "تم تحديث العنوان الافتراضي: تم تغيير عنوانك الافتراضي",
      );

      if (location.state?.fromCart) {
        setTimeout(() => {
          navigate("/cart", { state: { fromAddresses: true } });
        }, 1500);
      }
    } catch (err) {
      showAddressErrorAlert(err.response?.data);
    }
  };

  const resetForm = () => {
    setFormData({
      cityId: "",
      locationUrl: "",
      streetName: "",
      phoneNumber: "",
      buildingNumber: "",
      floorNumber: "",
      flatNumber: "",
      detailedDescription: "",
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  const handleAddNewAddress = () => {
    setFormData({
      cityId: "",
      locationUrl: "",
      streetName: "",
      phoneNumber: "",
      buildingNumber: "",
      floorNumber: "",
      flatNumber: "",
      detailedDescription: "",
    });
    setEditingId(null);
    setIsAdding(true);
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  const openMapModal = () => {
    setShowMapModal(true);
    setMapLoaded(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const embedUrl = generateEmbedUrl(lat, lng);
          setSelectedLocation({ lat, lng });
          setFormData((prev) => ({ ...prev, locationUrl: embedUrl }));
        },
        (error) => {
          console.warn("خطأ في تحديد الموقع:", error);
          setSelectedLocation(defaultCenter);
        },
        { enableHighAccuracy: true },
      );
    } else {
      setSelectedLocation(defaultCenter);
    }
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setMapLoaded(false);
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      closeMapModal();
      showAddressSuccessAlert("تم تأكيد الموقع: تم حفظ موقعك بنجاح");
    } else {
      Swal.fire({
        icon: "warning",
        title: "تحذير",
        text: "يرجى اختيار موقع من الخريطة أولاً",
        showConfirmButton: false,
        timer: 2000,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
    }
  };

  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  const isFormValid = () => {
    const requiredFields = [
      "cityId",
      "streetName",
      "phoneNumber",
      "buildingNumber",
      "floorNumber",
      "flatNumber",
      "detailedDescription",
    ];

    return requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== "",
    );
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
            جارٍ تحميل العناوين...
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
              onClick={() => {
                if (location.state?.fromCart) {
                  navigate("/cart");
                } else {
                  navigate(-1);
                }
              }}
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
                <FaMapMarkerAlt className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                عناويني
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                إدارة عناوين التوصيل الخاصة بك بسهولة وأمان
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
          onClick={handleAddNewAddress}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
        >
          <FaPlus className="text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden md:inline font-semibold">
            إضافة عنوان جديد
          </span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          {/* Addresses List */}
          <div>
            {addresses.length === 0 ? (
              <div className="w-full">
                <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                    <FaMapMarkerAlt
                      className="text-4xl"
                      style={{ color: "#2E3E88" }}
                    />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: "#2E3E88" }}
                  >
                    لا توجد عناوين حتى الآن
                  </h3>
                  <p
                    className="mb-6 max-w-md mx-auto"
                    style={{ color: "#32B9CC" }}
                  >
                    أضف عنوانك الأول للبدء في استلام طلباتك
                  </p>
                  <button
                    onClick={handleAddNewAddress}
                    className="px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      color: "white",
                      boxShadow: `0 10px 25px #2E3E8830`,
                    }}
                  >
                    إضافة عنوان جديد
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col"
                    style={{
                      borderTop: address.isDefaultLocation
                        ? "4px solid #2E3E88"
                        : "4px solid transparent",
                      minHeight: "400px",
                    }}
                  >
                    <div className="p-6 flex-grow">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                            <FaMapMarkerAlt
                              className="text-xl"
                              style={{ color: "#2E3E88" }}
                            />
                          </div>
                          <div>
                            <h4
                              className="font-bold text-lg"
                              style={{ color: "#2E3E88" }}
                            >
                              {address.city.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {address.isDefaultLocation && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white">
                                  افتراضي
                                </span>
                              )}
                              <span
                                className="text-sm"
                                style={{ color: "#32B9CC" }}
                              >
                                {address.phoneNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <FaRoad
                            className="mt-1 flex-shrink-0"
                            style={{ color: "#2E3E88" }}
                          />
                          <p className="text-gray-700">{address.streetName}</p>
                        </div>

                        <div className="flex items-start gap-3">
                          <FaBuildingIcon
                            className="mt-1 flex-shrink-0"
                            style={{ color: "#2E3E88" }}
                          />
                          <div className="flex gap-4">
                            <div>
                              <span className="text-sm text-gray-500">
                                المبنى
                              </span>
                              <p className="font-medium">
                                {address.buildingNumber}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                الدور
                              </span>
                              <p className="font-medium">
                                {address.floorNumber}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                الشقة
                              </span>
                              <p className="font-medium">
                                {address.flatNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        {address.detailedDescription && (
                          <div className="flex items-start gap-3">
                            <FaTag
                              className="mt-1 flex-shrink-0"
                              style={{ color: "#2E3E88" }}
                            />
                            <p className="text-gray-700">
                              {address.detailedDescription}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Map Section */}
                      <div className="mt-auto">
                        {/* زر عرض الخريطة */}
                        <div className="mb-3">
                          <button
                            onClick={() =>
                              address.locationUrl &&
                              toggleMapVisibility(address.id)
                            }
                            disabled={!address.locationUrl}
                            className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                              address.locationUrl
                                ? expandedMaps[address.id]
                                  ? "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white hover:shadow-md"
                                  : "bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 text-[#2E3E88] hover:shadow-md"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {address.locationUrl ? (
                              <>
                                {expandedMaps[address.id] ? (
                                  <>
                                    <FaEyeSlash />
                                    إخفاء الخريطة
                                  </>
                                ) : (
                                  <>
                                    <FaEye />
                                    عرض الخريطة
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <FaMap />
                                لا توجد خريطة
                              </>
                            )}
                          </button>
                        </div>

                        <AnimatePresence>
                          {expandedMaps[address.id] && address.locationUrl && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="rounded-xl overflow-hidden mb-4"
                            >
                              <iframe
                                src={address.locationUrl}
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`خريطة موقع ${address.streetName}`}
                                className="w-full rounded-lg"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          {!address.isDefaultLocation && (
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                              style={{
                                background: "#2E3E8810",
                                color: "#2E3E88",
                              }}
                            >
                              <FaStar />
                              تعيين افتراضي
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(address)}
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
                            onClick={() => handleDelete(address.id)}
                            className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                            style={{
                              background: "#FF6B6B10",
                              color: "#FF6B6B",
                            }}
                          >
                            <FaTrashAlt />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
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
                    {editingId ? "تعديل العنوان" : "إضافة عنوان جديد"}
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
                  {/* City Dropdown */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      المدينة
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggleDropdown("city")}
                        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <FaCity className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                          <span className="font-medium">
                            {formData.cityId
                              ? cities.find(
                                  (c) => c.id.toString() === formData.cityId,
                                )?.name
                              : "اختر المدينة"}
                          </span>
                        </div>
                        <motion.div
                          animate={{
                            rotate: openDropdown === "city" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown className="text-[#2E3E88]" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openDropdown === "city" && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                          >
                            {cities.map((city) => (
                              <li
                                key={city.id}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    cityId: city.id.toString(),
                                  });
                                  setOpenDropdown(null);
                                }}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                              >
                                {city.name}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      رقم الهاتف
                    </label>
                    <div className="relative group">
                      <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        inputMode="tel"
                        pattern="[0-9٠-٩]*"
                        className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                        placeholder="رقم الهاتف"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Street Name */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      اسم الشارع
                    </label>
                    <div className="relative group">
                      <FaRoad className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                      <input
                        type="text"
                        name="streetName"
                        value={formData.streetName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                        }}
                        placeholder="اسم الشارع"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Building, Floor, Flat Numbers */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        المبنى
                      </label>
                      <div className="relative group">
                        <FaBuildingIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9٠-٩]*"
                          name="buildingNumber"
                          value={formData.buildingNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-center"
                          style={{
                            background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                          }}
                          placeholder="رقم"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        الدور
                      </label>
                      <div className="relative group">
                        <FaTag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9٠-٩]*"
                          name="floorNumber"
                          value={formData.floorNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-center"
                          style={{
                            background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                          }}
                          placeholder="الدور"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        الشقة
                      </label>
                      <div className="relative group">
                        <FaTag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9٠-٩]*"
                          name="flatNumber"
                          value={formData.flatNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-center"
                          style={{
                            background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                          }}
                          placeholder="الشقة"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      تفاصيل إضافية
                    </label>
                    <textarea
                      name="detailedDescription"
                      value={formData.detailedDescription}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 resize-none"
                      style={{
                        background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                      }}
                      placeholder="أي تفاصيل إضافية عن موقعك..."
                      dir="rtl"
                    />
                  </div>

                  {/* Map Selection */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      تحديد الموقع على الخريطة
                    </label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openMapModal}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold mb-3 transition-all duration-300 hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                        color: "white",
                      }}
                    >
                      <FaMap />
                      <span>اختيار الموقع من الخريطة</span>
                      <FaExternalLinkAlt />
                    </motion.button>

                    <input
                      type="url"
                      name="locationUrl"
                      value={formData.locationUrl}
                      onChange={handleInputChange}
                      disabled
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none transition-all duration-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="سيتم تعبئته تلقائياً عند اختيار موقع من الخريطة"
                      dir="rtl"
                    />

                    {formData.locationUrl && (
                      <p className="text-sm mt-2" style={{ color: "#32B9CC" }}>
                        ✓ تم إضافة رابط الخريطة بنجاح
                      </p>
                    )}
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
                      <FaCheckCircle />
                      {editingId ? "تحديث العنوان" : "حفظ العنوان"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
                  <FaGlobeAmericas className="text-white text-xl" />
                  <h3 className="text-lg font-bold text-white">
                    اختر موقعك من الخريطة
                  </h3>
                </div>
                <button
                  onClick={closeMapModal}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-600">
                      انقر على الخريطة لتحديد موقعك بدقة
                    </p>
                  </div>

                  {/* Map Loading State */}
                  {!mapLoaded && (
                    <div className="flex items-center justify-center h-64 bg-gradient-to-r from-[#f0f8ff] to-[#e0f7fa] rounded-2xl">
                      <div className="text-center">
                        <div
                          className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
                          style={{
                            borderTopColor: "#2E3E88",
                            borderRightColor: "#32B9CC",
                            borderBottomColor: "#2E3E88",
                            borderLeftColor: "transparent",
                          }}
                        ></div>
                        <p className="text-gray-600">جاري تحميل الخريطة...</p>
                      </div>
                    </div>
                  )}

                  {/* Google Maps */}
                  <LoadScript
                    googleMapsApiKey="AIzaSyC9UUx3lHra53Dbx5rcZdWSBsSxUaPZDa4"
                    libraries={libraries}
                    onLoad={() => setMapLoaded(true)}
                    onError={() => {
                      setMapLoaded(false);
                      showAddressErrorAlert("خطأ في تحميل الخريطة");
                    }}
                  >
                    {mapLoaded && (
                      <div className="rounded-2xl overflow-hidden border border-gray-200">
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={selectedLocation || defaultCenter}
                          zoom={15}
                          onClick={handleMapClick}
                          onLoad={handleMapLoad}
                          options={{
                            styles: [
                              {
                                featureType: "all",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#2E3E88" }],
                              },
                              {
                                featureType: "all",
                                elementType: "labels.text.stroke",
                                stylers: [{ color: "#ffffff" }],
                              },
                            ],
                          }}
                        >
                          {selectedLocation && (
                            <Marker
                              position={selectedLocation}
                              icon={{
                                url:
                                  "data:image/svg+xml;charset=UTF-8," +
                                  encodeURIComponent(`
                                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="15" fill="#2E3E88" fill-opacity="0.8"/>
                                    <circle cx="20" cy="20" r="8" fill="#32B9CC"/>
                                    <circle cx="20" cy="20" r="4" fill="white"/>
                                  </svg>
                                `),
                                scaledSize: new window.google.maps.Size(40, 40),
                              }}
                            />
                          )}
                        </GoogleMap>
                      </div>
                    )}
                  </LoadScript>

                  {/* Selected Location Info */}
                  {selectedLocation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, #2E3E88/10, #32B9CC/10)`,
                        border: "1px solid #2E3E8820",
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p
                            className="font-semibold mb-2"
                            style={{ color: "#2E3E88" }}
                          >
                            ✓ الموقع المختار
                          </p>
                          <p className="text-sm text-gray-600">
                            خط العرض: {selectedLocation.lat.toFixed(6)} | خط
                            الطول: {selectedLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={confirmLocation}
                          className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                            color: "white",
                          }}
                        >
                          <FaCheck className="inline ml-2" />
                          تأكيد الموقع
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
