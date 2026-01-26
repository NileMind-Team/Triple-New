import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaBuilding,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaUser,
  FaUserShield,
  FaUserTag,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useUsers } from "../hooks/useUsers";
import SearchBar from "../components/adminUsers/SearchBar";
import UserCard from "../components/adminUsers/UserCard";
import EmptyState from "../components/adminUsers/EmptyState";
import UserForm from "../components/adminUsers/UserForm";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roles: ["Restaurant"],
  });
  // eslint-disable-next-line no-unused-vars
  const [formErrors, setFormErrors] = useState({});

  const {
    users,
    filteredUsers,
    isLoading,
    isAdmin,
    availableRoles,
    assigningRole,
    setAssigningRole,
    checkAdminAndFetchUsers,
    filterUsers,
    handleAssignRole,
    handleToggleStatus,
    handleSubmitUser,
    getSortedUsers,
    getAvailableRolesToAssign,
    isCurrentUser,
  } = useUsers();

  const showWarningAlert = (title, message) => {
    if (window.innerWidth < 768) {
      toast.warning(message || title, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "12px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
          background: "linear-gradient(135deg, #FFA726, #FF9800)",
          color: "white",
        },
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: title || "تحذير",
        text: message,
        showConfirmButton: false,
        timer: 2500,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      });
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const hasAccess = await checkAdminAndFetchUsers();
      if (!hasAccess) {
        navigate("/");
      }
    };
    initialize();
  }, [checkAdminAndFetchUsers, navigate]);

  useEffect(() => {
    filterUsers(searchTerm);
  }, [searchTerm, users, filterUsers]);

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!isFormValid()) {
      showWarningAlert("نموذج غير مكتمل", "يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    const result = await handleSubmitUser(formData, resetForm);
    if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roles: ["Restaurant"],
    });
    setFormErrors({});
    setIsAdding(false);
  };

  const handleAddNewUser = () => {
    setIsAdding(true);
    setFormErrors({});
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-transparent";
      case "Restaurant":
        return "bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] text-white border-transparent";
      case "Branch":
        return "bg-gradient-to-r from-[#4CAF50] to-[#2E3E88] text-white border-transparent";
      default:
        return "bg-gradient-to-r from-[#9E9E9E] to-[#607D8B] text-white border-transparent";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <FaUserShield className="text-xs sm:text-sm" />;
      case "Restaurant":
        return <FaBuilding className="text-xs sm:text-sm" />;
      case "Branch":
        return <FaUserTag className="text-xs sm:text-sm" />;
      default:
        return <FaUser className="text-xs sm:text-sm" />;
    }
  };

  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{
            background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
            color: "white",
          }}
        >
          <FaLock className="text-xs" />
          معطل
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
        style={{
          background: "linear-gradient(135deg, #4CAF50, #2E3E88)",
          color: "white",
        }}
      >
        <FaLockOpen className="text-xs" />
        مفعل
      </span>
    );
  };

  const isFormValid = () => {
    const basicFieldsValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.roles.length > 0;

    if (!isAdding) {
      return basicFieldsValid && formData.password.trim() !== "";
    }

    return basicFieldsValid;
  };

  if (isLoading) {
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
            جارٍ التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const sortedUsers = getSortedUsers(filteredUsers);

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
                <FaUserShield className="text-white text-4xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                إدارة المستخدمين
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                إدارة وإضافة وتعديل مستخدمي النظام بسهولة وأمان
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
          onClick={handleAddNewUser}
          className="fixed bottom-6 right-6 z-40 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 group"
          style={{
            background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
          }}
        >
          <FaPlus className="text-xl group-hover:rotate-90 transition-transform" />
          <span className="hidden md:inline font-semibold">
            إضافة مستخدم جديد
          </span>
        </motion.button>

        {/* Content Container */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </motion.div>

          {/* Users Grid - 2 users per row on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  index={index}
                  isCurrentUser={isCurrentUser}
                  getRoleBadgeColor={getRoleBadgeColor}
                  getRoleIcon={getRoleIcon}
                  getStatusBadge={getStatusBadge}
                  getAvailableRolesToAssign={getAvailableRolesToAssign}
                  assigningRole={assigningRole}
                  setAssigningRole={setAssigningRole}
                  handleAssignRole={handleAssignRole}
                  handleToggleStatus={handleToggleStatus}
                />
              ))
            ) : (
              <div className="lg:col-span-2">
                <EmptyState
                  searchTerm={searchTerm}
                  handleAddNewUser={handleAddNewUser}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <UserForm
              formData={formData}
              setFormData={setFormData}
              availableRoles={availableRoles}
              handleRoleToggle={handleRoleToggle}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              getRoleIcon={getRoleIcon}
              isFormValid={isFormValid}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
