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
            className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
            style={{
              borderTopColor: "#2E3E88",
              borderRightColor: "#32B9CC",
              borderBottomColor: "#2E3E88",
              borderLeftColor: "transparent",
            }}
          ></div>
          <p className="text-lg font-semibold" style={{ color: "#2E3E88" }}>
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
          className="relative py-16 px-4"
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
              className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg group"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FaArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pt-8"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                <FaMapMarkerAlt className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                إدارة تكاليف التوصيل
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                إدارة مناطق وتكاليف التوصيل بسهولة وأمان
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-10">
        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
        >
          <FaPlus className="text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden md:inline font-semibold">
            إضافة منطقة جديدة
          </span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          {/* Areas Grid - بطاقتين في الصف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="bg-white rounded-2xl p-8 text-center shadow-xl"
            >
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-[#2E3E88]/10 to-[#32B9CC]/10">
                <FaMapMarkerAlt
                  className="text-4xl"
                  style={{ color: "#2E3E88" }}
                />
              </div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: "#2E3E88" }}
              >
                لم يتم العثور على مناطق توصيل
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: "#32B9CC" }}>
                {searchTerm || filter !== "all"
                  ? "حاول تعديل معايير البحث أو التصفية"
                  : "أضف أول منطقة توصيل للبدء"}
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
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
                  {editingId ? (
                    <FaMapMarkerAlt className="text-white text-xl" />
                  ) : (
                    <FaPlus className="text-white text-xl" />
                  )}
                  <h3 className="text-lg font-bold text-white">
                    {editingId ? "تعديل المنطقة" : "إضافة منطقة جديدة"}
                  </h3>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                >
                  <FaPlus size={16} className="rotate-45" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
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
