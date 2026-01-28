import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function HeaderStats({ deliveryAreasCount, navigate }) {
  return (
    <div className="flex items-center justify-between mb-4 md:mb-6 px-2 sm:px-0">
      <div className="text-right">
        <div
          className="text-xl md:text-2xl font-bold"
          style={{ color: "#2E3E88" }}
        >
          {deliveryAreasCount} منطقة
        </div>
        <div className="text-xs md:text-sm" style={{ color: "#32B9CC" }}>
          الإجمالي
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10 rounded-full p-2 md:p-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/20 hover:to-[#32B9CC]/20 transition-all duration-300 shadow-lg"
        >
          <FaArrowLeft
            style={{ color: "#2E3E88" }}
            size={14}
            className="md:size-4"
          />
        </motion.button>
        <div dir="rtl" className="text-right">
          <h1
            className="text-lg md:text-xl font-bold"
            style={{ color: "#2E3E88" }}
          >
            إدارة تكاليف التوصيل
          </h1>
          <p className="text-xs md:text-sm" style={{ color: "#32B9CC" }}>
            إدارة مناطق وتكاليف التوصيل
          </p>
        </div>
      </div>
    </div>
  );
}
