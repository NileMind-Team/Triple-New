import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaHome,
  FaArrowRight,
  FaArrowLeft,
  FaBolt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const navigate = useNavigate();

  // Function to check if device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

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
        confirmButtonColor: "#E41E26",
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
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "12px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
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
        ...options.swalOptions,
      });
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);

        const productsPromises = response.data.map(async (favorite) => {
          try {
            const productResponse = await axiosInstance.get(
              `/api/MenuItems/Get/${favorite.menuItemId}`,
            );
            const productData = productResponse.data;

            return {
              id: productData.id,
              name: productData.name,
              category: productData.category?.name?.toLowerCase() || "meals",
              categoryId: productData.category?.id,
              price: productData.basePrice,
              isPriceBasedOnRequest: productData.basePrice === 0,
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
                  productData.menuItemSchedules?.[0]?.startTime?.substring(
                    0,
                    5,
                  ) || "",
                endTime:
                  productData.menuItemSchedules?.[0]?.endTime?.substring(
                    0,
                    5,
                  ) || "",
              },
              availabilityDays: {
                everyday: productData.isAllTime,
                specificDays:
                  productData.menuItemSchedules?.map((schedule) =>
                    getDayName(schedule.day),
                  ) || [],
              },
              menuItemSchedules: productData.menuItemSchedules || [],
              itemOffer: productData.itemOffer,
              finalPrice: productData.itemOffer
                ? productData.itemOffer.isPercentage
                  ? productData.basePrice *
                    (1 - productData.itemOffer.discountValue / 100)
                  : productData.basePrice - productData.itemOffer.discountValue
                : productData.basePrice,
              hasOffer:
                productData.itemOffer && productData.itemOffer.isEnabled,
              favoriteId: favorite.id,
            };
          } catch (error) {
            console.error(
              `Error fetching product ${favorite.menuItemId}:`,
              error,
            );
            return null;
          }
        });

        const products = await Promise.all(productsPromises);
        const validProducts = products.filter((product) => product !== null);
        setFavoriteProducts(validProducts);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showNotification("error", "خطأ", "فشل في تحميل المفضلة", {
          timer: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
    fetchCartItemsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

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
    if (e) e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
        confirmButtonColor: "#E41E26",
        cancelButtonColor: "#6B7280",
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
              confirmButtonColor: "#E41E26",
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

  const handleRemoveFromFavorites = async (favoriteId, productName) => {
    try {
      await axiosInstance.delete(`/api/Favorites/Delete/${favoriteId}`);

      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
      setFavoriteProducts(
        favoriteProducts.filter((product) => product.favoriteId !== favoriteId),
      );

      showNotification(
        "success",
        "تم الإزالة من المفضلة",
        `تم إزالة ${productName} من المفضلة`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showNotification("error", "خطأ", "فشل في إزالة المنتج من المفضلة", {
        timer: 2000,
      });
    }
  };

  const handleProductDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleContinueShopping = () => {
    navigate("/");
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
          <div className="text-gray-400 text-xs sm:text-sm line-through">
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
          <div className="text-gray-400 text-xs line-through">
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

  const isProductAvailableForCart = (product) => {
    if (!product.isActive) {
      return false;
    }

    if (!product.isAvailable) {
      return false;
    }

    return true;
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
            جارٍ تحميل المفضلة...
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
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع - حجم ثابت في جميع الشاشات */}
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
                <FaHeart className="text-white text-2xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                المفضلة
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto">
                منتجاتك المفضلة في مكان واحد
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 -mt-8 md:-mt-10 relative z-10">
        {/* Content Container */}
        <div className="w-full">
          {favoriteProducts.length === 0 ? (
            <div className="w-full">
              <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-xl">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                  <FaHeart
                    className="text-3xl md:text-4xl"
                    style={{ color: "#2E3E88" }}
                  />
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{ color: "#2E3E88" }}
                >
                  المفضلة فارغة
                </h3>
                <p
                  className="mb-6 max-w-md mx-auto text-sm md:text-base"
                  style={{ color: "#32B9CC" }}
                >
                  لم تقم بإضافة أي منتجات إلى المفضلة بعد
                </p>
                <button
                  onClick={handleContinueShopping}
                  className="px-6 py-3 md:px-8 md:py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2 mx-auto text-sm md:text-base"
                  style={{
                    background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                    color: "white",
                    boxShadow: `0 10px 25px #2E3E8830`,
                  }}
                >
                  <FaHome className="text-sm md:text-base" />
                  ابدأ التسوق الآن
                  <FaArrowRight className="text-sm md:text-base" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="sm:hidden">
                <div className="space-y-3">
                  {favoriteProducts.map((product, index) => (
                    <div
                      key={product.favoriteId}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer ${
                        !isProductAvailableForCart(product) ? "opacity-70" : ""
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

                            <h3
                              className="font-bold text-sm text-gray-800 hover:text-[#2E3E88] line-clamp-1 mb-2"
                              dir={isArabic(product.name) ? "rtl" : "ltr"}
                            >
                              {product.name}
                            </h3>

                            <p
                              className="text-gray-600 text-xs mb-2 line-clamp-1 leading-relaxed"
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
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavorites(
                                product.favoriteId,
                                product.name,
                              );
                            }}
                            className={`p-2.5 rounded-xl font-semibold flex items-center justify-center text-xs no-product-details ${"text-red-500 bg-red-50 hover:bg-red-100"}`}
                          >
                            <FaHeart size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden sm:grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {favoriteProducts.map((product, index) => (
                  <div
                    key={`${product.favoriteId}-${index}`}
                    className={`w-full relative ${
                      !isProductAvailableForCart(product) ? "opacity-70" : ""
                    }`}
                  >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromFavorites(
                                  product.favoriteId,
                                  product.name,
                                );
                              }}
                              className={`p-2 rounded-full no-product-details transition-all hover:scale-110 text-red-500 bg-red-50`}
                            >
                              <FaHeart size={18} />
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
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cart Button */}
      {cartItemsCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer hover:scale-110 group"
          onClick={() => navigate("/cart")}
        >
          <div className="relative">
            <FaShoppingCart className="text-lg md:text-xl" />
            <span className="absolute -top-2 -right-2 bg-white text-[#2E3E88] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {cartItemsCount}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;
