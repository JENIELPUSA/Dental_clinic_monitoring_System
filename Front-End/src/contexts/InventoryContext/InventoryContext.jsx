import { createContext, useContext, useState, useEffect, useCallback } from "react";
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
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [TotalInventory, setTotalInventory] = useState();

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const fetchInventory = useCallback(
        async (queryParams = {}) => {
            try {
                if (!authToken) return;
                setLoading(true);

                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    params: queryParams,
                });

                const data = res.data;

                setInventory(data.data || []);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(data.currentPage || 1);
                setTotalInventory(data.totalInventory || 0);
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching inventory");
            } finally {
                setLoading(false);
            }
        },
        [authToken],
    );

    const addInventory = async (newItem) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory`, newItem, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
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
            const res = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.data.status === "success") {
                setInventory((prev) => prev.map((item) => (item._id === id ? res.data.data : item)));
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
            const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
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

    const fetchInventoryReportPDF = async (queryParams = {}) => {
        if (!authToken) {
            setError("Authentication required");
            return;
        }

        setLoading(true);
        try {
            // Construct full URL with query params
            const baseUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Inventory/GenerateInventoryPDF`;
            const url = new URL(baseUrl);

            // Append all query params (From, To, status, search, etc.)
            Object.keys(queryParams).forEach((key) => {
                if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== "") {
                    url.searchParams.append(key, queryParams[key]);
                }
            });

            // Fetch PDF as Blob
            const response = await axios.get(url.toString(), {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/pdf",
                },
                responseType: "blob", // Critical: treat response as binary PDF
            });

            // Create blob URL and trigger preview/download
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Option 1: Open in new tab (inline preview)
            window.open(pdfUrl, "_blank");

            // Option 2: Auto-download (uncomment if preferred)
            // const link = document.createElement('a');
            // link.href = pdfUrl;
            // link.download = `appointment-report-${new Date().toISOString().slice(0, 10)}.pdf`;
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            // URL.revokeObjectURL(pdfUrl);
        } catch (error) {
            console.error("Error generating PDF report:", error);
            if (error.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError("Failed to generate report. Please try again.");
            }
        } finally {
            setLoading(false);
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
                TotalInventory,
                isTotalPages,
                currentPage,
                setCurrentPage,
                fetchInventoryReportPDF
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
