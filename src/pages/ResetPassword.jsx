import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // دالة لعرض رسائل النجاح والفشل على الموبايل باستخدام toast
  const showMobileMessage = (type, title, text) => {
    if (window.innerWidth < 768) {
      if (type === "success") {
        toast.success(text, {
          position: "top-right",
          autoClose: 2500,
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
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
          },
        });
      } else if (type === "error") {
        toast.error(text, {
          position: "top-right",
          autoClose: 2500,
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
            background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
            color: "white",
          },
        });
      } else if (type === "info") {
        toast.info(text, {
          position: "top-right",
          autoClose: 2500,
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
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
          },
        });
      }
      return true;
    }
    return false;
  };

  const passwordValidations = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    specialChar: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword !== "" && newPassword === confirmPassword,
  };

  const allFieldsFilled =
    newPassword.trim() !== "" && confirmPassword.trim() !== "";
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isFormValid = allFieldsFilled && allPasswordValid;

  const getValidationItem = (condition, label) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle style={{ color: "#4CAF50" }} />
      ) : (
        <FaTimesCircle className="text-gray-400" />
      )}
      <span style={condition ? { color: "#4CAF50" } : { color: "#9E9E9E" }}>
        {label}
      </span>
    </div>
  );

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      const isMobile = showMobileMessage(
        "error",
        "كلمة المرور لا تلبي المتطلبات",
        "يرجى التأكد من استيفاء جميع شروط كلمة المرور",
      );

      if (!isMobile) {
        Swal.fire({
          icon: "error",
          title: "كلمة المرور لا تلبي المتطلبات",
          text: "يرجى التأكد من استيفاء جميع شروط كلمة المرور",
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
          showConfirmButton: false,
          timer: 2500,
        });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/api/Auth/ResetPassword",
        { email, code, newPassword },
        { headers: { "Content-Type": "application/json" } },
      );

      setMessage(res.data.message || "تم إعادة تعيين كلمة المرور بنجاح.");
      setSuccess(true);

      const isMobile = showMobileMessage(
        "success",
        "تم إعادة تعيين كلمة المرور بنجاح",
        res.data.message || "تم إعادة تعيين كلمة المرور بنجاح.",
      );

      if (!isMobile) {
        Swal.fire({
          icon: "success",
          title: "تم إعادة تعيين كلمة المرور بنجاح",
          text: res.data.message || "تم إعادة تعيين كلمة المرور بنجاح.",
          showConfirmButton: false,
          timer: 2000,
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
        });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور.";
      setMessage(errorMsg);
      setSuccess(false);

      const isMobile = showMobileMessage(
        "error",
        "فشل إعادة تعيين كلمة المرور",
        errorMsg,
      );

      if (!isMobile) {
        Swal.fire({
          icon: "error",
          title: "فشل إعادة تعيين كلمة المرور",
          text: errorMsg,
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "white",
          showConfirmButton: false,
          timer: 2500,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div
          className="relative py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate("/login")}
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-8"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                <FaLock className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                إعادة تعيين كلمة المرور
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                أدخل كلمة المرور الجديدة أدناه
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-8">
              {!loading && message ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  <div
                    className="rounded-full p-4"
                    style={{
                      background: success
                        ? "linear-gradient(135deg, #4CAF50/20, #2E3E88/20)"
                        : "linear-gradient(135deg, #FF6B6B/20, #FF8E53/20)",
                    }}
                  >
                    {success ? (
                      <svg
                        className="w-16 h-16"
                        style={{ color: "#4CAF50" }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-16 h-16"
                        style={{ color: "#FF6B6B" }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>

                  <h2
                    className="text-2xl font-bold text-center"
                    style={{
                      background: success
                        ? "linear-gradient(135deg, #2E3E88, #32B9CC)"
                        : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {success
                      ? "تم إعادة تعيين كلمة المرور بنجاح"
                      : "فشل إعادة التعيين"}
                  </h2>

                  <p
                    className="text-center text-lg leading-relaxed"
                    style={{ color: "#32B9CC" }}
                  >
                    {message}
                  </p>

                  {success && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/login")}
                      className="mt-4 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                        color: "white",
                        boxShadow: "0 10px 25px #2E3E8830",
                      }}
                    >
                      العودة لتسجيل الدخول
                    </motion.button>
                  )}
                </div>
              ) : (
                <>
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        كلمة المرور الجديدة
                      </label>
                      <div className="relative group">
                        <FaLock
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور الجديدة"
                          className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          dir="rtl"
                        />
                        <div
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          style={{ color: "#32B9CC" }}
                        >
                          {showPassword ? (
                            <FaEyeSlash size={18} />
                          ) : (
                            <FaEye size={18} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "#2E3E88" }}
                      >
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative group">
                        <FaLock
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "#2E3E88" }}
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="تأكيد كلمة المرور الجديدة"
                          className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9ff, #ffffff)",
                          }}
                          dir="rtl"
                        />
                        <div
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          style={{ color: "#32B9CC" }}
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash size={18} />
                          ) : (
                            <FaEye size={18} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-xl space-y-2"
                      style={{
                        background:
                          "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
                        border: "1px solid #2E3E8820",
                      }}
                    >
                      <p
                        className="text-sm font-semibold mb-3"
                        style={{ color: "#2E3E88" }}
                      >
                        متطلبات كلمة المرور:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {getValidationItem(
                          passwordValidations.length,
                          "8 أحرف على الأقل",
                        )}
                        {getValidationItem(
                          passwordValidations.lowercase,
                          "حرف صغير واحد على الأقل",
                        )}
                        {getValidationItem(
                          passwordValidations.uppercase,
                          "حرف كبير واحد على الأقل",
                        )}
                        {getValidationItem(
                          passwordValidations.specialChar,
                          "رمز خاص واحد على الأقل",
                        )}
                        {getValidationItem(
                          passwordValidations.match,
                          "كلمتا المرور متطابقتان",
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!isFormValid || loading}
                      className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isFormValid
                          ? "shadow-lg hover:shadow-xl cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      style={
                        isFormValid
                          ? {
                              background:
                                "linear-gradient(135deg, #2E3E88, #32B9CC)",
                              color: "white",
                            }
                          : {
                              background: "#e5e7eb",
                              color: "#6b7280",
                            }
                      }
                    >
                      {loading ? (
                        <>
                          <div
                            className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2"
                            style={{ borderColor: "white" }}
                          ></div>
                          جاري إعادة تعيين كلمة المرور...
                        </>
                      ) : (
                        <>
                          <FaLock />
                          إعادة تعيين كلمة المرور
                        </>
                      )}
                    </motion.button>
                  </form>

                  <div className="flex space-x-2 justify-center mt-8">
                    <div
                      className="w-3 h-3 rounded-full animate-bounce"
                      style={{ backgroundColor: "#2E3E88" }}
                    ></div>
                    <div
                      className="w-3 h-3 rounded-full animate-bounce"
                      style={{
                        backgroundColor: "#32B9CC",
                        animationDelay: "0.2s",
                      }}
                    ></div>
                    <div
                      className="w-3 h-3 rounded-full animate-bounce"
                      style={{
                        backgroundColor: "#2E3E88",
                        animationDelay: "0.4s",
                      }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
