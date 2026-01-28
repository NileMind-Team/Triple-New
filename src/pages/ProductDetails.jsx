import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaFire,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaPlusCircle,
  FaSave,
  FaTimes,
  FaLayerGroup,
  FaStickyNote,
  FaPercent,
  FaChevronDown,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [addonsData, setAddonsData] = useState([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [currentAddonId, setCurrentAddonId] = useState(null);
  const [optionForm, setOptionForm] = useState({
    name: "",
    price: 0,
  });

  const [showAddonTypeModal, setShowAddonTypeModal] = useState(false);
  const [addonTypeForm, setAddonTypeForm] = useState({
    name: "",
    canSelectMultipleOptions: false,
    isSelectionRequired: false,
  });
  const [existingAddonTypes, setExistingAddonTypes] = useState([]);
  const [selectedAddonType, setSelectedAddonType] = useState(null);
  const [showAddonTypeDropdown, setShowAddonTypeDropdown] = useState(false);
  const [isAddingNewAddonType, setIsAddingNewAddonType] = useState(false);

  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [newAddonOptions, setNewAddonOptions] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const modalRef = useRef(null);
  const addonTypeModalRef = useRef(null);
  const notesModalRef = useRef(null);
  const dropdownRef = useRef(null);

  const isMobile = () => {
    return window.innerWidth < 768;
  };

  const showMessage = (type, title, text, options = {}) => {
    const hasButtons =
      options.showConfirmButton === true ||
      (options.showCancelButton !== undefined && options.showCancelButton);

    if (hasButtons) {
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
        showCancelButton:
          options.showCancelButton !== undefined
            ? options.showCancelButton
            : false,
        confirmButtonText: options.confirmButtonText || "موافق",
        cancelButtonText: options.cancelButtonText || "إلغاء",
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
        ...options,
      });
      return;
    }

    if (isMobile() && !options.forceSwal) {
      const toastOptions = {
        position: "top-right",
        autoClose: options.timer || 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        style: {
          width: "70vw",
          maxWidth: "none",
          minWidth: "200px",
          fontSize: "14px",
          borderRadius: "12px",
          right: "0",
          top: "10px",
          margin: "0",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          zIndex: 9999,
          background:
            type === "error"
              ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
              : type === "warning"
                ? "linear-gradient(135deg, #FFA726, #FF9800)"
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
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
        ...options,
      });
    }
  };

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const roles = userData.roles || [];
        setUserRoles(roles);

        const hasAdminOrRestaurantOrBranchRole =
          roles.includes("Admin") ||
          roles.includes("Restaurant") ||
          roles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
      }
    };

    checkUserRole();
  }, []);

  const fetchCartItemsCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/CartItems/GetAll");
      const cartItems = response.data;

      const totalCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      setCartItemsCount(totalCount);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItemsCount(0);
    }
  };

  const fetchCategoryInfo = async (categoryId) => {
    try {
      if (!categoryId) return;

      const response = await axiosInstance.get(
        `/api/Categories/Get/${categoryId}`,
      );
      setCategoryInfo(response.data);
    } catch (error) {
      console.error("Error fetching category info:", error);
      setCategoryInfo(null);
    }
  };

  const fetchExistingAddonTypes = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/MenuItemOptionTypes/GetAll",
      );
      setExistingAddonTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching existing addon types:", error);
      setExistingAddonTypes([]);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`/api/MenuItems/Get/${id}`);
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

      setAddonsData(transformedAddons);

      const finalPrice = productData.itemOffer
        ? productData.itemOffer.isPercentage
          ? productData.basePrice *
            (1 - productData.itemOffer.discountValue / 100)
          : productData.basePrice - productData.itemOffer.discountValue
        : productData.basePrice;

      const transformedProduct = {
        id: productData.id,
        name: productData.name,
        category: productData.category?.name?.toLowerCase() || "meals",
        categoryId: productData.category?.id,
        price: productData.basePrice,
        isPriceBasedOnRequest: productData.basePrice === 0,
        finalPrice: finalPrice,
        image: productData.imageUrl
          ? `https://restaurant-template.runasp.net/${productData.imageUrl}`
          : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        ingredients: [],
        description: productData.description,
        isActive: productData.isActive,
        isAvailable: productData.isAvailable !== false,
        calories: productData.calories,
        preparationTimeStart: productData.preparationTimeStart,
        preparationTimeEnd: productData.preparationTimeEnd,
        availabilityTime: {
          alwaysAvailable: productData.isAllTime,
          startTime:
            productData.menuItemSchedules?.[0]?.startTime?.substring(0, 5) ||
            "",
          endTime:
            productData.menuItemSchedules?.[0]?.endTime?.substring(0, 5) || "",
        },
        availabilityDays: {
          everyday: productData.isAllTime,
          specificDays:
            productData.menuItemSchedules?.map((schedule) =>
              getDayName(schedule.day),
            ) || [],
        },
        menuItemSchedules: productData.menuItemSchedules || [],
        typesWithOptions: productData.typesWithOptions || [],
        canSelectMultipleOptions: productData.canSelectMultipleOptions,
        isSelectionRequired: productData.isSelectionRequired,
        itemOffer: productData.itemOffer,
      };

      setProduct(transformedProduct);

      if (productData.category?.id) {
        fetchCategoryInfo(productData.category.id);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      showMessage("error", "خطأ", "فشل في تحميل تفاصيل المنتج", {
        timer: 2000,
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchCartItemsCount();
    fetchExistingAddonTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const cartSection = document.getElementById("cart-section");
      if (cartSection) {
        const rect = cartSection.getBoundingClientRect();
        setIsSticky(rect.top > 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseOptionModal();
      }
      if (
        addonTypeModalRef.current &&
        !addonTypeModalRef.current.contains(event.target)
      ) {
        handleCloseAddonTypeModal();
      }
      if (
        notesModalRef.current &&
        !notesModalRef.current.contains(event.target)
      ) {
        handleCloseNotesModal();
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        showAddonTypeDropdown
      ) {
        setShowAddonTypeDropdown(false);
      }
    };

    if (showOptionModal || showAddonTypeModal || showNotesModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [
    showOptionModal,
    showAddonTypeModal,
    showNotesModal,
    showAddonTypeDropdown,
  ]);

  const getDayName = (dayNumber) => {
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[dayNumber - 1] || "";
  };

  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const formatOfferText = (offer) => {
    if (!offer) return "";
    if (offer.isPercentage) {
      return `خصم ${offer.discountValue}%`;
    } else {
      return `خصم ${offer.discountValue} ج.م`;
    }
  };

  const formatPriceDisplay = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div
          className="font-bold text-xl sm:text-2xl md:text-3xl"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          السعر حسب الطلب
        </div>
      );
    }

    if (product.itemOffer && product.itemOffer.isEnabled) {
      return (
        <>
          <div className="text-gray-400 line-through text-base sm:text-lg">
            {toArabicNumbers(product.price)} ج.م
          </div>
          <div
            className="font-bold text-xl sm:text-2xl md:text-3xl"
            style={{
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {toArabicNumbers(product.finalPrice.toFixed(2))} ج.م
          </div>
        </>
      );
    }

    return (
      <div
        className="font-bold text-xl sm:text-2xl md:text-3xl"
        style={{
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {toArabicNumbers(product.price)} ج.م
      </div>
    );
  };

  const isCategoryDisabled = () => {
    if (!categoryInfo) return false;
    return !categoryInfo.isActive;
  };

  const isProductActive = () => {
    if (!product) return false;
    return product.isActive && product.isAvailable;
  };

  const isProductAvailableForCart = () => {
    if (!product) return false;

    if (!isProductActive()) {
      return false;
    }

    return !isCategoryDisabled();
  };

  const canToggleProductActive = () => {
    if (!product?.categoryId) return true;
    return !isCategoryDisabled();
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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

  const calculateTotalPrice = () => {
    if (!product) return 0;

    let total = 0;

    if (!product.isPriceBasedOnRequest) {
      const basePrice =
        product.itemOffer && product.itemOffer.isEnabled
          ? product.finalPrice
          : product.price;
      total = basePrice * quantity;
    }

    Object.values(selectedAddons).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        addonsData.forEach((addon) => {
          const option = addon.options.find((opt) => opt.id === optionId);
          if (option) {
            total += option.price * quantity;
          }
        });
      });
    });

    return total;
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3E88",
        cancelButtonColor: "#32B9CC",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/register");
        }
      });
      return;
    }

    if (!isProductAvailableForCart()) {
      showMessage(
        "warning",
        "تحذير",
        `لا يمكن إضافة هذا المنتج إلى السلة حالياً`,
        { timer: 2000 },
      );
      return;
    }

    const requiredAddons = addonsData.filter(
      (addon) => addon.isSelectionRequired,
    );
    const missingRequiredAddons = requiredAddons.filter(
      (addon) => !selectedAddons[addon.id],
    );

    if (missingRequiredAddons.length > 0) {
      showMessage(
        "warning",
        "تحذير",
        `يرجى اختيار ${missingRequiredAddons
          .map((addon) => addon.title)
          .join(" و ")}`,
        { timer: 2000 },
      );
      return;
    }

    setAddingToCart(true);

    try {
      const options = [];
      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          options.push(optionId);
        });
      });

      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: product.id,
        quantity: quantity,
        options: options,
        note: additionalNotes.trim(),
      });

      await fetchCartItemsCount();

      showMessage(
        "success",
        "تم بنجاح!",
        `تم إضافة ${toArabicNumbers(quantity)} ${product.name} إلى سلة التسوق`,
        { timer: 1500 },
      );

      setQuantity(1);
      setSelectedAddons({});
      setAdditionalNotes("");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showMessage("error", "خطأ", "فشل في إضافة المنتج إلى السلة", {
        timer: 2000,
      });
    } finally {
      setTimeout(() => {
        setAddingToCart(false);
      }, 500);
    }
  };

  const handleEditProduct = () => {
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleDeleteProduct = async () => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#32B9CC",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItems/Delete/${product.id}`);
          showMessage("success", "تم الحذف!", "تم حذف المنتج بنجاح", {
            timer: 2000,
          });
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } catch (error) {
          console.error("Error deleting product:", error);
          showMessage("error", "خطأ", "فشل في حذف المنتج", { timer: 2000 });
        }
      }
    });
  };

  const handleToggleActive = async () => {
    if (!canToggleProductActive()) {
      showMessage(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
        { timer: 2000 },
      );
      return;
    }

    try {
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${product.id}`,
      );

      setProduct({ ...product, isActive: !product.isActive });

      const currentActiveStatus = isProductActive();
      showMessage(
        "success",
        "تم تحديث الحالة!",
        `تم ${currentActiveStatus ? "تعطيل" : "تفعيل"} المنتج`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      showMessage("error", "خطأ", "فشل في تحديث حالة المنتج", { timer: 2000 });
    }
  };

  const handleManageOffers = async (e) => {
    e?.stopPropagation();

    try {
      const response = await axiosInstance.get("/api/ItemOffers/GetAll");
      const offersData = response.data;

      const existingOffer = offersData.find(
        (offer) => offer.menuItemId === product.id,
      );

      if (existingOffer) {
        navigate("/admin/item-offers", {
          state: {
            selectedProductId: product.id,
            selectedOfferId: existingOffer.id,
          },
        });
      } else {
        navigate("/admin/item-offers", {
          state: {
            selectedProductId: product.id,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      showMessage("error", "خطأ", "فشل في تحميل بيانات الخصومات", {
        timer: 2000,
      });
    }
  };

  const handleOpenAddOptionModal = (addonId) => {
    setCurrentAddonId(addonId);
    setEditingOption(null);
    setOptionForm({
      name: "",
      price: 0,
    });
    setShowOptionModal(true);
  };

  const handleOpenEditOptionModal = (addonId, option) => {
    setCurrentAddonId(addonId);
    setEditingOption(option);
    setOptionForm({
      name: option.name,
      price: option.price,
    });
    setShowOptionModal(true);
  };

  const handleCloseOptionModal = () => {
    setShowOptionModal(false);
    setEditingOption(null);
    setCurrentAddonId(null);
    setOptionForm({
      name: "",
      price: 0,
    });
  };

  const handleOptionFormChange = (e) => {
    const { name, value } = e.target;
    setOptionForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveOption = async () => {
    if (!optionForm.name.trim()) {
      showMessage("error", "خطأ", "يرجى إدخال اسم الخيار", { timer: 2000 });
      return;
    }

    try {
      if (editingOption) {
        await axiosInstance.put(
          `/api/MenuItemOptions/Update/${editingOption.id}`,
          {
            name: optionForm.name,
            price: optionForm.price,
            typeId: editingOption.typeId,
          },
        );

        showMessage("success", "تم بنجاح!", "تم تحديث الخيار بنجاح", {
          timer: 2000,
        });
      } else {
        await axiosInstance.post(`/api/MenuItemOptions/Add`, {
          menuItemId: parseInt(id),
          typeId: currentAddonId,
          name: optionForm.name,
          price: optionForm.price,
        });

        showMessage("success", "تم بنجاح!", "تم إضافة الخيار بنجاح", {
          timer: 2000,
        });
      }

      await fetchProductDetails();
      handleCloseOptionModal();
    } catch (error) {
      console.error("Error saving option:", error);
      showMessage("error", "خطأ", "فشل في حفظ الخيار", { timer: 2000 });
    }
  };

  const handleDeleteOption = async (optionId) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#32B9CC",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
      color: "white",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItemOptions/Delete/${optionId}`);

          showMessage("success", "تم بنجاح!", "تم حذف الخيار بنجاح", {
            timer: 2000,
          });

          await fetchProductDetails();
        } catch (error) {
          console.error("Error deleting option:", error);
          showMessage("error", "خطأ", "فشل في حذف الخيار", { timer: 2000 });
        }
      }
    });
  };

  const handleOpenAddAddonTypeModal = () => {
    setAddonTypeForm({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    setSelectedAddonType(null);
    setIsAddingNewAddonType(false);
    setNewAddonOptions([]);
    setShowAddonTypeModal(true);
  };

  const handleCloseAddonTypeModal = () => {
    setShowAddonTypeModal(false);
    setAddonTypeForm({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    setSelectedAddonType(null);
    setIsAddingNewAddonType(false);
    setNewAddonOptions([]);
  };

  const handleAddonTypeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddonTypeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectExistingAddonType = (addonType) => {
    setSelectedAddonType(addonType);
    setAddonTypeForm({
      name: addonType.name,
      canSelectMultipleOptions: addonType.canSelectMultipleOptions,
      isSelectionRequired: addonType.isSelectionRequired,
    });
    setIsAddingNewAddonType(false);
    setShowAddonTypeDropdown(false);
  };

  const handleAddNewAddonType = () => {
    setSelectedAddonType(null);
    setAddonTypeForm({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    setIsAddingNewAddonType(true);
    setShowAddonTypeDropdown(false);
  };

  const addNewOptionField = () => {
    setNewAddonOptions((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        price: 0,
      },
    ]);
  };

  const updateNewOptionField = (id, field, value) => {
    setNewAddonOptions((prev) =>
      prev.map((option) =>
        option.id === id
          ? {
              ...option,
              [field]: field === "price" ? parseFloat(value) || 0 : value,
            }
          : option,
      ),
    );
  };

  const removeNewOptionField = (id) => {
    setNewAddonOptions((prev) => prev.filter((option) => option.id !== id));
  };

  const handleSaveAddonType = async () => {
    try {
      if (selectedAddonType && !isAddingNewAddonType) {
        if (newAddonOptions.length === 0) {
          showMessage("error", "خطأ", "يرجى إضافة خيار واحد على الأقل", {
            timer: 2000,
          });
          return;
        }

        const invalidOptions = newAddonOptions.filter(
          (option) => !option.name.trim(),
        );
        if (invalidOptions.length > 0) {
          showMessage("error", "خطأ", "يرجى إدخال اسم لكل خيار", {
            timer: 2000,
          });
          return;
        }

        const optionPromises = newAddonOptions.map((option) => {
          return axiosInstance.post(`/api/MenuItemOptions/Add`, {
            menuItemId: parseInt(id),
            typeId: selectedAddonType.id,
            name: option.name,
            price: option.price,
          });
        });

        await Promise.all(optionPromises);

        showMessage(
          "success",
          "تم بنجاح!",
          "تم إضافة الخيارات لنوع الإضافة المحدد",
          { timer: 2000 },
        );
      } else if (isAddingNewAddonType) {
        if (!addonTypeForm.name.trim()) {
          showMessage("error", "خطأ", "يرجى إدخال اسم نوع الإضافة", {
            timer: 2000,
          });
          return;
        }

        const response = await axiosInstance.post(
          `/api/MenuItemOptionTypes/Add`,
          {
            menuItemId: parseInt(id),
            name: addonTypeForm.name,
            canSelectMultipleOptions: addonTypeForm.canSelectMultipleOptions,
            isSelectionRequired: addonTypeForm.isSelectionRequired,
          },
        );

        const newAddonTypeId = response.data.id;

        if (newAddonOptions.length > 0) {
          const optionPromises = newAddonOptions.map((option) => {
            if (option.name.trim()) {
              return axiosInstance.post(`/api/MenuItemOptions/Add`, {
                menuItemId: parseInt(id),
                typeId: newAddonTypeId,
                name: option.name,
                price: option.price,
              });
            }
            return Promise.resolve();
          });

          await Promise.all(optionPromises);
        }

        showMessage(
          "success",
          "تم بنجاح!",
          "تم إضافة نوع الإضافة الجديد مع خياراته بنجاح",
          { timer: 2000 },
        );
      } else {
        showMessage(
          "error",
          "خطأ",
          "يرجى اختيار نوع الإضافة أو إضافة نوع جديد",
          { timer: 2000 },
        );
        return;
      }

      await fetchProductDetails();
      handleCloseAddonTypeModal();
    } catch (error) {
      console.error("Error saving addon type:", error);
      if (error.response?.data?.errors?.TypeId) {
        showMessage(
          "error",
          "خطأ",
          "خطأ في معرّف نوع الإضافة. يرجى المحاولة مرة أخرى",
          { timer: 2000 },
        );
      } else {
        showMessage("error", "خطأ", "فشل في حفظ نوع الإضافة", { timer: 2000 });
      }
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
    showMessage("success", "تم بنجاح!", "تم حفظ التعليمات الإضافية", {
      timer: 1500,
    });
  };

  const handleClearNotes = () => {
    setAdditionalNotes("");
    showMessage("info", "تم المسح", "تم مسح التعليمات الإضافية", {
      timer: 1500,
    });
  };

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const navigateToCart = () => {
    navigate("/cart");
  };

  const isAdmin = userRoles.includes("Admin");
  const isRestaurant = userRoles.includes("Restaurant");
  const isBranch = userRoles.includes("Branch");

  const canShowAdminButtons = isAdmin || isRestaurant;
  const canShowToggleButton = isAdmin || isRestaurant || isBranch;

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
            className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p
            className="text-base sm:text-lg font-semibold"
            style={{ color: "#2E3E88" }}
          >
            جارٍ تحميل المنتج...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
            }}
          >
            <FaTimes
              className="text-2xl sm:text-4xl"
              style={{ color: "#FF6B6B" }}
            />
          </div>
          <h3
            className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3"
            style={{ color: "#2E3E88" }}
          >
            المنتج غير موجود
          </h3>
          <p
            className="mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base"
            style={{ color: "#32B9CC" }}
          >
            المنتج الذي تبحث عنه غير متوفر أو تم حذفه
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm sm:text-base"
            style={{
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              color: "white",
              boxShadow: "0 10px 25px #2E3E8830",
            }}
          >
            العودة للرئيسية
          </button>
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
      {/* Option Modal */}
      {showOptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <FaEdit className="text-white text-sm sm:text-base" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {editingOption ? "تعديل الخيار" : "إضافة خيار جديد"}
                </h3>
              </div>
              <button
                onClick={handleCloseOptionModal}
                className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  اسم الخيار *
                </label>
                <input
                  type="text"
                  name="name"
                  value={optionForm.name}
                  onChange={handleOptionFormChange}
                  className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                  placeholder="أدخل اسم الخيار"
                  autoFocus
                  dir="rtl"
                />
              </div>

              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                  style={{ color: "#2E3E88" }}
                >
                  السعر (ج.م)
                </label>
                <input
                  type="number"
                  name="price"
                  value={optionForm.price}
                  onChange={handleOptionFormChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                  placeholder="أدخل السعر"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseOptionModal}
                className="flex-1 py-2.5 sm:py-3.5 border-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                style={{
                  borderColor: "#2E3E88",
                  color: "#2E3E88",
                  background: "transparent",
                }}
              >
                إلغاء
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveOption}
                className="flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                  color: "white",
                }}
              >
                <FaSave className="text-sm" />
                {editingOption ? "تحديث" : "حفظ"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Addon Type Modal */}
      {showAddonTypeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            ref={addonTypeModalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <FaLayerGroup className="text-white text-sm sm:text-base" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  إضافة نوع إضافة جديد
                </h3>
              </div>
              <button
                onClick={handleCloseAddonTypeModal}
                className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div ref={dropdownRef} className="relative">
                    <label
                      className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                      style={{ color: "#2E3E88" }}
                    >
                      اختيار نوع الإضافة *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddonTypeDropdown(!showAddonTypeDropdown)
                      }
                      className="w-full flex items-center justify-between border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 transition-all hover:border-[#2E3E88] group text-right text-sm sm:text-base"
                      style={{
                        background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaLayerGroup
                          className="group-hover:scale-110 transition-transform text-sm sm:text-base"
                          style={{ color: "#2E3E88" }}
                        />
                        <span className="font-medium">
                          {selectedAddonType
                            ? selectedAddonType.name
                            : isAddingNewAddonType
                              ? "إضافة نوع جديد"
                              : "اختر نوع الإضافة"}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: showAddonTypeDropdown ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown style={{ color: "#2E3E88" }} />
                      </motion.div>
                    </button>

                    {showAddonTypeDropdown && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 mt-1 sm:mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                      >
                        <li
                          onClick={handleAddNewAddonType}
                          className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-sm sm:text-base"
                          style={{ color: "#4CAF50" }}
                        >
                          <span className="font-medium">+ إضافة نوع جديد</span>
                        </li>
                        {existingAddonTypes.map((addonType) => (
                          <li
                            key={addonType.id}
                            onClick={() =>
                              handleSelectExistingAddonType(addonType)
                            }
                            className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 cursor-pointer transition-all border-b last:border-b-0 text-sm sm:text-base"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">
                                {addonType.name}
                              </span>
                              <div className="flex gap-1 sm:gap-2">
                                {addonType.canSelectMultipleOptions && (
                                  <span
                                    className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                                      color: "#2E3E88",
                                    }}
                                  >
                                    متعدد
                                  </span>
                                )}
                                {addonType.isSelectionRequired && (
                                  <span
                                    className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #FF6B6B10, #FF8E5310)",
                                      color: "#FF6B6B",
                                    }}
                                  >
                                    مطلوب
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>

                  {isAddingNewAddonType && (
                    <>
                      <div>
                        <label
                          className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                          style={{ color: "#2E3E88" }}
                        >
                          اسم نوع الإضافة الجديد *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={addonTypeForm.name}
                          onChange={handleAddonTypeFormChange}
                          className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          placeholder="أدخل اسم نوع الإضافة الجديد"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="checkbox"
                            id="canSelectMultipleOptions"
                            name="canSelectMultipleOptions"
                            checked={addonTypeForm.canSelectMultipleOptions}
                            onChange={handleAddonTypeFormChange}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-2 focus:ring-[#2E3E88]"
                            style={{ color: "#2E3E88" }}
                          />
                          <label
                            htmlFor="canSelectMultipleOptions"
                            className="text-xs sm:text-sm font-medium"
                            style={{ color: "#2E3E88" }}
                          >
                            يمكن اختيار أكثر من خيار
                          </label>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="checkbox"
                            id="isSelectionRequired"
                            name="isSelectionRequired"
                            checked={addonTypeForm.isSelectionRequired}
                            onChange={handleAddonTypeFormChange}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-2 focus:ring-[#2E3E88]"
                            style={{ color: "#2E3E88" }}
                          />
                          <label
                            htmlFor="isSelectionRequired"
                            className="text-xs sm:text-sm font-medium"
                            style={{ color: "#2E3E88" }}
                          >
                            اختيار إجباري
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedAddonType && !isAddingNewAddonType && (
                    <div
                      className="rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm sm:text-base"
                      style={{
                        background:
                          "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                        border: "1px solid #2E3E8820",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h4
                          className="font-semibold"
                          style={{ color: "#2E3E88" }}
                        >
                          {selectedAddonType.name}
                        </h4>
                        <div className="flex gap-1 sm:gap-2">
                          {selectedAddonType.canSelectMultipleOptions && (
                            <span
                              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                                color: "#2E3E88",
                              }}
                            >
                              متعدد
                            </span>
                          )}
                          {selectedAddonType.isSelectionRequired && (
                            <span
                              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                              style={{
                                background:
                                  "linear-gradient(135deg, #FF6B6B10, #FF8E5310)",
                                color: "#FF6B6B",
                              }}
                            >
                              مطلوب
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className="text-xs sm:text-sm"
                        style={{ color: "#32B9CC" }}
                      >
                        سيتم إضافة خيارات جديدة لهذا النوع
                      </p>
                      <p
                        className="text-xs mt-0.5 sm:mt-1"
                        style={{ color: "#FF8E53" }}
                      >
                        * يجب إضافة خيار واحد على الأقل
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Options Section */}
                <div className="border-t border-gray-100 pt-3 sm:pt-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4
                      className="font-semibold text-sm sm:text-base"
                      style={{ color: "#2E3E88" }}
                    >
                      إضافة خيارات{" "}
                      {selectedAddonType && !isAddingNewAddonType && "(مطلوب)*"}
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addNewOptionField}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 hover:shadow-lg transition-all"
                      style={{
                        background: "linear-gradient(135deg, #4CAF50, #2E3E88)",
                        color: "white",
                      }}
                    >
                      <FaPlusCircle className="text-xs" />
                      إضافة خيار
                    </motion.button>
                  </div>

                  {selectedAddonType &&
                    !isAddingNewAddonType &&
                    newAddonOptions.length === 0 && (
                      <div
                        className="rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 text-xs sm:text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF8E5310, #FF6B6B10)",
                          border: "1px solid #FF8E5320",
                        }}
                      >
                        <p style={{ color: "#FF8E53" }}>
                          يجب إضافة خيار واحد على الأقل لنوع الإضافة المحدد
                        </p>
                      </div>
                    )}

                  <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto pr-2">
                    {newAddonOptions.length === 0 ? (
                      <p
                        className="text-xs sm:text-sm text-center py-2"
                        style={{ color: "#32B9CC" }}
                      >
                        لم يتم إضافة أي خيارات بعد
                      </p>
                    ) : (
                      newAddonOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className="rounded-lg p-2 sm:p-3 border text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            border: "1px solid #2E3E8820",
                          }}
                        >
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span
                              className="text-xs sm:text-sm font-medium"
                              style={{ color: "#2E3E88" }}
                            >
                              خيار #{index + 1}
                            </span>
                            <button
                              onClick={() => removeNewOptionField(option.id)}
                              className="hover:scale-110 transition-transform"
                              type="button"
                              style={{ color: "#FF6B6B" }}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <div>
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) =>
                                  updateNewOptionField(
                                    option.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#2E3E88] focus:border-[#2E3E88] transition-all duration-200"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                }}
                                placeholder="اسم الخيار"
                                required
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                value={option.price}
                                onChange={(e) =>
                                  updateNewOptionField(
                                    option.id,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                min="0"
                                step="0.01"
                                className="w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-[#2E3E88] focus:border-[#2E3E88] transition-all duration-200"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #f8f9ff, #ffffff)",
                                }}
                                placeholder="السعر (ج.م)"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseAddonTypeModal}
                className="flex-1 py-2.5 sm:py-3.5 border-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                style={{
                  borderColor: "#2E3E88",
                  color: "#2E3E88",
                  background: "transparent",
                }}
              >
                إلغاء
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAddonType}
                disabled={
                  (!selectedAddonType && !isAddingNewAddonType) ||
                  (selectedAddonType &&
                    !isAddingNewAddonType &&
                    newAddonOptions.length === 0)
                }
                className={`flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                  (selectedAddonType &&
                    !isAddingNewAddonType &&
                    newAddonOptions.length > 0) ||
                  (isAddingNewAddonType && addonTypeForm.name.trim())
                    ? "shadow-lg hover:shadow-xl cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={
                  (selectedAddonType &&
                    !isAddingNewAddonType &&
                    newAddonOptions.length > 0) ||
                  (isAddingNewAddonType && addonTypeForm.name.trim())
                    ? {
                        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        color: "white",
                      }
                    : {
                        background: "#e5e7eb",
                        color: "#6b7280",
                      }
                }
              >
                <FaSave className="text-sm" />
                حفظ
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            ref={notesModalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <FaStickyNote className="text-white text-sm sm:text-base" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تعليمات إضافية
                </h3>
              </div>
              <button
                onClick={handleCloseNotesModal}
                className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <p
                className="text-xs sm:text-sm mb-3 sm:mb-4"
                style={{ color: "#32B9CC" }}
              >
                اكتب أي ملاحظات
              </p>

              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="اكتب تعليماتك هنا..."
                className="w-full h-32 sm:h-40 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 resize-none text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                dir="rtl"
                maxLength={500}
                autoFocus
              />

              <div className="flex justify-between items-center mt-1 sm:mt-2">
                <span className="text-xs" style={{ color: "#32B9CC" }}>
                  اختياري
                </span>
                <span
                  className={`text-xs ${
                    additionalNotes.length >= 450
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {additionalNotes.length}/500
                </span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100">
              <button
                onClick={handleClearNotes}
                className="flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B10, #FF8E5310)",
                  color: "#FF6B6B",
                }}
              >
                <FaTrash className="text-xs sm:text-sm" />
                مسح
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseNotesModal}
                className="flex-1 py-2.5 sm:py-3.5 border-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                style={{
                  borderColor: "#2E3E88",
                  color: "#2E3E88",
                  background: "transparent",
                }}
              >
                إلغاء
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveNotes}
                className="flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                  color: "white",
                }}
              >
                <FaCheck className="text-xs sm:text-sm" />
                حفظ
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white rounded-full p-3 sm:p-4 shadow-2xl cursor-pointer hover:scale-110 transition-all duration-300 ${
          cartItemsCount === 0 ? "opacity-70" : ""
        }`}
        onClick={navigateToCart}
      >
        <div className="relative">
          <FaShoppingCart className="text-lg sm:text-xl" />
          {cartItemsCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                color: "white",
              }}
            >
              {cartItemsCount}
            </span>
          )}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[280px] xs:h-[320px] sm:h-[400px] md:h-[500px] object-contain"
              />

              <div
                className={`absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                  isProductActive() ? "text-white" : "text-white"
                }`}
                style={{
                  background: isProductActive()
                    ? "linear-gradient(135deg, #4CAF50, #2E3E88)"
                    : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                }}
              >
                {isProductActive() ? "نشط" : "غير نشط"}
              </div>

              {product.itemOffer && product.itemOffer.isEnabled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-10"
                >
                  <div
                    className="text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl shadow-2xl flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm"
                    style={{
                      background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    }}
                  >
                    <FaFire className="animate-pulse" size={12} />
                    <span className="font-bold whitespace-nowrap">
                      {formatOfferText(product.itemOffer)}
                    </span>
                  </div>
                </motion.div>
              )}

              {(canShowAdminButtons || canShowToggleButton) && (
                <div className="absolute top-10 sm:top-12 md:top-16 left-2 sm:left-3 md:left-4 flex flex-col gap-1 sm:gap-2 z-10">
                  {canShowToggleButton && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleActive}
                      disabled={!canToggleProductActive()}
                      className={`p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm ${
                        isProductActive() ? "text-white" : "text-white"
                      } ${
                        !canToggleProductActive()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      style={
                        isProductActive()
                          ? {
                              background:
                                "linear-gradient(135deg, #FF8E53, #FF6B6B)",
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #4CAF50, #2E3E88)",
                            }
                      }
                    >
                      {isProductActive() ? (
                        <FaTimesCircle className="text-xs sm:text-sm md:text-base" />
                      ) : (
                        <FaCheckCircle className="text-xs sm:text-sm md:text-base" />
                      )}
                      <span>{isProductActive() ? "تعطيل" : "تفعيل"}</span>
                    </motion.button>
                  )}

                  {canShowAdminButtons && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditProduct}
                        className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        }}
                      >
                        <FaEdit className="text-xs sm:text-sm md:text-base" />
                        <span>تعديل</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleManageOffers}
                        className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #9C27B0, #2E3E88)",
                        }}
                      >
                        <FaPercent className="text-xs sm:text-sm md:text-base" />
                        <span>خصومات</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteProduct}
                        className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                        }}
                      >
                        <FaTrash className="text-xs sm:text-sm md:text-base" />
                        <span>حذف</span>
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 h-auto flex flex-col">
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-3 sm:pb-4">
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <h2
                      className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4"
                      style={{ color: "#2E3E88" }}
                      dir={isArabic(product.name) ? "rtl" : "ltr"}
                    >
                      {product.name}
                    </h2>

                    <p
                      className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6"
                      style={{ color: "#32B9CC" }}
                      dir={isArabic(product.description) ? "rtl" : "ltr"}
                    >
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                      {formatPriceDisplay(product)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    {product.calories && (
                      <div
                        className="rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          border: "1px solid #2E3E8820",
                        }}
                        dir="rtl"
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <FaFire style={{ color: "#FF8E53" }} />
                          <span
                            className="font-semibold text-xs sm:text-sm md:text-base"
                            style={{ color: "#2E3E88" }}
                          >
                            السعرات الحرارية
                          </span>
                        </div>

                        <div
                          className="font-bold text-base sm:text-lg md:text-xl"
                          style={{ color: "#FF8E53" }}
                        >
                          {toArabicNumbers(product.calories)} كالوري
                        </div>
                      </div>
                    )}

                    {(product.preparationTimeStart ||
                      product.preparationTimeEnd) && (
                      <div
                        className="rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          border: "1px solid #2E3E8820",
                        }}
                        dir="rtl"
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <FaClock style={{ color: "#32B9CC" }} />
                          <span
                            className="font-semibold text-xs sm:text-sm md:text-base"
                            style={{ color: "#2E3E88" }}
                          >
                            وقت التحضير
                          </span>
                        </div>

                        <div
                          className="font-bold text-sm sm:text-base md:text-lg"
                          style={{ color: "#32B9CC" }}
                        >
                          {product.preparationTimeStart &&
                          product.preparationTimeEnd
                            ? `${toArabicNumbers(
                                product.preparationTimeStart,
                              )} - ${toArabicNumbers(
                                product.preparationTimeEnd,
                              )} دقيقة`
                            : product.preparationTimeStart
                              ? `${toArabicNumbers(
                                  product.preparationTimeStart,
                                )} دقيقة`
                              : `${toArabicNumbers(
                                  product.preparationTimeEnd,
                                )} دقيقة`}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {canShowAdminButtons && (
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleOpenAddAddonTypeModal}
                          className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold flex items-center gap-1 sm:gap-2 hover:shadow-lg transition-all text-sm sm:text-base"
                          style={{
                            background:
                              "linear-gradient(135deg, #9C27B0, #2E3E88)",
                            color: "white",
                          }}
                          dir="rtl"
                        >
                          <FaLayerGroup className="text-sm" />
                          إضافة نوع إضافة جديد
                        </motion.button>
                      </div>
                    )}

                    {addonsData.length > 0 &&
                      addonsData.map((addon) => (
                        <div
                          key={addon.id}
                          className="rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border relative group"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                            border: "1px solid #2E3E8820",
                          }}
                          dir="rtl"
                        >
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <h3
                                className="font-semibold text-sm sm:text-base md:text-lg"
                                style={{ color: "#2E3E88" }}
                              >
                                {addon.title}
                              </h3>
                              {addon.isSelectionRequired && (
                                <span
                                  className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #FF6B6B10, #FF8E5310)",
                                    color: "#FF6B6B",
                                  }}
                                >
                                  مطلوب
                                </span>
                              )}
                              {addon.canSelectMultipleOptions && (
                                <span
                                  className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                                    color: "#2E3E88",
                                  }}
                                >
                                  متعدد
                                </span>
                              )}
                            </div>

                            {canShowAdminButtons && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleOpenAddOptionModal(addon.id)
                                }
                                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 hover:shadow-lg transition-all"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #4CAF50, #2E3E88)",
                                  color: "white",
                                }}
                              >
                                <FaPlusCircle className="text-xs" />
                                إضافة خيار
                              </motion.button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
                            {addon.options.map((option) => {
                              const isSelected = selectedAddons[
                                addon.id
                              ]?.includes(option.id);
                              return (
                                <div key={option.id} className="relative">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                      handleAddonSelect(
                                        addon.id,
                                        option.id,
                                        addon.type,
                                      )
                                    }
                                    className={`w-full p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                                      isSelected
                                        ? "bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10"
                                        : "bg-white hover:border-[#2E3E88]"
                                    }`}
                                    style={{
                                      border: isSelected
                                        ? "2px solid #2E3E88"
                                        : "2px solid #2E3E8820",
                                    }}
                                    dir="rtl"
                                  >
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <span
                                        className={`font-medium text-xs sm:text-sm md:text-base ${
                                          isSelected
                                            ? "text-[#2E3E88]"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {option.name}
                                      </span>
                                      {isSelected && (
                                        <FaCheck className="text-[#2E3E88] text-xs sm:text-sm" />
                                      )}
                                    </div>

                                    {option.price > 0 && (
                                      <span className="text-xs sm:text-sm text-green-600 font-semibold">
                                        +{toArabicNumbers(option.price)} ج.م
                                      </span>
                                    )}
                                  </motion.button>

                                  {canShowAdminButtons && (
                                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 flex gap-0.5 sm:gap-1 z-10">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditOptionModal(
                                            addon.id,
                                            option,
                                          );
                                        }}
                                        className="p-1 sm:p-1.5 rounded-lg hover:scale-110 transition-all shadow-md"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                                          color: "white",
                                        }}
                                        title="تعديل"
                                      >
                                        <FaEdit className="text-xs" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteOption(option.id);
                                        }}
                                        className="p-1 sm:p-1.5 rounded-lg hover:scale-110 transition-all shadow-md"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                                          color: "white",
                                        }}
                                        title="حذف"
                                      >
                                        <FaTrash className="text-xs" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                    <div
                      onClick={handleOpenNotesModal}
                      className={`w-full rounded-lg sm:rounded-xl p-3 sm:p-4 text-center transition-all duration-300 cursor-pointer ${
                        additionalNotes
                          ? "border-2 border-solid hover:border-[#2E3E88]"
                          : "border-2 border-dashed hover:border-solid hover:border-[#2E3E88]"
                      }`}
                      style={{
                        background: additionalNotes
                          ? "linear-gradient(135deg, #4CAF5010, #2E3E8810)"
                          : "linear-gradient(135deg, #f8f9ff, #ffffff)",
                        borderColor: additionalNotes ? "#4CAF50" : "#2E3E8820",
                      }}
                      dir="rtl"
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                        <div
                          className="p-1.5 sm:p-2 rounded-full"
                          style={{
                            background: additionalNotes
                              ? "linear-gradient(135deg, #4CAF5020, #2E3E8820)"
                              : "linear-gradient(135deg, #2E3E8820, #32B9CC20)",
                          }}
                        >
                          <FaStickyNote
                            className="text-lg sm:text-xl"
                            style={{
                              color: additionalNotes ? "#4CAF50" : "#2E3E88",
                            }}
                          />
                        </div>
                        <div>
                          <h4
                            className="font-semibold text-sm sm:text-base md:text-lg"
                            style={{
                              color: additionalNotes ? "#4CAF50" : "#2E3E88",
                            }}
                          >
                            {additionalNotes
                              ? "تعليمات إضافية"
                              : "إضافة تعليمات إضافية"}
                          </h4>
                          <p
                            className="text-xs sm:text-sm mt-0.5 sm:mt-1"
                            style={{
                              color: additionalNotes ? "#4CAF50" : "#32B9CC",
                            }}
                          >
                            {additionalNotes
                              ? `انقر لتعديل التعليمات: ${additionalNotes.substring(
                                  0,
                                  60,
                                )}${additionalNotes.length > 60 ? "..." : ""}`
                              : "انقر لإضافة تعليمات إضافية"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="cart-section"
              className={`bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 md:p-6 transition-all duration-300 ${
                isSticky
                  ? "sticky bottom-4 z-10 lg:relative lg:bottom-0"
                  : "relative"
              }`}
            >
              <div
                className="flex flex-row items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-6"
                dir="rtl"
              >
                <div
                  className="w-[85px] xs:w-[95px] sm:w-auto flex items-center justify-between xs:justify-start gap-0.5 xs:gap-1 rounded-lg p-1.5 sm:p-2 md:p-3 flex-shrink-0 order-2 sm:order-1"
                  style={{
                    background: "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                  }}
                  dir="ltr"
                >
                  <button
                    onClick={decrementQuantity}
                    className="p-0.5 sm:p-1 rounded-md hover:scale-110 transition-transform"
                    style={{ color: "#2E3E88" }}
                  >
                    <FaMinus className="text-xs sm:text-sm" />
                  </button>

                  <span
                    className="font-semibold text-sm sm:text-base min-w-4 xs:min-w-6 text-center"
                    style={{ color: "#2E3E88" }}
                  >
                    {toArabicNumbers(quantity)}
                  </span>

                  <button
                    onClick={incrementQuantity}
                    className="p-0.5 sm:p-1 rounded-md hover:scale-110 transition-transform"
                    style={{ color: "#2E3E88" }}
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                  </button>
                </div>

                <div
                  className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap text-center sm:text-right order-1 sm:order-2"
                  style={{
                    background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  الإجمالي: {toArabicNumbers(calculateTotalPrice().toFixed(2))}{" "}
                  ج.م
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!isProductAvailableForCart() || addingToCart}
                className={`w-full py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-semibold text-base sm:text-lg md:text-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 ${
                  addingToCart
                    ? "opacity-50 cursor-wait"
                    : isProductAvailableForCart()
                      ? "shadow-lg hover:shadow-xl cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                }`}
                style={
                  isProductAvailableForCart() && !addingToCart
                    ? {
                        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        color: "white",
                      }
                    : {
                        background: "#e5e7eb",
                        color: "#6b7280",
                      }
                }
                dir="rtl"
              >
                {addingToCart ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2"
                      style={{ borderColor: "white" }}
                    ></div>
                    <span className="text-sm sm:text-base">يتم الإضافة...</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="text-base sm:text-lg md:text-xl" />
                    {isProductAvailableForCart()
                      ? `أضف إلى السلة - ${toArabicNumbers(
                          calculateTotalPrice().toFixed(2),
                        )} ج.م`
                      : "غير متوفر"}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
