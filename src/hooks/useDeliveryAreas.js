import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { translateErrorMessage } from "../utils/ErrorTranslator";

export default function useDeliveryAreas() {
  const navigate = useNavigate();
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [formBranchesDropdownOpen, setFormBranchesDropdownOpen] =
    useState(false);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);

  const [formData, setFormData] = useState({
    branchId: "",
    areaName: "",
    fee: "",
    estimatedTimeMin: "",
    estimatedTimeMax: "",
    isActive: true,
  });

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
        title: title || "حدث خطأ",
        text: message,
        icon: "error",
        confirmButtonText: "حاول مرة أخرى",
        timer: 2500,
        showConfirmButton: false,
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
        title: title || "تم بنجاح",
        text: message,
        icon: "success",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);

        if (!hasAdminOrRestaurantOrBranchRole) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
        navigate("/");
      }
    };

    checkUserRole();
  }, [navigate]);

  // Fetch branches and delivery areas in one effect
  useEffect(() => {
    const fetchData = async () => {
      if (!isAdminOrRestaurantOrBranch) return;

      try {
        setLoading(true);

        // Fetch branches
        const branchesResponse = await axiosInstance.get(
          "/api/Branches/GetAll",
        );
        setBranches(branchesResponse.data);

        // Fetch delivery areas
        await fetchDeliveryAreas(branchesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorAlert("خطأ", "فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminOrRestaurantOrBranch]);

  // Function to fetch delivery areas
  const fetchDeliveryAreas = useCallback(
    async (branchesData = branches) => {
      try {
        const areasResponse = await axiosInstance.get(
          "/api/DeliveryFees/GetAll",
        );

        // Transform API response to match our frontend structure
        const transformedAreas = areasResponse.data.map((area) => ({
          id: area.id,
          areaName: area.areaName,
          deliveryCost: area.fee,
          estimatedTime: `${area.estimatedTimeMin}-${area.estimatedTimeMax} دقائق`,
          estimatedTimeMin: area.estimatedTimeMin,
          estimatedTimeMax: area.estimatedTimeMax,
          isActive: area.isActive,
          branchId: area.branchId,
          branchName:
            branchesData.find((branch) => branch.id === area.branchId)?.name ||
            "فرع غير معروف",
          createdAt: area.createdAt || new Date().toISOString(),
        }));

        setDeliveryAreas(transformedAreas);
        setFilteredAreas(transformedAreas);
      } catch (error) {
        console.error("Error fetching delivery areas:", error);
        showErrorAlert("خطأ", "فشل في تحميل مناطق التوصيل");
      }
    },
    [branches],
  );

  // Filter areas based on search term and filter
  useEffect(() => {
    let filtered = deliveryAreas;

    if (filter !== "all") {
      filtered = filtered.filter((area) =>
        filter === "active" ? area.isActive : !area.isActive,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((area) =>
        area.areaName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredAreas(filtered);
  }, [searchTerm, filter, deliveryAreas]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.branchId ||
      !formData.areaName.trim() ||
      !formData.fee ||
      !formData.estimatedTimeMin ||
      !formData.estimatedTimeMax
    ) {
      showErrorAlert("معلومات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const requestData = {
        branchId: parseInt(formData.branchId),
        areaName: formData.areaName,
        fee: parseFloat(formData.fee),
        estimatedTimeMin: parseInt(formData.estimatedTimeMin),
        estimatedTimeMax: parseInt(formData.estimatedTimeMax),
        isActive: formData.isActive,
      };

      if (editingId) {
        // Update existing area
        const res = await axiosInstance.put(
          `/api/DeliveryFees/Update/${editingId}`,
          requestData,
        );
        if (res.status === 200 || res.status === 204) {
          await fetchDeliveryAreas();
          showSuccessAlert("تم التحديث", "تم تحديث منطقة التوصيل بنجاح");
        }
      } else {
        // Add new area
        const res = await axiosInstance.post(
          "/api/DeliveryFees/Add",
          requestData,
        );
        if (res.status === 200 || res.status === 201) {
          await fetchDeliveryAreas();
          showSuccessAlert("تم الإضافة", "تم إضافة منطقة توصيل جديدة بنجاح");
        }
      }

      resetForm();
    } catch (err) {
      const translatedMessage = translateErrorMessage(err.response?.data, true);

      showErrorAlert("خطأ", translatedMessage);
    }
  };

  const handleEdit = (area) => {
    setFormData({
      branchId: area.branchId?.toString() || "",
      areaName: area.areaName,
      fee: area.deliveryCost?.toString() || "",
      estimatedTimeMin: area.estimatedTimeMin?.toString() || "",
      estimatedTimeMax: area.estimatedTimeMax?.toString() || "",
      isActive: area.isActive,
    });
    setEditingId(area.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/DeliveryFees/Delete/${id}`);
          await fetchDeliveryAreas();
          showSuccessAlert("تم الحذف!", "تم حذف منطقة التوصيل");
        } catch (err) {
          showErrorAlert("خطأ", "فشل في حذف منطقة التوصيل");
        }
      }
    });
  };

  const handleToggleActive = async (id, e) => {
    e.stopPropagation();

    try {
      await axiosInstance.put(`/api/DeliveryFees/ChangeActiveStatus/${id}`);
      await fetchDeliveryAreas();

      showSuccessAlert("تم تحديث الحالة!", "تم تحديث حالة منطقة التوصيل");
    } catch (err) {
      showErrorAlert("خطأ", "فشل في تحديث حالة منطقة التوصيل");
    }
  };

  const resetForm = () => {
    setFormData({
      branchId: "",
      areaName: "",
      fee: "",
      estimatedTimeMin: "",
      estimatedTimeMax: "",
      isActive: true,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleFormBranchSelect = (branchId) => {
    setFormData({
      ...formData,
      branchId: branchId.toString(),
    });
    setFormBranchesDropdownOpen(false);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.branchId !== "" &&
      formData.areaName.trim() !== "" &&
      formData.fee !== "" &&
      formData.estimatedTimeMin !== "" &&
      formData.estimatedTimeMax !== ""
    );
  };

  return {
    deliveryAreas,
    filteredAreas,
    branches,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    isAdding,
    setIsAdding,
    editingId,
    setEditingId,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleActive,
    resetForm,
    fetchDeliveryAreas,
    formBranchesDropdownOpen,
    setFormBranchesDropdownOpen,
    handleFormBranchSelect,
    isFormValid,
    isAdminOrRestaurantOrBranch,
  };
}
