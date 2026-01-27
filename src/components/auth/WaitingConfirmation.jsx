import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";

export default function WaitingConfirmation({
  forgetMode,
  email,
  timer,
  resendDisabled,
  onResendEmail,
  onBackToLogin,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 space-y-6 max-w-md mx-auto w-full"
    >
      {/* Animated Icon */}
      <div className="relative">
        <div
          className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
          style={{
            borderTopColor: "#2E3E88",
            borderRightColor: "#32B9CC",
            borderBottomColor: "#2E3E88",
            borderLeftColor: "transparent",
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaEnvelope className="text-[#2E3E88] text-2xl" />
        </div>
      </div>

      <h2
        className="text-xl font-bold text-center"
        style={{ color: "#2E3E88" }}
      >
        {forgetMode
          ? "تم إرسال رمز إعادة التعيين"
          : "في انتظار تأكيد البريد الإلكتروني"}
      </h2>

      <p className="text-gray-600 text-center text-sm">
        {forgetMode
          ? `لقد أرسلنا رمز إعادة التعيين إلى بريدك الإلكتروني 
          <span class="font-semibold text-[#2E3E88]">${email}</span>. 
          يرجى التحقق من صندوق الوارد لإعادة تعيين كلمة المرور.`
          : `لقد أرسلنا بريد تأكيد إلى 
          <span class="font-semibold text-[#2E3E88]">${email}</span>. 
          يرجى التحقق من صندوق الوارد وتأكيد حسابك.`}
      </p>

      {/* Resend Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onResendEmail}
        disabled={resendDisabled}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden group ${
          resendDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "hover:shadow-xl cursor-pointer"
        }`}
        style={
          !resendDisabled
            ? {
                background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                color: "white",
                boxShadow: `0 10px 25px #2E3E8830`,
              }
            : {}
        }
      >
        {resendDisabled
          ? `إعادة الإرسال بعد ${timer} ثانية`
          : `إعادة إرسال ${forgetMode ? "رمز إعادة التعيين" : "بريد التأكيد"}`}
        {!resendDisabled && (
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
        )}
      </motion.button>

      {/* Back to Login Button */}
      <button
        onClick={onBackToLogin}
        className="text-[#2E3E88] hover:text-[#32B9CC] underline font-medium transition-colors duration-200 text-sm flex items-center gap-1"
      >
        <span>العودة إلى تسجيل الدخول</span>
        <FaCheckCircle className="text-sm" />
      </button>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {forgetMode
            ? "سيصلك الرمز خلال دقائق قليلة"
            : "قد يستغرق وصول البريد الإلكتروني بضع دقائق"}
        </p>
      </div>
    </motion.div>
  );
}
