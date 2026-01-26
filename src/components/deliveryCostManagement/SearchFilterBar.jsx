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
      className="bg-white rounded-2xl p-6 mb-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FaSearch
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            style={{ color: "#2E3E88" }}
          />
          <input
            type="text"
            placeholder="ابحث في مناطق التوصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-right"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
            }}
            dir="rtl"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200"
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
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
              color: "white",
            }}
          >
            <span>إضافة منطقة</span>
            <FaPlus />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
