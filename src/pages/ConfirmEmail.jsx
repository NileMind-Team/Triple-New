import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const hasConfirmed = useRef(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");
    const decodedCode = code ? decodeURIComponent(code) : null;

    if (!userId || !decodedCode) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "The link you used is incomplete or invalid.",
        customClass: {
          popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
        },
      });
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

        setMessage(
          res.data.message || "Your email has been confirmed successfully."
        );
        setSuccess(true);

        Swal.fire({
          icon: "success",
          title: "Email Confirmed",
          text:
            res.data.message || "Your email has been confirmed successfully.",
          showConfirmButton: false,
          timer: 2000,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });

        setLoading(false);
      } catch (err) {
        const errorCode = err.response?.data?.errors?.[0]?.code || "";
        if (errorCode === "User.DuplicatedConfirmation") {
          setMessage("Your email has already been confirmed.");
          setSuccess(true);
          Swal.fire({
            icon: "info",
            title: "Already Confirmed",
            text: "Your email was already confirmed previously.",
            showConfirmButton: false,
            timer: 2000,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        } else {
          setMessage(
            err.response?.data?.errors?.[0]?.description ||
              "An error occurred while confirming your email."
          );
          setSuccess(false);
          Swal.fire({
            icon: "error",
            title: "Email Confirmation Failed",
            text:
              err.response?.data?.errors?.[0]?.description ||
              "An error occurred while confirming your email.",
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 relative font-sans overflow-hidden transition-colors duration-300">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 dark:from-[#E41E26]/20 dark:to-[#FDB913]/20 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 dark:from-[#FDB913]/20 dark:to-[#E41E26]/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
      >
        {/* Form Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E41E26]/5 to-transparent rounded-bl-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#FDB913]/5 to-transparent rounded-tr-3xl"></div>

        <div className="p-8">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-6 py-4"
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26] dark:border-[#FDB913]"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FDB913] dark:border-[#E41E26] opacity-75"></div>
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent text-center">
                Confirming Your Email...
              </h2>

              <p className="text-gray-600 dark:text-gray-300 text-center text-lg leading-relaxed">
                Please wait a moment while we verify your email.
              </p>

              {/* Animated Dots */}
              <div className="flex space-x-2 justify-center mt-4">
                <div className="w-3 h-3 bg-[#E41E26] rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-[#FDB913] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-[#E41E26] rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
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
                className={`rounded-full p-4 ${
                  success
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {success ? (
                  <FaCheckCircle className="w-16 h-16 text-green-500" />
                ) : (
                  <FaTimesCircle className="w-16 h-16 text-red-500" />
                )}
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent text-center">
                {success ? "Email Confirmed" : "Confirmation Failed"}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 text-center text-lg leading-relaxed">
                {message}
              </p>

              {success && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="mt-4 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300"
                >
                  Back to Login
                </motion.button>
              )}

              {!success && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="mt-4 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300"
                >
                  Try Again
                </motion.button>
              )}

              {/* Animated Dots */}
              <div className="flex space-x-2 justify-center mt-4">
                <div className="w-2 h-2 bg-[#E41E26] rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-[#FDB913] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#E41E26] rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
