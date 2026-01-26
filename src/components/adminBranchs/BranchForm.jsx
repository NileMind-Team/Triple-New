import React, { useState } from "react";
import {
  FaBuilding,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaCity,
  FaUser,
  FaClock,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaUsers,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PhoneNumbersSection from "./PhoneNumbersSection";

const BranchForm = ({
  formData,
  setFormData,
  cities,
  managers,
  onSubmit,
  onCancel,
  isEditing,
  openDropdown,
  setOpenDropdown,
  convert12To24HourFormat,
}) => {
  const [localOpenDropdown, setLocalOpenDropdown] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    if (name === "openingTime" || name === "closingTime") {
      if (value && convert12To24HourFormat) {
        processedValue = convert12To24HourFormat(value);
      }
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setLocalOpenDropdown(null);
    if (setOpenDropdown) setOpenDropdown(null);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.openingTime.trim() !== "" &&
      formData.closingTime.trim() !== "" &&
      formData.cityId !== "" &&
      formData.managerId !== "" &&
      formData.phoneNumbers.length > 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      const dataToSubmit = {
        ...formData,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        supportsShifts:
          formData.supportsShifts !== undefined
            ? formData.supportsShifts
            : false,
      };

      onSubmit(dataToSubmit);
    }
  };

  const currentDropdown = openDropdown || localOpenDropdown;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
    >
      {/* Modal Header */}
      <div
        className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        }}
      >
        <div className="flex items-center gap-3">
          {isEditing ? <FaBuilding /> : <FaBuilding />}
          <h3 className="text-lg font-bold text-white">
            {isEditing ? "تعديل الفرع" : "إضافة فرع جديد"}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#2E3E88" }}
            >
              اسم الفرع *
            </label>
            <div className="relative group">
              <FaBuilding className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="اسم الفرع"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#2E3E88" }}
            >
              البريد الإلكتروني *
            </label>
            <div className="relative group">
              <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
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
              className="block text-sm font-semibold mb-2"
              style={{ color: "#2E3E88" }}
            >
              العنوان *
            </label>
            <div className="relative group">
              <FaMapMarkerAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="العنوان الكامل"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#2E3E88" }}
            >
              رابط الموقع
            </label>
            <div className="relative group">
              <FaGlobe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="url"
                name="locationUrl"
                value={formData.locationUrl}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="رابط خرائط جوجل (اختياري)"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#2E3E88" }}
              >
                المدينة *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setLocalOpenDropdown(
                      currentDropdown === "city" ? null : "city",
                    )
                  }
                  className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FaCity className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                    <span className="font-medium">
                      {formData.cityId
                        ? cities.find((c) => c.id === formData.cityId)?.name
                        : "اختر المدينة"}
                    </span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: currentDropdown === "city" ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#2E3E88]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {currentDropdown === "city" && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                    >
                      {cities.map((city) => (
                        <li
                          key={city.id}
                          onClick={() => handleSelectChange("cityId", city.id)}
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                        >
                          {city.name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#2E3E88" }}
              >
                المدير *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setLocalOpenDropdown(
                      currentDropdown === "manager" ? null : "manager",
                    )
                  }
                  className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FaUser className="text-[#2E3E88] group-hover:scale-110 transition-transform" />
                    <span className="font-medium">
                      {formData.managerId
                        ? managers.find((m) => m.id === formData.managerId)
                            ?.firstName +
                          " " +
                          managers.find((m) => m.id === formData.managerId)
                            ?.lastName
                        : "اختر المدير"}
                    </span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: currentDropdown === "manager" ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#2E3E88]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {currentDropdown === "manager" && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                    >
                      {managers.map((manager) => (
                        <li
                          key={manager.id}
                          onClick={() =>
                            handleSelectChange("managerId", manager.id)
                          }
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                        >
                          {manager.firstName} {manager.lastName} (
                          {manager.email})
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#2E3E88" }}
            >
              الحالة *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setLocalOpenDropdown(
                    currentDropdown === "status" ? null : "status",
                  )
                }
                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 transition-all hover:border-[#2E3E88] group text-right"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formData.status === "Open" ? "مفتوح" : "مغلق"}
                  </span>
                </div>
                <motion.div
                  animate={{
                    rotate: currentDropdown === "status" ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown className="text-[#2E3E88]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {currentDropdown === "status" && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                  >
                    {["Open", "Closed"].map((status) => (
                      <li
                        key={status}
                        onClick={() => handleSelectChange("status", status)}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                      >
                        {status === "Open" ? "مفتوح" : "مغلق"}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#2E3E88" }}
              >
                وقت الفتح *
              </label>
              <div className="relative group">
                <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#2E3E88" }}
              >
                وقت الإغلاق *
              </label>
              <div className="relative group">
                <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  }}
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          <PhoneNumbersSection
            phoneNumbers={formData.phoneNumbers}
            setPhoneNumbers={(phones) =>
              setFormData({ ...formData, phoneNumbers: phones })
            }
          />

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#2E3E88] bg-gray-100 border-gray-300 rounded focus:ring-[#2E3E88] focus:ring-2"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-semibold flex items-center gap-1"
                style={{ color: "#2E3E88" }}
              >
                <FaCheck className="text-[#4CAF50]" />
                فرع نشط
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="supportsShifts"
                name="supportsShifts"
                checked={formData.supportsShifts || false}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#2E3E88] bg-gray-100 border-gray-300 rounded focus:ring-[#2E3E88] focus:ring-2"
              />
              <label
                htmlFor="supportsShifts"
                className="text-sm font-semibold flex items-center gap-1"
                style={{ color: "#2E3E88" }}
              >
                <FaUsers className="text-[#32B9CC]" />
                يدعم الشفتات
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 py-3.5 border-2 rounded-xl font-semibold transition-all duration-300"
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
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
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
              <FaCheck />
              {isEditing ? "تحديث الفرع" : "إضافة الفرع"}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default BranchForm;
