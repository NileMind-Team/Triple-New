import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

export default function DeliveryAreaCard({
  area,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 md:hover:-translate-y-2 flex flex-col h-full mx-1 sm:mx-0"
      style={{
        borderTop: area.isActive ? "4px solid #4CAF50" : "4px solid #FF6B6B",
        minHeight: "220px",
      }}
    >
      <div className="p-4 md:p-6 flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
              <FaMapMarkerAlt
                className="text-lg md:text-xl"
                style={{ color: "#2E3E88" }}
              />
            </div>
            <div className="flex-1">
              <h4
                className="font-bold text-base md:text-lg mb-1 truncate"
                style={{ color: "#2E3E88" }}
              >
                {area.areaName}
              </h4>
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: area.isActive ? "#4CAF5010" : "#FF6B6B10",
                    color: area.isActive ? "#4CAF50" : "#FF6B6B",
                  }}
                >
                  {area.isActive ? "نشط" : "غير نشط"}
                </span>
                {area.branchName && (
                  <span
                    className="text-xs md:text-sm truncate"
                    style={{ color: "#32B9CC" }}
                  >
                    {area.branchName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Area Details */}
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          <div className="flex items-start gap-2 md:gap-3">
            <FaMoneyBillWave
              className="mt-0.5 md:mt-1 flex-shrink-0"
              size={14}
              style={{ color: "#2E3E88" }}
            />
            <div className="flex-1">
              <span className="text-xs md:text-sm text-gray-500">
                تكلفة التوصيل
              </span>
              <p
                className="font-bold text-base md:text-lg"
                style={{ color: "#2E3E88" }}
              >
                ج.م {area.deliveryCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 md:gap-3">
            <FaTruck
              className="mt-0.5 md:mt-1 flex-shrink-0"
              size={14}
              style={{ color: "#2E3E88" }}
            />
            <div className="flex-1">
              <span className="text-xs md:text-sm text-gray-500">
                الوقت المتوقع
              </span>
              <p
                className="font-bold text-base md:text-lg"
                style={{ color: "#2E3E88" }}
              >
                {area.estimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-100 mt-auto">
          <button
            onClick={(e) => onToggleActive(area.id, e)}
            className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            style={{
              background: area.isActive ? "#FFA72610" : "#4CAF5010",
              color: area.isActive ? "#FFA726" : "#4CAF50",
            }}
          >
            {area.isActive ? (
              <FaTimes size={12} className="md:size-4" />
            ) : (
              <FaCheck size={12} className="md:size-4" />
            )}
            {area.isActive ? "تعطيل" : "تفعيل"}
          </button>
          <button
            onClick={() => onEdit(area)}
            className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            style={{
              background: "#32B9CC10",
              color: "#32B9CC",
            }}
          >
            <FaEdit size={12} className="md:size-4" />
            تعديل
          </button>
          <button
            onClick={() => onDelete(area.id)}
            className="flex-1 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            style={{
              background: "#FF6B6B10",
              color: "#FF6B6B",
            }}
          >
            <FaTrash size={12} className="md:size-4" />
            حذف
          </button>
        </div>
      </div>
    </motion.div>
  );
}
