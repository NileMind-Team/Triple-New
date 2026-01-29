import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaFire,
  FaTag,
  FaClock,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const HeroSwipper = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoSlide, setAutoSlide] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSliderItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(
          "/api/MenuItems/GetAllSliderItems",
        );
        const sliderItems = response.data;

        const formattedSlides = sliderItems.map((item, index) => {
          let discountPrice = item.basePrice;
          let discountValue = 0;
          let discountType = "none";
          let discountText = "";

          if (item.itemOffer && item.itemOffer.isEnabled) {
            if (item.itemOffer.isPercentage) {
              discountPrice =
                item.basePrice * (1 - item.itemOffer.discountValue / 100);
              discountValue = item.itemOffer.discountValue;
              discountType = "percentage";
              discountText = `${discountValue}%`;
            } else {
              discountPrice = item.basePrice - item.itemOffer.discountValue;
              discountValue = item.itemOffer.discountValue;
              discountType = "fixed";
              discountText = `${discountValue} ج.م`;
            }
          }

          const imageUrl = item.imageUrl
            ? `https://restaurant-template.runasp.net/${item.imageUrl}`
            : "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop&crop=center";

          let preparationTime = null;
          if (
            item.preparationTimeStart !== null &&
            item.preparationTimeStart !== undefined
          ) {
            if (
              item.preparationTimeEnd !== null &&
              item.preparationTimeEnd !== undefined
            ) {
              preparationTime = `${item.preparationTimeStart}-${item.preparationTimeEnd} دقيقة`;
            } else {
              preparationTime = `${item.preparationTimeStart} دقيقة`;
            }
          }

          return {
            id: item.id,
            title: item.name,
            description: item.description || "تذوق الطعم الأصيل في كل لقمة",
            image: imageUrl,
            originalPrice: item.basePrice,
            discountPrice: discountPrice,
            discountValue: discountValue,
            discountType: discountType,
            discountText: discountText,
            preparationTime: preparationTime,
            category: item.category?.name || "عام",
            ctaText: "اطلب الآن",
            hasOffer: item.itemOffer && item.itemOffer.isEnabled,
            productData: item,
            rating: 4.5,
            reviews: 128,
          };
        });

        setSlides(formattedSlides);
      } catch (error) {
        console.error("Error fetching slider items:", error);
        setError("فشل في تحميل العروض الخاصة");

        Swal.fire({
          title: "حدث خطأ",
          html: "تعذر تحميل العروض الخاصة",
          icon: "error",
          confirmButtonText: "حاول مرة أخرى",
          timer: 2000,
          showConfirmButton: false,
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSliderItems();
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (!autoSlide || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSlide, slides.length]);

  const handleOrderNow = (slide) => {
    navigate(`/product/${slide.id}`, { state: { product: slide.productData } });
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative w-full pt-6 pr-4 pl-4">
        <div className="h-[320px] overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-[#f0f8ff] via-white to-[#e0f7fa] flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-3"
              style={{
                borderTopColor: "#2E3E88",
                borderRightColor: "#32B9CC",
                borderBottomColor: "#2E3E88",
                borderLeftColor: "transparent",
              }}
            ></div>
            <p className="text-base font-semibold" style={{ color: "#2E3E88" }}>
              جارٍ تحميل العروض المميزة...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full pt-6 pr-4 pl-4">
        <div className="h-[320px] overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-[#f0f8ff] via-white to-[#e0f7fa] flex items-center justify-center">
          <div className="text-center px-4">
            <div
              className="p-4 rounded-2xl inline-block mb-3"
              style={{
                background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              }}
            >
              <FaFire className="text-white text-3xl mx-auto" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#2E3E88" }}>
              {error}
            </h3>
            <p className="text-sm mb-4" style={{ color: "#32B9CC" }}>
              سيتم عرض المنتجات العادية أدناه
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full pt-6 pr-4 pl-4">
        <div className="h-[320px] overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-[#f0f8ff] via-white to-[#e0f7fa] flex items-center justify-center">
          <div className="text-center px-4">
            <div
              className="p-4 rounded-2xl inline-block mb-3"
              style={{
                background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              }}
            >
              <FaFire className="text-white text-3xl" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#2E3E88" }}>
              لا توجد عروض خاصة حالياً
            </h3>
            <p className="text-sm" style={{ color: "#32B9CC" }}>
              تصفح قائمة المنتجات لدينا للعثور على ما تبحث عنه
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full pt-6 pr-4 pl-4" dir="rtl">
      {/* Main Hero Section */}
      <div className="relative w-full h-[320px] overflow-hidden rounded-2xl shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E3E88]/5 via-[#32B9CC]/3 to-transparent"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-gradient-to-r from-[#32B9CC]/10 to-[#2E3E88]/10 rounded-full blur-2xl animate-pulse"></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Left Side - Text Content */}
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5 }}
                className="lg:w-1/2 text-right space-y-3"
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white px-2.5 py-1 rounded-full shadow-md">
                    <FaTag className="text-xs" />
                    <span className="font-semibold text-xs">
                      {currentSlideData.category}
                    </span>
                  </div>

                  {currentSlideData.hasOffer && (
                    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-2.5 py-1 rounded-full shadow-md animate-pulse">
                      <FaBolt className="text-xs" />
                      <span className="font-bold text-xs">عرض محدود!</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl font-bold"
                  style={{ color: "#2E3E88" }}
                >
                  {currentSlideData.title}
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                  {currentSlideData.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {currentSlideData.preparationTime && (
                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                      <FaClock className="text-[#32B9CC]" />
                      <span className="font-medium text-gray-700 text-xs">
                        {currentSlideData.preparationTime}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                    <FaStar className="text-yellow-500" />
                    <span className="font-medium text-gray-700 text-xs">
                      {currentSlideData.rating} ({currentSlideData.reviews}{" "}
                      تقييم)
                    </span>
                  </div>
                </div>

                {/* Price Section - All in ONE LINE */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Discount Price - MAIN LARGE PRICE */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: "#2E3E88" }}
                    >
                      {formatPrice(currentSlideData.discountPrice)} ج.م
                    </span>

                    {/* Original Price (if offer) - INLINE */}
                    {currentSlideData.hasOffer && (
                      <span className="text-base md:text-lg text-gray-400 line-through font-semibold">
                        {formatPrice(currentSlideData.originalPrice)} ج.م
                      </span>
                    )}
                  </div>

                  {/* Discount Badge - INLINE */}
                  {currentSlideData.hasOffer &&
                    currentSlideData.discountType !== "none" && (
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-2.5 py-1 rounded-lg shadow-md">
                        <FaFire className="text-xs" />
                        <span className="font-bold text-xs">
                          خصم {currentSlideData.discountText}
                        </span>
                      </div>
                    )}
                </div>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => handleOrderNow(currentSlideData)}
                  className="group relative bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 transform flex items-center gap-2 overflow-hidden mt-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">
                    {currentSlideData.ctaText}
                  </span>
                  <FaShoppingCart className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </motion.div>

              {/* Right Side - Product Image */}
              <motion.div
                key={`image-${currentSlide}`}
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="lg:w-1/2 relative"
              >
                <div className="relative">
                  {/* Main Image Container */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <div className="relative h-48 sm:h-56 md:h-64">
                      <img
                        src={currentSlideData.image}
                        alt={currentSlideData.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  {currentSlideData.hasOffer && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-3 py-1.5 rounded-xl shadow-lg"
                    >
                      <div className="flex items-center gap-1">
                        <FaFire className="text-sm" />
                        <div className="text-center">
                          <div className="font-bold text-xs">عرض خاص!</div>
                          <div className="text-xs font-semibold">
                            لفترة محدودة
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-r from-[#2E3E88]/20 to-[#32B9CC]/20 rounded-xl blur-lg"></div>
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gradient-to-r from-[#32B9CC] to-[#2E3E88] rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {slides.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              onMouseEnter={() => setAutoSlide(false)}
              onMouseLeave={() => setAutoSlide(true)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm text-[#2E3E88] rounded-full p-1.5 hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center group"
            >
              <FaChevronLeft className="text-base group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              onMouseEnter={() => setAutoSlide(false)}
              onMouseLeave={() => setAutoSlide(true)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm text-[#2E3E88] rounded-full p-1.5 hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center group"
            >
              <FaChevronRight className="text-base group-hover:translate-x-1 transition-transform" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                onMouseEnter={() => setAutoSlide(false)}
                onMouseLeave={() => setAutoSlide(true)}
                className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "w-6 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC]"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                } h-1.5`}
              >
                {currentSlide === index && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-white/30"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
      </div>

      {/* Thumbnails Carousel - CENTERED */}
      {slides.length > 1 && (
        <div className="mt-4">
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide max-w-full">
              {slides.map((slide, index) => (
                <motion.button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  onMouseEnter={() => setAutoSlide(false)}
                  onMouseLeave={() => setAutoSlide(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
                    currentSlide === index
                      ? "ring-2 ring-[#2E3E88] ring-offset-1"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    width: "120px",
                    height: "72px",
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Active Indicator */}
                  {currentSlide === index && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  )}

                  {/* Offer Badge */}
                  {slide.hasOffer && (
                    <div className="absolute top-1 left-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-1 py-0.5 rounded text-xs font-bold">
                      عرض
                    </div>
                  )}

                  <div className="absolute bottom-1 right-1 left-1">
                    <p className="text-white text-xs font-semibold truncate">
                      {slide.title}
                    </p>
                    <p className="text-white/90 text-xs truncate">
                      {slide.category}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSwipper;
