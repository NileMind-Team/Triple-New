import React from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function RegisterForm({
  formData,
  showRegisterPassword,
  showConfirmPassword,
  passwordValidations,
  isLoading,
  onInputChange,
  onToggleRegisterPassword,
  onToggleConfirmPassword,
  onSubmit,
}) {
  const getValidationItem = (condition, label) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-gray-400" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
    </motion.div>
  );

  const allFieldsFilled = Object.values(formData).every(
    (val) => val.trim() !== "",
  );
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isFormValid = allFieldsFilled && allPasswordValid;

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-4 max-w-md mx-auto w-full"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold" style={{ color: "#2E3E88" }}>
          انضم إلى مجتمعنا
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          ابدأ رحلتك معنا في خطوات بسيطة
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-3">
              <FaUser
                className="text-lg transition-all duration-300 group-focus-within:scale-110"
                style={{ color: "#2E3E88" }}
              />
            </div>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={(e) => onInputChange(e.target.name, e.target.value)}
              placeholder="الاسم الأول"
              className="w-full border border-gray-200 bg-white text-black rounded-xl pr-10 pl-3 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-sm text-right"
              style={{
                background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                focusRingColor: "#2E3E88",
              }}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-3">
              <FaUser
                className="text-lg transition-all duration-300 group-focus-within:scale-110"
                style={{ color: "#2E3E88" }}
              />
            </div>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={(e) => onInputChange(e.target.name, e.target.value)}
              placeholder="الاسم الأخير"
              className="w-full border border-gray-200 bg-white text-black rounded-xl pr-10 pl-3 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-sm text-right"
              style={{
                background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
                focusRingColor: "#2E3E88",
              }}
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaEnvelope
              className="text-lg transition-all duration-300 group-focus-within:scale-110"
              style={{ color: "#2E3E88" }}
            />
          </div>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="البريد الإلكتروني"
            className="w-full border border-gray-200 bg-white text-black rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-right"
            style={{
              background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
              focusRingColor: "#2E3E88",
            }}
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaPhone
              className="text-lg transition-all duration-300 group-focus-within:scale-110"
              style={{ color: "#2E3E88" }}
            />
          </div>
          <input
            type="tel"
            name="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="رقم الهاتف"
            className="w-full border border-gray-200 bg-white text-black rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-right"
            style={{
              background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
              focusRingColor: "#2E3E88",
            }}
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaLock
              className="text-lg transition-all duration-300 group-focus-within:scale-110"
              style={{ color: "#2E3E88" }}
            />
          </div>
          <input
            type={showRegisterPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="كلمة المرور"
            className="w-full border border-gray-200 bg-white text-black rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-right"
            style={{
              background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
              focusRingColor: "#2E3E88",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleRegisterPassword}
              className="text-gray-500 hover:text-[#2E3E88] cursor-pointer transition-all duration-200 hover:scale-110"
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
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaLock
              className="text-lg transition-all duration-300 group-focus-within:scale-110"
              style={{ color: "#2E3E88" }}
            />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="تأكيد كلمة المرور"
            className="w-full border border-gray-200 bg-white text-black rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-right"
            style={{
              background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
              focusRingColor: "#2E3E88",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleConfirmPassword}
              className="text-gray-500 hover:text-[#2E3E88] cursor-pointer transition-all duration-200 hover:scale-110"
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

      {/* Password Validation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border space-y-2"
        style={{
          background: `linear-gradient(135deg, #2E3E88/5, #32B9CC/5)`,
          borderColor: "#2E3E88/30",
        }}
      >
        <p
          className="text-sm font-semibold text-right"
          style={{ color: "#2E3E88" }}
        >
          متطلبات كلمة المرور:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {getValidationItem(passwordValidations.length, "8 أحرف على الأقل")}
          {getValidationItem(passwordValidations.lowercase, "حرف صغير")}
          {getValidationItem(passwordValidations.uppercase, "حرف كبير")}
          {getValidationItem(passwordValidations.specialChar, "رمز خاص")}
          {getValidationItem(passwordValidations.match, "كلمات المرور متطابقة")}
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden group ${
          isFormValid
            ? "hover:shadow-xl cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        style={
          isFormValid
            ? {
                background: `linear-gradient(135deg, #2E3E88, #32B9CC)`,
                color: "white",
                boxShadow: `0 10px 25px #2E3E8830`,
              }
            : {}
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div
              className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white ml-2"
              style={{ borderColor: "white" }}
            ></div>
            جاري إنشاء الحساب...
          </div>
        ) : (
          <>
            إنشاء الحساب
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </>
        )}
      </motion.button>

      {/* Terms and Conditions */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          بالتسجيل أنت توافق على{" "}
          <button type="button" className="text-[#2E3E88] hover:underline">
            الشروط والأحكام
          </button>{" "}
          و{" "}
          <button type="button" className="text-[#2E3E88] hover:underline">
            سياسة الخصوصية
          </button>
        </p>
      </div>
    </motion.form>
  );
}
