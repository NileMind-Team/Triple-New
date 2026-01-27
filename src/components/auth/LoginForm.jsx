import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginForm({
  email,
  password,
  showPassword,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onForgotPassword,
  onSubmit,
}) {
  const isDisabled = !email || !password || isLoading;

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-6 max-w-md mx-auto w-full"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold" style={{ color: "#2E3E88" }}>
          تسجيل الدخول إلى حسابك
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          أدخل بياناتك للوصول إلى جميع الميزات
        </p>
      </div>

      <div className="space-y-4">
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
            <FaLock
              className="text-lg transition-all duration-300 group-focus-within:scale-110"
              style={{ color: "#2E3E88" }}
            />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full border border-gray-200 bg-white text-black rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all duration-200 group-hover:border-[#2E3E88]/50 text-right"
            style={{
              background: `linear-gradient(135deg, #f8f9ff, #ffffff)`,
              focusRingColor: "#2E3E88",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleShowPassword}
              className="text-gray-500 hover:text-[#2E3E88] cursor-pointer transition-all duration-200 hover:scale-110"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[#2E3E88] hover:text-[#32B9CC] underline text-sm font-medium transition-all duration-200 flex items-center gap-1"
        >
          نسيت كلمة المرور؟
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isDisabled}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden group ${
          !isDisabled
            ? "hover:shadow-xl cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        style={
          !isDisabled
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
            جاري تسجيل الدخول...
          </div>
        ) : (
          <>
            تسجيل الدخول
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          </>
        )}
      </motion.button>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          بالدخول أنت توافق على{" "}
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
