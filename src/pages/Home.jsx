import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaList,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaTimes,
  FaLayerGroup,
  FaTag,
  FaHeart,
  FaRegHeart,
  FaFire,
  FaPercent,
  FaHome,
  FaBolt,
  FaBoxOpen,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeroSwipper from "./HeroSwipper";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", name: "جميع المنتجات" },
    { id: "offers", name: "العروض الحصرية" },
  ]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", isActive: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(8);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const categoriesContainerRef = useRef(null);
  const categoriesSectionRef = useRef(null);
  const topOfPageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Function to show notification based on device and content
  const showNotification = (type, title, text, options = {}) => {
    if (options.showConfirmButton || options.showCancelButton) {
      Swal.fire({
        icon: type,
        title: title,
        text: text,
        timer: options.timer || null,
        showConfirmButton: options.showConfirmButton || false,
        confirmButtonText: options.confirmButtonText,
        showCancelButton: options.showCancelButton,
        cancelButtonText: options.cancelButtonText,
        confirmButtonColor: "#2E3E88",
        cancelButtonColor: "#6B7280",
        ...options.swalOptions,
      });
      return;
    }

    if (isMobile()) {
      const toastOptions = {
        position: "top-right",
        autoClose: options.timer || 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        rtl: true,
        style: {
          width: "70%",
          borderRadius: "12px",
          margin: "10px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          maxWidth: "400px",
          minWidth: "250px",
          background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
          color: "white",
        },
        ...options.toastOptions,
      };

      if (type === "success") {
        toast.success(text, toastOptions);
      } else if (type === "error") {
        toast.error(text, toastOptions);
      } else if (type === "warning") {
        toast.warning(text, toastOptions);
      }
    } else {
      Swal.fire({
        icon: type,
        title: title,
        text: text,
        timer: options.timer || 2000,
        showConfirmButton: false,
        confirmButtonColor: "#2E3E88",
        ...options.swalOptions,
      });
    }
  };

  // Function to preload images
  const preloadImages = (imageUrls) => {
    return new Promise((resolve) => {
      if (imageUrls.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalImages = imageUrls.length;

      imageUrls.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        img.src = src;
      });
    });
  };

  // Skeleton Loading Component - تصميم جديد مع استجابة كاملة
  const ProductSkeleton = ({ count = 8 }) => {
    return (
      <div
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        style={{ direction: "rtl" }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 w-full relative min-h-[180px] animate-pulse"
          >
            {/* Mobile View Skeleton */}
            <div className="sm:hidden">
              <div className="p-3">
                <div className="flex">
                  <div className="w-28 flex-shrink-0 ml-3">
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              <div className="px-3 pb-3">
                <div className="flex gap-2">
                  <div className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            {/* Desktop View Skeleton */}
            <div className="hidden sm:block">
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700"></div>

              <div className="p-3 sm:p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-4">
                  <div className="flex-1 py-2 sm:py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 py-2 sm:py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const scrollToCategories = useCallback(() => {
    if (categoriesSectionRef.current) {
      const element = categoriesSectionRef.current;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      const { selectedCategoryFromFooter, scrollToCategories: shouldScroll } =
        location.state;

      if (selectedCategoryFromFooter) {
        setSelectedCategory(selectedCategoryFromFooter);
        setCurrentPage(1);

        navigate(".", { replace: true, state: {} });

        if (shouldScroll) {
          setTimeout(() => {
            scrollToCategories();
          }, 300);
        }
      }
    }
  }, [location.state, navigate, scrollToCategories]);

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
          { id: "all", name: "جميع المنتجات" },
          { id: "offers", name: "العروض الحصرية" },
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
        showNotification("error", "خطأ", "فشل في تحميل التصنيفات", {
          timer: 2000,
        });
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage]);

  const buildFiltersArray = () => {
    const filtersArray = [];

    if (selectedCategory !== "all" && selectedCategory !== "offers") {
      filtersArray.push({
        propertyName: "category.id",
        propertyValue: selectedCategory.toString(),
        range: false,
      });
    }
    return filtersArray;
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setImagesLoaded(false);

      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        filters: buildFiltersArray(),
      };

      const queryParams =
        selectedCategory === "offers" ? { isHasOffer: true } : {};

      const response = await axiosInstance.post(
        "/api/MenuItems/GetAll",
        requestBody,
        { params: queryParams },
      );

      const responseData = response.data;
      const productsData = responseData.items || responseData.data || [];

      const transformedProducts = productsData.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name?.toLowerCase() || "meals",
        categoryId: product.category?.id,
        price: product.basePrice,
        isPriceBasedOnRequest: product.basePrice === 0,
        image: product.imageUrl
          ? `https://restaurant-template.runasp.net/${product.imageUrl}`
          : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        ingredients: [],
        description: product.description,
        isActive: product.isActive,
        isAvailable: product.isAvailable !== false,
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
              getDayName(schedule.day),
            ) || [],
        },
        menuItemSchedules: product.menuItemSchedules || [],
        itemOffer: product.itemOffer,
        finalPrice: product.itemOffer
          ? product.itemOffer.isPercentage
            ? product.basePrice * (1 - product.itemOffer.discountValue / 100)
            : product.basePrice - product.itemOffer.discountValue
          : product.basePrice,
        hasOffer: product.itemOffer && product.itemOffer.isEnabled,
      }));

      setProducts(transformedProducts);

      if (selectedCategory === "offers") {
        const offersProducts = transformedProducts.filter(
          (product) => product.itemOffer && product.itemOffer.isEnabled,
        );
        setFilteredProducts(offersProducts);

        const totalItems = offersProducts.length;
        setTotalPages(Math.ceil(totalItems / pageSize));
      } else {
        setFilteredProducts(transformedProducts);

        setTotalPages(
          responseData.totalPages ||
            Math.ceil(
              (responseData.totalCount || productsData.length) / pageSize,
            ),
        );
      }

      const imageUrls = transformedProducts.map((product) => product.image);
      await preloadImages(imageUrls);
      setImagesLoaded(true);
      setProductsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      showNotification("error", "خطأ", "فشل في تحميل المنتجات", {
        timer: 2000,
      });
      setProducts([]);
      setFilteredProducts([]);
      setImagesLoaded(true);
      setProductsLoading(false);
    }
  };

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

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
    fetchCartItemsCount();
  }, []);

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

  useEffect(() => {
    if (!searchTerm) {
      if (selectedCategory === "offers") {
        const offersProducts = products.filter(
          (product) => product.itemOffer && product.itemOffer.isEnabled,
        );
        setFilteredProducts(offersProducts);
      } else {
        setFilteredProducts(products);
      }
      return;
    }

    let filtered = products;

    if (selectedCategory === "offers") {
      filtered = filtered.filter(
        (product) => product.itemOffer && product.itemOffer.isEnabled,
      );
    }

    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory]);

  const isProductInFavorites = (productId) => {
    return favorites.some((fav) => fav.menuItemId === productId);
  };

  const handleToggleFavorite = async (product, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى المفضلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3E88",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/register");
        }
      });
      return;
    }

    try {
      if (isProductInFavorites(product.id)) {
        const favoriteItem = favorites.find(
          (fav) => fav.menuItemId === product.id,
        );
        await axiosInstance.delete(`/api/Favorites/Delete/${favoriteItem.id}`);
        setFavorites(favorites.filter((fav) => fav.menuItemId !== product.id));

        showNotification(
          "success",
          "تم الإزالة",
          `تم إزالة ${product.name} من المفضلة`,
          { timer: 1500 },
        );
      } else {
        await axiosInstance.post("/api/Favorites/Add", {
          menuItemId: product.id,
        });

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);

        showNotification(
          "success",
          "تم الإضافة",
          `تم إضافة ${product.name} إلى المفضلة`,
          { timer: 1500 },
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showNotification("error", "خطأ", "فشل في تحديث المفضلة", { timer: 2000 });
    }
  };

  const handleProductDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const extractRequiredOptionsFromError = (errorDescription) => {
    if (!errorDescription) return [];

    let optionsText = errorDescription
      .replace("You must select at least one option for:", "")
      .replace(".", "")
      .trim();

    const optionsList = optionsText
      .split(/،|,|\sو\s/)
      .map((option) => option.trim())
      .filter(Boolean);

    return optionsList;
  };

  const formatOptionsForDisplay = (optionsList) => {
    if (optionsList.length === 0) return "";

    if (optionsList.length === 1) {
      return optionsList[0];
    }

    if (optionsList.length === 2) {
      return `${optionsList[0]} و ${optionsList[1]}`;
    }

    const lastOption = optionsList[optionsList.length - 1];
    const otherOptions = optionsList.slice(0, -1);
    return `${otherOptions.join("، ")} و ${lastOption}`;
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3E88",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/register");
        }
      });
      return;
    }

    if (!isProductAvailableForCart(product)) {
      showNotification(
        "error",
        "المنتج غير متوفر",
        `${product.name} غير متوفر حالياً`,
        { timer: 2000 },
      );
      return;
    }

    setAddingToCart(product.id);

    try {
      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: product.id,
        note: "",
        quantity: 1,
        options: [],
      });

      await fetchCartItemsCount();

      showNotification(
        "success",
        "تم الإضافة إلى السلة!",
        `تم إضافة ${product.name} إلى سلة التسوق`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        const missingOptionsError = errors.find(
          (err) => err.code === "MissingRequiredOptions",
        );

        if (missingOptionsError) {
          const requiredOptions = extractRequiredOptionsFromError(
            missingOptionsError.description,
          );

          if (requiredOptions.length > 0) {
            const formattedOptions = formatOptionsForDisplay(requiredOptions);

            let errorMessage;
            if (requiredOptions.length === 1) {
              errorMessage = `يجب تحديد خيار واحد على الأقل من: ${formattedOptions}. الرجاء عرض تفاصيل المنتج لتحديد الخيارات المطلوبة.`;
            } else {
              errorMessage = `يجب تحديد خيار واحد على الأقل من كل من: ${formattedOptions}. الرجاء عرض تفاصيل المنتج لتحديد الخيارات المطلوبة.`;
            }

            Swal.fire({
              icon: "warning",
              title: "خيارات مطلوبة",
              text: errorMessage,
              showConfirmButton: true,
              confirmButtonText: "عرض التفاصيل",
              showCancelButton: true,
              cancelButtonText: "إلغاء",
              confirmButtonColor: "#2E3E88",
              cancelButtonColor: "#6B7280",
            }).then((result) => {
              if (result.isConfirmed) {
                handleProductDetails(product);
              }
            });
            setAddingToCart(null);
            return;
          }
        }
      }

      showNotification("error", "خطأ", "فشل في إضافة المنتج إلى السلة", {
        timer: 2000,
      });
    } finally {
      setTimeout(() => {
        setAddingToCart(null);
      }, 500);
    }
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleManageOffers = async (product, e) => {
    e.stopPropagation();

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
    }
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation();

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItems/Delete/${productId}`);

          setProducts(products.filter((product) => product.id !== productId));
          showNotification("success", "تم الحذف!", "تم حذف المنتج بنجاح", {
            timer: 2000,
          });
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          showNotification("error", "خطأ", "فشل في حذف المنتج", {
            timer: 2000,
          });
        }
      }
    });
  };

  const isProductActive = (product) => {
    return product.isActive && product.isAvailable;
  };

  const handleToggleActive = async (productId, e) => {
    e.stopPropagation();

    const productToToggle = products.find((p) => p.id === productId);
    if (productToToggle && productToToggle.categoryId) {
      const category = categories.find(
        (cat) => cat.originalId === productToToggle.categoryId,
      );
      if (category && !category.isActive) {
        showNotification(
          "error",
          "لا يمكن التعديل",
          "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
          { timer: 2000 },
        );
        return;
      }
    }

    try {
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${productId}`,
      );

      fetchProducts();

      const product = products.find((p) => p.id === productId);
      const isCurrentlyActive = isProductActive(product);
      showNotification(
        "success",
        "تم تحديث الحالة!",
        `تم ${isCurrentlyActive ? "تعطيل" : "تفعيل"} المنتج`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      showNotification("error", "خطأ", "فشل في تحديث حالة المنتج", {
        timer: 2000,
      });
    }
  };

  const handleAddNewProduct = () => {
    navigate("/products/new");
  };

  const handleEditCategory = (category) => {
    if (category.id === "all" || category.id === "offers") {
      showNotification(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل هذا التصنيف",
        { timer: 2000 },
      );
      return;
    }
    setEditingCategory({ ...category });
    setNewCategory({ name: "", isActive: true });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      showNotification("error", "خطأ", "اسم التصنيف مطلوب", { timer: 2000 });
      return;
    }

    if (editingCategory.id === "all" || editingCategory.id === "offers") {
      showNotification(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل هذا التصنيف",
        { timer: 2000 },
      );
      return;
    }

    try {
      await axiosInstance.put(
        `/api/Categories/Update/${editingCategory.originalId}`,
        {
          name: editingCategory.name,
          isActive: editingCategory.isActive,
        },
      );

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...editingCategory } : cat,
        ),
      );

      setEditingCategory(null);
      showNotification("success", "تم التحديث!", "تم تحديث التصنيف بنجاح", {
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      showNotification("error", "خطأ", "فشل في تحديث التصنيف", { timer: 2000 });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      showNotification("error", "خطأ", "اسم التصنيف مطلوب", { timer: 2000 });
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

      showNotification(
        "success",
        "تم الإضافة!",
        "تم إضافة التصنيف الجديد بنجاح",
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification("error", "خطأ", "فشل في إضافة التصنيف", { timer: 2000 });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (categoryId === "all" || categoryId === "offers") {
      showNotification("error", "لا يمكن الحذف", "لا يمكن حذف هذا التصنيف", {
        timer: 2000,
      });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    const productsInCategory = products.filter(
      (product) => product.categoryId === category.originalId,
    );

    if (productsInCategory.length > 0) {
      Swal.fire({
        title: "لا يمكن حذف التصنيف",
        text: `يوجد ${productsInCategory.length} منتج في هذا التصنيف. يرجى إعادة تعيين أو حذف هذه المنتجات أولاً.`,
        icon: "warning",
        confirmButtonColor: "#2E3E88",
        confirmButtonText: "حسناً",
      });
      return;
    }

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3E88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(
            `/api/Categories/Delete/${category.originalId}`,
          );

          setCategories(categories.filter((cat) => cat.id !== categoryId));

          if (selectedCategory === categoryId) {
            setSelectedCategory("all");
          }

          showNotification("success", "تم الحذف!", "تم حذف التصنيف بنجاح", {
            timer: 2000,
          });
        } catch (error) {
          console.error("Error deleting category:", error);
          showNotification("error", "خطأ", "فشل في حذف التصنيف", {
            timer: 2000,
          });
        }
      }
    });
  };

  const handleToggleCategoryActive = async (categoryId, e) => {
    e.stopPropagation();

    if (categoryId === "all" || categoryId === "offers") {
      showNotification(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل هذا التصنيف",
        { timer: 2000 },
      );
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    try {
      await axiosInstance.put(
        `/api/Categories/ChangeCategoryActiveStatus/${category.originalId}`,
      );

      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat,
        ),
      );

      showNotification(
        "success",
        "تم تحديث الحالة!",
        `تم ${category.isActive ? "تعطيل" : "تفعيل"} التصنيف`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error updating category status:", error);
      showNotification("error", "خطأ", "فشل في تحديث حالة التصنيف", {
        timer: 2000,
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
          className="font-bold text-base sm:text-lg"
          style={{ color: "#2E3E88" }}
        >
          السعر حسب الطلب
        </div>
      );
    }

    if (product.itemOffer && product.itemOffer.isEnabled) {
      return (
        <>
          <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm line-through">
            {product.price} ج.م
          </div>
          <div
            className="font-bold text-base sm:text-lg"
            style={{ color: "#2E3E88" }}
          >
            {product.finalPrice.toFixed(2)} ج.م
          </div>
        </>
      );
    }

    return (
      <div
        className="font-bold text-base sm:text-lg"
        style={{ color: "#2E3E88" }}
      >
        {product.price} ج.م
      </div>
    );
  };

  const formatPriceDisplayMobile = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div className="font-bold text-sm" style={{ color: "#2E3E88" }}>
          السعر حسب الطلب
        </div>
      );
    }

    if (product.itemOffer && product.itemOffer.isEnabled) {
      return (
        <>
          <div className="text-gray-400 dark:text-gray-500 text-xs line-through">
            {product.price} ج.م
          </div>
          <div className="font-bold text-sm" style={{ color: "#2E3E88" }}>
            {product.finalPrice.toFixed(2)} ج.م
          </div>
        </>
      );
    }

    return (
      <div className="font-bold text-sm" style={{ color: "#2E3E88" }}>
        {product.price} ج.م
      </div>
    );
  };

  const isProductCategoryDisabled = (product) => {
    if (!product.categoryId) {
      return false;
    }

    const category = categories.find(
      (cat) => cat.originalId === product.categoryId,
    );

    if (!category) {
      return true;
    }

    return !category.isActive;
  };

  const isProductAvailableForCart = (product) => {
    if (!product.isActive) {
      return false;
    }

    if (!product.isAvailable) {
      return false;
    }

    if (isProductCategoryDisabled(product)) {
      return false;
    }

    return true;
  };

  const canToggleProductActive = (product) => {
    if (!product.categoryId) return true;

    const category = categories.find(
      (cat) => cat.originalId === product.categoryId,
    );
    return !category || category.isActive;
  };

  const checkLogin = (action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: `يجب تسجيل الدخول للوصول إلى ${action}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3E88",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/register");
        }
      });
      return false;
    }
    return true;
  };

  const handleNavigateToFavorites = () => {
    if (!checkLogin("صفحة المفضلة")) return;
    navigate("/favorites");
  };

  const handleNavigateToCart = () => {
    if (!checkLogin("سلة التسوق")) return;
    navigate("/cart");
  };

  const handleCategorySelectFromFooter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setTimeout(() => {
      scrollToCategories();
    }, 100);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      scrollToCategories();
    }, 100);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        scrollToCategories();
      }, 100);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        scrollToCategories();
      }, 100);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  // دوال للتحكم في الأسهم
  const scrollCategoriesLeft = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollCategoriesRight = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleCategorySelectedFromFooter = (event) => {
      const { categoryId, fromHomePage } = event.detail;
      if (fromHomePage) {
        handleCategorySelectFromFooter(categoryId);
      } else {
        handleCategorySelectFromFooter(categoryId);
      }
    };

    window.addEventListener(
      "categorySelectedFromFooter",
      handleCategorySelectedFromFooter,
    );

    return () => {
      window.removeEventListener(
        "categorySelectedFromFooter",
        handleCategorySelectedFromFooter,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToCategories]);

  const isAdmin = userRoles.includes("Admin");
  const isRestaurant = userRoles.includes("Restaurant");
  const isBranch = userRoles.includes("Branch");

  const canShowAdminButtons = isAdmin || isRestaurant;
  const canShowToggleButton = isAdmin || isRestaurant || isBranch;

  // دالة للحصول على اسم الزر من النوع
  const getButtonLabel = (buttonType) => {
    switch (buttonType) {
      case "cart":
        return `سلة التسوق (${cartItemsCount})`;
      case "favorites":
        return `المفضلة (${favorites.length})`;
      case "addProduct":
        return "إضافة منتج جديد";
      case "categories":
        return "إدارة التصنيفات";
      default:
        return "";
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
            className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p className="text-lg font-semibold" style={{ color: "#2E3E88" }}>
            جارٍ تحميل المحتوى...
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
      <div ref={topOfPageRef}></div>

      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
        <HeroSwipper />
      </div>

      {/* Categories Section - تابس أفقية مع أسهم */}
      <div
        ref={categoriesSectionRef}
        className="relative max-w-7xl mx-auto mt-2 sm:mt-3 px-2 sm:px-4 z-20"
      >
        <div
          className="bg-white rounded-2xl p-1 shadow-xl relative w-full"
          style={{
            boxShadow: "0 10px 30px rgba(46, 62, 136, 0.1)",
            background: `linear-gradient(135deg, #ffffff, #f0f8ff)`,
          }}
        >
          {/* السهم الأيسر - يشير لليسار */}
          <button
            onClick={scrollCategoriesLeft}
            className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 sm:p-2 z-10 shadow-lg transition-all duration-300 hover:scale-110 hidden sm:block"
            style={{
              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
              color: "white",
              boxShadow: "0 4px 12px rgba(46, 62, 136, 0.2)",
            }}
            aria-label="التقدم يساراً"
          >
            <FaChevronLeft size={12} className="sm:w-3 sm:h-3" />
          </button>

          {/* السهم الأيمن - يشير لليمين */}
          <button
            onClick={scrollCategoriesRight}
            className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 sm:p-2 z-10 shadow-lg transition-all duration-300 hover:scale-110 hidden sm:block"
            style={{
              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
              color: "white",
              boxShadow: "0 4px 12px rgba(46, 62, 136, 0.2)",
            }}
            aria-label="التقدم يميناً"
          >
            <FaChevronRight size={12} className="sm:w-3 sm:h-3" />
          </button>

          <div
            ref={categoriesContainerRef}
            className="flex overflow-x-auto scrollbar-hide px-6 sm:px-8 md:px-10 py-2 sm:py-3 cursor-grab active:cursor-grabbing select-none"
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
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                  setTimeout(() => {
                    scrollToCategories();
                  }, 50);
                }}
                className="flex-shrink-0 relative group mx-1 sm:mx-2"
                style={{ direction: "rtl" }}
              >
                <div
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "scale-105"
                      : "hover:scale-105"
                  }`}
                  style={{
                    background:
                      selectedCategory === category.id
                        ? `linear-gradient(135deg, #2E3E88, #32B9CC)`
                        : `linear-gradient(135deg, #ffffff, #f0f8ff)`,
                    boxShadow:
                      selectedCategory === category.id
                        ? `0 8px 20px rgba(46, 62, 136, 0.3)`
                        : `0 4px 12px rgba(46, 62, 136, 0.1)`,
                    border:
                      selectedCategory === category.id
                        ? "none"
                        : `1px solid #32B9CC20`,
                  }}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center ${
                      selectedCategory === category.id
                        ? "bg-white/20"
                        : "bg-gradient-to-br from-white to-gray-50"
                    }`}
                  >
                    {category.id === "offers" ? (
                      <FaFire
                        className={`text-xs ${
                          selectedCategory === category.id ? "text-white" : ""
                        }`}
                        style={
                          selectedCategory === category.id
                            ? {}
                            : { color: "#2E3E88" }
                        }
                      />
                    ) : category.id === "all" ? (
                      <FaHome
                        className={`text-xs ${
                          selectedCategory === category.id ? "text-white" : ""
                        }`}
                        style={
                          selectedCategory === category.id
                            ? {}
                            : { color: "#2E3E88" }
                        }
                      />
                    ) : (
                      <FaTag
                        className={`text-xs ${
                          selectedCategory === category.id ? "text-white" : ""
                        }`}
                        style={
                          selectedCategory === category.id
                            ? {}
                            : { color: "#2E3E88" }
                        }
                      />
                    )}
                  </div>

                  <span
                    className={`font-medium text-xs sm:text-sm whitespace-nowrap ${
                      selectedCategory === category.id ? "text-white" : ""
                    }`}
                    style={
                      selectedCategory !== category.id
                        ? { color: "#2E3E88" }
                        : {}
                    }
                  >
                    {category.name}
                  </span>

                  {category.id !== "all" &&
                    category.id !== "offers" &&
                    !category.isActive && (
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
                    )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative z-10 w-full mt-2 sm:mt-4">
        {productsLoading || !imagesLoaded ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
            <ProductSkeleton count={pageSize} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
            <div
              className="text-center py-8 sm:py-12 md:py-16 rounded-3xl mx-2 sm:mx-4 shadow-xl"
              style={{
                background: `linear-gradient(135deg, #ffffff, #f0f8ff)`,
                boxShadow: "0 20px 40px rgba(46, 62, 136, 0.1)",
              }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, #2E3E8820, #32B9CC20)`,
                }}
              >
                <FaBoxOpen
                  className="text-2xl sm:text-3xl md:text-4xl"
                  style={{ color: "#2E3E88" }}
                />
              </div>
              <h3
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3"
                style={{ color: "#2E3E88" }}
              >
                {selectedCategory === "offers"
                  ? "لا توجد عروض حالياً"
                  : "لم يتم العثور على منتجات"}
              </h3>
              <p
                className="mb-4 sm:mb-6 max-w-md mx-auto text-xs sm:text-sm"
                style={{ color: "#32B9CC" }}
              >
                {selectedCategory === "offers"
                  ? "لا توجد منتجات تحتوي على عروض حالياً"
                  : "حاول تعديل معايير البحث أو تصفح فئات أخرى"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setCurrentPage(1);
                  setTimeout(() => {
                    scrollToCategories();
                  }, 50);
                }}
                className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-xs sm:text-sm md:text-base"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                  color: "white",
                  boxShadow: `0 10px 25px #2E3E8830`,
                }}
              >
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-6 relative">
            {/* Products Grid Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2">
              {/* العنوان وعدد المنتجات – ناحية الشمال */}
              <div>
                <h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold"
                  style={{ color: "#2E3E88" }}
                >
                  {selectedCategory === "all"
                    ? "جميع المنتجات"
                    : selectedCategory === "offers"
                      ? "العروض الحصرية"
                      : categories.find((c) => c.id === selectedCategory)?.name}
                </h2>

                <p
                  className="mt-1 sm:mt-2 text-xs sm:text-sm"
                  style={{ color: "#32B9CC" }}
                >
                  {filteredProducts.length} منتج متاح
                </p>
              </div>

              {/* زر إضافة منتج – ناحية اليمين */}
              {canShowAdminButtons && (
                <button
                  onClick={handleAddNewProduct}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm whitespace-nowrap"
                  style={{
                    background: `linear-gradient(135deg, #32B9CC, #2E3E88)`,
                    color: "white",
                  }}
                >
                  <FaPlus className="text-xs sm:text-sm" />
                  <span>إضافة منتج</span>
                </button>
              )}
            </div>

            <div
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
              style={{ direction: "rtl" }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={`${product.id}-${currentPage}`}
                  className={`w-full relative ${
                    !isProductAvailableForCart(product) ? "opacity-70" : ""
                  }`}
                >
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    <div
                      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer ${
                        isProductCategoryDisabled(product) ? "opacity-80" : ""
                      }`}
                      onClick={(e) => {
                        const isButtonClick =
                          e.target.closest("button") ||
                          e.target.closest(".no-product-details");

                        if (!isButtonClick) {
                          handleProductDetails(product);
                        }
                      }}
                    >
                      {product.itemOffer && product.itemOffer.isEnabled && (
                        <div className="absolute top-2 right-2 z-10">
                          <div
                            className="px-2 py-1 rounded-xl shadow-2xl flex items-center gap-1 text-white font-bold"
                            style={{
                              background: `linear-gradient(135deg, #FF6B6B, #FFA726)`,
                              boxShadow: "0 5px 15px rgba(255, 107, 107, 0.4)",
                            }}
                          >
                            <FaBolt className="text-xs" />
                            <span className="text-xs whitespace-nowrap">
                              {formatOfferText(product.itemOffer)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Admin/Restaurant/Branch Buttons */}
                      {(canShowAdminButtons || canShowToggleButton) && (
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                          {/* Toggle Active Button */}
                          {canShowToggleButton && (
                            <button
                              onClick={(e) => {
                                if (!canToggleProductActive(product)) {
                                  showNotification(
                                    "error",
                                    "لا يمكن التعديل",
                                    "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
                                    { timer: 2000 },
                                  );
                                  return;
                                }
                                handleToggleActive(product.id, e);
                              }}
                              disabled={!canToggleProductActive(product)}
                              className={`p-1.5 rounded-lg shadow-lg text-xs no-product-details ${
                                isProductActive(product)
                                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                  : "bg-green-500 text-white hover:bg-green-600"
                              } ${
                                !canToggleProductActive(product)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {isProductActive(product) ? (
                                <FaTimesCircle size={10} />
                              ) : (
                                <FaCheckCircle size={10} />
                              )}
                            </button>
                          )}

                          {/* Admin/Restaurant Only Buttons */}
                          {canShowAdminButtons && (
                            <>
                              <button
                                onClick={(e) => handleEditProduct(product, e)}
                                className="bg-blue-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-blue-600 no-product-details"
                              >
                                <FaEdit size={10} />
                              </button>
                              <button
                                onClick={(e) => handleManageOffers(product, e)}
                                className="bg-purple-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-purple-600 no-product-details"
                              >
                                <FaPercent size={10} />
                              </button>
                              <button
                                onClick={(e) =>
                                  handleDeleteProduct(product.id, e)
                                }
                                className="bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-red-600 no-product-details"
                              >
                                <FaTrash size={10} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <div className="p-3">
                        <div className="flex">
                          <div className="w-28 flex-shrink-0 ml-3">
                            <div className="relative h-32 w-full overflow-hidden rounded-xl">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-bold text-sm text-gray-800 dark:text-gray-200 hover:text-[#2E3E88] line-clamp-1 mb-2"
                              dir={isArabic(product.name) ? "rtl" : "ltr"}
                            >
                              {product.name}
                            </h3>

                            <p
                              className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1 leading-relaxed"
                              dir={
                                isArabic(product.description) ? "rtl" : "ltr"
                              }
                            >
                              {product.description}
                            </p>

                            <div className="flex items-center gap-1 mb-3">
                              {formatPriceDisplayMobile(product)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 pb-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              if (isProductAvailableForCart(product)) {
                                handleAddToCart(product, e);
                              }
                            }}
                            disabled={
                              !isProductAvailableForCart(product) ||
                              addingToCart === product.id
                            }
                            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-xs no-product-details ${
                              addingToCart === product.id
                                ? "bg-gray-500 text-white cursor-wait"
                                : isProductAvailableForCart(product)
                                  ? "hover:scale-105"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            style={
                              isProductAvailableForCart(product) &&
                              addingToCart !== product.id
                                ? {
                                    background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                                    color: "white",
                                  }
                                : {}
                            }
                          >
                            {addingToCart === product.id ? (
                              <>
                                <div className="animate-spin rounded-full h-2.5 w-2.5 border-t-2 border-b-2 border-white"></div>
                                <span>يتم الإضافة...</span>
                              </>
                            ) : (
                              <>
                                <FaShoppingCart className="w-3 h-3" />
                                <span>
                                  {!isProductAvailableForCart(product)
                                    ? "غير متوفر"
                                    : "أضف إلى السلة"}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductDetails(product);
                            }}
                            className="flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-xs no-product-details"
                            style={{
                              background: `#32B9CC15`,
                              color: "#32B9CC",
                            }}
                          >
                            <FaEye className="w-3 h-3" />
                            <span>التفاصيل</span>
                          </button>

                          <button
                            onClick={(e) => handleToggleFavorite(product, e)}
                            className={`p-2.5 rounded-xl font-semibold flex items-center justify-center text-xs no-product-details ${
                              isProductInFavorites(product.id)
                                ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                : "text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                          >
                            {isProductInFavorites(product.id) ? (
                              <FaHeart size={14} />
                            ) : (
                              <FaRegHeart size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:block">
                    <div
                      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 transform hover:-translate-y-2 h-full ${
                        !isProductAvailableForCart(product) ? "opacity-70" : ""
                      }`}
                      style={{
                        background: `linear-gradient(145deg, #ffffff, #f0f8ff)`,
                        boxShadow: "0 15px 35px rgba(46, 62, 136, 0.1)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={(e) => {
                        const isButtonClick =
                          e.target.closest("button") ||
                          e.target.closest(".no-product-details");

                        if (!isButtonClick) {
                          handleProductDetails(product);
                        }
                      }}
                    >
                      {/* Offer Badge */}
                      {product.itemOffer && product.itemOffer.isEnabled && (
                        <div className="absolute top-4 right-4 z-10">
                          <div
                            className="px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-white font-bold"
                            style={{
                              background: `linear-gradient(135deg, #FF6B6B, #FFA726)`,
                              boxShadow: "0 5px 15px rgba(255, 107, 107, 0.4)",
                            }}
                          >
                            <FaBolt />
                            <span className="text-xs whitespace-nowrap">
                              {formatOfferText(product.itemOffer)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Admin Buttons Overlay */}
                        {(canShowAdminButtons || canShowToggleButton) && (
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                            {/* Toggle Active Button */}
                            {canShowToggleButton && (
                              <button
                                onClick={(e) => {
                                  if (!canToggleProductActive(product)) {
                                    showNotification(
                                      "error",
                                      "لا يمكن التعديل",
                                      "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
                                      { timer: 2000 },
                                    );
                                    return;
                                  }
                                  handleToggleActive(product.id, e);
                                }}
                                disabled={!canToggleProductActive(product)}
                                className={`p-2 rounded-full shadow-lg text-xs no-product-details transition-all ${
                                  isProductActive(product)
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                } ${
                                  !canToggleProductActive(product)
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                title={
                                  isProductActive(product) ? "تعطيل" : "تفعيل"
                                }
                              >
                                {isProductActive(product) ? (
                                  <FaTimesCircle size={12} />
                                ) : (
                                  <FaCheckCircle size={12} />
                                )}
                              </button>
                            )}

                            {/* Admin/Restaurant Only Buttons */}
                            {canShowAdminButtons && (
                              <>
                                <button
                                  onClick={(e) => handleEditProduct(product, e)}
                                  className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 no-product-details transition-all"
                                  title="تعديل"
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleManageOffers(product, e)
                                  }
                                  className="bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 no-product-details transition-all"
                                  title="العروض"
                                >
                                  <FaPercent size={12} />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleDeleteProduct(product.id, e)
                                  }
                                  className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 no-product-details transition-all"
                                  title="حذف"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Category Tag */}
                        <div className="mb-2">
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: `#2E3E8815`,
                              color: "#2E3E88",
                            }}
                          >
                            {product.category}
                          </span>
                        </div>

                        {/* Product Name */}
                        <h3
                          className="font-bold text-base mb-1 line-clamp-1 group-hover:text-opacity-80 transition-colors"
                          dir={isArabic(product.name) ? "rtl" : "ltr"}
                          style={{ color: "#2E3E88" }}
                        >
                          {product.name}
                        </h3>

                        {/* Product Description */}
                        <p
                          className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed flex-1"
                          dir={isArabic(product.description) ? "rtl" : "ltr"}
                        >
                          {product.description}
                        </p>

                        {/* Price & Actions */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {formatPriceDisplay(product)}
                            </div>

                            <button
                              onClick={(e) => handleToggleFavorite(product, e)}
                              className={`p-2 rounded-full no-product-details transition-all hover:scale-110 ${
                                isProductInFavorites(product.id)
                                  ? "text-red-500 bg-red-50"
                                  : "text-gray-400 bg-gray-100 hover:text-red-500"
                              }`}
                            >
                              {isProductInFavorites(product.id) ? (
                                <FaHeart size={18} />
                              ) : (
                                <FaRegHeart size={18} />
                              )}
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                if (isProductAvailableForCart(product)) {
                                  handleAddToCart(product, e);
                                }
                              }}
                              disabled={
                                !isProductAvailableForCart(product) ||
                                addingToCart === product.id
                              }
                              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs no-product-details transition-all ${
                                addingToCart === product.id
                                  ? "bg-gray-500 text-white cursor-wait"
                                  : isProductAvailableForCart(product)
                                    ? "hover:scale-105 active:scale-95"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                              style={
                                isProductAvailableForCart(product) &&
                                addingToCart !== product.id
                                  ? {
                                      background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                                      color: "white",
                                      boxShadow: `0 5px 15px #2E3E8830`,
                                    }
                                  : {}
                              }
                            >
                              {addingToCart === product.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                  <span>يتم الإضافة...</span>
                                </>
                              ) : (
                                <>
                                  <FaShoppingCart className="w-4 h-4" />
                                  <span>
                                    {!isProductAvailableForCart(product)
                                      ? "غير متوفر"
                                      : "أضف إلى السلة"}
                                  </span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductDetails(product);
                              }}
                              className="w-12 flex items-center justify-center rounded-xl font-bold no-product-details transition-all hover:scale-105 active:scale-95"
                              style={{
                                background: `#32B9CC15`,
                                color: "#32B9CC",
                              }}
                              title="عرض التفاصيل"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col items-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 sm:p-3 rounded-xl transition-all ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 active:scale-95"
                    }`}
                    style={{
                      background:
                        currentPage === 1
                          ? `#2E3E8810`
                          : `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      color: currentPage === 1 ? `#2E3E8850` : "white",
                      boxShadow:
                        currentPage === 1 ? "none" : `0 5px 15px #2E3E8830`,
                    }}
                  >
                    <FaChevronRight className="text-sm sm:text-base" />
                  </button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {getPaginationNumbers().map((pageNum, index) => (
                      <React.Fragment key={index}>
                        {pageNum === "..." ? (
                          <span
                            className="px-2 sm:px-3 md:px-4 py-1 sm:py-2"
                            style={{ color: "#32B9CC" }}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm ${
                              currentPage === pageNum
                                ? "text-white shadow-lg"
                                : "hover:shadow-md"
                            }`}
                            style={
                              currentPage === pageNum
                                ? {
                                    background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                                    boxShadow: `0 5px 15px #2E3E8840`,
                                  }
                                : {
                                    color: "#2E3E88",
                                    background: `#2E3E8810`,
                                  }
                            }
                          >
                            {pageNum}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 sm:p-3 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 active:scale-95"
                    }`}
                    style={{
                      background:
                        currentPage === totalPages
                          ? `#2E3E8810`
                          : `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      color: currentPage === totalPages ? `#2E3E8850` : "white",
                      boxShadow:
                        currentPage === totalPages
                          ? "none"
                          : `0 5px 15px #2E3E8830`,
                    }}
                  >
                    <FaChevronLeft className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Buttons - مع إستجابة للشاشات الصغيرة */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 flex flex-col gap-3 sm:gap-4 z-40">
        {/* Cart Button */}
        <div className="relative">
          <button
            onClick={handleNavigateToCart}
            onMouseEnter={() => setHoveredButton("cart")}
            onMouseLeave={() => setHoveredButton(null)}
            className={`relative rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 no-product-details ${
              cartItemsCount === 0 ? "opacity-90" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
              boxShadow: `0 10px 30px #2E3E8840`,
            }}
          >
            <div className="relative">
              <FaShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              {cartItemsCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-white rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold"
                  style={{ color: "#2E3E88" }}
                >
                  {cartItemsCount}
                </span>
              )}
            </div>
          </button>

          {/* Tooltip for Cart */}
          {hoveredButton === "cart" && (
            <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 hidden sm:block">
              <div className="relative">
                <div
                  className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-2xl whitespace-nowrap text-xs sm:text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                    boxShadow: `0 10px 25px #2E3E8830`,
                  }}
                >
                  {getButtonLabel("cart")}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3"
                      style={{
                        borderRight: `6px solid #2E3E88`,
                        borderTop: "6px solid transparent",
                        borderBottom: "6px solid transparent",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Favorites Button */}
        <div className="relative">
          <button
            onClick={handleNavigateToFavorites}
            onMouseEnter={() => setHoveredButton("favorites")}
            onMouseLeave={() => setHoveredButton(null)}
            className="relative rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 no-product-details"
            style={{
              background: "linear-gradient(135deg, #FF6B6B, #FF3366)",
              boxShadow: "0 10px 30px rgba(255, 107, 107, 0.4)",
            }}
          >
            <div className="relative flex items-center justify-center">
              <FaHeart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />

              {favorites.length > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-white rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold"
                  style={{ color: "#FF3366" }}
                >
                  {favorites.length}
                </span>
              )}
            </div>
          </button>

          {/* Tooltip for Favorites */}
          {hoveredButton === "favorites" && (
            <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 hidden sm:block">
              <div className="relative">
                <div
                  className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-2xl whitespace-nowrap text-xs sm:text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #FF6B6B, #FF3366)",
                    boxShadow: "0 10px 25px rgba(255, 107, 107, 0.4)",
                  }}
                >
                  {getButtonLabel("favorites")}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3"
                      style={{
                        borderRight: "6px solid #FF3366",
                        borderTop: "6px solid transparent",
                        borderBottom: "6px solid transparent",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Buttons */}
        {canShowAdminButtons && (
          <>
            {/* Add Product Button */}
            <div className="relative">
              <button
                onClick={handleAddNewProduct}
                onMouseEnter={() => setHoveredButton("addProduct")}
                onMouseLeave={() => setHoveredButton(null)}
                className="relative rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 no-product-details"
                style={{
                  background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                  boxShadow: "0 10px 30px rgba(76, 175, 80, 0.4)",
                }}
              >
                <FaPlus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Tooltip for Add Product */}
              {hoveredButton === "addProduct" && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 hidden sm:block">
                  <div className="relative">
                    <div
                      className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-2xl whitespace-nowrap text-xs sm:text-sm font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                        boxShadow: "0 10px 25px rgba(76, 175, 80, 0.4)",
                      }}
                    >
                      {getButtonLabel("addProduct")}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                        <div
                          className="w-2 h-2 sm:w-3 sm:h-3"
                          style={{
                            borderRight: "6px solid #2E7D32",
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Manager Button */}
            <div className="relative">
              <button
                onClick={handleOpenCategoriesManager}
                onMouseEnter={() => setHoveredButton("categories")}
                onMouseLeave={() => setHoveredButton(null)}
                className="relative rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 no-product-details"
                style={{
                  background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                  boxShadow: "0 10px 30px rgba(156, 39, 176, 0.4)",
                }}
              >
                <FaList className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Tooltip for Categories Manager */}
              {hoveredButton === "categories" && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 hidden sm:block">
                  <div className="relative">
                    <div
                      className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-2xl whitespace-nowrap text-xs sm:text-sm font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                        boxShadow: "0 10px 25px rgba(156, 39, 176, 0.4)",
                      }}
                    >
                      {getButtonLabel("categories")}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                        <div
                          className="w-2 h-2 sm:w-3 sm:h-3"
                          style={{
                            borderRight: "6px solid #7B1FA2",
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Categories Manager Modal - تصميم جديد مع إستجابة */}
      {showCategoriesManager && canShowAdminButtons && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleCloseCategoriesManager}
          />

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            onClick={handleCloseCategoriesManager}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
              style={{
                background: `linear-gradient(135deg, #ffffff, #f0f8ff)`,
                boxShadow: "0 40px 80px rgba(46, 62, 136, 0.2)",
              }}
            >
              {/* Modal Header */}
              <div
                className="p-4 sm:p-6 relative text-white"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="bg-white/20 p-2 sm:p-3 rounded-2xl backdrop-blur-sm">
                      <FaLayerGroup className="text-lg sm:text-xl md:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                        إدارة التصنيفات
                      </h2>
                      <p className="text-white/80 mt-1 text-xs sm:text-sm">
                        إضافة، تعديل وحذف التصنيفات
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseCategoriesManager}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 no-product-details transition-all"
                  >
                    <FaTimes size={16} className="sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {/* Add New Category */}
                <div
                  className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
                  style={{
                    background: `linear-gradient(135deg, #2E3E8805, #32B9CC05)`,
                    border: `2px dashed #2E3E8820`,
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div
                      className="p-2 sm:p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      }}
                    >
                      <FaPlus className="text-white text-base sm:text-lg" />
                    </div>
                    <h3
                      className="text-base sm:text-lg md:text-xl font-bold"
                      style={{ color: "#2E3E88" }}
                    >
                      إضافة تصنيف جديد
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2">
                      <label
                        className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                        style={{ color: "#2E3E88" }}
                      >
                        اسم التصنيف
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                          }
                          placeholder="أدخل اسم التصنيف الجديد..."
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 focus:ring-3 focus:outline-none text-right text-sm sm:text-base font-medium transition-all"
                          style={{
                            borderColor: `#32B9CC30`,
                            background: "white",
                            color: "#2E3E88",
                            focusBorderColor: "#2E3E88",
                            focusRingColor: `#2E3E8820`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <label
                        className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                        style={{ color: "#2E3E88" }}
                      >
                        حالة التصنيف
                      </label>
                      <div className="flex items-center gap-3 sm:gap-4">
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
                              className={`block w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-all duration-300 ${
                                newCategory.isActive
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <div
                              className={`absolute right-1 top-1 bg-white w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-lg transition-all duration-300 ${
                                newCategory.isActive
                                  ? "transform translate-x-[-1.5rem] sm:translate-x-[-1.75rem]"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                        <span
                          className={`font-semibold text-sm sm:text-base md:text-lg ${
                            newCategory.isActive
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {newCategory.isActive ? "مفعل" : "معطل"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start mt-4 sm:mt-6">
                    <button
                      onClick={handleAddCategory}
                      className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl font-bold shadow-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base no-product-details transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                        color: "white",
                        boxShadow: `0 10px 25px #2E3E8830`,
                      }}
                    >
                      <FaPlus />
                      إضافة تصنيف جديد
                    </button>
                  </div>
                </div>

                {/* Categories List */}
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div
                      className="p-2 sm:p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                      }}
                    >
                      <FaList className="text-white text-base sm:text-lg" />
                    </div>
                    <h3
                      className="text-base sm:text-lg md:text-xl font-bold"
                      style={{ color: "#2E3E88" }}
                    >
                      التصنيفات الحالية ({categories.length - 2})
                    </h3>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`rounded-2xl p-4 sm:p-6 transition-all ${
                          category.id === "all" || category.id === "offers"
                            ? "opacity-80"
                            : "hover:shadow-xl"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, #ffffff, #f0f8ff)`,
                          boxShadow: "0 10px 30px rgba(46, 62, 136, 0.1)",
                          border:
                            category.id === "all" || category.id === "offers"
                              ? `2px solid #2E3E8820`
                              : `2px solid #32B9CC20`,
                        }}
                      >
                        {editingCategory &&
                        editingCategory.id === category.id ? (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                              <div className="lg:col-span-2">
                                <label
                                  className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                                  style={{ color: "#2E3E88" }}
                                >
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
                                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 focus:ring-3 focus:outline-none text-right text-sm sm:text-base font-medium transition-all"
                                  style={{
                                    borderColor: `#32B9CC30`,
                                    background: "white",
                                    color: "#2E3E88",
                                    focusBorderColor: "#2E3E88",
                                    focusRingColor: `#2E3E8820`,
                                  }}
                                  dir="rtl"
                                />
                              </div>

                              <div className="flex flex-col justify-center">
                                <label
                                  className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                                  style={{ color: "#2E3E88" }}
                                >
                                  حالة التصنيف
                                </label>
                                <div className="flex items-center gap-3 sm:gap-4">
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
                                        className={`block w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-all duration-300 ${
                                          editingCategory.isActive
                                            ? "bg-green-500"
                                            : "bg-gray-400"
                                        }`}
                                      ></div>
                                      <div
                                        className={`absolute right-1 top-1 bg-white w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-lg transition-all duration-300 ${
                                          editingCategory.isActive
                                            ? "transform translate-x-[-1.5rem] sm:translate-x-[-1.75rem]"
                                            : ""
                                        }`}
                                      ></div>
                                    </div>
                                  </label>
                                  <span
                                    className={`font-semibold text-sm sm:text-base md:text-lg ${
                                      editingCategory.isActive
                                        ? "text-green-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {editingCategory.isActive ? "مفعل" : "معطل"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              className="flex gap-2 sm:gap-3 justify-start pt-3 sm:pt-4 border-t"
                              style={{ borderColor: `#2E3E8820` }}
                            >
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl font-semibold no-product-details transition-all hover:scale-105 text-xs sm:text-sm"
                                style={{
                                  background: `#2E3E8810`,
                                  color: "#2E3E88",
                                }}
                              >
                                إلغاء التعديل
                              </button>
                              <button
                                onClick={handleSaveCategory}
                                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 no-product-details transition-all hover:scale-105 text-xs sm:text-sm"
                                style={{
                                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                                  color: "white",
                                  boxShadow: `0 5px 15px #2E3E8830`,
                                }}
                              >
                                <FaSave />
                                حفظ التغييرات
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div
                                className={`p-2 sm:p-3 rounded-xl ${
                                  category.id === "all"
                                    ? `bg-gradient-to-br from-blue-50 to-blue-100`
                                    : category.id === "offers"
                                      ? `bg-gradient-to-br from-orange-50 to-orange-100`
                                      : category.isActive
                                        ? `bg-gradient-to-br from-green-50 to-green-100`
                                        : `bg-gradient-to-br from-red-50 to-red-100`
                                }`}
                              >
                                {category.id === "offers" ? (
                                  <FaFire
                                    className="text-sm sm:text-base"
                                    style={{ color: "#FF9800" }}
                                  />
                                ) : (
                                  <FaTag
                                    className="text-sm sm:text-base"
                                    style={
                                      category.id === "all"
                                        ? { color: "#32B9CC" }
                                        : category.isActive
                                          ? { color: "#4CAF50" }
                                          : { color: "#F44336" }
                                    }
                                  />
                                )}
                              </div>
                              <div>
                                <h4
                                  className="font-bold text-sm sm:text-base md:text-lg mb-1"
                                  style={{ color: "#2E3E88" }}
                                >
                                  {category.name}
                                </h4>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                  {category.id === "offers" ? (
                                    <span
                                      className="font-medium"
                                      style={{ color: "#FF9800" }}
                                    >
                                      {
                                        products.filter(
                                          (p) =>
                                            p.itemOffer &&
                                            p.itemOffer.isEnabled,
                                        ).length
                                      }{" "}
                                      منتج
                                    </span>
                                  ) : (
                                    category.id !== "all" && (
                                      <>
                                        <span
                                          className={`px-2 py-1 rounded-full font-medium ${
                                            category.isActive
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {category.isActive ? "مفعل" : "معطل"}
                                        </span>
                                        <span
                                          className="text-gray-500"
                                          style={{ color: "#32B9CC" }}
                                        >
                                          {
                                            products.filter(
                                              (p) =>
                                                p.categoryId ===
                                                category.originalId,
                                            ).length
                                          }{" "}
                                          منتج
                                        </span>
                                      </>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1 sm:gap-2 justify-end mt-2 sm:mt-0">
                              {category.id !== "all" &&
                                category.id !== "offers" && (
                                  <>
                                    <button
                                      onClick={(e) =>
                                        handleToggleCategoryActive(
                                          category.id,
                                          e,
                                        )
                                      }
                                      className={`p-2 sm:p-3 rounded-xl shadow-md no-product-details transition-all hover:scale-105 ${
                                        category.isActive
                                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                          : "bg-green-500 hover:bg-green-600 text-white"
                                      }`}
                                      title={
                                        category.isActive
                                          ? "تعطيل التصنيف"
                                          : "تفعيل التصنيف"
                                      }
                                    >
                                      {category.isActive ? (
                                        <FaTimesCircle
                                          size={14}
                                          className="sm:w-4 sm:h-4"
                                        />
                                      ) : (
                                        <FaCheckCircle
                                          size={14}
                                          className="sm:w-4 sm:h-4"
                                        />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleEditCategory(category)
                                      }
                                      className="bg-blue-500 text-white p-2 sm:p-3 rounded-xl hover:bg-blue-600 shadow-md no-product-details transition-all hover:scale-105"
                                      title="تعديل التصنيف"
                                    >
                                      <FaEdit
                                        size={14}
                                        className="sm:w-4 sm:h-4"
                                      />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteCategory(category.id)
                                      }
                                      className="bg-red-500 text-white p-2 sm:p-3 rounded-xl hover:bg-red-600 shadow-md no-product-details transition-all hover:scale-105"
                                      title="حذف التصنيف"
                                    >
                                      <FaTrash
                                        size={14}
                                        className="sm:w-4 sm:h-4"
                                      />
                                    </button>
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
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
