import { motion } from "framer-motion";
import { FaSearch, FaPlus } from "react-icons/fa";

export default function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  handleAddNewArea,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg md:shadow-xl"
    >
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FaSearch
            className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2"
            style={{ color: "#2E3E88" }}
            size={14}
          />
          <input
            type="text"
            placeholder="ابحث في مناطق التوصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-8 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 border border-gray-200 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base text-right"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
            }}
            dir="rtl"
          />
        </div>

        {/* Filter and Button Container */}
        <div className="flex gap-2 md:gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base w-full md:w-auto"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              color: "#2E3E88",
            }}
            dir="rtl"
          >
            <option value="all">جميع المناطق</option>
            <option value="active">المناطق النشطة</option>
            <option value="inactive">المناطق غير النشطة</option>
          </select>

          {/* Add New Area Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNewArea}
            className="flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap text-sm md:text-base"
            style={{
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              color: "white",
            }}
          >
            <span>إضافة منطقة</span>
            <FaPlus size={12} className="md:size-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
