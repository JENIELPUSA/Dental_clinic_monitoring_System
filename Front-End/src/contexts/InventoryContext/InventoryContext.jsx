import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

const InventoryContext = createContext();

export const InventoryDisplayContext = InventoryContext;
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const fetchInventory = async () => {
        try {
            if (!authToken) return;
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setInventory(res.data.data || res.data); // depende sa response structure
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching inventory");
        } finally {
            setLoading(false);
        }
    };

    const addInventory = async (newItem) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory`,
                newItem,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (res.data.status === "success") {
                fetchInventory();
                setModalStatus("success");
                setShowModal(true);
            }
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error adding inventory item");
            setModalStatus("failed");
            setShowModal(true);
            throw err;
        }
    };

    const updateInventory = async (id, updatedData) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory/${id}`,
                updatedData,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (res.data.status === "success") {
                setInventory((prev) =>
                    prev.map((item) => (item._id === id ? res.data.data : item))
                );
                setModalStatus("success");
                setShowModal(true);
            }
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error updating inventory item");
            setModalStatus("failed");
            setShowModal(true);
            throw err;
        }
    };

    const deleteInventory = async (id) => {
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory/${id}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (res.data.status === "success") {
                setInventory((prev) => prev.filter((item) => item._id !== id));
                setModalStatus("success");
                setShowModal(true);
            }
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting inventory item");
            setModalStatus("failed");
            setShowModal(true);
            throw err;
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [authToken]);

    return (
        <InventoryContext.Provider
            value={{
                inventory,
                loading,
                error,
                fetchInventory,
                addInventory,
                updateInventory,
                deleteInventory,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </InventoryContext.Provider>
    );
};
