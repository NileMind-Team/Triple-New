import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaShoppingCart,
  FaStar,
  FaPlus,
  FaMinus,
  FaTimes,
  FaUtensils,
  FaCoffee,
  FaIceCream,
  FaHamburger,
  FaClock,
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
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", name: "All Items", icon: <FaUtensils /> },
    { id: "meals", name: "Main Courses", icon: <FaHamburger /> },
    { id: "drinks", name: "Beverages", icon: <FaCoffee /> },
    { id: "desserts", name: "Desserts", icon: <FaIceCream /> },
  ]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const categoriesContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  // Icons available for categories
  const availableIcons = [
    { name: "Utensils", icon: <FaUtensils /> },
    { name: "Hamburger", icon: <FaHamburger /> },
    { name: "Coffee", icon: <FaCoffee /> },
    { name: "Ice Cream", icon: <FaIceCream /> },
    { name: "Clock", icon: <FaClock /> },
    { name: "List", icon: <FaList /> },
  ];

  // Check user role from API endpoint using axios
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

  // Mock data with real food images
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: "Classic Fried Chicken",
        category: "meals",
        price: 45.99,
        image:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        ingredients: [
          "Chicken Breast",
          "Secret Spices",
          "Flour",
          "Buttermilk",
          "Garlic",
          "Pepper",
        ],
        description:
          "Crispy golden fried chicken with our secret blend of 11 herbs and spices. Served with your choice of dipping sauce and fresh fries.",
        rating: 4.8,
        prepTime: "15-20 mins",
        calories: "420 kcal",
        isActive: true,
        availabilityTime: {
          alwaysAvailable: true,
          startTime: "",
          endTime: "",
        },
        availabilityDays: {
          everyday: true,
          specificDays: [],
        },
      },
      {
        id: 2,
        name: "Spicy Chicken Wings",
        category: "meals",
        price: 35.99,
        image:
          "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
        ingredients: [
          "Chicken Wings",
          "Hot Sauce",
          "Butter",
          "Garlic",
          "Celery",
        ],
        description:
          "Spicy buffalo wings tossed in our signature hot sauce. Perfectly crispy with just the right amount of heat. Served with ranch dressing.",
        rating: 4.6,
        prepTime: "10-15 mins",
        calories: "320 kcal",
        isActive: true,
        availabilityTime: {
          alwaysAvailable: false,
          startTime: "11:00",
          endTime: "23:00",
        },
        availabilityDays: {
          everyday: false,
          specificDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
      },
      {
        id: 3,
        name: "Chocolate Milkshake",
        category: "drinks",
        price: 18.99,
        image:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
        ingredients: [
          "Milk",
          "Chocolate Ice Cream",
          "Whipped Cream",
          "Chocolate Syrup",
          "Cherry",
        ],
        description:
          "Creamy chocolate milkshake topped with whipped cream and chocolate drizzle. The perfect sweet treat for any time of day.",
        rating: 4.9,
        prepTime: "5 mins",
        calories: "280 kcal",
        isActive: true,
        availabilityTime: {
          alwaysAvailable: true,
          startTime: "",
          endTime: "",
        },
        availabilityDays: {
          everyday: true,
          specificDays: [],
        },
      },
      {
        id: 4,
        name: "Fresh Orange Juice",
        category: "drinks",
        price: 12.99,
        image:
          "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop",
        ingredients: ["Fresh Oranges", "Ice", "Mint Leaves"],
        description:
          "Freshly squeezed orange juice, packed with vitamin C and natural sweetness. No added sugar, 100% natural.",
        rating: 4.7,
        prepTime: "3 mins",
        calories: "110 kcal",
        isActive: false,
        availabilityTime: {
          alwaysAvailable: false,
          startTime: "08:00",
          endTime: "20:00",
        },
        availabilityDays: {
          everyday: false,
          specificDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
        },
      },
      {
        id: 5,
        name: "Chocolate Lava Cake",
        category: "desserts",
        price: 22.99,
        image:
          "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
        ingredients: [
          "Dark Chocolate",
          "Butter",
          "Eggs",
          "Flour",
          "Sugar",
          "Vanilla",
        ],
        description:
          "Warm chocolate cake with a molten chocolate center. Served with vanilla ice cream and fresh berries.",
        rating: 4.9,
        prepTime: "12-15 mins",
        calories: "380 kcal",
        isActive: true,
        availabilityTime: {
          alwaysAvailable: false,
          startTime: "14:00",
          endTime: "22:00",
        },
        availabilityDays: {
          everyday: false,
          specificDays: ["Friday", "Saturday", "Sunday"],
        },
      },
      {
        id: 6,
        name: "Ice Cream Sundae",
        category: "desserts",
        price: 19.99,
        image:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
        ingredients: [
          "Vanilla Ice Cream",
          "Chocolate Sauce",
          "Nuts",
          "Cherry",
          "Sprinkles",
        ],
        description:
          "Classic ice cream sundae with your choice of toppings. A timeless dessert favorite that never disappoints.",
        rating: 4.8,
        prepTime: "5 mins",
        calories: "250 kcal",
        isActive: true,
        availabilityTime: {
          alwaysAvailable: true,
          startTime: "",
          endTime: "",
        },
        availabilityDays: {
          everyday: true,
          specificDays: [],
        },
      },
      {
        id: 7,
        name: "Chicken Burger",
        category: "meals",
        price: 32.99,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        ingredients: [
          "Chicken Patty",
          "Bun",
          "Lettuce",
          "Tomato",
          "Special Sauce",
          "Pickles",
        ],
        description:
          "Juicy chicken burger with fresh vegetables and our special sauce. Served with crispy golden fries and coleslaw.",
        rating: 4.5,
        prepTime: "10-12 mins",
        calories: "450 kcal",
        isActive: true,
        availabilityTime: {
          alwaysAvailable: false,
          startTime: "11:00",
          endTime: "23:00",
        },
        availabilityDays: {
          everyday: false,
          specificDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
      },
      {
        id: 8,
        name: "Iced Coffee",
        category: "drinks",
        price: 15.99,
        image:
          "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
        ingredients: ["Coffee", "Ice", "Milk", "Sugar", "Vanilla"],
        description:
          "Refreshing iced coffee perfect for hot days. Customize with your preferred sweetness level and milk options.",
        rating: 4.6,
        prepTime: "4 mins",
        calories: "80 kcal",
        isActive: false,
        availabilityTime: {
          alwaysAvailable: false,
          startTime: "07:00",
          endTime: "18:00",
        },
        availabilityDays: {
          everyday: false,
          specificDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
        },
      },
    ];

    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter products based on category and search term
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    document.body.style.overflow = "hidden";
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = "auto";
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent opening modal when adding to cart

    // Check if product is active before adding to cart
    if (!product.isActive) {
      Swal.fire({
        icon: "error",
        title: "Product Not Available",
        text: `${product.name} is currently not available`,
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
      title: "Added to Cart!",
      text: `${product.name} added to your cart`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddToCartFromModal = (product) => {
    // Check if product is active before adding to cart
    if (!product.isActive) {
      Swal.fire({
        icon: "error",
        title: "Product Not Available",
        text: `${product.name} is currently not available`,
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
      title: "Added to Cart!",
      text: `${quantity} ${product.name} added to your cart`,
      timer: 1500,
      showConfirmButton: false,
    });

    closeProductModal();
  };

  // Admin/Restaurant/Branch Functions - Only for Admin, Restaurant or Branch role
  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    // Navigate to edit form with product data
    navigate("/products/edit", { state: { product } });
  };

  const handleDeleteProduct = (productId, e) => {
    e.stopPropagation();

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((product) => product.id !== productId));
        Swal.fire({
          title: "Deleted!",
          text: "Product has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Toggle product active status
  const handleToggleActive = (productId, e) => {
    e.stopPropagation();

    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, isActive: !product.isActive }
          : product
      )
    );

    Swal.fire({
      icon: "success",
      title: "Status Updated!",
      text: `Product ${
        products.find((p) => p.id === productId).isActive
          ? "deactivated"
          : "activated"
      }`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddNewProduct = () => {
    navigate("/products/new");
  };

  // Categories Management Functions
  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
    setNewCategory({ name: "", icon: "" });
  };

  const handleSaveCategory = () => {
    if (!editingCategory.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Category name is required",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (editingCategory.id === "all") {
      Swal.fire({
        icon: "error",
        title: "Cannot Edit",
        text: "The 'All Items' category cannot be edited",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setCategories(
      categories.map((cat) =>
        cat.id === editingCategory.id ? { ...editingCategory } : cat
      )
    );

    setEditingCategory(null);
    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Category has been updated",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Category name is required",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!newCategory.icon) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select an icon for the category",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const newId = newCategory.name.toLowerCase().replace(/\s+/g, "-");

    // Check if category already exists
    if (categories.some((cat) => cat.id === newId)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "A category with this name already exists",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const newCat = {
      id: newId,
      name: newCategory.name,
      icon: availableIcons.find((icon) => icon.name === newCategory.icon)
        ?.icon || <FaList />,
    };

    setCategories([...categories, newCat]);
    setNewCategory({ name: "", icon: "" });

    Swal.fire({
      icon: "success",
      title: "Added!",
      text: "New category has been added",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDeleteCategory = (categoryId) => {
    if (categoryId === "all") {
      Swal.fire({
        icon: "error",
        title: "Cannot Delete",
        text: "The 'All Items' category cannot be deleted",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // Check if there are products in this category
    const productsInCategory = products.filter(
      (product) => product.category === categoryId
    );

    if (productsInCategory.length > 0) {
      Swal.fire({
        title: "Cannot Delete Category",
        text: `There are ${productsInCategory.length} products in this category. Please reassign or delete these products first.`,
        icon: "warning",
        confirmButtonColor: "#E41E26",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setCategories(categories.filter((cat) => cat.id !== categoryId));

        // If the deleted category was selected, switch to "all"
        if (selectedCategory === categoryId) {
          setSelectedCategory("all");
        }

        Swal.fire({
          title: "Deleted!",
          text: "Category has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleOpenCategoriesManager = () => {
    setShowCategoriesManager(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseCategoriesManager = () => {
    setShowCategoriesManager(false);
    setEditingCategory(null);
    setNewCategory({ name: "", icon: "" });
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

  // Drag to scroll functionality
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

  const renderStars = (rating) => {
    const numericRating = Number(rating);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${
              star <= numericRating
                ? "text-[#FDB913]"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatAvailabilityTime = (product) => {
    if (product.availabilityTime.alwaysAvailable) {
      return "24/7";
    }
    return `${product.availabilityTime.startTime} - ${product.availabilityTime.endTime}`;
  };

  const formatAvailabilityDays = (product) => {
    if (product.availabilityDays.everyday) {
      return "Every day";
    }
    return product.availabilityDays.specificDays.join(", ");
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
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 dark:from-[#E41E26]/5 dark:to-[#FDB913]/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 dark:from-[#FDB913]/5 dark:to-[#E41E26]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white py-8 md:py-16 px-4 text-center w-full">
        <div className="max-w-4xl mx-auto relative z-10 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2"
          >
            <span className="block sm:inline">Welcome to</span>{" "}
            <span className="block sm:inline">Chicken One</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg md:text-xl lg:text-2xl opacity-90 mb-6 md:mb-8 px-2"
          >
            Delicious Food, Delivered Fresh
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-2xl mx-auto w-full px-2"
          >
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border-none outline-none text-gray-800 dark:text-gray-200 dark:bg-gray-700 shadow-2xl focus:ring-2 focus:ring-[#E41E26] text-sm md:text-base"
              />
              <FaFilter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Tabs with Swiper */}
      <div className="relative max-w-6xl mx-auto -mt-6 md:-mt-8 px-2 sm:px-4 z-20 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 md:p-4 relative w-full transition-colors duration-300">
          {/* Left Scroll Button */}
          <button
            onClick={() => scrollCategories("left")}
            className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
          >
            <FaChevronLeft size={14} className="sm:w-4" />
          </button>

          {/* Categories Container */}
          <div
            ref={categoriesContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 px-6 sm:px-8 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
                }`}
              >
                <span className="text-base md:text-lg">{category.icon}</span>
                <span className="whitespace-nowrap">{category.name}</span>
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
        {filteredProducts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
            <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 transition-colors duration-300">
              <FaSearch className="mx-auto text-4xl md:text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4 px-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
              >
                Show All Products
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
            <motion.div
              layout
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group w-full relative ${
                    !product.isActive ? "opacity-70" : ""
                  }`}
                >
                  {/* Product Status Badge */}
                  <div
                    className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </div>

                  {/* Admin/Restaurant/Branch Actions Overlay - Only show for Admin, Restaurant or Branch role */}
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
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2 group-hover:text-[#E41E26] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3 sm:mb-0">
                      <div className="text-[#E41E26] font-bold text-lg sm:text-xl">
                        EGP {product.price}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                        <FaClock className="hidden xs:block" />
                        <span>{product.prepTime}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={!product.isActive}
                        className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                          product.isActive
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="xs:hidden">
                          {product.isActive ? "Add to Cart" : "Not Available"}
                        </span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleProductClick(product)}
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <FaEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="xs:hidden">View Details</span>
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
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeProductModal}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110"
                >
                  <FaTimes size={16} className="sm:w-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-64 sm:h-80 lg:h-full object-cover"
                    />

                    {/* Product Status Badge - Moved to right */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-2 rounded-full text-sm font-semibold ${
                        selectedProduct.isActive
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {selectedProduct.isActive ? "Active" : "Inactive"}
                    </div>

                    {/* Admin/Restaurant/Branch Actions in Modal - Moved to left */}
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
                          {selectedProduct.isActive ? "Deactivate" : "Activate"}
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
                          Edit
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
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[60vh] lg:max-h-none">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                          {selectedProduct.name}
                        </h2>
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          {renderStars(selectedProduct.rating)}
                          <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
                            •
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 text-sm sm:text-base">
                            <FaClock />
                            {selectedProduct.prepTime}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                        {selectedProduct.description}
                      </p>

                      {/* Three Info Boxes in One Row */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 py-3 sm:py-4">
                        {/* Prep Time */}
                        <div className="text-center bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 p-3 sm:p-4 rounded-xl flex flex-col justify-center items-center h-full">
                          <FaClock className="mx-auto text-[#E41E26] text-lg sm:text-xl mb-2" />
                          <div className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">
                            Prep Time
                          </div>
                          <div className="text-[#E41E26] font-bold text-sm sm:text-base">
                            {selectedProduct.prepTime}
                          </div>
                        </div>

                        {/* Calories */}
                        <div className="text-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 sm:p-4 rounded-xl flex flex-col justify-center items-center h-full">
                          <FaStar className="mx-auto text-blue-500 text-lg sm:text-xl mb-2" />
                          <div className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">
                            Calories
                          </div>
                          <div className="text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base">
                            {selectedProduct.calories}
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="text-center bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 sm:p-4 rounded-xl flex flex-col justify-center items-center h-full">
                          <FaCalendarAlt className="mx-auto text-green-500 text-lg sm:text-xl mb-2" />
                          <div className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">
                            Availability
                          </div>
                          <div className="text-green-600 dark:text-green-400 font-bold text-xs sm:text-sm leading-tight">
                            {formatAvailabilityTime(selectedProduct)}
                          </div>
                          <div className="text-green-500 dark:text-green-400 font-semibold text-xs leading-tight mt-1">
                            {formatAvailabilityDays(selectedProduct)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 text-base sm:text-lg">
                          Ingredients
                        </h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {selectedProduct.ingredients.map(
                            (ingredient, idx) => (
                              <span
                                key={idx}
                                className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-xs sm:text-sm"
                              >
                                {ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 mt-3 sm:mt-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
                          <div className="text-2xl sm:text-3xl font-bold text-[#E41E26] whitespace-nowrap">
                            EGP {selectedProduct.price}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-2 flex-shrink-0">
                            <button
                              onClick={decrementQuantity}
                              className="p-1 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              <FaMinus size={12} className="sm:w-3.5" />
                            </button>
                            <span className="font-semibold text-base sm:text-lg min-w-6 sm:min-w-8 text-center dark:text-gray-200">
                              {quantity}
                            </span>
                            <button
                              onClick={incrementQuantity}
                              className="p-1 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              <FaPlus size={12} className="sm:w-3.5" />
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
                          className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${
                            selectedProduct.isActive
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaShoppingCart size={16} className="sm:w-5" />
                          {selectedProduct.isActive
                            ? `Add to Cart - EGP ${(
                                selectedProduct.price * quantity
                              ).toFixed(2)}`
                            : "Product Not Available"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Categories Manager Modal */}
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
                {/* Header */}
                <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white p-4 sm:p-6 relative">
                  <h2 className="text-xl sm:text-2xl font-bold text-center">
                    Manage Categories
                  </h2>
                  <button
                    onClick={handleCloseCategoriesManager}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors duration-200 hover:scale-110"
                  >
                    <FaTimes size={16} className="sm:w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  {/* Add New Category Form */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 mb-6 transition-colors duration-300">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Add New Category
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category Name
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
                          placeholder="Enter category name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Icon
                        </label>
                        <select
                          value={newCategory.icon}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              icon: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none transition-all"
                        >
                          <option value="">Choose an icon</option>
                          {availableIcons.map((iconObj) => (
                            <option key={iconObj.name} value={iconObj.name}>
                              {iconObj.name}
                            </option>
                          ))}
                        </select>
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
                        Add Category
                      </motion.button>
                    </div>
                  </div>

                  {/* Categories List */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Existing Categories
                    </h3>
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all"
                        >
                          {editingCategory &&
                          editingCategory.id === category.id ? (
                            // Edit Mode
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Category Name
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
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Icon Preview
                                </label>
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl">
                                    {category.icon}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                                    (Icons cannot be changed)
                                  </span>
                                </div>
                              </div>
                              <div className="md:col-span-2 flex justify-end gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setEditingCategory(null)}
                                  className="px-6 py-3 rounded-xl font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleSaveCategory}
                                  className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                  <FaSave />
                                  Save Changes
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-2xl text-[#E41E26]">
                                  {category.icon}
                                </span>
                                <div>
                                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                                    {category.name}
                                  </h4>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    ID: {category.id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {category.id !== "all" && (
                                  <>
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

      {/* Cart Indicator */}
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
