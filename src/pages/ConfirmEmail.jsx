import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const hasConfirmed = useRef(false);

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

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");
    const decodedCode = code ? decodeURIComponent(code) : null;

    if (!userId || !decodedCode) {
      const isMobile = showMobileMessage(
        "error",
        "رابط غير صالح",
        "الرابط الذي استخدمته غير مكتمل أو غير صالح.",
      );

      if (!isMobile) {
        Swal.fire({
          icon: "error",
          title: "رابط غير صالح",
          text: "الرابط الذي استخدمته غير مكتمل أو غير صالح.",
          confirmButtonText: "حاول مرة أخرى",
          timer: 2500,
          showConfirmButton: false,
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          color: "white",
        });
      }

      setLoading(false);
      setSuccess(false);
      return;
    }

    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    const confirmEmail = async () => {
      try {
        const res = await axiosInstance.post("/api/Auth/ConfirmEmail", {
          userId,
          code: decodedCode,
        });

        setMessage(res.data.message || "تم تأكيد بريدك الإلكتروني بنجاح.");
        setSuccess(true);

        const isMobile = showMobileMessage(
          "success",
          "تم تأكيد البريد الإلكتروني",
          res.data.message || "تم تأكيد بريدك الإلكتروني بنجاح.",
        );

        if (!isMobile) {
          Swal.fire({
            icon: "success",
            title: "تم تأكيد البريد الإلكتروني",
            text: res.data.message || "تم تأكيد بريدك الإلكتروني بنجاح.",
            showConfirmButton: false,
            timer: 2000,
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
          });
        }

        setLoading(false);
      } catch (err) {
        const errorCode = err.response?.data?.errors?.[0]?.code || "";
        if (errorCode === "User.DuplicatedConfirmation") {
          setMessage("تم تأكيد بريدك الإلكتروني مسبقاً.");
          setSuccess(true);

          const isMobile = showMobileMessage(
            "info",
            "تم التأكيد مسبقاً",
            "تم تأكيد بريدك الإلكتروني مسبقاً.",
          );

          if (!isMobile) {
            Swal.fire({
              icon: "info",
              title: "تم التأكيد مسبقاً",
              text: "تم تأكيد بريدك الإلكتروني مسبقاً.",
              showConfirmButton: false,
              timer: 2000,
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              color: "white",
            });
          }
        } else {
          const errorDescription =
            err.response?.data?.errors?.[0]?.description ||
            "حدث خطأ أثناء تأكيد بريدك الإلكتروني.";
          setMessage(errorDescription);
          setSuccess(false);

          const isMobile = showMobileMessage(
            "error",
            "فشل تأكيد البريد الإلكتروني",
            errorDescription,
          );

          if (!isMobile) {
            Swal.fire({
              icon: "error",
              title: "فشل تأكيد البريد الإلكتروني",
              text: errorDescription,
              confirmButtonText: "حاول مرة أخرى",
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              color: "white",
            });
          }
        }
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative font-sans overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
          }}
        ></div>
        <div
          className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #32B9CC/10, #2E3E88/10)",
          }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 relative overflow-hidden"
      >
        {/* Form Background Pattern */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-3xl"
          style={{
            background:
              "linear-gradient(to bottom left, #2E3E88/5, transparent)",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-3xl"
          style={{
            background: "linear-gradient(to top right, #32B9CC/5, transparent)",
          }}
        ></div>

        <div className="p-8">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-6 py-4"
            >
              <div className="relative">
                <div
                  className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
                  style={{
                    borderTopColor: "#2E3E88",
                    borderRightColor: "#32B9CC",
                    borderBottomColor: "#2E3E88",
                    borderLeftColor: "transparent",
                  }}
                ></div>
              </div>

              <h2
                className="text-2xl font-bold text-center"
                style={{ color: "#2E3E88" }}
              >
                جاري تأكيد بريدك الإلكتروني...
              </h2>

              <p
                className="text-center text-lg leading-relaxed"
                style={{ color: "#32B9CC" }}
              >
                يرجى الانتظار لحظة بينما نقوم بالتحقق من بريدك الإلكتروني.
              </p>

              {/* Animated Dots */}
              <div className="flex space-x-2 justify-center mt-4">
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-6 py-4"
            >
              <div
                className="rounded-full p-4"
                style={{
                  background: success
                    ? "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)"
                    : "linear-gradient(135deg, #FF6B6B/10, #FF8E53/10)",
                }}
              >
                {success ? (
                  <FaCheckCircle
                    className="w-16 h-16"
                    style={{ color: "#4CAF50" }}
                  />
                ) : (
                  <FaTimesCircle
                    className="w-16 h-16"
                    style={{ color: "#FF6B6B" }}
                  />
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
                {success ? "تم تأكيد البريد الإلكتروني" : "فشل التأكيد"}
              </h2>

              <p
                className="text-center text-lg leading-relaxed"
                style={{ color: success ? "#2E3E88" : "#FF6B6B" }}
              >
                {message}
              </p>

              {success && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="mt-4 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                    color: "white",
                    boxShadow: "0 10px 25px #2E3E8830",
                  }}
                >
                  العودة لتسجيل الدخول
                </motion.button>
              )}

              {!success && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="mt-4 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                    color: "white",
                    boxShadow: "0 10px 25px #2E3E8830",
                  }}
                >
                  المحاولة مرة أخرى
                </motion.button>
              )}

              {/* Animated Dots */}
              <div className="flex space-x-2 justify-center mt-4">
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "#2E3E88" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#32B9CC",
                    animationDelay: "0.2s",
                  }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#2E3E88",
                    animationDelay: "0.4s",
                  }}
                ></div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
