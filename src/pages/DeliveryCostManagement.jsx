import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import useDeliveryAreas from "../hooks/useDeliveryAreas";
import DeliveryAreaCard from "../components/deliveryCostManagement/DeliveryAreaCard";
import DeliveryAreaForm from "../components/deliveryCostManagement/DeliveryAreaForm";

export default function DeliveryCostManagement() {
  const navigate = useNavigate();
  const {
    filteredAreas,
    branches,
    loading,
    searchTerm,
    filter,
    isAdding,
    setIsAdding,
    editingId,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleActive,
    resetForm,
    formBranchesDropdownOpen,
    setFormBranchesDropdownOpen,
    handleFormBranchSelect,
    isFormValid,
  } = useDeliveryAreas();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p
            className="text-base md:text-lg font-semibold"
            style={{ color: "#2E3E88" }}
          >
            جارٍ تحميل مناطق التوصيل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f8ff 0%, #e0f7fa 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>

        {/* Hero Header */}
        <div
          className="relative py-12 md:py-16 px-4"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* زر الرجوع */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group z-10"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={16}
                className="md:size-5 group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-8 md:pt-12"
            >
              <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm mb-4 md:mb-6">
                <FaMapMarkerAlt className="text-white text-2xl md:text-4xl" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-2">
                إدارة تكاليف التوصيل
              </h1>
              <p className="text-white/80 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
                إدارة مناطق وتكاليف التوصيل بسهولة وأمان
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8 -mt-6 md:-mt-10 relative z-10">
        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
        >
          <FaPlus className="text-lg md:text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden sm:inline font-semibold text-sm md:text-base">
            إضافة منطقة جديدة
          </span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          {/* Areas Grid - متجاوبة مع جميع الشاشات */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredAreas.map((area, index) => (
                <DeliveryAreaCard
                  key={area.id}
                  area={area}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredAreas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-xl mx-2 sm:mx-0"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                <FaMapMarkerAlt
                  className="text-2xl md:text-4xl"
                  style={{ color: "#2E3E88" }}
                />
              </div>
              <h3
                className="text-xl md:text-2xl font-bold mb-2 md:mb-3"
                style={{ color: "#2E3E88" }}
              >
                لم يتم العثور على مناطق توصيل
              </h3>
              <p
                className="mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base"
                style={{ color: "#32B9CC" }}
              >
                {searchTerm || filter !== "all"
                  ? "حاول تعديل معايير البحث أو التصفية"
                  : "أضف أول منطقة توصيل للبدء"}
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm md:text-base"
                style={{
                  background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                  color: "white",
                  boxShadow: "0 10px 25px #2E3E8830",
                }}
              >
                إضافة منطقة جديدة
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2"
            >
              {/* Modal Header */}
              <div
                className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  {editingId ? (
                    <FaMapMarkerAlt className="text-white text-lg md:text-xl" />
                  ) : (
                    <FaPlus className="text-white text-lg md:text-xl" />
                  )}
                  <h3 className="text-base md:text-lg font-bold text-white">
                    {editingId ? "تعديل المنطقة" : "إضافة منطقة جديدة"}
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1 md:p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaPlus size={14} className="md:size-4 rotate-45" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <DeliveryAreaForm
                  formData={formData}
                  setFormData={setFormData}
                  editingId={editingId}
                  branches={branches}
                  formBranchesDropdownOpen={formBranchesDropdownOpen}
                  setFormBranchesDropdownOpen={setFormBranchesDropdownOpen}
                  handleFormBranchSelect={handleFormBranchSelect}
                  handleSubmit={handleSubmit}
                  resetForm={resetForm}
                  isFormValid={isFormValid}
                  getSelectedBranchName={() => {
                    if (!formData.branchId) return "اختر الفرع";
                    const branch = branches.find(
                      (b) => b.id === parseInt(formData.branchId),
                    );
                    return branch ? branch.name : "اختر الفرع";
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
