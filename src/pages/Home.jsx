import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTimes,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaList,
  FaSave,
  FaFire,
  FaClock,
  FaTag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", name: "جميع العناصر" },
  ]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", isActive: true });
  const categoriesContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        const categoriesData = response.data;

        const transformedCategories = [
          { id: "all", name: "جميع العناصر" },
          ...categoriesData.map((category) => ({
            id: category.id.toString(),
            name: category.name,
            isActive: category.isActive,
            originalId: category.id,
          })),
        ];

        setCategories(transformedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل التصنيفات",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const params = {};
        if (selectedCategory !== "all") {
          params.categoryId = parseInt(selectedCategory);
        }

        const response = await axiosInstance.get("/api/MenuItems/GetAll", {
          params,
        });
        const productsData = response.data;

        const transformedProducts = productsData.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category?.name?.toLowerCase() || "meals",
          categoryId: product.category?.id,
          price: product.basePrice,
          image: product.imageUrl
            ? `https://restaurant-template.runasp.net/${product.imageUrl}`
            : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          ingredients: [],
          description: product.description,
          isActive: product.isActive,
          calories: product.calories,
          preparationTimeStart: product.preparationTimeStart,
          preparationTimeEnd: product.preparationTimeEnd,
          availabilityTime: {
            alwaysAvailable: product.isAllTime,
            startTime:
              product.menuItemSchedules?.[0]?.startTime?.substring(0, 5) || "",
            endTime:
              product.menuItemSchedules?.[0]?.endTime?.substring(0, 5) || "",
          },
          availabilityDays: {
            everyday: product.isAllTime,
            specificDays:
              product.menuItemSchedules?.map((schedule) =>
                getDayName(schedule.day)
              ) || [],
          },
          menuItemSchedules: product.menuItemSchedules || [],
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل المنتجات",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

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

  const fetchProductDetails = async (productId) => {
    try {
      const response = await axiosInstance.get(
        `/api/MenuItems/Get/${productId}`
      );
      const product = response.data;

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name?.toLowerCase() || "meals",
        categoryId: product.category?.id,
        price: product.basePrice,
        image: product.imageUrl
          ? `https://restaurant-template.runasp.net/${product.imageUrl}`
          : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        ingredients: [],
        description: product.description,
        isActive: product.isActive,
        calories: product.calories,
        preparationTimeStart: product.preparationTimeStart,
        preparationTimeEnd: product.preparationTimeEnd,
        availabilityTime: {
          alwaysAvailable: product.isAllTime,
          startTime:
            product.menuItemSchedules?.[0]?.startTime?.substring(0, 5) || "",
          endTime:
            product.menuItemSchedules?.[0]?.endTime?.substring(0, 5) || "",
        },
        availabilityDays: {
          everyday: product.isAllTime,
          specificDays:
            product.menuItemSchedules?.map((schedule) =>
              getDayName(schedule.day)
            ) || [],
        },
        menuItemSchedules: product.menuItemSchedules || [],
      };
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductClick = async (product) => {
    const productDetails = await fetchProductDetails(product.id);
    if (productDetails) {
      setSelectedProduct(productDetails);
      setQuantity(1);
      document.body.style.overflow = "hidden";
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = "auto";
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();

    if (!product.isActive) {
      Swal.fire({
        icon: "error",
        title: "المنتج غير متوفر",
        text: `${product.name} غير متوفر حالياً`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    Swal.fire({
      icon: "success",
      title: "تم الإضافة إلى السلة!",
      text: `تم إضافة ${product.name} إلى سلة التسوق`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddToCartFromModal = (product) => {
    if (!product.isActive) {
      Swal.fire({
        icon: "error",
        title: "المنتج غير متوفر",
        text: `${product.name} غير متوفر حالياً`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }

    Swal.fire({
      icon: "success",
      title: "تم الإضافة إلى السلة!",
      text: `تم إضافة ${quantity} ${product.name} إلى سلة التسوق`,
      timer: 1500,
      showConfirmButton: false,
    });

    closeProductModal();
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation();

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItems/Delete/${productId}`);

          setProducts(products.filter((product) => product.id !== productId));
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف المنتج بنجاح",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المنتج",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleToggleActive = async (productId, e) => {
    e.stopPropagation();

    try {
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${productId}`
      );

      setProducts(
        products.map((product) =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        )
      );

      setFilteredProducts(
        filteredProducts.map((product) =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        )
      );

      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة!",
        text: `تم ${
          products.find((p) => p.id === productId).isActive ? "تعطيل" : "تفعيل"
        } المنتج`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة المنتج",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleAddNewProduct = () => {
    navigate("/products/new");
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
    setNewCategory({ name: "", isActive: true });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "اسم التصنيف مطلوب",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (editingCategory.id === "all") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن التعديل",
        text: "لا يمكن تعديل تصنيف 'جميع العناصر'",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await axiosInstance.put(
        `/api/Categories/Update/${editingCategory.originalId}`,
        {
          name: editingCategory.name,
          isActive: editingCategory.isActive,
        }
      );

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...editingCategory } : cat
        )
      );

      setEditingCategory(null);
      Swal.fire({
        icon: "success",
        title: "تم التحديث!",
        text: "تم تحديث التصنيف بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "اسم التصنيف مطلوب",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/api/Categories/Add", null, {
        params: {
          Name: newCategory.name,
          IsActive: newCategory.isActive,
        },
      });

      const newCategoryData = response.data;

      const newCat = {
        id: newCategoryData.id.toString(),
        name: newCategoryData.name,
        isActive: newCategoryData.isActive,
        originalId: newCategoryData.id,
      };

      setCategories([...categories, newCat]);
      setNewCategory({ name: "", isActive: true });

      Swal.fire({
        icon: "success",
        title: "تم الإضافة!",
        text: "تم إضافة التصنيف الجديد بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في إضافة التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (categoryId === "all") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن الحذف",
        text: "لا يمكن حذف تصنيف 'جميع العناصر'",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    const productsInCategory = products.filter(
      (product) => product.categoryId === category.originalId
    );

    if (productsInCategory.length > 0) {
      Swal.fire({
        title: "لا يمكن حذف التصنيف",
        text: `يوجد ${productsInCategory.length} منتج في هذا التصنيف. يرجى إعادة تعيين أو حذف هذه المنتجات أولاً.`,
        icon: "warning",
        confirmButtonColor: "#E41E26",
        confirmButtonText: "حسناً",
      });
      return;
    }

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(
            `/api/Categories/Delete/${category.originalId}`
          );

          setCategories(categories.filter((cat) => cat.id !== categoryId));

          if (selectedCategory === categoryId) {
            setSelectedCategory("all");
          }

          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف التصنيف بنجاح",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error deleting category:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف التصنيف",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleToggleCategoryActive = async (categoryId, e) => {
    e.stopPropagation();

    if (categoryId === "all") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن التعديل",
        text: "لا يمكن تعديل تصنيف 'جميع العناصر'",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    try {
      await axiosInstance.put(
        `/api/Categories/ChangeCategoryActiveStatus/${category.originalId}`
      );

      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
        )
      );

      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة!",
        text: `تم ${category.isActive ? "تعطيل" : "تفعيل"} التصنيف`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating category status:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleOpenCategoriesManager = () => {
    setShowCategoriesManager(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseCategoriesManager = () => {
    setShowCategoriesManager(false);
    setEditingCategory(null);
    setNewCategory({ name: "", isActive: true });
    document.body.style.overflow = "auto";
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const scrollCategories = (direction) => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - categoriesContainerRef.current.offsetLeft);
    setScrollLeft(categoriesContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - categoriesContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - categoriesContainerRef.current.offsetLeft);
    setScrollLeft(categoriesContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - categoriesContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 font-sans relative overflow-x-hidden transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 dark:from-[#E41E26]/5 dark:to-[#FDB913]/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 dark:from-[#FDB913]/5 dark:to-[#E41E26]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white py-8 md:py-16 px-4 text-center w-full">
        <div className="max-w-4xl mx-auto relative z-10 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2 text-center"
            dir="rtl"
          >
            <span className="block sm:inline">مرحباً بكم في</span>{" "}
            <span className="block sm:inline">Chicken One</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg md:text-xl lg:text-2xl opacity-90 mb-6 md:mb-8 px-2"
          >
            طعام لذيذ، يصل إليك طازجاً
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-2xl mx-auto w-full px-2"
          >
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="ابحث عن أطباقك المفضلة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border-none outline-none text-gray-800 dark:text-gray-200 dark:bg-gray-700 shadow-2xl focus:ring-2 focus:ring-[#E41E26] text-sm md:text-base text-right"
                dir="rtl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto -mt-6 md:-mt-8 px-2 sm:px-4 z-20 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 md:p-4 relative w-full transition-colors duration-300">
          {/* Left Scroll Button */}
          <button
            onClick={() => scrollCategories("left")}
            className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
          >
            <FaChevronLeft size={14} className="sm:w-4" />
          </button>

          <div
            ref={categoriesContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 px-6 sm:px-8 cursor-grab active:cursor-grabbing select-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              direction: "rtl",
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                } ${
                  !category.isActive && category.id !== "all"
                    ? "opacity-60"
                    : ""
                }`}
                style={{ direction: "rtl" }} // جعل اتجاه النص من اليمين لليسار
              >
                <span className="whitespace-nowrap">{category.name}</span>
                {category.id !== "all" && !category.isActive && (
                  <span className="text-xs text-red-500">(معطل)</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scrollCategories("right")}
            className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
          >
            <FaChevronRight size={14} className="sm:w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full">
        {/* Products Grid */}
        {productsLoading ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
            <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 transition-colors duration-300">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26] mx-auto mb-4"></div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
            <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 transition-colors duration-300">
              <FaSearch className="mx-auto text-4xl md:text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                لم يتم العثور على منتجات
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4 px-4">
                حاول تعديل معايير البحث أو التصفية
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
              >
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full relative">
            {/* Products Grid with preserved layout during loading */}
            <motion.div
              layout
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 relative"
              style={{ direction: "rtl" }} // جعل اتجاه الكروت من اليمين لليسار
            >
              {/* Show existing products while loading new ones */}
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group w-full relative ${
                    !product.isActive ? "opacity-70" : ""
                  } ${productsLoading ? "opacity-50" : ""}`} // تخفيف الشفافية أثناء التحميل
                >
                  {/* Product Status Badge */}
                  <div
                    className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {product.isActive ? "نشط" : "غير نشط"}
                  </div>

                  {/* Admin/Restaurant/Branch Actions Overlay */}
                  {isAdminOrRestaurantOrBranch && (
                    <div className="absolute top-2 left-2 z-10 flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleToggleActive(product.id, e)}
                        className={`p-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 text-xs ${
                          product.isActive
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {product.isActive ? (
                          <FaTimesCircle size={12} />
                        ) : (
                          <FaCheckCircle size={12} />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleEditProduct(product, e)}
                        className="bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaEdit size={12} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDeleteProduct(product.id, e)}
                        className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <FaTrash size={12} />
                      </motion.button>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h3
                      className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2 group-hover:text-[#E41E26] transition-colors line-clamp-1"
                      dir={isArabic(product.name) ? "rtl" : "ltr"} // تحديد اتجاه النص حسب اللغة
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed"
                      dir={isArabic(product.description) ? "rtl" : "ltr"} // تحديد اتجاه النص حسب اللغة
                    >
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[#E41E26] font-bold text-lg sm:text-xl">
                        {product.price} ج.م
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={!product.isActive || productsLoading}
                        className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                          product.isActive && !productsLoading
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="xs:hidden">
                          {product.isActive && !productsLoading
                            ? "أضف إلى السلة"
                            : "غير متوفر"}
                        </span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          !productsLoading && handleProductClick(product)
                        }
                        disabled={productsLoading}
                        className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                          !productsLoading
                            ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <FaEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="xs:hidden">عرض التفاصيل</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Admin/Restaurant/Branch Buttons */}
      {isAdminOrRestaurantOrBranch && (
        <div className="fixed bottom-4 left-4 flex flex-col gap-3 z-40">
          {/* Add Product Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddNewProduct}
            className="bg-green-500 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:bg-green-600 transition-colors duration-200"
          >
            <FaPlus className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.button>

          {/* Manage Categories Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenCategoriesManager}
            className="bg-purple-500 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:bg-purple-600 transition-colors duration-200"
          >
            <FaList className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.button>
        </div>
      )}

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeProductModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
              onClick={closeProductModal}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-6xl mx-auto my-auto transition-colors duration-300"
                style={{ height: "90vh" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeProductModal}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110"
                >
                  <FaTimes size={16} className="sm:w-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Product Status Badge */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-2 rounded-full text-sm font-semibold ${
                        selectedProduct.isActive
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {selectedProduct.isActive ? "نشط" : "غير نشط"}
                    </div>

                    {/* Admin/Restaurant/Branch Actions in Modal */}
                    {isAdminOrRestaurantOrBranch && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(selectedProduct.id, e);
                          }}
                          className={`p-2.5 rounded-lg shadow-lg transition-colors flex items-center gap-1 text-sm ${
                            selectedProduct.isActive
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {selectedProduct.isActive ? (
                            <FaTimesCircle size={16} />
                          ) : (
                            <FaCheckCircle size={16} />
                          )}
                          {selectedProduct.isActive ? "تعطيل" : "تفعيل"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(selectedProduct, e);
                          }}
                          className="bg-blue-500 text-white p-2.5 rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
                        >
                          <FaEdit size={16} />
                          تعديل
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(selectedProduct.id, e);
                          }}
                          className="bg-red-500 text-white p-2.5 rounded-lg shadow-lg hover:bg-red-600 transition-colors flex items-center gap-1 text-sm"
                        >
                          <FaTrash size={16} />
                          حذف
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 sm:p-6 overflow-y-auto flex flex-col h-full">
                    {/* Content Section - يأخذ المساحة المتاحة */}
                    <div className="overflow-y-auto">
                      {/* Product Name and Description */}
                      <div className="space-y-4 mb-6">
                        <h2
                          className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3"
                          dir={isArabic(selectedProduct.name) ? "rtl" : "ltr"}
                        >
                          {selectedProduct.name}
                        </h2>

                        <p
                          className="text-gray-600 dark:text-gray-400 text-base leading-relaxed"
                          dir={
                            isArabic(selectedProduct.description)
                              ? "rtl"
                              : "ltr"
                          }
                        >
                          {selectedProduct.description}
                        </p>
                      </div>

                      {/* Nutrition and Preparation Info */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {/* Calories */}
                        {selectedProduct.calories && (
                          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-3 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <FaFire className="text-orange-500 text-sm" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                السعرات الحرارية
                              </span>
                            </div>
                            <div className="text-orange-600 dark:text-orange-400 font-bold text-base">
                              {selectedProduct.calories} كالوري
                            </div>
                          </div>
                        )}

                        {/* Preparation Time */}
                        {(selectedProduct.preparationTimeStart ||
                          selectedProduct.preparationTimeEnd) && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <FaClock className="text-blue-500 text-sm" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                وقت التحضير
                              </span>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {selectedProduct.preparationTimeStart &&
                              selectedProduct.preparationTimeEnd
                                ? `${selectedProduct.preparationTimeStart} - ${selectedProduct.preparationTimeEnd} دقيقة`
                                : selectedProduct.preparationTimeStart
                                ? `${selectedProduct.preparationTimeStart} دقيقة`
                                : `${selectedProduct.preparationTimeEnd} دقيقة`}
                            </div>
                          </div>
                        )}

                        {/* Category */}
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <FaTag className="text-purple-500 text-sm" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                              التصنيف
                            </span>
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 font-bold text-base">
                            {selectedProduct.category}
                          </div>
                        </div>

                        {/* Availability Status */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <FaCalendarAlt className="text-green-500 text-sm" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                              الحالة
                            </span>
                          </div>
                          <div
                            className={`font-bold text-base ${
                              selectedProduct.isActive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {selectedProduct.isActive ? "متاح" : "غير متاح"}
                          </div>
                        </div>
                      </div>

                      {selectedProduct.menuItemSchedules &&
                        selectedProduct.menuItemSchedules.length > 0 && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg mb-6">
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <FaCalendarAlt className="text-gray-600 dark:text-gray-300 text-lg" />
                              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg">
                                جدول التوفر
                              </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                              {selectedProduct.menuItemSchedules.map(
                                (schedule, index) => (
                                  <div
                                    key={schedule.id || index}
                                    className={`p-3 rounded-lg border ${
                                      schedule.isActive
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                    }`}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex-1 text-right">
                                          {schedule.day}
                                        </span>
                                        <div className="flex items-center gap-2 flex-wrap justify-end">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                              schedule.isActive
                                                ? "bg-green-500 text-white"
                                                : "bg-red-500 text-white"
                                            }`}
                                          >
                                            {schedule.isActive
                                              ? "نشط"
                                              : "غير نشط"}
                                          </span>
                                          <span className="text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                                            {formatTimeDisplay(
                                              schedule.startTime
                                            )}{" "}
                                            -{" "}
                                            {formatTimeDisplay(
                                              schedule.endTime
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      {schedule.notes && (
                                        <p className="text-gray-500 dark:text-gray-400 text-xs text-center border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                          {schedule.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex-shrink-0">
                      <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="text-2xl sm:text-3xl font-bold text-[#E41E26] whitespace-nowrap">
                          {selectedProduct.price} ج.م
                        </div>

                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-2 flex-shrink-0">
                          <button
                            onClick={decrementQuantity}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            <FaMinus size={14} />
                          </button>
                          <span className="font-semibold text-lg min-w-8 text-center dark:text-gray-200">
                            {quantity}
                          </span>
                          <button
                            onClick={incrementQuantity}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            <FaPlus size={14} />
                          </button>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleAddToCartFromModal(selectedProduct)
                        }
                        disabled={!selectedProduct.isActive}
                        className={`w-full py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                          selectedProduct.isActive
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <FaShoppingCart size={18} />
                        {selectedProduct.isActive
                          ? `أضف إلى السلة - ${(
                              selectedProduct.price * quantity
                            ).toFixed(2)} ج.م`
                          : "المنتج غير متوفر"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCategoriesManager && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseCategoriesManager}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
              onClick={handleCloseCategoriesManager}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto transition-colors duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white p-4 sm:p-6 relative">
                  <h2 className="text-xl sm:text-2xl font-bold text-center">
                    إدارة التصنيفات
                  </h2>
                  <button
                    onClick={handleCloseCategoriesManager}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors duration-200 hover:scale-110"
                  >
                    <FaTimes size={16} className="sm:w-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 mb-6 transition-colors duration-300">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      إضافة تصنيف جديد
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          اسم التصنيف
                        </label>
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                          }
                          placeholder="أدخل اسم التصنيف"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none transition-all text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={newCategory.isActive}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  isActive: e.target.checked,
                                })
                              }
                              className="sr-only"
                            />
                            <div
                              className={`block w-14 h-8 rounded-full ${
                                newCategory.isActive
                                  ? "bg-green-500"
                                  : "bg-gray-600"
                              }`}
                            ></div>
                            <div
                              className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                                newCategory.isActive
                                  ? "transform translate-x-6"
                                  : ""
                              }`}
                            ></div>
                          </div>
                          <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                            {newCategory.isActive ? "مفعل" : "معطل"}
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddCategory}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <FaPlus />
                        إضافة تصنيف
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      التصنيفات الحالية
                    </h3>
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all"
                        >
                          {editingCategory &&
                          editingCategory.id === category.id ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  اسم التصنيف
                                </label>
                                <input
                                  type="text"
                                  value={editingCategory.name}
                                  onChange={(e) =>
                                    setEditingCategory({
                                      ...editingCategory,
                                      name: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none transition-all text-right"
                                  dir="rtl"
                                />
                              </div>
                              <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={editingCategory.isActive}
                                      onChange={(e) =>
                                        setEditingCategory({
                                          ...editingCategory,
                                          isActive: e.target.checked,
                                        })
                                      }
                                      className="sr-only"
                                    />
                                    <div
                                      className={`block w-14 h-8 rounded-full ${
                                        editingCategory.isActive
                                          ? "bg-green-500"
                                          : "bg-gray-600"
                                      }`}
                                    ></div>
                                    <div
                                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                                        editingCategory.isActive
                                          ? "transform translate-x-6"
                                          : ""
                                      }`}
                                    ></div>
                                  </div>
                                  <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                                    {editingCategory.isActive ? "مفعل" : "معطل"}
                                  </div>
                                </label>
                              </div>
                              <div className="md:col-span-2 flex justify-end gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setEditingCategory(null)}
                                  className="px-6 py-3 rounded-xl font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                                >
                                  إلغاء
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleSaveCategory}
                                  className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                  <FaSave />
                                  حفظ التغييرات
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <h4
                                    className="font-semibold text-gray-800 dark:text-gray-200 text-lg"
                                    dir={
                                      isArabic(category.name) ? "rtl" : "ltr"
                                    }
                                  >
                                    {category.name}
                                  </h4>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {category.id !== "all" && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) =>
                                        handleToggleCategoryActive(
                                          category.id,
                                          e
                                        )
                                      }
                                      className={`p-3 rounded-xl transition-colors ${
                                        category.isActive
                                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                          : "bg-green-500 text-white hover:bg-green-600"
                                      }`}
                                    >
                                      {category.isActive ? (
                                        <FaTimesCircle size={16} />
                                      ) : (
                                        <FaCheckCircle size={16} />
                                      )}
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        handleEditCategory(category)
                                      }
                                      className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors"
                                    >
                                      <FaEdit size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        handleDeleteCategory(category.id)
                                      }
                                      className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors"
                                    >
                                      <FaTrash size={16} />
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {cart.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-full p-3 sm:p-4 shadow-2xl z-40 cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => navigate("/cart")}
        >
          <div className="relative">
            <FaShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-[#E41E26] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
