import { motion } from "framer-motion";
import { FaUserShield, FaPlus } from "react-icons/fa";

export default function EmptyState({ searchTerm, handleAddNewUser }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-8 text-center shadow-xl"
    >
      <div
        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
        }}
      >
        <FaUserShield className="text-4xl" style={{ color: "#2E3E88" }} />
      </div>
      <h3 className="text-2xl font-bold mb-3" style={{ color: "#2E3E88" }}>
        {searchTerm
          ? "لم يتم العثور على مستخدمين"
          : "لا توجد مستخدمين حتى الآن"}
      </h3>
      <p className="mb-6 max-w-md mx-auto" style={{ color: "#32B9CC" }}>
        {searchTerm
          ? "حاول تعديل مصطلحات البحث"
          : "أضف مستخدمك الأول للبدء في إدارة النظام"}
      </p>
      {!searchTerm && (
        <button
          onClick={handleAddNewUser}
          className="px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
            boxShadow: "0 10px 25px #2E3E8830",
          }}
        >
          <FaPlus className="inline ml-2" />
          إضافة مستخدم جديد
        </button>
      )}
    </motion.div>
  );
}
