import React, { useState } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaPlus,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PhoneNumbersSection = ({ phoneNumbers, setPhoneNumbers }) => {
  const [phoneNumber, setPhoneNumber] = useState({
    phone: "",
    type: "Mobile",
    isWhatsapp: false,
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const getPhoneTypeArabic = (type) => {
    switch (type) {
      case "Mobile":
        return "موبايل";
      case "Landline":
        return "أرضي";
      case "Other":
        return "آخر";
      default:
        return type;
    }
  };

  const handlePhoneInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "isWhatsapp") {
      if (phoneNumber.type !== "Mobile") {
        setPhoneNumber({
          ...phoneNumber,
          isWhatsapp: false,
        });
        return;
      }
      setPhoneNumber({
        ...phoneNumber,
        [name]: checked,
      });
    } else {
      setPhoneNumber({
        ...phoneNumber,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handlePhoneTypeSelect = (type) => {
    const updatedPhoneNumber = {
      ...phoneNumber,
      type: type,
    };

    if (type !== "Mobile") {
      updatedPhoneNumber.isWhatsapp = false;
    }

    setPhoneNumber(updatedPhoneNumber);
    setOpenDropdown(null);
  };

  const addPhoneNumber = () => {
    if (!phoneNumber.phone.trim()) {
      return;
    }

    const newPhoneNumber = {
      phone: phoneNumber.phone,
      type: phoneNumber.type,
      isWhatsapp:
        phoneNumber.type === "Mobile" ? phoneNumber.isWhatsapp : false,
    };

    setPhoneNumbers([...phoneNumbers, newPhoneNumber]);
    setPhoneNumber({
      phone: "",
      type: "Mobile",
      isWhatsapp: false,
    });
  };

  const removePhoneNumber = (index) => {
    const updatedPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(updatedPhoneNumbers);
  };

  return (
    <div className="pt-3">
      <label
        className="block text-sm font-semibold mb-3"
        style={{ color: "#2E3E88" }}
      >
        أرقام الهاتف *
      </label>

      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
          border: "1px solid #2E3E8820",
        }}
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: "#2E3E88" }}
            >
              رقم الهاتف *
            </label>
            <div className="relative group">
              <FaPhone
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "#2E3E88" }}
              />
              <input
                type="text"
                name="phone"
                value={phoneNumber.phone}
                onChange={handlePhoneInputChange}
                className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
                placeholder="أدخل رقم الهاتف"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: "#2E3E88" }}
            >
              النوع *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "phoneType" ? null : "phoneType",
                  )
                }
                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 transition-all hover:border-[#2E3E88] group text-right"
                style={{
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                }}
              >
                <span className="flex items-center gap-3">
                  <FaPhone style={{ color: "#2E3E88" }} />
                  <span className="font-medium">
                    {getPhoneTypeArabic(phoneNumber.type)}
                  </span>
                </span>
                <motion.div
                  animate={{
                    rotate: openDropdown === "phoneType" ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown style={{ color: "#2E3E88" }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openDropdown === "phoneType" && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                  >
                    {[
                      { value: "Mobile", label: "موبايل" },
                      { value: "Landline", label: "أرضي" },
                      { value: "Other", label: "آخر" },
                    ].map((type) => (
                      <li
                        key={type.value}
                        onClick={() => handlePhoneTypeSelect(type.value)}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0"
                      >
                        {type.label}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            <label
              className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                phoneNumber.type !== "Mobile"
                  ? "text-gray-400 cursor-not-allowed"
                  : ""
              }`}
              style={phoneNumber.type === "Mobile" ? { color: "#2E3E88" } : {}}
            >
              <input
                type="checkbox"
                name="isWhatsapp"
                checked={phoneNumber.isWhatsapp}
                onChange={handlePhoneInputChange}
                disabled={phoneNumber.type !== "Mobile"}
                className={`w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-[#2E3E88] ${
                  phoneNumber.type !== "Mobile"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                style={{ color: "#2E3E88" }}
              />
              <FaWhatsapp
                className={`${
                  phoneNumber.type !== "Mobile"
                    ? "text-gray-400"
                    : "text-[#25D366]"
                }`}
              />
              <span
                className={phoneNumber.type !== "Mobile" ? "opacity-70" : ""}
              >
                واتساب {phoneNumber.type !== "Mobile" ? "(غير متاح)" : ""}
              </span>
            </label>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addPhoneNumber}
            disabled={!phoneNumber.phone.trim()}
            className={`py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              phoneNumber.phone.trim()
                ? "shadow-lg hover:shadow-xl cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            style={
              phoneNumber.phone.trim()
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
            <FaPlus />
            إضافة رقم
          </motion.button>
        </div>
      </div>

      {phoneNumbers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" style={{ color: "#2E3E88" }}>
            الأرقام المضافة ({phoneNumbers.length})
          </h4>
          {phoneNumbers.map((phone, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl p-3"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                border: "1px solid #2E3E8820",
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FaPhone style={{ color: "#2E3E88" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#2E3E88" }}
                    >
                      {phone.phone}
                    </span>
                    {phone.isWhatsapp && (
                      <FaWhatsapp className="text-[#25D366]" />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "#32B9CC" }}>
                    ({getPhoneTypeArabic(phone.type)})
                    {phone.type !== "Mobile" &&
                      phone.isWhatsapp &&
                      " - الواتساب غير متاح لهذا النوع"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePhoneNumber(index)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200 flex-shrink-0 ml-2"
              >
                <FaTimes size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneNumbersSection;
