import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaBuilding,
  FaUserShield,
  FaUserTag,
} from "react-icons/fa";

export default function UserForm({
  formData,
  setFormData,
  availableRoles,
  handleRoleToggle,
  handleSubmit,
  resetForm,
  getRoleIcon,
  isFormValid,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const getRoleIconFull = (role) => {
    switch (role) {
      case "Admin":
        return <FaUserShield className="text-base sm:text-lg" />;
      case "Restaurant":
        return <FaBuilding className="text-base sm:text-lg" />;
      case "Branch":
        return <FaUserTag className="text-base sm:text-lg" />;
      default:
        return <FaUser className="text-base sm:text-lg" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2 sm:mx-0"
    >
      {/* Modal Header */}
      <div
        className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <FaUserShield className="text-sm sm:text-base" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            إضافة مستخدم جديد
          </h3>
        </div>
        <button
          onClick={resetForm}
          className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
        >
          <FaTimes size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label
                className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                style={{ color: "#2E3E88" }}
              >
                الاسم الأول *
              </label>
              <div className="relative group">
                <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full border border-gray-200 rounded-xl pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                  placeholder="الاسم الأول"
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                style={{ color: "#2E3E88" }}
              >
                الاسم الأخير *
              </label>
              <div className="relative group">
                <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full border border-gray-200 rounded-xl pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                  placeholder="الاسم الأخير"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
              style={{ color: "#2E3E88" }}
            >
              البريد الإلكتروني *
            </label>
            <div className="relative group">
              <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border border-gray-200 rounded-xl pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="البريد الإلكتروني"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
              style={{ color: "#2E3E88" }}
            >
              رقم الهاتف
            </label>
            <div className="relative group">
              <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="رقم الهاتف"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
              style={{ color: "#2E3E88" }}
            >
              كلمة المرور *
            </label>
            <div className="relative group">
              <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2E3E88] cursor-pointer transition-colors duration-200"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-sm sm:text-base" />
                ) : (
                  <FaEye className="text-sm sm:text-base" />
                )}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full border border-gray-200 rounded-xl pr-10 sm:pr-12 pl-10 sm:pl-12 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="كلمة المرور"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
              style={{ color: "#2E3E88" }}
            >
              الصلاحيات *
            </label>
            <div
              className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl border"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                border: "1px solid #2E3E8820",
              }}
            >
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    id={`role-${role.name}`}
                    checked={formData.roles.includes(role.name)}
                    onChange={() => handleRoleToggle(role.name)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#2E3E88] bg-white border-gray-300 rounded focus:ring-2 focus:ring-[#2E3E88] focus:ring-offset-0"
                  />
                  <label
                    htmlFor={`role-${role.name}`}
                    className="flex items-center gap-2 sm:gap-3 text-sm font-medium cursor-pointer flex-1"
                    style={{ color: "#2E3E88" }}
                  >
                    <span className="text-sm sm:text-base">
                      {getRoleIconFull(role.name)}
                    </span>
                    <span className="text-xs sm:text-sm">{role.name}</span>
                    <span
                      className="text-xs mr-auto"
                      style={{ color: "#32B9CC" }}
                    >
                      {formData.roles.includes(role.name)
                        ? "✓ محددة"
                        : "غير محددة"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="flex-1 py-2.5 sm:py-3.5 border-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
              style={{
                borderColor: "#2E3E88",
                color: "#2E3E88",
                background: "transparent",
              }}
            >
              إلغاء
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isFormValid()}
              className={`flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                isFormValid()
                  ? "shadow-lg hover:shadow-xl cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              style={
                isFormValid()
                  ? {
                      background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                      color: "white",
                    }
                  : {
                      background: "#e5e7eb",
                      color: "#6b7280",
                    }
              }
            >
              <FaCheck className="text-xs sm:text-sm" />
              إضافة مستخدم
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
