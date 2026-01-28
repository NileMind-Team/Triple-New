import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaSave,
  FaArrowLeft,
  FaBuilding,
  FaChevronDown,
} from "react-icons/fa";

export default function DeliveryAreaForm({
  formData,
  setFormData,
  editingId,
  branches,
  formBranchesDropdownOpen,
  setFormBranchesDropdownOpen,
  handleFormBranchSelect,
  handleSubmit,
  resetForm,
  isFormValid,
  getSelectedBranchName,
}) {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      {/* Branch Dropdown */}
      <div>
        <label
          className="block text-sm font-semibold mb-1 md:mb-2"
          style={{ color: "#2E3E88" }}
        >
          الفرع
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setFormBranchesDropdownOpen(!formBranchesDropdownOpen)
            }
            className="w-full flex items-center justify-between border border-gray-200 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 transition-all hover:border-[#2E3E88] group text-right text-sm md:text-base"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
            }}
          >
            <div className="flex items-center gap-2 md:gap-3 truncate">
              <FaBuilding
                className="text-[#2E3E88] group-hover:scale-110 transition-transform flex-shrink-0"
                size={14}
              />
              <span className="font-medium truncate">
                {getSelectedBranchName()}
              </span>
            </div>
            <motion.div
              animate={{ rotate: formBranchesDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown className="text-[#2E3E88]" size={14} />
            </motion.div>
          </button>

          <AnimatePresence>
            {formBranchesDropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 md:mt-2 w-full bg-white border border-gray-200 shadow-xl md:shadow-2xl rounded-lg md:rounded-xl overflow-hidden max-h-40 md:max-h-48 overflow-y-auto text-sm md:text-base"
              >
                {branches.map((branch) => (
                  <li
                    key={branch.id}
                    onClick={() => handleFormBranchSelect(branch.id)}
                    className="px-3 md:px-4 py-2 md:py-3 hover:bg-gradient-to-r hover:from-[#2E3E88]/5 hover:to-[#32B9CC]/5 text-gray-700 cursor-pointer transition-all border-b last:border-b-0 truncate"
                  >
                    {branch.name}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Area Name */}
      <div>
        <label
          className="block text-sm font-semibold mb-1 md:mb-2"
          style={{ color: "#2E3E88" }}
        >
          اسم المنطقة
        </label>
        <div className="relative group">
          <FaMapMarkerAlt
            className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110"
            size={14}
          />
          <input
            type="text"
            name="areaName"
            value={formData.areaName}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
            }}
            placeholder="أدخل اسم المنطقة"
            dir="rtl"
          />
        </div>
      </div>

      {/* Delivery Cost */}
      <div>
        <label
          className="block text-sm font-semibold mb-1 md:mb-2"
          style={{ color: "#2E3E88" }}
        >
          تكلفة التوصيل (ج.م)
        </label>
        <div className="relative group">
          <FaMoneyBillWave
            className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110"
            size={14}
          />
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-sm md:text-base"
            style={{
              background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
            }}
            placeholder="0.00"
            dir="rtl"
          />
        </div>
      </div>

      {/* Estimated Time Range */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <div>
          <label
            className="block text-sm font-semibold mb-1 md:mb-2"
            style={{ color: "#2E3E88" }}
          >
            أقل وقت (دقيقة)
          </label>
          <div className="relative group">
            <FaTruck
              className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110"
              size={14}
            />
            <input
              type="number"
              name="estimatedTimeMin"
              value={formData.estimatedTimeMin}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-center text-sm md:text-base"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              }}
              placeholder="أقل"
              dir="rtl"
            />
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-semibold mb-1 md:mb-2"
            style={{ color: "#2E3E88" }}
          >
            أقصى وقت (دقيقة)
          </label>
          <div className="relative group">
            <FaTruck
              className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#2E3E88] transition-all duration-300 group-focus-within:scale-110"
              size={14}
            />
            <input
              type="number"
              name="estimatedTimeMax"
              value={formData.estimatedTimeMax}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full border border-gray-200 rounded-lg md:rounded-xl pr-10 md:pr-12 pl-3 md:pl-4 py-2.5 md:py-3.5 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 text-center text-sm md:text-base"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              }}
              placeholder="أقصى"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div
        className="flex items-center justify-between gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl border text-sm md:text-base"
        style={{
          background: "linear-gradient(135deg, #2E3E8810, #32B9CC10)",
          border: "1px solid #2E3E8820",
        }}
      >
        <label className="font-medium" style={{ color: "#2E3E88" }}>
          نشط (متاح للتوصيل)
        </label>
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="w-4 h-4 text-[#2E3E88] bg-white border-gray-300 rounded focus:ring-[#2E3E88] focus:ring-2"
        />
      </div>

      <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetForm}
          className="flex-1 py-2.5 md:py-3.5 border-2 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
          style={{
            borderColor: "#2E3E88",
            color: "#2E3E88",
            background: "transparent",
          }}
        >
          <FaArrowLeft size={14} className="md:size-4" />
          رجوع
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!isFormValid()}
          className={`flex-1 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base ${
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
          <FaSave size={14} className="md:size-4" />
          {editingId ? "تحديث المنطقة" : "حفظ المنطقة"}
        </motion.button>
      </div>
    </form>
  );
}
