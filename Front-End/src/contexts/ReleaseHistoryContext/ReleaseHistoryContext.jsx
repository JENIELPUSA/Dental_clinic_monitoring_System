import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";

export const ReleaseHistoryContext = createContext();

export const ReleaseHistoryProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [releaseItems, setReleaseItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customError, setCustomError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");

  useEffect(() => {
    if (!authToken) {
      setReleaseItems([]);
      setLoading(false);
      return;
    }
    fetchReleaseItems();
  }, [authToken]);

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [customError]);

  // Fetch all items
  const fetchReleaseItems = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setReleaseItems(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching release items:", err);
      setError("Failed to fetch release items");
    } finally {
      setLoading(false);
    }
  };

  // Add item
  const addReleaseItem = async (itemId,serialNumber) => {
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release`,
        {
          inventoryId: itemId || "",
          serialNumber: serialNumber|| "",
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.status==="success") {
        setReleaseItems((prev) => [...prev, res.data.data]);
        setModalStatus("success");
        setShowModal(true);
      } else {
        setModalStatus("failed");
        setShowModal(true);
      }
    } catch (err) {
      let message = err.response?.data?.message || err.message || "Something went wrong.";
      setCustomError(message);
      toast.error(message);
    }
  };

  // Update item
  const updateReleaseItem = async (id, payload) => {
    try {
      const res = await axiosInstance.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

       if (res.data.status==="success") {
        setReleaseItems((prev) =>
          prev.map((item) => (item._id === id ? res.data.data : item))
        );
        setModalStatus("success");
        setShowModal(true);
      } else {
        setModalStatus("failed");
        setShowModal(true);
      }
    } catch (err) {
      let message = err.response?.data?.message || err.message || "Something went wrong.";
      setCustomError(message);
      toast.error(message);
    }
  };

  // Delete item
  const deleteReleaseItem = async (id) => {
    try {
      const res = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

        if (res.data.status==="success") {
        setReleaseItems((prev) => prev.filter((item) => item._id !== id));
        setModalStatus("success");
        setShowModal(true);
      } else {
        setModalStatus("failed");
        setShowModal(true);
      }
    } catch (err) {
      let message = err.response?.data?.message || err.message || "Failed to delete item.";
      setCustomError(message);
      toast.error(message);
    }
  };

  return (
    <ReleaseHistoryContext.Provider
      value={{
        releaseItems,
        addReleaseItem,
        updateReleaseItem,
        deleteReleaseItem,
        fetchReleaseItems,
        loading,
        error,
      }}
    >
      {children}
      <SuccessFailed
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </ReleaseHistoryContext.Provider>
  );
};
