import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/loginSlice";
import { registerUser } from "../redux/slices/registerSlice";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axiosInstance from "../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaUser,
  FaPhone,
  FaTimesCircle,
} from "react-icons/fa";
import Confetti from "react-confetti";

const MySwal = withReactContent(Swal);

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading: loginLoading } = useSelector((state) => state.login);
  const { isLoading: registerLoading } = useSelector((state) => state.register);

  const [activeTab, setActiveTab] = useState(
    location.pathname === "/register" ? "register" : "login"
  );
  const [forgetMode, setForgetMode] = useState(false);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common states
  const [forgetEmail, setForgetEmail] = useState("");
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedUserName, setLoggedUserName] = useState("");

  // Password validation for register
  const passwordValidations = {
    length: form.password.length >= 8,
    lowercase: /[a-z]/.test(form.password),
    uppercase: /[A-Z]/.test(form.password),
    specialChar: /[^A-Za-z0-9]/.test(form.password),
    match: form.password !== "" && form.password === form.confirmPassword,
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    MySwal.fire({
      title: "Logging in...",
      didOpen: () => {
        MySwal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    const formData = new FormData();
    formData.append("Email", email);
    formData.append("Password", password);

    const res = await dispatch(loginUser(formData));
    const data = res.payload;

    if (data?.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      setLoggedUserName(data.firstName || "User");
      setShowWelcome(true);

      MySwal.close();

      setTimeout(() => {
        setShowWelcome(false);
        navigate("/");
      }, 3000);
    } else {
      MySwal.close();
      Swal.fire({
        icon: "error",
        title: "Invalid Credentials",
        text: "Please check your email and password",
      });
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    const allValid = Object.values(passwordValidations).every(Boolean);
    if (!allValid) return;

    const formData = new FormData();
    formData.append("FirstName", form.firstName);
    formData.append("LastName", form.lastName);
    formData.append("Email", form.email);
    formData.append("PhoneNumber", form.phoneNumber);
    formData.append("Password", form.password);
    formData.append("ConfirmPassword", form.confirmPassword);

    try {
      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        setWaitingForConfirmation(true);
        setUserEmail(form.email);
        setResendDisabled(true);
        setTimer(60);
        Swal.fire({
          icon: "info",
          title: "Account Created",
          text: "Your account has been created! Please confirm your email to continue.",
          allowOutsideClick: false,
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        const errorResponse =
          resultAction.payload || resultAction.error?.response?.data || null;

        const emailError =
          errorResponse?.errors?.Email?.[0] ||
          errorResponse?.message ||
          "An error occurred during registration.";

        if (emailError.toLowerCase().includes("already exists")) {
          try {
            await axiosInstance.get(
              `/api/Auth/CheckConfirmationEmail?email=${encodeURIComponent(
                form.email
              )}`
            );
            Swal.fire({
              icon: "error",
              title: "Email Already Exists",
              text: "This email is already registered and confirmed.",
            });
          } catch (checkErr) {
            const notConfirmed =
              checkErr.response?.status === 401 &&
              checkErr.response?.data?.errors?.[0]?.code ===
                "User.EmailNotConfirmed";

            if (notConfirmed) {
              Swal.fire({
                icon: "warning",
                title: "Email Not Confirmed",
                text: "This email is already registered but not confirmed. Do you want to resend the confirmation email?",
                showCancelButton: true,
                confirmButtonText: "Yes, resend",
                cancelButtonText: "No",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    await axiosInstance.post(
                      "/api/Auth/ResendConfirmationEmail",
                      { email: form.email }
                    );
                    setWaitingForConfirmation(true);
                    setUserEmail(form.email);
                    setResendDisabled(true);
                    setTimer(60);
                    Swal.fire({
                      icon: "success",
                      title: "Confirmation Email Sent",
                      text: "Please check your inbox.",
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  } catch (resendErr) {
                    Swal.fire({
                      icon: "error",
                      title: "Failed to Resend",
                      text:
                        resendErr.response?.data?.errors?.[0]?.description ||
                        "An error occurred while resending the email.",
                    });
                  }
                }
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: emailError,
              });
            }
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: emailError,
          });
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: "An unexpected error occurred.",
      });
    }
  };

  // Forget password handler
  const handleForgetPassword = async (e) => {
    e.preventDefault();
    MySwal.fire({
      title: "Sending reset code...",
      didOpen: () => {
        MySwal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      await axiosInstance.post(
        "/api/Auth/ForgetPassword",
        { email: forgetEmail },
        { headers: { "Content-Type": "application/json" } }
      );

      MySwal.close();
      setWaitingForConfirmation(true);
      setUserEmail(forgetEmail);
      setResendDisabled(true);
      setTimer(60);

      Swal.fire({
        icon: "info",
        title: "Reset Code Sent",
        text: "We've sent a reset code to your email. Please confirm to continue.",
        allowOutsideClick: false,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      MySwal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Please try again later",
      });
    }
  };

  // Common effects
  useEffect(() => {
    let countdown;
    if (waitingForConfirmation && resendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [waitingForConfirmation, resendDisabled]);

  useEffect(() => {
    let interval;
    if (waitingForConfirmation && userEmail) {
      interval = setInterval(async () => {
        try {
          const res = await axiosInstance.get(
            `/api/Auth/CheckConfirmationEmail?email=${encodeURIComponent(
              userEmail
            )}`
          );
          if (res.status === 200) {
            Swal.close();
            Swal.fire({
              icon: "success",
              title: "Email Confirmed",
              text:
                activeTab === "register"
                  ? "Your email has been confirmed. You can now login."
                  : "Your email has been confirmed. You can now reset your password.",
              timer: 2000,
              showConfirmButton: false,
            });
            setWaitingForConfirmation(false);
            clearInterval(interval);
            if (activeTab === "register") {
              setActiveTab("login");
            } else {
              setForgetMode(false);
            }
          }
        } catch (err) {
          console.error("Error checking email confirmation", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [waitingForConfirmation, userEmail, activeTab]);

  const handleResendEmail = async () => {
    try {
      await axiosInstance.post("/api/Auth/ResendConfirmationEmail", {
        email: forgetMode ? forgetEmail : form.email,
      });
      Swal.fire({
        icon: "success",
        title: "Email Resent",
        text: "A new confirmation email has been sent to your inbox.",
        timer: 2000,
        showConfirmButton: false,
      });
      setResendDisabled(true);
      setTimer(60);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Resend",
        text:
          err.response?.data?.errors?.[0]?.description ||
          "An error occurred while resending the email.",
      });
    }
  };

  const getValidationItem = (condition, label) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-gray-400" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );

  // Form validation
  const allFieldsFilled = Object.values(form).every((val) => val.trim() !== "");
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isRegisterFormValid = allFieldsFilled && allPasswordValid;
  const isLoginDisabled = !email || !password || loginLoading;

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 relative font-sans overflow-hidden transition-colors duration-300`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 dark:from-[#E41E26]/20 dark:to-[#FDB913]/20 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 dark:from-[#FDB913]/20 dark:to-[#E41E26]/20 rounded-full blur-3xl"></div>
      </div>

      {!showWelcome && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-6 left-6 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-3 text-[#E41E26] dark:text-gray-300 border border-[#E41E26]/30 dark:border-gray-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <FaArrowLeft size={18} />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
      >
        {/* Form Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E41E26]/5 to-transparent rounded-bl-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#FDB913]/5 to-transparent rounded-tr-3xl"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[600px]">
          {/* Left Side - Brand Section with Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-1 bg-gradient-to-br from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700 rounded-l-3xl p-8 flex flex-col transition-colors duration-300"
          >
            {/* Brand Content */}
            <div className="space-y-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                  Chicken One
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Join our community and experience the best service with secure
                authentication.
              </p>
            </div>

            {/* Tabs Navigation - Vertical */}
            <div className="flex flex-col gap-3 flex-1 justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabChange("login")}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === "login"
                    ? "bg-white dark:bg-gray-800 text-[#E41E26] dark:text-[#FDB913] shadow-lg border border-[#E41E26]/20 dark:border-[#FDB913]/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent"
                }`}
              >
                <div
                  className={`w-2 h-8 rounded-full ${
                    activeTab === "login"
                      ? "bg-[#E41E26] dark:bg-[#FDB913]"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
                <span className="flex-1 text-left">Sign In</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabChange("register")}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  activeTab === "register"
                    ? "bg-white dark:bg-gray-800 text-[#E41E26] dark:text-[#FDB913] shadow-lg border border-[#E41E26]/20 dark:border-[#FDB913]/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent"
                }`}
              >
                <div
                  className={`w-2 h-8 rounded-full ${
                    activeTab === "register"
                      ? "bg-[#E41E26] dark:bg-[#FDB913]"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
                <span className="flex-1 text-left">Create Account</span>
              </motion.button>
            </div>

            {/* Animated Dots */}
            <div className="flex space-x-2 justify-center mt-8">
              <div className="w-3 h-3 bg-[#E41E26] dark:bg-[#FDB913] rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-[#FDB913] dark:bg-[#E41E26] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-[#E41E26] dark:bg-[#FDB913] rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <div className="lg:col-span-2 flex flex-col justify-center px-6 py-6 md:px-8 md:py-8">
            {!waitingForConfirmation && !showWelcome && !forgetMode && (
              <AnimatePresence mode="wait">
                {/* Login Form */}
                {activeTab === "login" && (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-6 max-w-md mx-auto w-full"
                  >
                    <div className="text-center mb-2">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                        Welcome Back
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                        Sign in to your Chicken One account
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                          <FaEnvelope className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                          <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
                          <div
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
                          >
                            {showPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setForgetMode(true)}
                        className="text-[#E41E26] dark:text-[#FDB913] hover:text-[#FDB913] dark:hover:text-[#E41E26] underline text-sm font-medium transition-all duration-200"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoginDisabled}
                      className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
                        !isLoginDisabled
                          ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {loginLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        <>
                          Sign In
                          <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}

                {/* Register Form */}
                {activeTab === "register" && (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleRegister}
                    className="space-y-6 max-w-md mx-auto w-full"
                  >
                    <div className="text-center mb-2">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                        Create Account
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                        Join Chicken One and start your journey
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3">
                            <FaUser className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-10 pr-3 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-sm"
                          />
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-3">
                            <FaUser className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                          </div>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-10 pr-3 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-sm"
                          />
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                          <FaEnvelope className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                          <FaPhone className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          required
                          value={form.phoneNumber}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                          <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          required
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
                          <div
                            onClick={() =>
                              setShowRegisterPassword(!showRegisterPassword)
                            }
                            className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
                          >
                            {showRegisterPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                          <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          required
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm Password"
                          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
                          <div
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password Validation - Responsive */}
                    <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700 p-3 rounded-xl border border-[#FDB913]/30 dark:border-gray-600 space-y-2 transition-colors duration-300">
                      <p className="text-sm font-semibold text-[#E41E26] dark:text-[#FDB913]">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {getValidationItem(
                          passwordValidations.length,
                          "8+ characters"
                        )}
                        {getValidationItem(
                          passwordValidations.lowercase,
                          "Lowercase letter"
                        )}
                        {getValidationItem(
                          passwordValidations.uppercase,
                          "Uppercase letter"
                        )}
                        {getValidationItem(
                          passwordValidations.specialChar,
                          "Special character"
                        )}
                        {getValidationItem(
                          passwordValidations.match,
                          "Passwords match"
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!isRegisterFormValid || registerLoading}
                      className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
                        isRegisterFormValid
                          ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {registerLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <>
                          Create Account
                          <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}

            {/* Forget Password Form */}
            {!waitingForConfirmation && !showWelcome && forgetMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-md mx-auto w-full"
              >
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                    Reset Password
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                    Enter your email to receive a reset code
                  </p>
                </div>

                <form onSubmit={handleForgetPassword} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                      <FaEnvelope className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgetEmail}
                      onChange={(e) => setForgetEmail(e.target.value)}
                      placeholder="Your registered email"
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                    />
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setForgetMode(false)}
                      className="flex-1 py-3.5 border-2 border-[#E41E26] dark:border-[#FDB913] text-[#E41E26] dark:text-[#FDB913] rounded-xl font-semibold hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!forgetEmail}
                      className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                        forgetEmail
                          ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Send Reset Code
                      {forgetEmail && (
                        <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Waiting for Confirmation */}
            {waitingForConfirmation && !showWelcome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 space-y-6 max-w-md mx-auto w-full"
              >
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26] dark:border-[#FDB913]"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FDB913] dark:border-[#E41E26] opacity-75"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">
                  Waiting for Email Confirmation
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                  We've sent a confirmation email to{" "}
                  <span className="font-semibold text-[#E41E26] dark:text-[#FDB913]">
                    {forgetMode ? forgetEmail : form.email}
                  </span>
                  . Please check your inbox and confirm your account.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResendEmail}
                  disabled={resendDisabled}
                  className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
                    resendDisabled
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
                  }`}
                >
                  {resendDisabled
                    ? `Resend in ${timer}s`
                    : "Resend Confirmation Email"}
                  {!resendDisabled && (
                    <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                  )}
                </motion.button>

                <button
                  onClick={() => {
                    setWaitingForConfirmation(false);
                    setForgetMode(false);
                  }}
                  className="text-[#E41E26] dark:text-[#FDB913] hover:text-[#FDB913] dark:hover:text-[#E41E26] underline font-medium transition-colors duration-200 text-sm"
                >
                  Back to Login
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-colors duration-300"
            >
              <Confetti width={window.innerWidth} height={window.innerHeight} />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                className="text-center space-y-6"
              >
                <motion.h1
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent mb-4 font-poppins drop-shadow-lg"
                >
                  Welcome, {loggedUserName}!
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="flex items-center justify-center gap-3 text-xl font-semibold text-gray-800 dark:text-white"
                >
                  <span>Login Successful</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    <FaCheckCircle className="text-[#FDB913]" size={28} />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
