import { forwardRef } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaGoogle, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const AuthLayout = forwardRef(
  (
    {
      children,
      activeTab,
      onTabChange,
      onBack,
      showWelcome,
      isProcessingGoogle,
      onGoogleLogin,
      isGoogleLoading,
      onLoginTabClick,
      onRegisterTabClick,
    },
    ref,
  ) => {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 relative font-sans overflow-hidden transition-colors duration-300`}
        style={{
          background: `linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)`,
          backgroundAttachment: "fixed",
        }}
        dir="rtl"
      >
        {/* Background decorative elements - متوافق مع العناوين والعربة */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#32B9CC]/10 to-[#2E3E88]/10 rounded-full blur-3xl"></div>
          {/* Floating particles effect */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-[#2E3E88]/30 to-[#32B9CC]/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {!showWelcome && !isProcessingGoogle && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="fixed top-6 left-6 z-50 bg-white/80 backdrop-blur-md hover:bg-[#2E3E88] hover:text-white rounded-full p-3 text-[#2E3E88] border border-[#2E3E88]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
            style={{ left: "1.5rem", right: "auto" }}
          >
            <FaArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: "spring",
            damping: 15,
          }}
          className="w-full max-w-6xl bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 relative overflow-hidden"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
          ref={ref}
        >
          {/* Form Background Pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#2E3E88]/5 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#32B9CC]/5 to-transparent rounded-tr-3xl"></div>
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-transparent via-[#2E3E88]/20 to-transparent">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2E3E88]/0 via-[#32B9CC]/0 to-[#2E3E88]/0 animate-gradient-x"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[650px] relative z-10">
            {/* Left Side - Brand Section with Tabs */}
            {!isProcessingGoogle && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="lg:col-span-1 rounded-l-3xl p-8 flex flex-col relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                }}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Brand Content */}
                <div className="space-y-6 mb-8 relative z-10">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                    {activeTab === "login" ? (
                      <FaSignInAlt className="text-white text-3xl" />
                    ) : (
                      <FaUserPlus className="text-white text-3xl" />
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-white leading-tight text-right">
                    {activeTab === "login" ? "مرحباً بعودتك" : "انضم إلينا"}
                  </h1>
                  <p className="text-white/80 leading-relaxed text-right">
                    {activeTab === "login"
                      ? "سجل الدخول لتجربة أفضل الخدمات مع نظام أمان متكامل."
                      : "انضم إلى مجتمعنا واستمتع بأفضل الخدمات مع نظام أمان متكامل."}
                  </p>
                </div>

                {/* Tabs Navigation - Vertical */}
                <div className="flex flex-col gap-3 flex-1 justify-center relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onTabChange("login");
                      if (window.innerWidth < 1024 && onLoginTabClick) {
                        onLoginTabClick();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm ${
                      activeTab === "login"
                        ? "bg-white/20 text-white shadow-lg border border-white/30"
                        : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-8 rounded-full transition-all duration-300 ${
                        activeTab === "login"
                          ? "bg-white"
                          : "bg-white/50 group-hover:bg-white"
                      }`}
                    ></div>
                    <span className="flex-1 text-right">تسجيل الدخول</span>
                    {activeTab === "login" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onTabChange("register");
                      if (window.innerWidth < 1024 && onRegisterTabClick) {
                        onRegisterTabClick();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm ${
                      activeTab === "register"
                        ? "bg-white/20 text-white shadow-lg border border-white/30"
                        : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-8 rounded-full transition-all duration-300 ${
                        activeTab === "register"
                          ? "bg-white"
                          : "bg-white/50 group-hover:bg-white"
                      }`}
                    ></div>
                    <span className="flex-1 text-right">إنشاء حساب</span>
                    {activeTab === "register" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                </div>

                {/* Google Login Button */}
                <div className="mt-6 mb-6 relative z-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white/80">
                        أو تابع باستخدام
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isGoogleLoading}
                    className={`w-full flex items-center justify-center gap-3 font-semibold py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                      isGoogleLoading
                        ? "bg-white/10 border border-white/20 cursor-not-allowed"
                        : "bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 hover:shadow-lg"
                    }`}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span className="text-white">جاري التوجيه...</span>
                      </div>
                    ) : (
                      <>
                        <FaGoogle className="text-white" size={20} />
                        <span className="text-white">
                          {activeTab === "login"
                            ? "تسجيل الدخول عبر Google"
                            : "إنشاء حساب عبر Google"}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center mt-4 relative z-10">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white/80 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating elements animation */}
                <div className="absolute bottom-0 left-0 right-0 h-1">
                  <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Right Side - Auth Form */}
            <div
              className={`${
                isProcessingGoogle ? "lg:col-span-3" : "lg:col-span-2"
              } flex flex-col justify-center px-6 py-6 md:px-8 md:py-8`}
            >
              {children}
            </div>
          </div>
        </motion.div>

        {/* CSS for gradient animation */}
        <style jsx>{`
          @keyframes gradient-x {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
            background-size: 200% 200%;
          }
        `}</style>
      </div>
    );
  },
);

AuthLayout.displayName = "AuthLayout";

export default AuthLayout;
