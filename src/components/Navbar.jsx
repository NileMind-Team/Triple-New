import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaStar,
  FaShoppingCart,
  FaClipboardList,
  FaTimes,
  FaUsers,
  FaUserShield,
  FaBuilding,
  FaMoneyBillWave,
  FaCity,
  FaStore,
  FaCodeBranch,
  FaUserCircle,
  FaHeart,
  FaMap,
  FaPercent,
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaTruck,
  FaClipboardCheck,
  FaBox,
  FaListAlt,
  FaFileInvoice,
  FaTasks,
  FaWarehouse,
  FaCog,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import logo from "../assets/logo.png";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);
  const [activeTab, setActiveTab] = useState("home");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/Account/Profile");
        if (res.status === 200) {
          const fixedImageUrl = res.data.imageUrl
            ? `https://restaurant-template.runasp.net/${res.data.imageUrl}`
            : null;

          const userDataWithAvatar = { ...res.data, avatar: fixedImageUrl };
          setUser(userDataWithAvatar);

          const roles = res.data.roles || [];
          setUserRoles(roles);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...userDataWithAvatar,
              roles: roles,
            }),
          );
        }
      } catch (err) {
        console.error("فشل في جلب الملف الشخصي", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isLoggedIn]);

  const getInitial = (name) => (!name ? "?" : name.charAt(0).toUpperCase());

  const hasRole = (role) => userRoles.includes(role);
  const hasAnyRole = (roles) => roles.some((role) => userRoles.includes(role));

  // Navigation handlers
  const navigateTo = (path, tabName) => {
    navigate(path);
    setActiveTab(tabName);
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const getAdminMenuItems = () => {
    const items = [];

    // روابط الأدمن
    if (hasRole("Admin")) {
      items.push(
        { path: "/admin/users", icon: FaUsers, label: "إدارة المستخدمين" },
        { path: "/admin/branches", icon: FaBuilding, label: "إدارة الفروع" },
        {
          path: "/admin/delivery-cost",
          icon: FaMoneyBillWave,
          label: "تكاليف التوصيل",
        },
        {
          path: "/admin/item-offers",
          icon: FaPercent,
          label: "إدارة الخصومات",
        },
        { path: "/admin/cities", icon: FaCity, label: "إدارة المدن" },
        { path: "/admin/reports", icon: FaChartBar, label: "تقارير المبيعات" },
        {
          path: "/admin/time-date-reports",
          icon: FaCalendarAlt,
          label: "تقارير المبيعات بالوقت والتاريخ",
        },
        {
          path: "/admin/order-shifts",
          icon: FaClock,
          label: "تقارير الورديات",
        },
        {
          path: "/admin/order-reports",
          icon: FaClipboardCheck,
          label: "تقارير الطلبات",
        },
        {
          path: "/admin/items",
          icon: FaBox,
          label: "إدارة المنتجات",
        },
        {
          path: "/admin/categories",
          icon: FaListAlt,
          label: "إدارة الفئات",
        },
        {
          path: "/admin/invoices",
          icon: FaFileInvoice,
          label: "الفواتير",
        },
        {
          path: "/admin/tasks",
          icon: FaTasks,
          label: "المهام",
        },
        {
          path: "/admin/warehouse",
          icon: FaWarehouse,
          label: "المخزن",
        },
        {
          path: "/admin/settings",
          icon: FaCog,
          label: "الإعدادات",
        },
      );
    }

    // روابط المطعم
    if (hasRole("Restaurant")) {
      const restaurantItems = [
        { path: "/admin/users", icon: FaUsers, label: "إدارة المستخدمين" },
        {
          path: "/admin/delivery-cost",
          icon: FaMoneyBillWave,
          label: "تكاليف التوصيل",
        },
        {
          path: "/admin/item-offers",
          icon: FaPercent,
          label: "إدارة الخصومات",
        },
        { path: "/admin/cities", icon: FaCity, label: "إدارة المدن" },
        { path: "/admin/reports", icon: FaChartBar, label: "تقارير المبيعات" },
        {
          path: "/admin/time-date-reports",
          icon: FaCalendarAlt,
          label: "تقارير الوقت والتاريخ",
        },
        {
          path: "/admin/order-shifts",
          icon: FaClock,
          label: "تقارير الورديات",
        },
        {
          path: "/admin/order-reports",
          icon: FaClipboardCheck,
          label: "تقارير الطلبات",
        },
        {
          path: "/admin/items",
          icon: FaBox,
          label: "إدارة المنتجات",
        },
        {
          path: "/admin/categories",
          icon: FaListAlt,
          label: "إدارة الفئات",
        },
        {
          path: "/admin/invoices",
          icon: FaFileInvoice,
          label: "الفواتير",
        },
        {
          path: "/admin/tasks",
          icon: FaTasks,
          label: "المهام",
        },
        {
          path: "/admin/warehouse",
          icon: FaWarehouse,
          label: "المخزن",
        },
        {
          path: "/restaurant/settings",
          icon: FaCog,
          label: "إعدادات المطعم",
        },
      ];

      restaurantItems.forEach((item) => {
        if (!items.some((existingItem) => existingItem.label === item.label)) {
          items.push(item);
        }
      });
    }

    // روابط الفرع
    if (hasRole("Branch")) {
      const branchItems = [
        {
          path: "/branch/orders",
          icon: FaClipboardList,
          label: "طلبات الفرع",
        },
        {
          path: "/branch/order-shifts",
          icon: FaTruck,
          label: "ورديات الفرع",
        },
        {
          path: "/branch/reports",
          icon: FaChartBar,
          label: "تقارير الفرع",
        },
        {
          path: "/branch/inventory",
          icon: FaWarehouse,
          label: "مخزون الفرع",
        },
        {
          path: "/branch/tasks",
          icon: FaTasks,
          label: "مهام الفرع",
        },
      ];

      branchItems.forEach((item) => {
        if (!items.some((existingItem) => existingItem.label === item.label)) {
          items.push(item);
        }
      });
    }

    return items;
  };

  const adminMenuItems = getAdminMenuItems();
  const hasAdminAccess = hasAnyRole(["Admin", "Restaurant"]);
  const hasOrderShiftsAccess = hasAnyRole(["Admin", "Restaurant", "Branch"]);
  const hasBranchAccess = hasRole("Branch");

  // فقط الصفحة الرئيسية وفروعنا
  const mainNavItems = [
    { path: "/", icon: FaHome, label: "الصفحة الرئيسية", tabName: "home" },
    { path: "/branches", icon: FaMap, label: "فروعنا", tabName: "branches" },
  ];

  const userNavItems = [
    {
      path: "/profile",
      icon: FaUser,
      label: "ملفي الشخصي",
      tabName: "profile",
    },
    {
      path: "/my-orders",
      icon: FaClipboardList,
      label: "طلباتي",
      tabName: "orders",
    },
    {
      path: "/favorites",
      icon: FaHeart,
      label: "المفضلة",
      tabName: "favorites",
    },
    {
      path: "/addresses",
      icon: FaMapMarkerAlt,
      label: "عناويني",
      tabName: "addresses",
    },
    { path: "/reviews", icon: FaStar, label: "تقييماتي", tabName: "reviews" },
    {
      path: "/cart",
      icon: FaShoppingCart,
      label: "عربة التسوق",
      tabName: "cart",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p className="text-lg font-semibold" style={{ color: "#2E3E88" }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modern Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 rtl:space-x-reverse"
            >
              <Link
                to="/"
                className="group relative"
                onClick={() => setActiveTab("home")}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 rtl:space-x-reverse">
                  <div className="relative">
                    <div className="absolute -inset-1 sm:-inset-1.5 md:-inset-2 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src={logo}
                      alt="Triple S Logo"
                      className="relative h-8 sm:h-10 md:h-12 w-auto transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2E3E88] via-[#32B9CC] to-[#2E3E88] bg-clip-text text-transparent animate-gradient">
                      Triple S
                    </h1>
                    <p className="text-xs text-gray-500 hidden md:block">
                      تجربة طعام استثنائية
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Main Navigation - Desktop */}
            <div className="hidden lg:flex items-center space-x-2 md:space-x-3 lg:space-x-4 rtl:space-x-reverse">
              {mainNavItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setActiveTab(item.tabName)}
                    className={`relative px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse ${
                      activeTab === item.tabName
                        ? "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/10 hover:to-[#32B9CC]/10"
                    }`}
                  >
                    <item.icon
                      className={`${
                        activeTab === item.tabName
                          ? "text-white"
                          : "text-[#2E3E88]"
                      } text-sm md:text-base`}
                    />
                    <span className="font-medium text-sm md:text-base">
                      {item.label}
                    </span>
                    {activeTab === item.tabName && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 md:w-10 lg:w-12 h-0.5 md:h-1 bg-white rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 rtl:space-x-reverse">
              {/* Cart Icon */}
              {isLoggedIn && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateTo("/cart", "cart")}
                  className="relative p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 hover:from-[#2E3E88]/10 hover:to-[#32B9CC]/10 transition-all duration-300 group"
                >
                  <FaShoppingCart className="text-lg sm:text-xl md:text-2xl text-[#2E3E88] group-hover:text-[#32B9CC] transition-colors" />
                </motion.button>
              )}

              {/* Dark Mode Toggle */}
              {/* <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 hover:from-[#2E3E88]/10 hover:to-[#32B9CC]/10 transition-all duration-300"
                aria-label="تبديل الوضع"
              >
                {darkMode ? (
                  <FaSun className="text-lg sm:text-xl md:text-2xl text-[#FF8E53]" />
                ) : (
                  <FaMoon className="text-lg sm:text-xl md:text-2xl text-[#2E3E88]" />
                )}
              </motion.button> */}

              {/* User Menu / Auth */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  {/* زر صورة المستخدم - يظهر القائمة الجانبية على الجوال والدروب داون على سطح المكتب */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // على الجوال: يفتح القائمة الجانبية
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(true);
                      } else {
                        // على سطح المكتب: يفتح الدروب داون
                        setIsUserMenuOpen(!isUserMenuOpen);
                      }
                    }}
                    className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 rtl:space-x-reverse p-1.5 sm:p-2 md:p-2 rounded-2xl bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5 hover:from-[#2E3E88]/10 hover:to-[#32B9CC]/10 transition-all duration-300 border border-white/20"
                  >
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="صورة المستخدم"
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white flex items-center justify-center font-semibold text-sm sm:text-lg md:text-xl shadow-lg">
                        {getInitial(userData.firstName)}
                      </div>
                    )}

                    <div className="text-right hidden md:block">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">
                        {userData.firstName || "مستخدم"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {hasRole("Admin")
                          ? "مدير النظام"
                          : hasRole("Restaurant")
                            ? "مشرف مطعم"
                            : hasRole("Branch")
                              ? "موظف فرع"
                              : "عميل"}
                      </span>
                    </div>

                    {/* السهم - يظهر فقط على سطح المكتب */}
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="hidden lg:block"
                    >
                      <FaChevronDown className="text-[#2E3E88] text-sm md:text-base" />
                    </motion.div>
                  </motion.button>

                  {/* User Dropdown Menu - يظهر فقط على سطح المكتب */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 rtl:right-0 rtl:left-auto mt-2 md:mt-3 w-64 sm:w-72 md:w-80 bg-white shadow-2xl rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden z-50 hidden lg:block"
                        style={{
                          left: "-100px", // تم التعديل هنا: نقل الدروب داون لليسار
                          right: "auto", // تم التعديل هنا
                        }}
                      >
                        {/* User Header */}
                        <div className="p-4 md:p-6 bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5">
                          <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse">
                            {userData.avatar ? (
                              <img
                                src={userData.avatar}
                                alt="صورة المستخدم"
                                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white flex items-center justify-center font-semibold text-xl sm:text-2xl md:text-2xl shadow-lg">
                                {getInitial(userData.firstName)}
                              </div>
                            )}

                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg">
                                {userData.firstName} {userData.lastName}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {userData.email}
                              </p>

                              {/* User Roles */}
                              <div className="flex flex-wrap gap-1 mt-1 md:mt-2">
                                {hasRole("Admin") && (
                                  <div className="flex items-center gap-1 bg-[#2E3E88]/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                                    <FaUserShield className="text-[#2E3E88] text-xs" />
                                    <span className="text-xs font-semibold text-[#2E3E88]">
                                      مدير
                                    </span>
                                  </div>
                                )}
                                {hasRole("Restaurant") && (
                                  <div className="flex items-center gap-1 bg-[#32B9CC]/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                                    <FaStore className="text-[#32B9CC] text-xs" />
                                    <span className="text-xs font-semibold text-[#32B9CC]">
                                      مطعم
                                    </span>
                                  </div>
                                )}
                                {hasRole("Branch") && (
                                  <div className="flex items-center gap-1 bg-[#4CAF50]/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                                    <FaCodeBranch className="text-[#4CAF50] text-xs" />
                                    <span className="text-xs font-semibold text-[#4CAF50]">
                                      فرع
                                    </span>
                                  </div>
                                )}
                                {hasRole("User") && (
                                  <div className="flex items-center gap-1 bg-[#9C27B0]/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                                    <FaUserCircle className="text-[#9C27B0] text-xs" />
                                    <span className="text-xs font-semibold text-[#9C27B0]">
                                      مستخدم
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 max-h-80 sm:max-h-96 overflow-y-auto">
                          <div className="space-y-1">
                            {userNavItems.map((item) => (
                              <motion.button
                                key={item.path}
                                whileHover={{ x: -4 }}
                                onClick={() =>
                                  navigateTo(item.path, item.tabName)
                                }
                                className="w-full text-right flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 transition-all duration-200 font-medium rounded-lg group text-sm sm:text-base"
                              >
                                <span>{item.label}</span>
                                <item.icon className="text-[#2E3E88] group-hover:text-[#32B9CC] text-sm md:text-base" />
                              </motion.button>
                            ))}

                            {/* الورديات */}
                            {hasOrderShiftsAccess && (
                              <motion.button
                                whileHover={{ x: -4 }}
                                onClick={() =>
                                  navigateTo("/order-shifts", "shifts")
                                }
                                className="w-full text-right flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 transition-all duration-200 font-medium rounded-lg group text-sm sm:text-base"
                              >
                                <span>الورديات</span>
                                <FaTruck className="text-[#2E3E88] group-hover:text-[#32B9CC] text-sm md:text-base" />
                              </motion.button>
                            )}
                          </div>

                          {/* Admin Section */}
                          {hasAdminAccess && (
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                              <div className="px-3 py-1.5 md:px-4 md:py-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <FaUserShield className="text-[#2E3E88] text-sm" />
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                    {hasRole("Admin")
                                      ? "لوحة الإدارة"
                                      : "إدارة المطعم"}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {adminMenuItems
                                  .slice(0, 6) // عرض 6 عناصر في القائمة المنسدلة للشاشات الصغيرة
                                  .map((item, index) => (
                                    <motion.button
                                      key={index}
                                      whileHover={{ x: -4 }}
                                      onClick={() =>
                                        navigateTo(item.path, "admin")
                                      }
                                      className="w-full text-right flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 transition-all duration-200 font-medium rounded-lg group text-sm sm:text-base"
                                    >
                                      <span className="truncate">
                                        {item.label}
                                      </span>
                                      <item.icon className="text-[#2E3E88] group-hover:text-[#32B9CC] text-sm md:text-base flex-shrink-0" />
                                    </motion.button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Branch Section */}
                          {hasBranchAccess && !hasAdminAccess && (
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                              <div className="px-3 py-1.5 md:px-4 md:py-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <FaCodeBranch className="text-[#4CAF50] text-sm" />
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                    إدارة الفرع
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {adminMenuItems
                                  .filter(
                                    (item) =>
                                      item.path.includes("/branch") ||
                                      item.label.includes("الفرع"),
                                  )
                                  .slice(0, 5)
                                  .map((item, index) => (
                                    <motion.button
                                      key={index}
                                      whileHover={{ x: -4 }}
                                      onClick={() =>
                                        navigateTo(item.path, "branch")
                                      }
                                      className="w-full text-right flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 transition-all duration-200 font-medium rounded-lg group text-sm sm:text-base"
                                    >
                                      <span className="truncate">
                                        {item.label}
                                      </span>
                                      <item.icon className="text-[#2E3E88] group-hover:text-[#32B9CC] text-sm md:text-base flex-shrink-0" />
                                    </motion.button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Logout */}
                          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                            <motion.button
                              whileHover={{ x: -4 }}
                              onClick={handleLogout}
                              className="w-full text-right flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium rounded-lg text-sm sm:text-base"
                            >
                              <span>تسجيل الخروج</span>
                              <FaSignOutAlt className="text-sm md:text-base" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Auth Buttons
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 rtl:space-x-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/login")}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:shadow-lg text-xs sm:text-sm md:text-base"
                    style={{
                      borderColor: "#2E3E88",
                      color: "#2E3E88",
                      background: "transparent",
                    }}
                  >
                    تسجيل الدخول
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/register")}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base"
                    style={{
                      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                      color: "white",
                    }}
                  >
                    إنشاء حساب
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - تظهر عند النقر على صورة المستخدم في الجوال */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              ref={sidebarRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm md:max-w-sm z-[70]"
              style={{
                background: "linear-gradient(135deg, #ffffff, #f8f9ff)",
              }}
            >
              {/* Sidebar Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 rtl:space-x-reverse">
                    <div className="relative">
                      <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] rounded-xl sm:rounded-2xl blur opacity-20"></div>
                      <img
                        src={logo}
                        alt="Logo"
                        className="relative h-8 sm:h-10 md:h-10 w-auto"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg sm:text-xl text-gray-800">
                        Triple S
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        القائمة
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
                  >
                    <FaTimes className="text-gray-600 text-lg sm:text-xl" />
                  </motion.button>
                </div>

                {/* User Info in Mobile */}
                {isLoggedIn ? (
                  <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 rtl:space-x-reverse mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#2E3E88]/5 to-[#32B9CC]/5">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="صورة المستخدم"
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white flex items-center justify-center font-semibold text-base sm:text-lg md:text-xl shadow-lg">
                        {getInitial(userData.firstName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {userData.email}
                      </p>

                      {/* User Roles in Mobile */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hasRole("Admin") && (
                          <div className="flex items-center gap-1 bg-[#2E3E88]/10 px-1.5 py-0.5 rounded-full">
                            <FaUserShield className="text-[#2E3E88] text-xs" />
                            <span className="text-xs font-semibold text-[#2E3E88]">
                              مدير
                            </span>
                          </div>
                        )}
                        {hasRole("Restaurant") && (
                          <div className="flex items-center gap-1 bg-[#32B9CC]/10 px-1.5 py-0.5 rounded-full">
                            <FaStore className="text-[#32B9CC] text-xs" />
                            <span className="text-xs font-semibold text-[#32B9CC]">
                              مطعم
                            </span>
                          </div>
                        )}
                        {hasRole("Branch") && (
                          <div className="flex items-center gap-1 bg-[#4CAF50]/10 px-1.5 py-0.5 rounded-full">
                            <FaCodeBranch className="text-[#4CAF50] text-xs" />
                            <span className="text-xs font-semibold text-[#4CAF50]">
                              فرع
                            </span>
                          </div>
                        )}
                        {hasRole("User") && (
                          <div className="flex items-center gap-1 bg-[#9C27B0]/10 px-1.5 py-0.5 rounded-full">
                            <FaUserCircle className="text-[#9C27B0] text-xs" />
                            <span className="text-xs font-semibold text-[#9C27B0]">
                              مستخدم
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 sm:mb-6">
                    <p className="text-gray-600 mb-3 text-center text-sm sm:text-base">
                      مرحباً بك في مطعمنا
                    </p>
                    <div className="flex space-x-2 sm:space-x-3 rtl:space-x-reverse">
                      <button
                        onClick={() => navigateTo("/login", "login")}
                        className="flex-1 py-2.5 sm:py-3 text-center rounded-xl font-semibold border-2 text-xs sm:text-sm"
                        style={{
                          borderColor: "#2E3E88",
                          color: "#2E3E88",
                        }}
                      >
                        تسجيل الدخول
                      </button>
                      <button
                        onClick={() => navigateTo("/register", "register")}
                        className="flex-1 py-2.5 sm:py-3 text-center rounded-xl font-semibold text-white text-xs sm:text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        }}
                      >
                        إنشاء حساب
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Menu */}
              <div className="p-3 sm:p-4 overflow-y-auto h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)]">
                <div className="space-y-1 sm:space-y-2">
                  {/* Main Navigation */}
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 px-2">
                      الرئيسية
                    </p>
                    {mainNavItems.map((item) => (
                      <motion.button
                        key={item.path}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateTo(item.path, item.tabName)}
                        className={`w-full text-right flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 mb-1 sm:mb-2 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                          activeTab === item.tabName
                            ? "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white shadow-lg"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5"
                        }`}
                      >
                        <span>{item.label}</span>
                        <item.icon
                          className={
                            activeTab === item.tabName
                              ? "text-white"
                              : "text-[#2E3E88]"
                          }
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* User Menu في القائمة الجانبية للجوال */}
                  {isLoggedIn && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 px-2">
                        حسابي
                      </p>
                      {userNavItems.map((item) => (
                        <motion.button
                          key={item.path}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateTo(item.path, item.tabName)}
                          className={`w-full text-right flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 mb-1 sm:mb-2 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                            activeTab === item.tabName
                              ? "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white shadow-lg"
                              : "text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5"
                          }`}
                        >
                          <span>{item.label}</span>
                          <item.icon
                            className={
                              activeTab === item.tabName
                                ? "text-white"
                                : "text-[#2E3E88]"
                            }
                          />
                        </motion.button>
                      ))}

                      {/* الورديات */}
                      {hasOrderShiftsAccess && (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateTo("/order-shifts", "shifts")}
                          className={`w-full text-right flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 mb-1 sm:mb-2 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5`}
                        >
                          <span>الورديات</span>
                          <FaTruck className="text-[#2E3E88]" />
                        </motion.button>
                      )}
                    </div>
                  )}

                  {/* Admin Section في القائمة الجانبية */}
                  {hasAdminAccess && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 px-2">
                        لوحة التحكم
                      </p>
                      {adminMenuItems.slice(0, 8).map((item, index) => (
                        <motion.button
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateTo(item.path, "admin")}
                          className="w-full text-right flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 mb-1 sm:mb-2 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 transition-all duration-200 font-medium text-sm sm:text-base"
                        >
                          <span className="truncate">{item.label}</span>
                          <item.icon className="text-[#2E3E88] flex-shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Branch Section في القائمة الجانبية */}
                  {hasBranchAccess && !hasAdminAccess && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 px-2">
                        إدارة الفرع
                      </p>
                      {adminMenuItems
                        .filter(
                          (item) =>
                            item.path.includes("/branch") ||
                            item.label.includes("الفرع"),
                        )
                        .slice(0, 5)
                        .map((item, index) => (
                          <motion.button
                            key={index}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigateTo(item.path, "branch")}
                            className="w-full text-right flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 mb-1 sm:mb-2 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 transition-all duration-200 font-medium text-sm sm:text-base"
                          >
                            <span className="truncate">{item.label}</span>
                            <item.icon className="text-[#2E3E88] flex-shrink-0" />
                          </motion.button>
                        ))}
                    </div>
                  )}

                  {/* تسجيل الخروج */}
                  {isLoggedIn && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full text-right flex items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium rounded-xl text-sm sm:text-base"
                      >
                        <span>تسجيل الخروج</span>
                        <FaSignOutAlt />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-18 md:h-20"></div>
    </>
  );
};

export default Navbar;
