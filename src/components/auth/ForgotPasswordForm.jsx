import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";

export default function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  onBack,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-md mx-auto w-full"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold" style={{ color: "#2E3E88" }}>
          إعادة تعيين كلمة المرور
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          أدخل بريدك الإلكتروني لاستلام رمز إعادة التعيين
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaEnvelope
              className="text-lg transition-all duration-300 group-focus-within:scale-110"
              style={{ color: "#2E3E88" }}
            />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="بريدك الإلكتروني المسجل"
            className="w-full border border-gray-200 bg-white text-black rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-right"
            style={{
              background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
              focusRingColor: "#2E3E88",
            }}
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 border-2 rounded-xl font-semibold transition-all duration-300"
            style={{
              borderColor: "#2E3E88",
              color: "#2E3E88",
              background: "transparent",
            }}
          >
            رجوع
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!email}
            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
              email
                ? "hover:shadow-xl cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            style={
              email
                ? {
                    background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                    color: "white",
                    boxShadow: `0 10px 25px #2E3E8830`,
                  }
                : {}
            }
          >
            إرسال رمز إعادة التعيين
            <FaArrowRight className="inline mr-2 group-hover:translate-x-1 transition-transform" />
            {email && (
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            )}
          </motion.button>
        </div>
      </form>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          سنرسل رمز إعادة التعيين إلى بريدك الإلكتروني المسجل
        </p>
      </div>
    </motion.div>
  );
}
