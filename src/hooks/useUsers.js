import { useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { translateErrorMessageAdminUser } from "../utils/ErrorTranslator";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [assigningRole, setAssigningRole] = useState(null);

  const showErrorAlert = (title, message) => {
    if (window.innerWidth < 768) {
      toast.error(message || title, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "8px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
        },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: title || "حدث خطأ",
        text: message,
      });
    }
  };

  const showSuccessAlert = (title, message) => {
    if (window.innerWidth < 768) {
      toast.success(message || title, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "8px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
        },
      });
    } else {
      Swal.fire({
        icon: "success",
        title: title || "تم بنجاح",
        text: message,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const checkAdminAndFetchUsers = useCallback(async () => {
    try {
      const profileRes = await axiosInstance.get("/api/Account/Profile");
      const userRoles = profileRes.data.roles;

      if (!userRoles || !userRoles.includes("Admin")) {
        Swal.fire({
          icon: "error",
          title: "تم رفض الوصول",
          text: "ليس لديك الإذن للوصول إلى هذه الصفحة.",
        });
        return false;
      }

      setIsAdmin(true);
      setCurrentUser(profileRes.data);
      await fetchRoles();
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("فشل في التحقق من صلاحية المسؤول", err);
      Swal.fire({
        icon: "error",
        title: "تم رفض الوصول",
        text: "فشل في التحقق من أذوناتك.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/api/Roles/GetAll");
      if (res.status === 200) {
        setAvailableRoles(res.data);
      }
    } catch (err) {
      console.error("فشل في جلب الأدوار", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/Users/GetAll");
      if (res.status === 200) {
        setUsers(res.data);
        setFilteredUsers(res.data);
      }
    } catch (err) {
      console.error("فشل في جلب المستخدمين", err);
      showErrorAlert("خطأ", "فشل في جلب بيانات المستخدمين.");
    }
  };

  const handleAssignRole = async (userId, roleName) => {
    try {
      await axiosInstance.post(
        `/api/Users/AssignRole?userId=${userId}&role=${roleName}`
      );

      const updatedUsers = users.map((user) =>
        user.id === userId
          ? { ...user, roles: [...(user.roles || []), roleName] }
          : user
      );

      setUsers(updatedUsers);

      showSuccessAlert(
        "تم تعيين الصلاحية",
        `تم تعيين الصلاحية ${roleName} بنجاح.`
      );

      setAssigningRole(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "فشل في تعيين الصلاحية.";
      showErrorAlert("خطأ", errorMsg);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? "تفعيل" : "تعطيل";

    Swal.fire({
      title: `هل أنت متأكد؟`,
      text: `أنت على وشك ${action} المستخدم: ${user.email}`,
      html: `<div style="text-align: right; direction: rtl;">أنت على وشك ${action} المستخدم: <strong>${user.email}</strong></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}!`,
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.put(`/api/Users/ChangeUserStatus/${user.id}`);

          const updatedUsers = users.map((u) =>
            u.id === user.id ? { ...u, isActive: newStatus } : u
          );
          setUsers(updatedUsers);

          showSuccessAlert(
            `${action === "تفعيل" ? "تم التفعيل" : "تم التعطيل"}!`,
            `تم ${action} المستخدم بنجاح.`
          );
        } catch (err) {
          showErrorAlert("خطأ", `فشل في ${action} المستخدم.`);
        }
      }
    });
  };

  const handleSubmitUser = async (formData, onSuccess) => {
    try {
      const res = await axiosInstance.post("/api/Users/Add", formData);
      if (res.status === 200 || res.status === 201) {
        await fetchUsers();
        showSuccessAlert(
          "تمت إضافة المستخدم",
          "تمت إضافة المستخدم الجديد بنجاح."
        );
        onSuccess?.();
        return { success: true };
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const translatedErrors = translateErrorMessageAdminUser(
          err.response.data
        );

        let errorMessages = [];
        Object.keys(translatedErrors).forEach((field) => {
          translatedErrors[field].forEach((error) => {
            errorMessages.push(error);
          });
        });

        if (window.innerWidth < 768) {
          const shortMessage = errorMessages.slice(0, 3).join("، ");
          toast.error(shortMessage, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
              width: "70%",
              margin: "10px",
              borderRadius: "8px",
              textAlign: "right",
              fontSize: "14px",
              direction: "rtl",
            },
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ في البيانات",
            html: errorMessages
              .map(
                (msg) =>
                  `<div style="text-align: right; direction: rtl; margin-bottom: 8px; padding-right: 15px; position: relative;">
               ${msg}
               <span style="position: absolute; right: 0; top: 0;"></span>
             </div>`
              )
              .join(""),
            showConfirmButton: false,
            timer: 2500,
          });
        }
        return { success: false, errors: translatedErrors };
      } else {
        const errorMsg = err.response?.data?.message || "فشل في حفظ المستخدم.";
        showErrorAlert("خطأ", errorMsg);
        return { success: false };
      }
    }
  };

  const filterUsers = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.includes(searchTerm)
      );
    });

    setFilteredUsers(filtered);
  };

  const getSortedUsers = (usersList) => {
    if (!currentUser) return usersList;

    const sortedUsers = [...usersList];
    sortedUsers.sort((a, b) => {
      if (a.email === currentUser.email) return -1;
      if (b.email === currentUser.email) return 1;
      return 0;
    });

    return sortedUsers;
  };

  const getAvailableRolesToAssign = (user) => {
    const userRoles = user.roles || [];
    return availableRoles.filter((role) => !userRoles.includes(role.name));
  };

  const isCurrentUser = (user) => {
    return currentUser && user.email === currentUser.email;
  };

  return {
    users,
    filteredUsers,
    isLoading,
    isAdmin,
    currentUser,
    availableRoles,
    assigningRole,
    setAssigningRole,
    checkAdminAndFetchUsers,
    fetchUsers,
    filterUsers,
    handleAssignRole,
    handleToggleStatus,
    handleSubmitUser,
    getSortedUsers,
    getAvailableRolesToAssign,
    isCurrentUser,
  };
};
