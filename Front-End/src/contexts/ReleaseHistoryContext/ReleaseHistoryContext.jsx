import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
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
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [TotalRelease, setTotalRelease] = useState();

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

    const fetchReleaseItems = useCallback(
        async (queryParams = {}) => {
            if (!authToken) return;
            setLoading(true);

            try {
                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    params: queryParams,
                });

                const data = res?.data || {};
                setReleaseItems(data.data || []);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(data.currentPage || 1);
                setTotalRelease(data.totalItems || 0);
            } catch (err) {
                console.error("Error fetching release items:", err);
                setError("Failed to fetch release items");
            } finally {
                setLoading(false);
            }
        },
        [authToken],
    );

    // Add item
    const addReleaseItem = async (itemId, serialNumber) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release`,
                {
                    inventoryId: itemId || "",
                    serialNumber: serialNumber || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
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
            const res = await axiosInstance.put(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release/${id}`, payload, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data.status === "success") {
                setReleaseItems((prev) => prev.map((item) => (item._id === id ? res.data.data : item)));
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
            const res = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data.status === "success") {
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

    const fetchReleaseReportPDF = async (queryParams = {}) => {
        if (!authToken) {
            setError("Authentication required");
            return;
        }

        setLoading(true);
        try {
            // Construct full URL with query params
            const baseUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Release/GenerateReleaseReportPDF`;
            const url = new URL(baseUrl);

            // Append all query params (From, To, status, search, etc.)
            Object.keys(queryParams).forEach((key) => {
                if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== "") {
                    url.searchParams.append(key, queryParams[key]);
                }
            });

            // Fetch PDF as Blob
            const response = await axiosInstance.get(url.toString(), {
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

    return (
        <ReleaseHistoryContext.Provider
            value={{
                releaseItems,
                addReleaseItem,
                updateReleaseItem,
                deleteReleaseItem,
                fetchReleaseItems,

                error,
                loading,
                TotalRelease,
                isTotalPages,
                currentPage,
                setCurrentPage,
                fetchReleaseReportPDF
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
