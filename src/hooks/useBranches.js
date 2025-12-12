import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { translateErrorMessageAdminBranches } from "../utils/ErrorTranslator";

export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [cities, setCities] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/api/Branches/GetAll");
      if (res.status === 200) {
        setBranches(res.data);
      }
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/Cities/GetAll");
      if (res.status === 200) {
        setCities(res.data);
      }
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/Users/GetAll");
      if (res.status === 200) {
        const branchManagers = res.data.filter(
          (user) => user.roles && user.roles.includes("Branch")
        );
        setManagers(branchManagers);
      }
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchBranches(), fetchCities(), fetchManagers()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBranches, fetchCities, fetchManagers]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const addBranch = async (branchData) => {
    try {
      const res = await axiosInstance.post("/api/Branches/Add", branchData);
      await fetchBranches();
      return res;
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    }
  };

  const updateBranch = async (branchId, branchData) => {
    try {
      const res = await axiosInstance.put(
        `/api/Branches/Update/${branchId}`,
        branchData
      );
      await fetchBranches();
      return res;
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    }
  };

  const deleteBranch = async (branchId) => {
    try {
      await axiosInstance.delete(`/api/Branches/Delete/${branchId}`);
      await fetchBranches();
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    }
  };

  const toggleBranchActive = async (branchId) => {
    try {
      await axiosInstance.put(`/api/Branches/ChangeActiveStatus/${branchId}`);
      await fetchBranches();
    } catch (err) {
      const errorMessage = translateErrorMessageAdminBranches(err.response?.data);
      setError(errorMessage);
      throw errorMessage;
    }
  };

  return {
    branches,
    cities,
    managers,
    isLoading,
    error,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    toggleBranchActive,
  };
};
