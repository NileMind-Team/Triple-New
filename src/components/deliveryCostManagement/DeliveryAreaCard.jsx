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
      className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full"
      style={{
        borderTop: area.isActive ? "4px solid #4CAF50" : "4px solid #FF6B6B",
        minHeight: "250px",
      }}
    >
      <div className="p-6 flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
              <FaMapMarkerAlt
                className="text-xl"
                style={{ color: "#2E3E88" }}
              />
            </div>
            <div className="flex-1">
              <h4
                className="font-bold text-lg mb-1"
                style={{ color: "#2E3E88" }}
              >
                {area.areaName}
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: area.isActive ? "#4CAF5010" : "#FF6B6B10",
                    color: area.isActive ? "#4CAF50" : "#FF6B6B",
                  }}
                >
                  {area.isActive ? "نشط" : "غير نشط"}
                </span>
                {area.branchName && (
                  <span className="text-sm" style={{ color: "#32B9CC" }}>
                    {area.branchName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Area Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <FaMoneyBillWave
              className="mt-1 flex-shrink-0"
              style={{ color: "#2E3E88" }}
            />
            <div className="flex-1">
              <span className="text-sm text-gray-500">تكلفة التوصيل</span>
              <p className="font-bold text-lg" style={{ color: "#2E3E88" }}>
                ج.م {area.deliveryCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaTruck
              className="mt-1 flex-shrink-0"
              style={{ color: "#2E3E88" }}
            />
            <div className="flex-1">
              <span className="text-sm text-gray-500">الوقت المتوقع</span>
              <p className="font-bold text-lg" style={{ color: "#2E3E88" }}>
                {area.estimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
          <button
            onClick={(e) => onToggleActive(area.id, e)}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: area.isActive ? "#FFA72610" : "#4CAF5010",
              color: area.isActive ? "#FFA726" : "#4CAF50",
            }}
          >
            {area.isActive ? <FaTimes /> : <FaCheck />}
            {area.isActive ? "تعطيل" : "تفعيل"}
          </button>
          <button
            onClick={() => onEdit(area)}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: "#32B9CC10",
              color: "#32B9CC",
            }}
          >
            <FaEdit />
            تعديل
          </button>
          <button
            onClick={() => onDelete(area.id)}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: "#FF6B6B10",
              color: "#FF6B6B",
            }}
          >
            <FaTrash />
            حذف
          </button>
        </div>
      </div>
    </motion.div>
  );
}
