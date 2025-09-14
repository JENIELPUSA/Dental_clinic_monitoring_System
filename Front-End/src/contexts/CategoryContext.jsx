import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import SuccessFailed from "../ReusableFolder/SuccessandField";
// Create Context
export const CategoryDisplayContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const API_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/InventoryCategory`;

    const fetchCategories = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setCategories(res.data.data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (categoryData) => {
        try {
            const res = await axios.post(API_URL, categoryData);

            if (res.data.status === "success") {
                setCategories((prev) => [...prev, res.data.data]);
                setModalStatus("success");
                setShowModal(true);
                return res.data.data;
            }
        } catch (err) {
            console.error("Error adding category:", err);
            setModalStatus("failed");
            setShowModal(true);
            throw err;
        }
    };

    // ✅ Update category
    const updateCategory = async (id, categoryData) => {
        try {
            const res = await axios.patch(`${API_URL}/${id}`, categoryData);

            if (res.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                setCategories((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
                return res.data.data;
            }
        } catch (err) {
            console.error("Error updating category:", err);
            setModalStatus("failed");
            setShowModal(true);
            throw err;
        }
    };

    const deleteCategory = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/${id}`); // <-- lagay sa res

            if (res.data.status === "success") {
                setCategories((prev) => prev.filter((c) => c._id !== id));
                setModalStatus("success");
                setShowModal(true);
            }
        } catch (err) {
            console.error("Error deleting category:", err);
            setModalStatus("failed");
            setShowModal(true);
            throw err;
        }
    };

    // Auto-fetch on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryDisplayContext.Provider
            value={{
                categories,
                loading,
                fetchCategories,
                addCategory,
                updateCategory,
                deleteCategory,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </CategoryDisplayContext.Provider>
    );
};
