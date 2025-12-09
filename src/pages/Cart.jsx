import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaCheck,
  FaTimes,
  FaEdit,
  FaFire,
  FaStickyNote,
  FaInfoCircle,
  FaSave,
  FaStore,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState("now");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [selectedTime, setSelectedTime] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(15);
  const [hasAddress, setHasAddress] = useState(true);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [productAddons, setProductAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [productQuantity, setProductQuantity] = useState(1);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [updatingCart, setUpdatingCart] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const notesModalRef = React.useRef(null);
  const productDetailsModalRef = React.useRef(null);

  const deliveryTimes = [
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
    "8:00 PM - 9:00 PM",
  ];

  useEffect(() => {
    fetchCartItems();
    checkUserAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deliveryType === "pickup") {
      setDeliveryFee(0);
    } else {
      setDeliveryFee(15);
    }
  }, [deliveryType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notesModalRef.current &&
        !notesModalRef.current.contains(event.target)
      ) {
        handleCloseNotesModal();
      }

      if (
        showProductDetailsModal &&
        productDetailsModalRef.current &&
        !productDetailsModalRef.current.contains(event.target)
      ) {
        closeProductDetailsModal();
      }
    };

    if (showNotesModal || showProductDetailsModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showNotesModal, showProductDetailsModal]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get("/api/CartItems/GetAll");

      const transformedItems = response.data.map((item) => {
        const basePrice = item.menuItem?.basePrice || 0;
        const itemOffer = item.menuItem?.itemOffer;

        let finalPrice = basePrice;
        if (itemOffer?.isEnabled) {
          if (itemOffer.isPercentage) {
            finalPrice =
              basePrice - (basePrice * itemOffer.discountValue) / 100;
          } else {
            finalPrice = basePrice - itemOffer.discountValue;
          }
        }

        let prepTime = null;
        if (
          item.menuItem?.preparationTimeStart !== null &&
          item.menuItem?.preparationTimeEnd !== null
        ) {
          prepTime = `${item.menuItem.preparationTimeStart}-${item.menuItem.preparationTimeEnd} mins`;
        }

        return {
          id: item.id,
          name: item.menuItem?.name || "Product",
          category: item.menuItem?.category?.name?.toLowerCase() || "meals",
          price: basePrice,
          finalPrice: finalPrice,
          image: item.menuItem?.imageUrl
            ? `https://restaurant-template.runasp.net/${item.menuItem.imageUrl}`
            : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          description: item.menuItem?.description || "",
          prepTime: prepTime,
          quantity: item.quantity,
          totalPrice: item.totalPrice || item.quantity * finalPrice,
          menuItem: item.menuItem,
          menuItemOptions: item.menuItemOptions || [],
          additionalNotes: item.additionalNotes || "",
          hasDiscount: itemOffer?.isEnabled || false,
          discountValue: itemOffer?.discountValue || 0,
          isPercentageDiscount: itemOffer?.isPercentage || false,
        };
      });

      setCartItems(transformedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل عناصر السلة",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setHasAddress(false);
        return;
      }

      setHasAddress(true);
    } catch (error) {
      console.error("Error checking user address:", error);
      setHasAddress(false);
    }
  };

  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const openProductDetailsModal = async (item) => {
    try {
      setSelectedProduct(item);
      setProductQuantity(item.quantity);
      setAdditionalNotes(item.additionalNotes || "");

      const response = await axiosInstance.get(
        `/api/MenuItems/Get/${item.menuItem?.id}`
      );
      const productData = response.data;

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

      console.log("Initial selected addons:", initialSelectedAddons);
      setSelectedAddons(initialSelectedAddons);

      setShowProductDetailsModal(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل تفاصيل المنتج",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
    }
  };

  const closeProductDetailsModal = () => {
    setShowProductDetailsModal(false);
    setSelectedProduct(null);
    setProductDetails(null);
    setProductAddons([]);
    setSelectedAddons({});
    setAdditionalNotes("");
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
            (id) => id !== optionId
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
    let total = basePrice * productQuantity;

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

      const options = [];
      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          options.push(optionId);
        });
      });

      await axiosInstance.delete(`/api/CartItems/Delete/${selectedProduct.id}`);

      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: productDetails.id,
        quantity: productQuantity,
        options: options,
        additionalNotes: additionalNotes.trim(),
      });

      await fetchCartItems();

      Swal.fire({
        icon: "success",
        title: "تم التحديث!",
        text: "تم تحديث المنتج في سلة التسوق بنجاح",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });

      closeProductDetailsModal();
    } catch (error) {
      console.error("Error updating cart item:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث المنتج",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
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
    handleCloseNotesModal();
    toast.success("تم حفظ التعليمات الإضافية", {
      position: "top-right",
      autoClose: 1500,
      rtl: true,
    });
  };

  const handleClearNotes = () => {
    setAdditionalNotes("");
    toast.info("تم مسح التعليمات الإضافية", {
      position: "top-right",
      autoClose: 1500,
      rtl: true,
    });
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) return;

      await axiosInstance.put(`/api/CartItems/Update`, {
        cartItemId: id,
        quantity: newQuantity,
      });

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.finalPrice,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث الكمية",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
    }
  };

  const removeItem = async (id) => {
    Swal.fire({
      title: "إزالة المنتج؟",
      text: "هل أنت متأكد من إزالة هذا المنتج من سلة التسوق؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، قم بإزالته!",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/CartItems/Delete/${id}`);

          setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
          );

          Swal.fire({
            title: "تمت الإزالة!",
            text: "تم إزالة المنتج من سلة التسوق",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        } catch (error) {
          console.error("Error removing item:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في إزالة المنتج",
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
      }
    });
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      Swal.fire({
        icon: "error",
        title: "خطأ...",
        text: "الرجاء إدخال رمز الكوبون!",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
      return;
    }

    const validCoupons = [
      { code: "WELCOME10", discount: 10 },
      { code: "FIRSTORDER", discount: 15 },
      { code: "CHICKEN20", discount: 20 },
      { code: "SAVE25", discount: 25 },
    ];

    const coupon = validCoupons.find(
      (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase()
    );

    if (coupon) {
      setDiscount(coupon.discount);
      setIsCouponApplied(true);
      Swal.fire({
        icon: "success",
        title: "تم تطبيق الكوبون!",
        text: `لقد حصلت على خصم ${coupon.discount}% على طلبك!`,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "كوبون غير صالح",
        text: "رمز الكوبون الذي أدخلته غير صالح أو منتهي الصلاحية.",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setIsCouponApplied(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.totalPrice || item.finalPrice * item.quantity),
      0
    );
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    return subtotal - discountAmount + deliveryFee;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "السلة فارغة",
        text: "الرجاء إضافة بعض المنتجات إلى سلة التسوق قبل المتابعة للدفع.",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
      return;
    }

    if (deliveryType === "delivery") {
      if (!hasAddress) {
        Swal.fire({
          icon: "warning",
          title: "لا يوجد عنوان توصيل",
          html: `
            <div class="text-center">
              <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </div>
              <p class="text-gray-700 dark:text-gray-300 mb-4">لم تقم بإضافة أي عنوان توصيل حتى الآن. الرجاء إضافة عنوان للمتابعة مع طلبك.</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "إضافة عنوان",
          cancelButtonText: "إلغاء",
          confirmButtonColor: "#E41E26",
          cancelButtonColor: "#6B7280",
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/addresses");
          }
        });
        return;
      }

      if (deliveryOption === "later" && !selectedTime) {
        Swal.fire({
          icon: "warning",
          title: "اختر وقت التوصيل",
          text: "الرجاء اختيار وقت التوصيل لطلبك.",
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
        return;
      }
    }

    const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderData = {
      orderNumber,
      items: cartItems,
      subtotal: calculateSubtotal(),
      discount: discount,
      discountAmount: calculateDiscountAmount(),
      deliveryFee: deliveryFee,
      total: calculateTotal(),
      deliveryType: deliveryType,
      deliveryOption: deliveryType === "delivery" ? deliveryOption : null,
      deliveryTime:
        deliveryType === "delivery"
          ? deliveryOption === "later"
            ? selectedTime
            : "ASAP"
          : "عند الاستعداد",
      couponCode: isCouponApplied ? couponCode : null,
      status: "preparing",
      estimatedDelivery:
        deliveryType === "delivery"
          ? deliveryOption === "now"
            ? "25-35 دقيقة"
            : selectedTime
          : "20-30 دقيقة",
      customerInfo: {
        name: "محمد أحمد",
        phone: "+20 123 456 7890",
        address:
          deliveryType === "delivery"
            ? "123 الشارع الرئيسي، القاهرة، مصر"
            : "فرع المطعم الرئيسي - مدينة نصر، القاهرة",
      },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("currentOrder", JSON.stringify(orderData));

    Swal.fire({
      title:
        '<h2 class="text-2xl font-bold text-gray-800 dark:text-white">تأكيد الطلب</h2>',
      html: `
        <div class="text-right max-h-96 overflow-y-auto">
          <!-- ملخص الطلب -->
          <div class="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-4 border border-[#FDB913]/30 dark:border-gray-600">
            <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#E41E26] dark:text-[#FDB913]" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              ملخص الطلب
            </h3>
            
            <!-- قائمة المنتجات -->
            <div class="space-y-3 mb-4">
              ${cartItems
                .map(
                  (item) => `
                <div class="flex items-center justify-between bg-white/80 dark:bg-gray-600/80 rounded-lg p-3">
                  <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${
                    item.name
                  }" class="w-12 h-12 rounded-lg object-cover">
                    <div>
                      <h4 class="font-semibold text-gray-800 dark:text-white text-sm">${
                        item.name
                      }</h4>
                      <p class="text-xs text-gray-600 dark:text-gray-400">الكمية: ${
                        item.quantity
                      } × ${(item.finalPrice || 0).toFixed(2)} ج.م</p>
                    </div>
                  </div>
                  <span class="font-bold text-[#E41E26] dark:text-[#FDB913]">${(
                    item.totalPrice ||
                    item.finalPrice * item.quantity ||
                    0
                  ).toFixed(2)} ج.م</span>
                </div>
              `
                )
                .join("")}
            </div>

            <!-- تفاصيل السعر -->
            <div class="space-y-2 border-t border-gray-200 dark:border-gray-600 pt-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span>
                <span class="font-semibold text-gray-800 dark:text-white">${calculateSubtotal().toFixed(
                  2
                )} ج.م</span>
              </div>
              ${
                discount > 0
                  ? `
                <div class="flex justify-between text-sm">
                  <span class="text-green-600 dark:text-green-400">الخصم (${discount}%):</span>
                  <span class="font-semibold text-green-600 dark:text-green-400">-${calculateDiscountAmount().toFixed(
                    2
                  )} ج.م</span>
                </div>
              `
                  : ""
              }
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">${
                  deliveryType === "delivery" ? "رسوم التوصيل:" : "رسوم الخدمة:"
                }</span>
                <span class="font-semibold text-gray-800 dark:text-white">${deliveryFee.toFixed(
                  2
                )} ج.م</span>
              </div>
              <div class="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                <span class="text-gray-800 dark:text-white">الإجمالي:</span>
                <span class="text-[#E41E26] dark:text-[#FDB913]">${calculateTotal().toFixed(
                  2
                )} ج.م</span>
              </div>
            </div>
          </div>

          <!-- معلومات ${
            deliveryType === "delivery" ? "التوصيل" : "الاستلام"
          } -->
          <div class="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-4 border border-[#FDB913]/30 dark:border-gray-600">
            <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#E41E26] dark:text-[#FDB913]" fill="currentColor" viewBox="0 0 16 16">
                ${
                  deliveryType === "delivery"
                    ? '<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>'
                    : '<path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zm2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5z"/>'
                }
              </svg>
              معلومات ${deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
            </h3>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#E41E26] dark:bg-[#FDB913] rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400">اسم العميل</p>
                  <p class="font-semibold text-sm text-gray-800 dark:text-white">محمد أحمد</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#E41E26] dark:bg-[#FDB913] rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400">رقم الهاتف</p>
                  <p class="font-semibold text-sm text-gray-800 dark:text-white">+20 123 456 7890</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#E41E26] dark:bg-[#FDB913] rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                    ${
                      deliveryType === "delivery"
                        ? '<path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>'
                        : '<path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zm2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5z"/>'
                    }
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400">${
                    deliveryType === "delivery"
                      ? "عنوان التوصيل"
                      : "مكان الاستلام"
                  }</p>
                  <p class="font-semibold text-sm text-gray-800 dark:text-white">${
                    deliveryType === "delivery"
                      ? "123 الشارع الرئيسي، القاهرة، مصر"
                      : "فرع المطعم الرئيسي - مدينة نصر، القاهرة"
                  }</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#E41E26] dark:bg-[#FDB913] rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 dark:text-gray-400">${
                    deliveryType === "delivery" ? "وقت التوصيل" : "وقت الاستلام"
                  }</p>
                  <p class="font-semibold text-sm text-gray-800 dark:text-white">${
                    deliveryType === "delivery"
                      ? deliveryOption === "now"
                        ? "في أقرب وقت (25-35 دقيقة)"
                        : selectedTime
                      : "عند الاستعداد (20-30 دقيقة)"
                  }</p>
                </div>
              </div>
            </div>
          </div>

          <!-- طريقة الدفع -->
          <div class="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-[#FDB913]/30 dark:border-gray-600">
            <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#E41E26] dark:text-[#FDB913]" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
              </svg>
              طريقة الدفع
            </h3>
            <div class="flex items-center gap-3 bg-white/80 dark:bg-gray-600/80 rounded-lg p-3">
              <div class="w-10 h-6 bg-[#E41E26] dark:bg-[#FDB913] rounded flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                  <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-sm text-gray-800 dark:text-white">الدفع عند ${
                  deliveryType === "delivery"
                    ? "الاستلام"
                    : "الاستلام من المطعم"
                }</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">ادفع عند ${
                  deliveryType === "delivery"
                    ? "استلام طلبك"
                    : "استلام الطلب من المطعم"
                }</p>
              </div>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "تأكيد الطلب",
      cancelButtonText: "مراجعة الطلب",
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      padding: "2rem",
      width: "800px",
      customClass: {
        popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        closeButton:
          "text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] text-xl",
        confirmButton: "px-8 py-3 rounded-xl font-bold text-lg",
        cancelButton: "px-8 py-3 rounded-xl font-bold text-lg border-2",
      },
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title:
            '<div class="flex flex-col items-center">' +
            '<div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">' +
            '<svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 16 16">' +
            '<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>' +
            "</svg>" +
            "</div>" +
            '<h2 class="text-2xl font-bold text-gray-800 dark:text-white">تم تأكيد الطلب!</h2>' +
            "</div>",
          html: `
            <div class="text-center">
              <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">تم تقديم طلبك بنجاح!</p>
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <p class="font-semibold text-green-800 dark:text-green-300">الطلب رقم #${orderNumber}</p>
                <p class="text-sm text-green-600 dark:text-green-400 mt-1">الوقت المتوقع لل${
                  deliveryType === "delivery" ? "توصيل" : "استلام"
                }: ${
            deliveryType === "delivery"
              ? deliveryOption === "now"
                ? "25-35 دقيقة"
                : selectedTime
              : "20-30 دقيقة"
          }</p>
              </div>
            </div>
          `,
          icon: null,
          confirmButtonText: "تتبع طلبي",
          confirmButtonColor: "#E41E26",
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            confirmButton: "px-8 py-3 rounded-xl font-bold text-lg",
          },
        }).then(() => {
          navigate("/order-tracking", { state: { orderNumber } });
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />

      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <motion.div
            ref={notesModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaStickyNote className="text-[#E41E26] text-xl" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  تعليمات إضافية
                </h3>
              </div>
              <button
                onClick={handleCloseNotesModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                اكتب أي ملاحظات
              </p>

              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="اكتب تعليماتك هنا..."
                className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent resize-none"
                dir="rtl"
                maxLength={500}
                autoFocus
              />

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  اختياري
                </span>
                <span
                  className={`text-xs ${
                    additionalNotes.length >= 450
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {additionalNotes.length}/500
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClearNotes}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash className="text-sm" />
                مسح
              </button>
              <button
                onClick={handleCloseNotesModal}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNotes}
                className="flex-1 py-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaSave className="text-sm" />
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showProductDetailsModal && productDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className="fixed inset-0"
            onClick={closeProductDetailsModal}
          ></div>
          <motion.div
            ref={productDetailsModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      productDetails.imageUrl
                        ? `https://restaurant-template.runasp.net/${productDetails.imageUrl}`
                        : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop"
                    }
                    alt={productDetails.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {productDetails.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {productDetails.itemOffer?.isEnabled ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Prices */}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                            {toArabicNumbers(productDetails.basePrice)} ج.م
                          </span>
                          <span className="text-xl font-bold text-[#E41E26]">
                            {toArabicNumbers(
                              productDetails.itemOffer.isPercentage
                                ? productDetails.basePrice -
                                    (productDetails.basePrice *
                                      productDetails.itemOffer.discountValue) /
                                      100
                                : productDetails.basePrice -
                                    productDetails.itemOffer.discountValue
                            )}{" "}
                            ج.م
                          </span>
                        </div>

                        {/* Discount Badge - AFTER THE PRICE */}
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg text-sm flex items-center gap-1">
                          <span>خصم</span>
                          <span>
                            {productDetails.itemOffer.isPercentage
                              ? `${productDetails.itemOffer.discountValue}%`
                              : `${productDetails.itemOffer.discountValue} ج.م`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-[#E41E26]">
                        {toArabicNumbers(productDetails.basePrice)} ج.م
                      </span>
                    )}

                    {/* Calories and Prep Time */}
                    <div className="flex items-center gap-3">
                      {productDetails.calories && (
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                          <FaFire className="text-orange-500 text-sm" />
                          {toArabicNumbers(productDetails.calories)} كالوري
                        </span>
                      )}

                      {productDetails.preparationTimeStart !== null &&
                        productDetails.preparationTimeEnd !== null && (
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                            <FaClock className="text-blue-500 text-sm" />
                            {toArabicNumbers(
                              productDetails.preparationTimeStart
                            )}
                            {productDetails.preparationTimeEnd !== null &&
                              `-${toArabicNumbers(
                                productDetails.preparationTimeEnd
                              )}`}{" "}
                            دقيقة
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={closeProductDetailsModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-200px)] p-4 sm:p-5 lg:p-6">
              {/* Description */}
              {productDetails.description && (
                <div className="mb-4 sm:mb-5 lg:mb-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-1 sm:mb-2">
                    الوصف
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                    {productDetails.description}
                  </p>
                </div>
              )}

              {/* Addons - UPDATED DESIGN TO MATCH PRODUCT DETAILS PAGE */}
              {productAddons.length > 0 && (
                <div className="space-y-4 sm:space-y-5 lg:space-y-6 mb-4 sm:mb-5 lg:mb-6">
                  {productAddons.map((addon) => {
                    const selectedOptionIds = selectedAddons[addon.id] || [];

                    return (
                      <div
                        key={addon.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                              {addon.title}
                            </h4>
                            {addon.isSelectionRequired && (
                              <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                                مطلوب
                              </span>
                            )}
                            {addon.canSelectMultipleOptions && (
                              <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                                متعدد
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2">
                          {addon.options.map((option) => {
                            const isSelected = selectedOptionIds.includes(
                              option.id
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
                                    addon.type
                                  )
                                }
                                className={`w-full p-2 rounded-md sm:rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                                  isSelected
                                    ? "border-[#E41E26] bg-red-50 dark:bg-red-900/20"
                                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                }`}
                                dir="rtl"
                              >
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`font-medium text-xs sm:text-sm ${
                                      isSelected
                                        ? "text-[#E41E26]"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  {isSelected && (
                                    <FaCheck className="text-[#E41E26] text-xs" />
                                  )}
                                </div>

                                {option.price > 0 && (
                                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
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

              <button
                onClick={handleOpenNotesModal}
                className="w-full bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:border-solid hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 mb-4 sm:mb-5 lg:mb-6"
                dir="rtl"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-800/50 p-1.5 sm:p-2 rounded-full">
                    <FaStickyNote className="text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm sm:text-base">
                      {additionalNotes
                        ? "تم إضافة تعليمات إضافية"
                        : "إضافة تعليمات إضافية"}
                    </h4>
                    <p className="text-indigo-600/70 dark:text-indigo-400/70 text-xs mt-0.5 sm:mt-1">
                      {additionalNotes
                        ? "انقر لتعديل التعليمات الإضافية"
                        : "انقر لإضافة تعليمات إضافية"}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer - Quantity and Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      الكمية:
                    </span>
                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-1 shadow">
                      <button
                        onClick={() =>
                          setProductQuantity((prev) =>
                            prev > 1 ? prev - 1 : 1
                          )
                        }
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaMinus className="text-[#E41E26] text-xs" />
                      </button>
                      <span className="font-bold text-gray-800 dark:text-white min-w-8 sm:min-w-10 text-center text-sm sm:text-base">
                        {toArabicNumbers(productQuantity)}
                      </span>
                      <button
                        onClick={() => setProductQuantity((prev) => prev + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaPlus className="text-[#E41E26] text-xs" />
                      </button>
                    </div>
                  </div>
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-[#E41E26]">
                    {toArabicNumbers(calculateProductTotalPrice().toFixed(2))}{" "}
                    ج.م
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                  <button
                    onClick={closeProductDetailsModal}
                    className="flex-1 md:flex-none px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    إلغاء
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={updateCartItem}
                    disabled={updatingCart}
                    className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {updatingCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] dark:text-gray-300 hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300 shadow-lg"
            >
              <FaArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                سلة التسوق
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                راجع طلبك و تابع للدفع
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26] dark:text-[#FDB913]">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}{" "}
              عناصر
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              في سلة التسوق الخاصة بك
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 transition-colors duration-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FaShoppingCart
                  className="text-[#E41E26] dark:text-[#FDB913] sm:w-6 sm:h-6"
                  size={18}
                />
                عناصر الطلب ({cartItems.length})
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-600">
                      <FaShoppingCart className="mx-auto text-4xl sm:text-5xl text-gray-400 mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        سلة التسوق فارغة
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500 mb-4 px-4">
                        لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
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
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-600 transition-colors duration-300 hover:shadow-lg cursor-pointer group"
                        onClick={() => openProductDetailsModal(item)}
                      >
                        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1">
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                            />
                            {/* Badge for discount */}
                            {item.hasDiscount && (
                              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                                {item.isPercentageDiscount
                                  ? `خصم ${item.discountValue}%`
                                  : `خصم ${item.discountValue} ج.م`}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 sm:mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg group-hover:text-[#E41E26] transition-colors">
                                  {item.name}
                                </h3>
                                <FaInfoCircle className="text-[#E41E26] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            {item.hasDiscount ? (
                              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                                  {(item.price || 0).toFixed(2)} ج.م
                                </span>
                                <span className="text-[#E41E26] dark:text-[#FDB913] font-bold text-base sm:text-lg">
                                  {(item.finalPrice || 0).toFixed(2)} ج.م
                                </span>
                              </div>
                            ) : (
                              <p className="text-[#E41E26] dark:text-[#FDB913] font-bold text-base sm:text-lg mb-1 sm:mb-2">
                                {(item.price || 0).toFixed(2)} ج.م
                              </p>
                            )}
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                              {item.description}
                            </p>

                            {item.prepTime && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                                <FaClock
                                  className="text-[#E41E26] dark:text-[#FDB913]"
                                  size={12}
                                />
                                <span>{item.prepTime}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls, Total Price and Remove Button */}
                        <div
                          className="flex items-center justify-between w-full sm:w-auto sm:flex-nowrap gap-2 sm:gap-3 mt-3 sm:mt-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity - 1);
                              }}
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-[#E41E26] dark:text-[#FDB913]"
                            >
                              <FaMinus size={10} className="sm:w-3 sm:h-3" />
                            </button>
                            <span className="font-bold text-gray-800 dark:text-white min-w-6 sm:min-w-8 text-center text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-[#E41E26] dark:text-[#FDB913]"
                            >
                              <FaPlus size={10} className="sm:w-3 sm:h-3" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right min-w-20 sm:min-w-24">
                            <div className="font-bold text-gray-800 dark:text-white text-base sm:text-lg whitespace-nowrap">
                              {(
                                item.totalPrice ||
                                item.finalPrice * item.quantity ||
                                0
                              ).toFixed(2)}{" "}
                              ج.م
                            </div>
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="p-1 sm:p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md sm:rounded-lg transition-colors duration-200"
                          >
                            <FaTrash size={14} className="sm:w-4 sm:h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 transition-colors duration-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FaMapMarkerAlt
                  className="text-[#E41E26] dark:text-[#FDB913] sm:w-6 sm:h-6"
                  size={18}
                />
                خيارات  {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
              </h2>

              <div className="mb-4 sm:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div
                    className={`p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      deliveryType === "delivery"
                        ? "border-[#E41E26] dark:border-[#FDB913]"
                        : "border-[#FDB913]/30 dark:border-gray-600"
                    }`}
                    onClick={() => setDeliveryType("delivery")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          deliveryType === "delivery"
                            ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {deliveryType === "delivery" && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                          التوصيل للمنزل
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          توصيل الطلب إلى عنوانك
                        </div>
                      </div>
                      <FaMapMarkerAlt className="text-[#E41E26] text-lg" />
                    </div>
                  </div>

                  <div
                    className={`p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      deliveryType === "pickup"
                        ? "border-[#E41E26] dark:border-[#FDB913]"
                        : "border-[#FDB913]/30 dark:border-gray-600"
                    }`}
                    onClick={() => setDeliveryType("pickup")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          deliveryType === "pickup"
                            ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {deliveryType === "pickup" && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                          الاستلام من المطعم
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          استلام الطلب من الفرع
                        </div>
                      </div>
                      <FaStore className="text-[#E41E26] text-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {deliveryType === "delivery" && (
                <div className="space-y-3 sm:space-y-4">
                  <div
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => setDeliveryOption("now")}
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === "now"
                          ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {deliveryOption === "now" && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                        التوصيل الآن
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                        احصل على طلبك في أسرع وقت ممكن
                      </div>
                    </div>
                    <div className="text-[#E41E26] dark:text-[#FDB913] font-bold text-sm sm:text-base">
                      في أقرب وقت
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => setDeliveryOption("later")}
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === "later"
                          ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {deliveryOption === "later" && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                        جدولة التوصيل
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                        اختر وقت التوصيل المفضل لديك
                      </div>
                    </div>
                  </div>

                  {deliveryOption === "later" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-600"
                    >
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        اختر وقت التوصيل
                      </label>
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                        {deliveryTimes.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                              selectedTime === time
                                ? "border-[#E41E26] dark:border-[#FDB913] bg-[#E41E26] dark:bg-[#FDB913] text-white"
                                : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#E41E26] dark:hover:border-[#FDB913] hover:bg-[#fff8e7] dark:hover:bg-gray-500"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {deliveryType === "pickup" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl sm:rounded-2xl border border-green-200 dark:border-green-600"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <FaStore className="text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 dark:text-green-300 text-sm sm:text-base">
                        الاستلام من المطعم
                      </h4>
                      <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">
                        لن تدفع رسوم توصيل
                      </p>
                    </div>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    ستستلم طلبك من فرعنا الرئيسي عند استعداد الطلب (20-30
                    دقيقة). سيتم إشعارك عبر الهاتف عند استعداد الطلب.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto transition-colors duration-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                ملخص الطلب
              </h2>

              {/* Coupon Section */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  رمز الكوبون
                </label>
                <div className="flex gap-1 sm:gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="جرب: WELCOME10"
                    disabled={isCouponApplied}
                    className="flex-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  />
                  {isCouponApplied ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={removeCoupon}
                      className="bg-red-500 text-white px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FaTimes size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={applyCoupon}
                      className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FaTag size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.button>
                  )}
                </div>
                {isCouponApplied && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 sm:mt-2 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl text-green-700 dark:text-green-300 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <FaCheck
                      className="text-green-500 dark:text-green-400"
                      size={12}
                    />
                    <span>
                      تم تطبيق خصم ${discount}% باستخدام {couponCode}
                    </span>
                  </motion.div>
                )}
                {!isCouponApplied && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    جرب: WELCOME10, FIRSTORDER, CHICKEN20, SAVE25
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    المجموع الفرعي
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    {calculateSubtotal().toFixed(2)} ج.م
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">
                      الخصم ({discount}%)
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">
                      -{calculateDiscountAmount().toFixed(2)} ج.م
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {deliveryType === "delivery"
                      ? "رسوم التوصيل"
                      : "رسوم الخدمة"}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    {deliveryFee.toFixed(2)} ج.م
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">
                      الإجمالي
                    </span>
                    <span className="font-bold text-[#E41E26] dark:text-[#FDB913] text-lg sm:text-xl md:text-2xl">
                      {calculateTotal().toFixed(2)} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300 ${
                  cartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl"
                }`}
              >
                المتابعة للدفع
              </motion.button>

              {/* Continue Shopping */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/")}
                className="w-full mt-3 sm:mt-4 border-2 border-[#E41E26] dark:border-[#FDB913] text-[#E41E26] dark:text-[#FDB913] py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300"
              >
                مواصلة التسوق
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
