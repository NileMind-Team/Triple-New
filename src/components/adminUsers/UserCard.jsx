import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaUserSlash,
  FaUserCheck,
  FaUserTag,
} from "react-icons/fa";

export default function UserCard({
  user,
  index,
  isCurrentUser,
  getRoleBadgeColor,
  getRoleIcon,
  getStatusBadge,
  getAvailableRolesToAssign,
  assigningRole,
  setAssigningRole,
  handleAssignRole,
  handleToggleStatus,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2"
      style={{
        borderTop: isCurrentUser(user)
          ? "4px solid #FF6B6B"
          : user.isActive === false
            ? "4px solid #FF6B6B"
            : "4px solid #2E3E88",
      }}
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              {user.imageUrl ? (
                <img
                  src={`https://restaurant-template.runasp.net/${user.imageUrl}`}
                  alt="صورة المستخدم"
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-4 ${
                    user.isActive === false
                      ? "border-gray-300 grayscale"
                      : "border-white shadow-lg"
                  }`}
                  style={{
                    boxShadow: isCurrentUser(user)
                      ? "0 0 0 2px #FF6B6B"
                      : user.isActive === false
                        ? "0 0 0 2px #FF6B6B"
                        : "0 0 0 2px #2E3E88",
                  }}
                />
              ) : (
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl border-4 text-white ${
                    user.isActive === false
                      ? "bg-gray-400 border-gray-300"
                      : isCurrentUser(user)
                        ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] border-white"
                        : "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] border-white"
                  }`}
                  style={{
                    boxShadow: isCurrentUser(user)
                      ? "0 0 0 2px #FF6B6B"
                      : user.isActive === false
                        ? "0 0 0 2px #FF6B6B"
                        : "0 0 0 2px #2E3E88",
                  }}
                >
                  {user.firstName?.charAt(0).toUpperCase() || "م"}
                </div>
              )}

              {isCurrentUser(user) && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-full p-1.5 sm:p-2 border-2 border-white shadow-lg">
                  <FaUserShield className="text-xs sm:text-sm" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className="font-bold text-base sm:text-lg truncate"
                style={{ color: "#2E3E88" }}
              >
                {user.firstName} {user.lastName}
              </h4>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                {getStatusBadge(user)}
                {isCurrentUser(user) && (
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    }}
                  >
                    المستخدم الحالي
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <FaEnvelope
              className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700 text-sm sm:text-base break-words">
              {user.email}
            </p>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <FaPhone
              className="mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700 text-sm sm:text-base">
              {user.phoneNumber || "غير متوفر"}
            </p>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-2 ${getRoleBadgeColor(role)}`}
                >
                  {getRoleIcon(role)}
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
          <button
            onClick={() =>
              setAssigningRole(assigningRole === user.id ? null : user.id)
            }
            disabled={
              user.isActive === false ||
              getAvailableRolesToAssign(user).length === 0
            }
            className={`flex-1 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
              user.isActive === false ||
              getAvailableRolesToAssign(user).length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#9C27B010] to-[#2E3E8810] text-[#9C27B0]"
            }`}
          >
            <FaUserTag className="text-xs sm:text-sm" />
            تعيين صلاحية
          </button>

          <button
            onClick={() => handleToggleStatus(user)}
            disabled={isCurrentUser(user)}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
              isCurrentUser(user)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : user.isActive === false
                  ? "bg-gradient-to-r from-[#4CAF5010] to-[#2E3E8810] text-[#4CAF50]"
                  : "bg-gradient-to-r from-[#FF6B6B10] to-[#FF8E5310] text-[#FF6B6B]"
            }`}
          >
            {user.isActive === false ? (
              <>
                <FaUserCheck className="text-xs sm:text-sm" />
                تفعيل
              </>
            ) : (
              <>
                <FaUserSlash className="text-xs sm:text-sm" />
                تعطيل
              </>
            )}
          </button>
        </div>

        {/* Role Assignment Section */}
        {assigningRole === user.id &&
          getAvailableRolesToAssign(user).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              }}
            >
              <h4
                className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                style={{ color: "#2E3E88" }}
              >
                تعيين صلاحية إضافية
              </h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {getAvailableRolesToAssign(user).map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleAssignRole(user.id, role.name)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition-all duration-300 hover:scale-105 ${getRoleBadgeColor(role.name)}`}
                  >
                    {getRoleIcon(role.name)}
                    {role.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
      </div>
    </motion.div>
  );
}
