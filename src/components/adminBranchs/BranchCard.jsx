import React from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaCity,
  FaPhone,
  FaWhatsapp,
  FaEdit,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";

const BranchCard = ({
  branch,
  onEdit,
  onToggleActive,
  getPhoneTypeArabic,
  adjustTimeFromBackend,
}) => {
  const convertTo12HourFormat = (time24) => {
    if (!time24) return "";

    const adjustedTime = adjustTimeFromBackend
      ? adjustTimeFromBackend(time24)
      : time24;

    const [hours, minutes] = adjustedTime.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) return adjustedTime;

    const period = hours >= 12 ? "م" : "ص";
    const hours12 = hours % 12 || 12;

    return `${hours12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const displayOpeningTime = convertTo12HourFormat(branch.openingTime);
  const displayClosingTime = convertTo12HourFormat(branch.closingTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2"
      style={{
        borderTop: branch.isActive ? "4px solid #2E3E88" : "4px solid #FF6B6B",
      }}
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
              }}
            >
              <FaBuilding
                className="text-base sm:text-lg md:text-xl"
                style={{ color: "#2E3E88" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="font-bold text-base sm:text-lg truncate"
                style={{ color: "#2E3E88" }}
              >
                {branch.name}
              </h4>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                    branch.isActive
                      ? "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white"
                      : "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white"
                  }`}
                >
                  {branch.isActive ? "نشط" : "غير نشط"}
                </span>
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                    branch.status === "Open"
                      ? "bg-gradient-to-r from-[#4CAF50] to-[#2E3E88] text-white"
                      : "bg-gradient-to-r from-[#FFA726] to-[#FF9800] text-white"
                  }`}
                >
                  {branch.status === "Open" ? "مفتوح" : "مغلق"}
                </span>
                {branch.supportsShifts && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #9C27B0, #2E3E88)",
                    }}
                  >
                    <FaUsers className="inline ml-0.5 sm:ml-1 text-xs" />
                    <span className="hidden sm:inline"> يدعم الشفتات</span>
                    <span className="sm:hidden"> شفتات</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Branch Details */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <FaMapMarkerAlt
              className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700 text-sm sm:text-base break-words">
              {branch.address}
            </p>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <FaEnvelope
              className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700 text-sm sm:text-base break-words">
              {branch.email}
            </p>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <FaClock
              className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700 text-sm sm:text-base">
              {displayOpeningTime} - {displayClosingTime}
            </p>
          </div>

          {branch.city && (
            <div className="flex items-start gap-2 sm:gap-3">
              <FaCity
                className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
                style={{ color: "#2E3E88" }}
              />
              <p className="text-gray-700 text-sm sm:text-base">
                {branch.city.name}
              </p>
            </div>
          )}

          {branch.phoneNumbers && branch.phoneNumbers.length > 0 && (
            <div className="flex items-start gap-2 sm:gap-3">
              <FaPhone
                className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
                style={{ color: "#2E3E88" }}
              />
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {branch.phoneNumbers.map((phone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs sm:text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
                    }}
                  >
                    <span style={{ color: "#2E3E88" }}>{phone.phone}</span>
                    <span className="text-xs" style={{ color: "#32B9CC" }}>
                      ({getPhoneTypeArabic(phone.type)})
                    </span>
                    {phone.isWhatsapp && (
                      <FaWhatsapp className="text-green-500 text-xs sm:text-sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(branch)}
            className="flex-1 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            style={{
              background: "#32B9CC10",
              color: "#32B9CC",
            }}
          >
            <FaEdit className="text-xs sm:text-sm" />
            تعديل
          </button>
          <button
            onClick={() => onToggleActive(branch.id, branch.isActive)}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
              branch.isActive
                ? "bg-gradient-to-r from-[#FF6B6B10] to-[#FF8E5310] text-[#FF6B6B]"
                : "bg-gradient-to-r from-[#4CAF5010] to-[#2E3E8810] text-[#4CAF50]"
            }`}
          >
            {branch.isActive ? "تعطيل" : "تفعيل"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BranchCard;
