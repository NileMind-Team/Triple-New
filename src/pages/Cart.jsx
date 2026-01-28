import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaEdit,
  FaFire,
  FaStickyNote,
  FaInfoCircle,
  FaSave,
  FaStore,
  FaLocationArrow,
  FaChevronDown,
  FaMapMarker,
  FaPlusCircle,
  FaUser,
  FaExchangeAlt,
  FaPhone,
  FaMapPin,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState(null);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [branches, setBranches] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [productAddons, setProductAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [productQuantity, setProductQuantity] = useState(1);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingDeliveryFees, setLoadingDeliveryFees] = useState(false);
  const [itemNotes, setItemNotes] = useState("");
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInputModal, setShowPhoneInputModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");

  const notesModalRef = React.useRef(null);
  const productDetailsModalRef = React.useRef(null);
  const addressDropdownRef = React.useRef(null);

  const isMobile = () => window.innerWidth <= 768;

  const showMessage = (type, title, text) => {
    if (isMobile()) {
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

  useEffect(() => {
    fetchCartItems();
    fetchBranches();
    fetchUserAddresses();
    fetchDeliveryFees();
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBranch && deliveryType === "delivery") {
      fetchDeliveryAreas(selectedBranch.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, deliveryType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notesModalRef.current &&
        !notesModalRef.current.contains(event.target)
      ) {
        handleCloseNotesModal();
      }

      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target) &&
        addressDropdownOpen
      ) {
        setAddressDropdownOpen(false);
      }
    };

    if (showNotesModal || addressDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showNotesModal, addressDropdownOpen]);

  useEffect(() => {
    if (location.state?.fromAddresses) {
      fetchUserAddresses();
      showMessage("success", "تم بنجاح", "تم تحديث العنوان الافتراضي");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await axiosInstance.get("/api/Account/Profile");
      setUserProfile(response.data);
      setPhoneNumber(response.data.phoneNumber || "");
      setNewPhoneNumber(response.data.phoneNumber || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const updatePhoneNumber = async () => {
    try {
      if (!newPhoneNumber.trim()) {
        showMessage("error", "خطأ", "الرجاء إدخال رقم هاتف صحيح");
        return;
      }

      setLoadingProfile(true);
      await axiosInstance.put("/api/Account/UpdateProfile", {
        firstName: userProfile?.firstName || "",
        lastName: userProfile?.lastName || "",
        phoneNumber: newPhoneNumber,
      });

      showMessage("success", "تم بنجاح", "تم تحديث رقم الهاتف بنجاح");

      setShowPhoneInputModal(false);
      setShowMissingInfoModal(false);
      fetchUserProfile();

      setTimeout(() => {
        handleCheckout();
      }, 500);
    } catch (error) {
      console.error("Error updating phone number:", error);
      showMessage("error", "خطأ", "فشل في تحديث رقم الهاتف");
    } finally {
      setLoadingProfile(false);
    }
  };

  const openPhoneInputModal = () => {
    setShowMissingInfoModal(false);
    setShowPhoneInputModal(true);
  };

  const handleAddAddress = () => {
    setShowMissingInfoModal(false);
    navigate("/addresses", { state: { fromCart: true, requireDefault: true } });
  };

  const fetchDeliveryFees = async () => {
    try {
      setLoadingDeliveryFees(true);
      const response = await axiosInstance.get("/api/DeliveryFees/GetAll");

      if (response.data && Array.isArray(response.data)) {
        setDeliveryFees(response.data);
      }
    } catch (error) {
      console.error("Error fetching delivery fees:", error);
    } finally {
      setLoadingDeliveryFees(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await axiosInstance.get("/api/Locations/GetAllForUser");

      if (response.data && Array.isArray(response.data)) {
        setUserAddresses(response.data);

        const defaultAddress = response.data.find(
          (addr) => addr.isDefaultLocation,
        );
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (response.data.length > 0) {
          setSelectedAddress(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      if (error.response?.status !== 404) {
        showMessage("error", "خطأ", "فشل في تحميل العناوين");
      }
    } finally {
      setLoadingAddresses(false);
    }
  };

  const calculateDiscountInMoney = (basePrice, itemOffer) => {
    if (!itemOffer || !itemOffer.isEnabled) return 0;

    if (itemOffer.isPercentage) {
      return (basePrice * itemOffer.discountValue) / 100;
    } else {
      return itemOffer.discountValue;
    }
  };

  const calculatePriceAfterDiscount = (basePrice, itemOffer) => {
    if (!itemOffer || !itemOffer.isEnabled) return basePrice;

    if (itemOffer.isPercentage) {
      return basePrice - (basePrice * itemOffer.discountValue) / 100;
    } else {
      return basePrice - itemOffer.discountValue;
    }
  };

  const calculateOptionsTotal = (menuItemOptions, quantity) => {
    if (!menuItemOptions || !Array.isArray(menuItemOptions)) return 0;

    const optionsTotal = menuItemOptions.reduce((total, option) => {
      return total + (option.price || 0);
    }, 0);

    return optionsTotal * quantity;
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get("/api/CartItems/GetAll");

      if (response.data && response.data.length > 0) {
        setCartId(response.data[0].cartId);
      }

      const transformedItems = response.data.map((item) => {
        const basePrice = item.menuItem?.basePrice || 0;
        const itemOffer = item.menuItem?.itemOffer;

        const priceAfterDiscount = calculatePriceAfterDiscount(
          basePrice,
          itemOffer,
        );

        const discountInMoney = calculateDiscountInMoney(basePrice, itemOffer);

        let prepTime = null;
        if (
          item.menuItem?.preparationTimeStart !== null &&
          item.menuItem?.preparationTimeEnd !== null
        ) {
          prepTime = `${item.menuItem.preparationTimeStart}-${item.menuItem.preparationTimeEnd} mins`;
        }

        const optionsTotal = calculateOptionsTotal(
          item.menuItemOptions,
          item.quantity,
        );

        const finalPrice = priceAfterDiscount;
        const totalPrice = priceAfterDiscount * item.quantity + optionsTotal;

        return {
          id: item.id,
          name: item.menuItem?.name || "Product",
          category: item.menuItem?.category?.name?.toLowerCase() || "meals",
          price: basePrice,
          finalPrice: finalPrice,
          isPriceBasedOnRequest: basePrice === 0,
          image: item.menuItem?.imageUrl
            ? `https://restaurant-template.runasp.net/${item.menuItem.imageUrl}`
            : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          description: item.menuItem?.description || "",
          prepTime: prepTime,
          quantity: item.quantity,
          totalPrice: totalPrice,
          menuItem: item.menuItem,
          menuItemOptions: item.menuItemOptions || [],
          note: item.note || "",
          hasDiscount: itemOffer?.isEnabled || false,
          discountValue: discountInMoney,
          originalDiscountValue: itemOffer?.discountValue || 0,
          isPercentageDiscount: itemOffer?.isPercentage || false,
          originalTotalPrice: item.totalPrice || basePrice * item.quantity,
          optionsTotal: optionsTotal,
        };
      });

      setCartItems(transformedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      showMessage("error", "خطأ", "فشل في تحميل عناصر السلة");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await axiosInstance.get("/api/Branches/GetList");
      setBranches(response.data);

      if (response.data.length > 0) {
        setSelectedBranch(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      showMessage("error", "خطأ", "فشل في تحميل فروع المطعم");
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchDeliveryAreas = async (branchId) => {
    try {
      setLoadingAreas(true);
      const response = await axiosInstance.get("/api/DeliveryFees/GetAll", {
        params: { branchId },
      });

      const filteredAreas = response.data.filter(
        (area) => !area.areaName.includes("الاستلام من المكان"),
      );

      setDeliveryAreas(filteredAreas);

      if (filteredAreas.length > 0) {
        setSelectedArea(filteredAreas[0]);
      }
    } catch (error) {
      console.error("Error fetching delivery areas:", error);
      showMessage("error", "خطأ", "فشل في تحميل مناطق التوصيل");
    } finally {
      setLoadingAreas(false);
    }
  };

  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const formatAddressText = (address) => {
    if (!address) return "";

    const parts = [];
    if (address.city?.name) parts.push(address.city.name);
    if (address.streetName) parts.push(address.streetName);
    if (address.detailedDescription) parts.push(address.detailedDescription);

    return parts.join("، ");
  };

  const getDeliveryFee = () => {
    if (deliveryType === "delivery" && selectedArea) {
      return selectedArea.fee;
    } else if (deliveryType === "pickup" && selectedBranch) {
      const branchPickupFee = deliveryFees.find(
        (fee) =>
          fee.areaName.includes("الاستلام من المكان") &&
          fee.branchId === selectedBranch.id,
      );

      if (branchPickupFee) {
        return branchPickupFee.fee;
      }

      const anyPickupFee = deliveryFees.find((fee) =>
        fee.areaName.includes("الاستلام من المكان"),
      );

      return anyPickupFee ? anyPickupFee.fee : 0;
    }
    return 0;
  };

  const getDeliveryFeeId = () => {
    if (deliveryType === "delivery" && selectedArea) {
      return selectedArea.id;
    } else if (deliveryType === "pickup" && selectedBranch) {
      const branchPickupFee = deliveryFees.find(
        (fee) =>
          fee.areaName.includes("الاستلام من المكان") &&
          fee.branchId === selectedBranch.id,
      );

      if (branchPickupFee) {
        return branchPickupFee.id;
      }

      const anyPickupFee = deliveryFees.find((fee) =>
        fee.areaName.includes("الاستلام من المكان"),
      );

      return anyPickupFee ? anyPickupFee.id : 0;
    }
    return 0;
  };

  const formatPriceDisplay = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div className="text-[#2E3E88] font-bold text-sm sm:text-base lg:text-lg">
          السعر حسب الطلب
        </div>
      );
    }

    if (product.hasDiscount) {
      return (
        <>
          <span className="text-gray-500 text-xs sm:text-sm line-through">
            {toArabicNumbers(product.price.toFixed(2))} ج.م
          </span>
          <span className="text-[#2E3E88] font-bold text-sm sm:text-base lg:text-lg">
            {toArabicNumbers(product.finalPrice.toFixed(2))} ج.م
          </span>
        </>
      );
    }

    return (
      <div className="text-[#2E3E88] font-bold text-sm sm:text-base lg:text-lg">
        {toArabicNumbers(product.price.toFixed(2))} ج.م
      </div>
    );
  };

  const formatPriceInModal = (product) => {
    if (product.basePrice === 0) {
      return (
        <span className="text-sm sm:text-base lg:text-xl font-bold text-[#2E3E88]">
          السعر حسب الطلب
        </span>
      );
    }

    if (product.itemOffer?.isEnabled) {
      const priceAfterDiscount = calculatePriceAfterDiscount(
        product.basePrice,
        product.itemOffer,
      );

      return (
        <>
          <span className="text-gray-500 text-xs line-through">
            {toArabicNumbers(product.basePrice)} ج.م
          </span>
          <span className="text-sm sm:text-base lg:text-xl font-bold text-[#2E3E88]">
            {toArabicNumbers(priceAfterDiscount.toFixed(2))} ج.م
          </span>
        </>
      );
    }

    return (
      <span className="text-sm sm:text-base lg:text-xl font-bold text-[#2E3E88]">
        {toArabicNumbers(product.basePrice)} ج.م
      </span>
    );
  };

  const openAddressesPage = () => {
    navigate("/addresses", { state: { fromCart: true } });
  };

  const renderAddressSection = () => {
    if (loadingAddresses) {
      return (
        <div className="mb-4 md:mb-6">
          <div className="animate-pulse bg-gray-200 rounded-lg md:rounded-xl h-10 md:h-12"></div>
        </div>
      );
    }

    if (userAddresses.length === 0) {
      return (
        <div className="p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-lg md:rounded-xl border border-[#2E3E88]/30 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#2E3E88]/20 to-[#32B9CC]/20 rounded-full flex items-center justify-center">
              <FaMapMarker className="text-[#2E3E88] text-sm md:text-base" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#2E3E88] text-sm md:text-base">
                لا توجد عناوين
              </h4>
              <p className="text-[#32B9CC] text-xs md:text-sm mb-2">
                يجب إضافة عنوان للتوصيل أولاً
              </p>
              <button
                onClick={handleAddAddress}
                className="bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-xs md:text-sm hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FaPlusCircle />
                إضافة عنوان جديد
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs md:text-sm font-semibold text-gray-700">
            عنوان التوصيل
          </label>
          <button
            onClick={openAddressesPage}
            className="text-[#2E3E88] text-xs md:text-sm font-semibold hover:underline flex items-center gap-1"
          >
            <FaExchangeAlt className="text-xs" />
            تغيير
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl border border-[#2E3E88]/20 p-3 md:p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div
                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center 
                ${
                  selectedAddress?.isDefaultLocation
                    ? "bg-[#2E3E88] border-[#2E3E88]"
                    : "border-gray-300"
                }`}
              >
                {selectedAddress?.isDefaultLocation && (
                  <FaCheck className="text-white text-xs" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  {selectedAddress?.city?.name || "عنوان"}
                </span>
                {selectedAddress?.isDefaultLocation && (
                  <span className="text-xs bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                    افتراضي
                  </span>
                )}
              </div>
              <div className="text-gray-600 text-xs">
                {formatAddressText(selectedAddress)}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {selectedAddress?.phoneNumber &&
                  `📞 ${selectedAddress.phoneNumber}`}
                {selectedAddress?.buildingNumber &&
                  ` | 🏢 مبنى ${selectedAddress.buildingNumber}`}
                {selectedAddress?.floorNumber &&
                  ` | دور ${selectedAddress.floorNumber}`}
                {selectedAddress?.flatNumber &&
                  ` | شقة ${selectedAddress.flatNumber}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const openProductDetailsModal = async (item) => {
    try {
      setSelectedProduct(item);
      setProductQuantity(item.quantity);
      setItemNotes(item.note || "");

      const response = await axiosInstance.get(
        `/api/MenuItems/Get/${item.menuItem?.id}`,
      );
      const productData = response.data;

      productData.isPriceBasedOnRequest = productData.basePrice === 0;

      const transformedAddons =
        productData.typesWithOptions?.map((type) => ({
          id: type.id,
          title: type.name,
          type: type.canSelectMultipleOptions ? "multiple" : "single",
          required: type.isSelectionRequired,
          canSelectMultipleOptions: type.canSelectMultipleOptions,
          isSelectionRequired: type.isSelectionRequired,
          options:
            type.menuItemOptions?.map((option) => ({
              id: option.id,
              name: option.name,
              price: option.price,
              typeId: type.id,
              branchMenuItemOption: option.branchMenuItemOption || [],
            })) || [],
        })) || [];

      setProductAddons(transformedAddons);
      setProductDetails(productData);

      const initialSelectedAddons = {};

      if (item.menuItemOptions && item.menuItemOptions.length > 0) {
        const optionIdMap = {};
        transformedAddons.forEach((addon) => {
          addon.options.forEach((option) => {
            optionIdMap[option.id] = {
              typeId: addon.id,
              option: option,
            };
          });
        });

        item.menuItemOptions.forEach((cartOption) => {
          const optionInfo = optionIdMap[cartOption.id];
          if (optionInfo) {
            const typeId = optionInfo.typeId;
            if (!initialSelectedAddons[typeId]) {
              initialSelectedAddons[typeId] = [];
            }
            initialSelectedAddons[typeId].push(cartOption.id);
          }
        });
      }

      setSelectedAddons(initialSelectedAddons);

      setShowProductDetailsModal(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      showMessage("error", "خطأ", "فشل في تحميل تفاصيل المنتج");
    }
  };

  const closeProductDetailsModal = () => {
    setShowProductDetailsModal(false);
    setSelectedProduct(null);
    setProductDetails(null);
    setProductAddons([]);
    setSelectedAddons({});
    setItemNotes("");
  };

  const handleAddonSelect = (addonId, optionId, type) => {
    setSelectedAddons((prev) => {
      const newSelectedAddons = { ...prev };

      if (type === "single") {
        newSelectedAddons[addonId] = [optionId];
      } else {
        const currentSelections = newSelectedAddons[addonId] || [];

        if (currentSelections.includes(optionId)) {
          newSelectedAddons[addonId] = currentSelections.filter(
            (id) => id !== optionId,
          );
        } else {
          newSelectedAddons[addonId] = [...currentSelections, optionId];
        }

        if (newSelectedAddons[addonId].length === 0) {
          delete newSelectedAddons[addonId];
        }
      }

      return newSelectedAddons;
    });
  };

  const calculateProductTotalPrice = () => {
    if (!productDetails) return 0;

    const basePrice = productDetails.basePrice || 0;

    if (basePrice === 0) {
      let total = 0;

      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          productAddons.forEach((addon) => {
            const option = addon.options.find((opt) => opt.id === optionId);
            if (option) {
              total += option.price * productQuantity;
            }
          });
        });
      });

      return total;
    }

    const priceAfterDiscount = calculatePriceAfterDiscount(
      basePrice,
      productDetails.itemOffer,
    );

    let total = priceAfterDiscount * productQuantity;

    Object.values(selectedAddons).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        productAddons.forEach((addon) => {
          const option = addon.options.find((opt) => opt.id === optionId);
          if (option) {
            total += option.price * productQuantity;
          }
        });
      });
    });

    return total;
  };

  const updateCartItem = async () => {
    if (!selectedProduct || !productDetails) return;

    try {
      setUpdatingCart(true);

      const missingRequiredAddons = [];
      productAddons.forEach((addon) => {
        if (addon.isSelectionRequired) {
          const selectedOptionIds = selectedAddons[addon.id] || [];
          if (selectedOptionIds.length === 0) {
            missingRequiredAddons.push(addon.title);
          }
        }
      });

      if (missingRequiredAddons.length > 0) {
        showMessage(
          "warning",
          "تنبيه",
          `الرجاء اختيار ${missingRequiredAddons.join(" و ")}`,
        );
        setUpdatingCart(false);
        return;
      }

      const options = [];
      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          options.push(optionId);
        });
      });

      await axiosInstance.put(`/api/CartItems/Update/${selectedProduct.id}`, {
        note: itemNotes.trim(),
        options: options,
      });

      if (productQuantity !== selectedProduct.quantity) {
        await axiosInstance.put(
          `/api/CartItems/UpdateQuantity/${selectedProduct.id}`,
          {
            quantity: productQuantity,
          },
        );
      }

      await fetchCartItems();

      closeProductDetailsModal();

      showMessage("success", "تم بنجاح", "تم تحديث المنتج في سلة التسوق بنجاح");
    } catch (error) {
      console.error("Error updating cart item:", error);
      showMessage("error", "خطأ", "فشل في تحديث المنتج");
    } finally {
      setUpdatingCart(false);
    }
  };

  const handleOpenNotesModal = () => {
    setShowNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
  };

  const handleSaveNotes = () => {
    if (selectedProduct) {
      updateCartItem();
    } else {
      handleCloseNotesModal();
      showMessage("success", "تم بنجاح", "تم حفظ التعليمات الإضافية");
    }
  };

  const handleClearNotes = () => {
    setItemNotes("");
    showMessage("info", "تم", "تم مسح التعليمات الإضافية");
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) return;

      const basePrice = cartItem.finalPrice;
      const optionsPricePerUnit = cartItem.optionsTotal / cartItem.quantity;

      const newOptionsTotal = optionsPricePerUnit * newQuantity;
      const newTotalPrice = basePrice * newQuantity + newOptionsTotal;

      await axiosInstance.put(`/api/CartItems/UpdateQuantity/${id}`, {
        quantity: newQuantity,
      });

      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: newTotalPrice,
              optionsTotal: newOptionsTotal,
            };
          }
          return item;
        }),
      );

      showMessage("success", "تم", "تم تحديث الكمية");
    } catch (error) {
      console.error("Error updating quantity:", error);
      showMessage("error", "خطأ", "فشل في تحديث الكمية");
    }
  };

  const removeItem = async (id) => {
    Swal.fire({
      title: "إزالة المنتج؟",
      text: "هل أنت متأكد من إزالة هذا المنتج من سلة التسوق؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، قم بإزالته!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/CartItems/Delete/${id}`);

          setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id),
          );

          showMessage("success", "تم", "تم إزالة المنتج من سلة التسوق");
        } catch (error) {
          console.error("Error removing item:", error);
          showMessage("error", "خطأ", "فشل في إزالة المنتج");
        }
      }
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = getDeliveryFee();

    return subtotal + deliveryFee;
  };

  const handleCheckout = async () => {
    // Case 1: User logged in but cart is empty
    if (cartItems.length === 0) {
      showMessage(
        "warning",
        "تنبيه",
        "الرجاء إضافة بعض المنتجات إلى سلة التسوق قبل المتابعة للدفع.",
      );
      return;
    }

    if (!cartId) {
      showMessage("error", "خطأ", "لم يتم العثور على معرف السلة");
      return;
    }

    if (!selectedBranch) {
      showMessage("warning", "تنبيه", "الرجاء اختيار فرع المطعم");
      return;
    }

    if (deliveryType === "delivery") {
      // Case 2: User logged in but no addresses
      if (userAddresses.length === 0) {
        showMessage("warning", "تنبيه", "يجب إضافة عنوان للتوصيل أولاً.");
        return;
      }

      // Case 3: User logged in with addresses but none selected
      if (!selectedAddress) {
        showMessage("warning", "تنبيه", "الرجاء اختيار عنوان التوصيل");
        return;
      }

      if (!selectedArea) {
        showMessage("warning", "تنبيه", "الرجاء اختيار منطقة التوصيل");
        return;
      }
    }

    try {
      const orderData = {
        branchId: selectedBranch.id,
        deliveryFeeId: getDeliveryFeeId(),
        notes: additionalNotes.trim(),
        locationId:
          deliveryType === "delivery" && selectedAddress
            ? selectedAddress.id
            : 0,
      };

      const response = await axiosInstance.post("/api/Orders/Add", orderData);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title:
            '<h2 class="text-xl md:text-2xl font-bold text-white">تم تأكيد الطلب!</h2>',
          html: `
            <div class="text-center">
              <div class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaCheckCircle class="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p class="text-base md:text-lg text-white/80 mb-4">تم تقديم طلبك بنجاح!</p>
              <div class="bg-gradient-to-r from-[#2E3E88]/20 to-[#32B9CC]/20 rounded-xl p-4 border border-[#2E3E88]/30">
                <p class="text-xs md:text-sm text-white/90 mt-1">
                  سيتم تجهيز طلبك في فرع ${selectedBranch.name}
                  ${
                    deliveryType === "delivery"
                      ? `ويتم التوصيل إلى ${selectedArea.areaName}`
                      : "يمكنك الاستلام من المطعم"
                  }
                </p>
              </div>
            </div>
          `,
          icon: null,
          timer: 3000,
          showConfirmButton: false,
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
        }).then(() => {
          navigate("/my-orders", { state: { orderData: response.data } });
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);

      if (!error.response?.data?.errors) {
        showMessage(
          "error",
          "خطأ",
          "فشل في إنشاء الطلب. الرجاء المحاولة مرة أخرى.",
        );
        return;
      }

      const errors = error.response.data.errors;

      let errorMessages = [];
      let showModalOnly = false;

      errors.forEach((errorItem) => {
        if (
          errorItem.code === "User.MissingInfo" &&
          errorItem.description ===
            "User must have a phone number or a default location."
        ) {
          showModalOnly = true;
          setShowMissingInfoModal(true);
          fetchUserProfile();
        } else {
          if (
            errorItem.code === "User" &&
            errorItem.description === "User is not active."
          ) {
            errorMessages.push(
              "حسابك غير نشط حالياً. الرجاء التواصل مع إدارة المطعم لتفعيل الحساب.",
            );
          } else if (errorItem.code === "Branch.Closed") {
            errorMessages.push(
              "الفرع المختار مغلق حالياً. الرجاء اختيار فرع آخر أو المحاولة عند فتح الفرع.",
            );
          } else if (errorItem.code === "Branch.InActive") {
            errorMessages.push(
              "الفرع المختار غير نشط حالياً. الرجاء اختيار فرع آخر أو المحاولة عندما يكون الفرع نشطاً.",
            );
          } else if (errorItem.code === "Branch.OutOfWorkingHours") {
            errorMessages.push(
              "الفرع المختار خارج ساعات العمل حالياً. الرجاء المحاولة خلال ساعات العمل أو اختيار فرع آخر.",
            );
          } else if (errorItem.code === "DeliveryFee.NotActive") {
            errorMessages.push(
              `رسوم ${
                deliveryType === "delivery" ? "التوصيل" : "الاستلام"
              } غير نشطة حالياً. الرجاء اختيار فرع آخر أو طريقة استلام مختلفة.`,
            );
          } else if (errorItem.code === "Cart") {
            const match = errorItem.description.match(/\d+/g);
            const unavailableItemIds = match ? match.map(Number) : [];

            const unavailableItems = cartItems.filter((item) =>
              unavailableItemIds.includes(item.id),
            );

            const itemNames = unavailableItems
              .map((item) => item.name)
              .join("، ");

            errorMessages.push(
              `المنتجات التالية غير متاحة في فرع ${
                selectedBranch?.name || "المختار"
              }: ${itemNames}. الرجاء إزالتها من السلة أو اختيار فرع آخر.`,
            );
          } else if (errorItem.code === "DeliveryFee.NotFound") {
            errorMessages.push(
              `رسوم ${
                deliveryType === "delivery" ? "التوصيل" : "الاستلام"
              } غير متاحة لهذا الفرع حالياً. الرجاء اختيار فرع آخر أو طريقة استلام مختلفة.`,
            );
          } else {
            errorMessages.push("فشل في إنشاء الطلب. الرجاء المحاولة مرة أخرى.");
          }
        }
      });

      if (showModalOnly && errorMessages.length === 0) {
        return;
      }

      if (errorMessages.length > 0) {
        showMessage("error", "خطأ", errorMessages.join(" "));
      }
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: `linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)`,
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
            جارٍ تحميل السلة...
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
      {/* Phone Input Modal */}
      {showPhoneInputModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <FaPhone className="text-[#2E3E88] text-lg md:text-xl" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  تحديث رقم الهاتف
                </h3>
              </div>
              <button
                onClick={() => setShowPhoneInputModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-base md:text-lg" />
              </button>
            </div>

            <div className="mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-lg md:rounded-xl border border-[#2E3E88]/30 mb-3 md:mb-4">
                <p className="text-[#2E3E88] text-xs md:text-sm">
                  الرجاء إدخال رقم هاتفك لتتمكن من إكمال عملية الدفع.
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3E88] focus:border-transparent"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  سيتم استخدام هذا الرقم للتواصل بشأن الطلب
                </p>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setShowPhoneInputModal(false)}
                className="flex-1 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={updatePhoneNumber}
                disabled={loadingProfile || !newPhoneNumber.trim()}
                className="flex-1 py-2 md:py-3 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loadingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave />
                    حفظ وتأكيد الدفع
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Missing Info Modal */}
      {showMissingInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <FaInfoCircle className="text-[#2E3E88] text-lg md:text-xl" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  معلومات ناقصة
                </h3>
              </div>
              <button
                onClick={() => setShowMissingInfoModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-base md:text-lg" />
              </button>
            </div>

            <div className="mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-lg md:rounded-xl border border-[#2E3E88]/30 mb-3 md:mb-4">
                <p className="text-[#2E3E88] text-xs md:text-sm">
                  يرجى إضافة رقم هاتف أو عنوان افتراضي للمتابعة في عملية الدفع.
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                    اختر أحد الخيارات التالية:
                  </p>
                </div>

                {/* Add Phone Number Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openPhoneInputModal}
                  className="w-full p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl border-2 border-[#2E3E88]/30 hover:border-[#2E3E88] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#2E3E88]/20 to-[#32B9CC]/20 rounded-full flex items-center justify-center">
                    <FaPhone className="text-[#2E3E88] text-lg md:text-xl" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-[#2E3E88] text-sm md:text-base">
                      إضافة رقم هاتف
                    </h4>
                    <p className="text-[#32B9CC] text-xs md:text-sm">
                      أضف رقم هاتف للتواصل معك بشأن الطلب
                    </p>
                  </div>
                </motion.button>

                {/* Add Address Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddAddress}
                  className="w-full p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl border-2 border-[#2E3E88]/30 hover:border-[#2E3E88] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#2E3E88]/20 to-[#32B9CC]/20 rounded-full flex items-center justify-center">
                    <FaMapPin className="text-[#2E3E88] text-lg md:text-xl" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-[#2E3E88] text-sm md:text-base">
                      إضافة عنوان
                    </h4>
                    <p className="text-[#32B9CC] text-xs md:text-sm">
                      أضف عنوان افتراضي لتوصيل الطلب
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setShowMissingInfoModal(false)}
                className="flex-1 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                إلغاء الطلب
              </button>
              <button
                onClick={() => {
                  setShowMissingInfoModal(false);
                  navigate("/");
                }}
                className="flex-1 py-2 md:py-3 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                مواصلة التسوق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <motion.div
            ref={notesModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <FaStickyNote className="text-[#2E3E88] text-lg md:text-xl" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  تعليمات إضافية
                </h3>
              </div>
              <button
                onClick={handleCloseNotesModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-base md:text-lg" />
              </button>
            </div>

            <div className="mb-4 md:mb-6">
              <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                اكتب أي ملاحظات
              </p>

              <textarea
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="اكتب تعليماتك هنا..."
                className="w-full h-32 md:h-40 px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3E88] focus:border-transparent resize-none"
                dir="rtl"
                maxLength={500}
                autoFocus
              />

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">اختياري</span>
                <span
                  className={`text-xs ${
                    itemNotes.length >= 450 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {itemNotes.length}/500
                </span>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={handleClearNotes}
                className="flex-1 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FaTrash className="text-xs" />
                مسح
              </button>
              <button
                onClick={handleCloseNotesModal}
                className="flex-1 py-2 md:py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNotes}
                className="flex-1 py-2 md:py-3 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FaSave className="text-xs" />
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showProductDetailsModal && productDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0" onClick={closeProductDetailsModal} />
          <motion.div
            ref={productDetailsModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-xl md:rounded-3xl shadow-2xl w-full ${
              isMobile() ? "max-w-full h-full" : "max-w-2xl max-h-[90vh]"
            } overflow-hidden relative z-50 flex flex-col`}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="relative">
                  <img
                    src={
                      productDetails.imageUrl
                        ? `https://restaurant-template.runasp.net/${productDetails.imageUrl}`
                        : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop"
                    }
                    alt={productDetails.name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-lg lg:text-xl font-bold text-gray-800 truncate">
                    {productDetails.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 md:gap-3 mt-1 md:mt-2">
                    <div className="flex flex-wrap items-center gap-1 md:gap-3">
                      {formatPriceInModal(productDetails)}
                    </div>

                    {productDetails.itemOffer?.isEnabled &&
                      productDetails.basePrice !== 0 && (
                        <div className="bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg font-bold shadow text-xs md:text-sm flex items-center gap-1">
                          <span>خصم</span>
                          <span>
                            {toArabicNumbers(
                              calculateDiscountInMoney(
                                productDetails.basePrice,
                                productDetails.itemOffer,
                              ).toFixed(2),
                            )}{" "}
                            ج.م
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <button
                onClick={closeProductDetailsModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 md:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
              >
                <FaTimes className="text-base md:text-lg" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6">
              {/* Calories and Prep Time */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-5">
                {productDetails.calories && (
                  <span className="flex items-center gap-1 text-gray-600 text-xs md:text-sm">
                    <FaFire className="text-orange-500 text-xs md:text-sm" />
                    {toArabicNumbers(productDetails.calories)} كالوري
                  </span>
                )}

                {productDetails.preparationTimeStart !== null &&
                  productDetails.preparationTimeEnd !== null && (
                    <span className="flex items-center gap-1 text-gray-600 text-xs md:text-sm">
                      <FaClock className="text-[#2E3E88] text-xs md:text-sm" />
                      {toArabicNumbers(productDetails.preparationTimeStart)}
                      {productDetails.preparationTimeEnd !== null &&
                        `-${toArabicNumbers(
                          productDetails.preparationTimeEnd,
                        )}`}{" "}
                      دقيقة
                    </span>
                  )}
              </div>

              {/* Description */}
              {productDetails.description && (
                <div className="mb-3 md:mb-5 lg:mb-6">
                  <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-1 md:mb-2">
                    الوصف
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                    {productDetails.description}
                  </p>
                </div>
              )}

              {/* Addons */}
              {productAddons.length > 0 && (
                <div className="space-y-2 md:space-y-5 lg:space-y-6 mb-3 md:mb-5 lg:mb-6">
                  {productAddons.map((addon) => {
                    const selectedOptionIds = selectedAddons[addon.id] || [];

                    return (
                      <div
                        key={addon.id}
                        className="bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-200"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between mb-1 md:mb-3">
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <h4 className="font-semibold text-xs md:text-base text-gray-800">
                              {addon.title}
                            </h4>
                            {addon.isSelectionRequired && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                                مطلوب
                              </span>
                            )}
                            {addon.canSelectMultipleOptions && (
                              <span className="text-xs bg-[#2E3E88]/10 text-[#2E3E88] px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                                متعدد
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {addon.options.map((option) => {
                            const isSelected = selectedOptionIds.includes(
                              option.id,
                            );
                            return (
                              <motion.button
                                key={option.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  handleAddonSelect(
                                    addon.id,
                                    option.id,
                                    addon.type,
                                  )
                                }
                                className={`w-full p-2 rounded-md md:rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                                  isSelected
                                    ? "border-[#2E3E88] bg-[#2E3E88]/5"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                                dir="rtl"
                              >
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`font-medium text-xs md:text-sm ${
                                      isSelected
                                        ? "text-[#2E3E88]"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  {isSelected && (
                                    <FaCheck className="text-[#2E3E88] text-xs" />
                                  )}
                                </div>

                                {option.price > 0 && (
                                  <span className="text-xs text-[#32B9CC] font-semibold">
                                    +{toArabicNumbers(option.price)} ج.م
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                onClick={handleOpenNotesModal}
                className={`w-full rounded-lg md:rounded-xl p-2 md:p-4 text-center transition-all duration-300 mb-3 md:mb-5 lg:mb-6 cursor-pointer ${
                  itemNotes
                    ? "bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 border-2 border-solid border-[#2E3E88]/30 hover:border-[#2E3E88]"
                    : "bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 border-2 border-dashed border-[#2E3E88]/30 hover:border-solid hover:border-[#2E3E88]"
                }`}
                dir="rtl"
              >
                <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                  <div
                    className={`p-1 md:p-2 rounded-full ${
                      itemNotes ? "bg-[#2E3E88]/10" : "bg-[#2E3E88]/10"
                    }`}
                  >
                    <FaStickyNote
                      className={`text-base md:text-xl ${
                        itemNotes ? "text-[#2E3E88]" : "text-[#2E3E88]"
                      }`}
                    />
                  </div>
                  <div>
                    <h4
                      className={`font-semibold text-xs md:text-base ${
                        itemNotes ? "text-[#2E3E88]" : "text-[#2E3E88]"
                      }`}
                    >
                      {itemNotes ? "تعليمات إضافية" : "إضافة تعليمات إضافية"}
                    </h4>
                    <p
                      className={`text-xs mt-0.5 md:mt-1 ${
                        itemNotes ? "text-[#32B9CC]" : "text-[#32B9CC]"
                      }`}
                    >
                      {itemNotes
                        ? `انقر لتعديل التعليمات: ${itemNotes.substring(
                            0,
                            40,
                          )}${itemNotes.length > 40 ? "..." : ""}`
                        : "انقر لإضافة تعليمات إضافية"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Quantity and Actions */}
            <div className="border-t border-gray-200 p-3 md:p-5 lg:p-6 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="font-semibold text-gray-700 text-xs md:text-sm">
                      الكمية:
                    </span>
                    <div className="flex items-center bg-white rounded-lg p-1 shadow">
                      <button
                        onClick={() =>
                          setProductQuantity((prev) =>
                            prev > 1 ? prev - 1 : 1,
                          )
                        }
                        className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <FaMinus className="text-[#2E3E88] text-xs" />
                      </button>
                      <span className="font-bold text-gray-800 min-w-6 md:min-w-8 text-center text-xs md:text-sm">
                        {toArabicNumbers(productQuantity)}
                      </span>
                      <button
                        onClick={() => setProductQuantity((prev) => prev + 1)}
                        className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <FaPlus className="text-[#2E3E88] text-xs" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm md:text-lg lg:text-xl font-bold text-[#2E3E88]">
                    {toArabicNumbers(calculateProductTotalPrice().toFixed(2))}{" "}
                    ج.م
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 md:gap-3 w-full md:w-auto">
                  <button
                    onClick={closeProductDetailsModal}
                    className="flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-xs md:text-sm"
                  >
                    إلغاء
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={updateCartItem}
                    disabled={updatingCart}
                    className="flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                  >
                    {updatingCart ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-t-2 border-b-2 border-white"></div>
                        تحديث...
                      </>
                    ) : (
                      <>
                        <FaEdit className="text-xs" />
                        تحديث
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع - تم تعديل الحجم */}
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
              className="text-center pt-6 md:pt-8"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaShoppingCart className="text-white text-2xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                سلة التسوق
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto">
                راجع طلبك و تابع للدفع
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 -mt-8 md:-mt-10 relative z-10">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl mb-4 md:mb-6">
                <div className="p-4 md:p-6">
                  <h2
                    className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
                    style={{ color: "#2E3E88" }}
                  >
                    <FaShoppingCart className="text-[#2E3E88]" />
                    عناصر الطلب ({cartItems.length})
                  </h2>

                  <div className="space-y-3 md:space-y-4">
                    <AnimatePresence>
                      {cartItems.length === 0 ? (
                        <div className="text-center py-6 md:py-8">
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                            <FaShoppingCart
                              className="text-2xl md:text-4xl"
                              style={{ color: "#2E3E88" }}
                            />
                          </div>
                          <h3
                            className="text-xl md:text-2xl font-bold mb-2 md:mb-3"
                            style={{ color: "#2E3E88" }}
                          >
                            سلة التسوق فارغة
                          </h3>
                          <p
                            className="mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base"
                            style={{ color: "#32B9CC" }}
                          >
                            لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
                          </p>
                          <button
                            onClick={() => navigate("/")}
                            className="px-6 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm md:text-base"
                            style={{
                              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                              color: "white",
                              boxShadow: `0 10px 25px #2E3E8830`,
                            }}
                          >
                            تصفح المنتجات
                          </button>
                        </div>
                      ) : (
                        cartItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transition-all duration-500 transform hover:-translate-y-0.5 md:hover:-translate-y-1 border border-gray-100"
                          >
                            <div className="p-3 md:p-6">
                              <div className="flex gap-3 md:gap-4">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl object-cover"
                                  />
                                  {item.hasDiscount &&
                                    !item.isPriceBasedOnRequest && (
                                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white px-1.5 py-1 md:px-2 md:py-1 rounded-md md:rounded-lg text-xs font-bold shadow-md md:shadow-lg">
                                        خصم{" "}
                                        {toArabicNumbers(
                                          item.discountValue.toFixed(2),
                                        )}{" "}
                                        ج.م
                                      </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="mb-1 md:mb-2">
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <h3 className="font-bold text-gray-800 text-sm md:text-lg">
                                        {item.name}
                                      </h3>
                                      <button
                                        onClick={() =>
                                          openProductDetailsModal(item)
                                        }
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                      >
                                        <FaInfoCircle className="text-[#32B9CC] text-xs md:text-sm" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                                    {formatPriceDisplay(item)}
                                  </div>

                                  <p className="text-gray-600 text-xs md:text-sm mb-1 md:mb-2 line-clamp-2">
                                    {item.description}
                                  </p>

                                  {/* Prep Time */}
                                  {item.prepTime && (
                                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
                                      <FaClock className="text-[#2E3E88]" />
                                      <span>{item.prepTime}</span>
                                    </div>
                                  )}

                                  {/* Notes */}
                                  {item.note && (
                                    <div className="flex items-start gap-1 md:gap-2 text-xs md:text-sm text-green-600 mt-1 md:mt-2 bg-green-50 px-2 py-1 md:px-3 md:py-2 rounded-lg">
                                      <FaStickyNote className="text-green-500 mt-0.5 text-xs" />
                                      <span className="font-medium">
                                        ملاحظة:
                                      </span>
                                      <span className="flex-1 break-words max-w-[120px] md:max-w-[150px] line-clamp-2">
                                        {item.note}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Controls and Total Price */}
                              <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 md:gap-4">
                                  <div className="flex items-center gap-1 md:gap-2 bg-gray-50 rounded-lg p-1 md:p-2">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          item.quantity - 1,
                                        )
                                      }
                                      className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                                      style={{ color: "#2E3E88" }}
                                    >
                                      <FaMinus className="text-xs" />
                                    </button>
                                    <span className="font-bold text-gray-800 min-w-6 md:min-w-8 text-center text-sm">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          item.quantity + 1,
                                        )
                                      }
                                      className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                                      style={{ color: "#2E3E88" }}
                                    >
                                      <FaPlus className="text-xs" />
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-gray-800 text-sm md:text-lg">
                                      {toArabicNumbers(
                                        item.totalPrice.toFixed(2),
                                      )}{" "}
                                      ج.م
                                    </div>
                                    {item.optionsTotal > 0 && (
                                      <div className="text-xs text-[#32B9CC] mt-0.5">
                                        +
                                        {toArabicNumbers(
                                          item.optionsTotal.toFixed(2),
                                        )}{" "}
                                        ج.م للإضافات
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-1 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FaTrash className="text-sm" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl">
                <div className="p-4 md:p-6">
                  <h2
                    className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
                    style={{ color: "#2E3E88" }}
                  >
                    <FaMapMarkerAlt className="text-[#2E3E88]" />
                    خيارات{" "}
                    {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
                  </h2>

                  {deliveryType === "delivery" && renderAddressSection()}

                  <div className="mb-4 md:mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                      <div
                        className={`p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl border-2 cursor-pointer hover:shadow-md md:hover:shadow-lg transition-all duration-300 ${
                          deliveryType === "delivery"
                            ? "border-[#2E3E88]"
                            : "border-gray-200"
                        }`}
                        onClick={() => setDeliveryType("delivery")}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                              deliveryType === "delivery"
                                ? "bg-[#2E3E88] border-[#2E3E88]"
                                : "border-gray-300"
                            }`}
                          >
                            {deliveryType === "delivery" && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-sm md:text-base">
                              التوصيل للمنزل
                            </div>
                            <div className="text-gray-600 text-xs md:text-sm">
                              توصيل الطلب إلى عنوانك
                            </div>
                          </div>
                          <FaMapMarkerAlt className="text-[#2E3E88] text-base md:text-lg" />
                        </div>
                      </div>

                      <div
                        className={`p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl border-2 cursor-pointer hover:shadow-md md:hover:shadow-lg transition-all duration-300 ${
                          deliveryType === "pickup"
                            ? "border-[#2E3E88]"
                            : "border-gray-200"
                        }`}
                        onClick={() => setDeliveryType("pickup")}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                              deliveryType === "pickup"
                                ? "bg-[#2E3E88] border-[#2E3E88]"
                                : "border-gray-300"
                            }`}
                          >
                            {deliveryType === "pickup" && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-sm md:text-base">
                              الاستلام من المطعم
                            </div>
                            <div className="text-gray-600 text-xs md:text-sm">
                              استلام الطلب من الفرع
                            </div>
                          </div>
                          <FaStore className="text-[#2E3E88] text-base md:text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                      اختر الفرع
                    </label>
                    {loadingBranches ? (
                      <div className="animate-pulse bg-gray-200 rounded-lg md:rounded-xl h-10 md:h-12"></div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === "branch" ? null : "branch",
                            )
                          }
                          className="w-full flex items-center justify-between border border-gray-200 bg-white text-black rounded-lg md:rounded-xl px-3 py-2.5 md:px-4 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88] focus:border-transparent transition-all duration-200 cursor-pointer"
                        >
                          <span className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
                            <FaStore className="text-[#2E3E88]" />
                            {selectedBranch
                              ? selectedBranch.name
                              : "اختر الفرع"}
                          </span>
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
                              className="absolute z-[100] mt-1 md:mt-2 w-full bg-white border border-gray-200 shadow-xl md:shadow-2xl rounded-lg md:rounded-xl overflow-hidden max-h-40 md:max-h-48 overflow-y-auto"
                            >
                              {branches.map((branch) => (
                                <li
                                  key={branch.id}
                                  onClick={() => {
                                    setSelectedBranch(branch);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-3 py-2 md:px-4 md:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0 text-sm md:text-base"
                                >
                                  {branch.name}
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {deliveryType === "delivery" && (
                    <div className="mb-4 md:mb-6">
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                        اختر منطقة التوصيل
                      </label>
                      {loadingAreas ? (
                        <div className="animate-pulse bg-gray-200 rounded-lg md:rounded-xl h-10 md:h-12"></div>
                      ) : deliveryAreas.length > 0 ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === "area" ? null : "area",
                              )
                            }
                            className="w-full flex items-center justify-between border border-gray-200 bg-white text-black rounded-lg md:rounded-xl px-3 py-2.5 md:px-4 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88] focus:border-transparent transition-all duration-200 cursor-pointer"
                          >
                            <span className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
                              <FaMapMarkerAlt className="text-[#2E3E88]" />
                              {selectedArea
                                ? `${selectedArea.areaName} - ${selectedArea.fee} ج.م`
                                : "اختر منطقة التوصيل"}
                            </span>
                            <motion.div
                              animate={{
                                rotate: openDropdown === "area" ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronDown className="text-[#2E3E88]" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {openDropdown === "area" && (
                              <motion.ul
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute z-[100] mt-1 md:mt-2 w-full bg-white border border-gray-200 shadow-xl md:shadow-2xl rounded-lg md:rounded-xl overflow-hidden max-h-40 md:max-h-48 overflow-y-auto"
                              >
                                {deliveryAreas.map((area) => (
                                  <li
                                    key={area.id}
                                    onClick={() => {
                                      setSelectedArea(area);
                                      setOpenDropdown(null);
                                    }}
                                    className="px-3 py-2 md:px-4 md:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0 text-sm"
                                  >
                                    <div>
                                      <div className="font-medium text-xs md:text-sm">
                                        {area.areaName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        رسوم: {area.fee} ج.م - وقت:{" "}
                                        {area.estimatedTimeMin}-
                                        {area.estimatedTimeMax} دقيقة
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-lg md:rounded-xl border border-[#2E3E88]/30 text-center">
                          <p className="text-[#2E3E88] text-sm">
                            لا توجد مناطق توصيل متاحة لهذا الفرع حالياً
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === "pickup" && (
                    <div className="p-3 md:p-4 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl border border-[#2E3E88]/30 mb-4 md:mb-6">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#2E3E88]/20 to-[#32B9CC]/20 rounded-full flex items-center justify-center">
                          <FaStore className="text-[#2E3E88]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2E3E88] text-sm md:text-base">
                            الاستلام من المطعم
                          </h4>
                          <p className="text-[#32B9CC] text-xs md:text-sm">
                            {selectedBranch?.name || "المطعم"}
                          </p>
                          <p className="text-[#2E3E88] text-xs mt-0.5 md:mt-1">
                            رسوم الاستلام: {getDeliveryFee().toFixed(2)} ج.م
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl sticky top-4 md:top-6">
                <div className="p-4 md:p-6">
                  <h2
                    className="text-lg md:text-2xl font-bold mb-4 md:mb-6"
                    style={{ color: "#2E3E88" }}
                  >
                    ملخص الطلب
                  </h2>

                  {/* User Info */}
                  <div className="mb-4 md:mb-6">
                    <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#2E3E88]/30">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] rounded-full flex items-center justify-center">
                          <FaUser className="text-white text-xs md:text-sm" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm md:text-base">
                          معلومات العميل
                        </h4>
                      </div>
                      <div className="text-xs md:text-sm">
                        {deliveryType === "delivery" && selectedAddress ? (
                          <div>
                            <div className="font-medium text-gray-700">
                              {selectedAddress.city?.name || "عنوان"}
                            </div>
                            <div className="text-gray-600 text-xs mt-0.5 md:mt-1">
                              {formatAddressText(selectedAddress)}
                            </div>
                            {selectedAddress.phoneNumber && (
                              <div className="text-gray-600 text-xs mt-0.5 md:mt-1">
                                📞 {selectedAddress.phoneNumber}
                              </div>
                            )}
                          </div>
                        ) : deliveryType === "pickup" ? (
                          <div className="text-gray-600">
                            الاستلام من المطعم
                          </div>
                        ) : deliveryType === "delivery" &&
                          userAddresses.length === 0 ? (
                          <div className="text-[#2E3E88] text-xs md:text-sm">
                            يجب إضافة عنوان للتوصيل
                          </div>
                        ) : (
                          <div className="text-[#2E3E88] text-xs md:text-sm">
                            لم يتم اختيار عنوان التوصيل
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">
                        المجموع الفرعي
                      </span>
                      <span className="font-semibold text-gray-800 text-sm md:text-base">
                        {calculateSubtotal().toFixed(2)} ج.م
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs md:text-sm">
                        رسوم{" "}
                        {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
                      </span>
                      <span className="font-semibold text-gray-800 text-sm md:text-base">
                        {getDeliveryFee().toFixed(2)} ج.م
                      </span>
                    </div>

                    {deliveryType === "delivery" && selectedArea && (
                      <div className="text-xs text-gray-500 text-center">
                        وقت التوصيل المتوقع: {selectedArea.estimatedTimeMin}-
                        {selectedArea.estimatedTimeMax} دقيقة
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3 md:pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-base md:text-lg">
                          الإجمالي
                        </span>
                        <span className="font-bold text-[#2E3E88] text-lg md:text-xl">
                          {calculateTotal().toFixed(2)} ج.م
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Branch and Area Info */}
                  <div className="mb-4 md:mb-6">
                    <div className="bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#2E3E88]/30">
                      <h4 className="font-bold text-gray-800 text-sm md:text-base mb-1 md:mb-2">
                        معلومات{" "}
                        {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
                      </h4>

                      <div className="space-y-1 md:space-y-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600">
                            طريقة{" "}
                            {deliveryType === "delivery"
                              ? "التوصيل"
                              : "الاستلام"}
                            :
                          </span>
                          <span className="font-semibold text-gray-800">
                            {deliveryType === "delivery"
                              ? "توصيل للمنزل"
                              : "استلام من المطعم"}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600">الفرع:</span>
                          <span className="font-semibold text-gray-800">
                            {selectedBranch ? selectedBranch.name : "غير محدد"}
                          </span>
                        </div>

                        {deliveryType === "delivery" && selectedArea && (
                          <>
                            <div className="flex justify-between text-xs md:text-sm">
                              <span className="text-gray-600">
                                منطقة التوصيل:
                              </span>
                              <span className="font-semibold text-gray-800">
                                {selectedArea.areaName}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs md:text-sm">
                              <span className="text-gray-600">
                                رسوم التوصيل:
                              </span>
                              <span className="font-semibold text-[#2E3E88]">
                                {getDeliveryFee().toFixed(2)} ج.م
                              </span>
                            </div>
                          </>
                        )}

                        {deliveryType === "pickup" && (
                          <>
                            <div className="flex justify-between text-xs md:text-sm">
                              <span className="text-gray-600">
                                رسوم الاستلام:
                              </span>
                              <span className="font-semibold text-[#2E3E88]">
                                {getDeliveryFee().toFixed(2)} ج.م
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={
                      cartItems.length === 0 ||
                      !selectedBranch ||
                      (deliveryType === "delivery" && !selectedArea) ||
                      (deliveryType === "delivery" &&
                        userAddresses.length === 0) ||
                      (deliveryType === "delivery" && !selectedAddress)
                    }
                    className={`w-full py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-sm md:text-lg transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${
                      cartItems.length === 0 ||
                      !selectedBranch ||
                      (deliveryType === "delivery" && !selectedArea) ||
                      (deliveryType === "delivery" &&
                        userAddresses.length === 0) ||
                      (deliveryType === "delivery" && !selectedAddress)
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white hover:shadow-lg md:hover:shadow-xl"
                    }`}
                  >
                    <FaLocationArrow />
                    المتابعة للدفع
                  </motion.button>

                  {/* Continue Shopping */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/")}
                    className="w-full mt-3 md:mt-4 border-2 border-[#2E3E88] text-[#2E3E88] py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-base hover:bg-[#2E3E88] hover:text-white transition-all duration-300"
                  >
                    مواصلة التسوق
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
