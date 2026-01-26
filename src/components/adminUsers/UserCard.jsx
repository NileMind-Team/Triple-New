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
      className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      style={{
        borderTop: isCurrentUser(user)
          ? "4px solid #FF6B6B"
          : user.isActive === false
            ? "4px solid #FF6B6B"
            : "4px solid #2E3E88",
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.imageUrl ? (
                <img
                  src={`https://restaurant-template.runasp.net/${user.imageUrl}`}
                  alt="صورة المستخدم"
                  className={`w-16 h-16 rounded-full object-cover border-4 ${
                    user.isActive === false
                      ? "border-gray-300 grayscale"
                      : "border-white shadow-lg"
                  }`}
                  style={{
                    boxShadow: isCurrentUser(user)
                      ? "0 0 0 3px #FF6B6B"
                      : user.isActive === false
                        ? "0 0 0 3px #FF6B6B"
                        : "0 0 0 3px #2E3E88",
                  }}
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 text-white ${
                    user.isActive === false
                      ? "bg-gray-400 border-gray-300"
                      : isCurrentUser(user)
                        ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] border-white"
                        : "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] border-white"
                  }`}
                  style={{
                    boxShadow: isCurrentUser(user)
                      ? "0 0 0 3px #FF6B6B"
                      : user.isActive === false
                        ? "0 0 0 3px #FF6B6B"
                        : "0 0 0 3px #2E3E88",
                  }}
                >
                  {user.firstName?.charAt(0).toUpperCase() || "م"}
                </div>
              )}

              {isCurrentUser(user) && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-full p-2 border-2 border-white shadow-lg">
                  <FaUserShield className="text-sm" />
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-lg" style={{ color: "#2E3E88" }}>
                {user.firstName} {user.lastName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(user)}
                {isCurrentUser(user) && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
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
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <FaEnvelope
              className="mt-1 flex-shrink-0"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700">{user.email}</p>
          </div>

          <div className="flex items-start gap-3">
            <FaPhone
              className="mt-1 flex-shrink-0"
              style={{ color: "#2E3E88" }}
            />
            <p className="text-gray-700">{user.phoneNumber || "غير متوفر"}</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-wrap gap-2">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${getRoleBadgeColor(role)}`}
                >
                  {getRoleIcon(role)}
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() =>
              setAssigningRole(assigningRole === user.id ? null : user.id)
            }
            disabled={
              user.isActive === false ||
              getAvailableRolesToAssign(user).length === 0
            }
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
              user.isActive === false ||
              getAvailableRolesToAssign(user).length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#9C27B010] to-[#2E3E8810] text-[#9C27B0]"
            }`}
          >
            <FaUserTag />
            تعيين صلاحية
          </button>

          <button
            onClick={() => handleToggleStatus(user)}
            disabled={isCurrentUser(user)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
              isCurrentUser(user)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : user.isActive === false
                  ? "bg-gradient-to-r from-[#4CAF5010] to-[#2E3E8810] text-[#4CAF50]"
                  : "bg-gradient-to-r from-[#FF6B6B10] to-[#FF8E5310] text-[#FF6B6B]"
            }`}
          >
            {user.isActive === false ? (
              <>
                <FaUserCheck />
                تفعيل
              </>
            ) : (
              <>
                <FaUserSlash />
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
              className="mt-4 p-4 rounded-xl border border-gray-100"
              style={{
                background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
              }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: "#2E3E88" }}
              >
                تعيين صلاحية إضافية
              </h4>
              <div className="flex flex-wrap gap-2">
                {getAvailableRolesToAssign(user).map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleAssignRole(user.id, role.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 ${getRoleBadgeColor(role.name)}`}
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
