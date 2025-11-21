import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import Reviews from "./pages/Reviews";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import ProductForm from "./pages/ProductForm";
import Footer from "./components/Footer";
import AdminUsers from "./pages/AdminUsers";
import AdminBranches from "./pages/AdminBranches";

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const hideNavbarFooterPaths = [
    "/login",
    "/register",
    "/auth/verify-email-address",
    "/reset-password",
    "/profile",
    "/addresses",
    "/reviews",
    "/admin/users",
    "/admin/branches",
  ];

  const shouldShowNavbarFooter = !hideNavbarFooterPaths.includes(
    location.pathname
  );

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      {shouldShowNavbarFooter && (
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      )}

      {/* Main content */}
      <main className="flex-grow w-full bg-white dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/verify-email-address" element={<ConfirmEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit" element={<ProductForm />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/branches" element={<AdminBranches />} />
        </Routes>
      </main>

      {/* Footer */}
      {shouldShowNavbarFooter && <Footer />}
    </div>
  );
}

export default App;
