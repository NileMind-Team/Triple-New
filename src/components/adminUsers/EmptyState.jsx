import { motion } from "framer-motion";
import { FaUserShield, FaPlus } from "react-icons/fa";

export default function EmptyState({ searchTerm, handleAddNewUser }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-xl mx-2 sm:mx-0"
    >
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #2E3E88/10, #32B9CC/10)",
        }}
      >
        <FaUserShield
          className="text-2xl sm:text-3xl md:text-4xl"
          style={{ color: "#2E3E88" }}
        />
      </div>
      <h3
        className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3"
        style={{ color: "#2E3E88" }}
      >
        {searchTerm
          ? "لم يتم العثور على مستخدمين"
          : "لا توجد مستخدمين حتى الآن"}
      </h3>
      <p
        className="mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base"
        style={{ color: "#32B9CC" }}
      >
        {searchTerm
          ? "حاول تعديل مصطلحات البحث"
          : "أضف مستخدمك الأول للبدء في إدارة النظام"}
      </p>
      {!searchTerm && (
        <button
          onClick={handleAddNewUser}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm sm:text-base"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
            color: "white",
            boxShadow: "0 10px 25px #2E3E8830",
          }}
        >
          <FaPlus className="inline ml-1 sm:ml-2 text-sm sm:text-base" />
          إضافة مستخدم جديد
        </button>
      )}
    </motion.div>
  );
}
