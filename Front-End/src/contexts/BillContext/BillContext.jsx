import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";
import { TreatmentDisplayContext } from "../TreatmentContext/TreatmentContext";

export const BillDisplayContext = createContext();

export const BillDisplayProvider = ({ children }) => {
    const { fetchTreatment } = useContext(TreatmentDisplayContext);
    const { authToken } = useContext(AuthContext);
    const [isBIll, setBill] = useState([]);
    const [isHistory, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [TotalCount, setTotalCount] = useState();
    useEffect(() => {
        if (!authToken) {
            setBill([]);
            setLoading(false);
            return;
        }
        fetchHistory();
        fetchBill();
    }, [authToken]);
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);
    const fetchBill = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const BillData = res?.data?.data;
            setBill(BillData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const AddBill = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill`,
                {
                    balance: values.balance || "",
                    amount_paid: values.amount_paid || "",
                    bill_date: values.bill_date || "",
                    treatment_id: values.treatment_id || "",
                    payment_status: values.payment_status || "",
                    total_amount: values.total_amount || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                let newBillData = res.data.data;
                setBill((prevBillData) => [...prevBillData, newBillData]);
                setHistory((prevBillData) => [...prevBillData, newBillData]);
                fetchTreatment();
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                toast.error("Unexpected response from server.");
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            let message = "Something went wrong.";
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                message = typeof errorData === "string" ? errorData : errorData.message || errorData.error || message;
            } else if (error.request) {
                message = "No response from the server.";
            } else {
                message = error.message || message;
            }

            setCustomError(message);
            toast.error(message);
        }
    };

    const UpdateBill = async (dataId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill/${dataId}`,
                {
                    balance: payload.balance,
                    amount_paid: payload.amount_paid,
                    bill_date: payload.bill_date,
                    patient_id: payload.patient_id,
                    payment_status: payload.payment_status,
                    total_amount: payload.total_amount,
                },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data && response.data.status === "success") {
                const updatedItem = response.data.data;

                if (updatedItem && updatedItem._id) {
                    setBill((prev) => prev.map((u) => (u._id === updatedItem._id ? { ...u, ...updatedItem } : u)));
                }

                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message = typeof errorData === "string" ? errorData : errorData.message || errorData.error || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
        }
    };

    const deleteBill = async (Id) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill/${Id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setBill((prevBill) => prevBill.filter((treatment) => treatment._id !== Id));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.response?.data?.message || "Failed to delete user.");
        }
    };

    const fetchHistory = useCallback(
        async (queryParams = {}) => {
            if (!authToken) return;

            setLoading(true);
            try {
                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill/History`, {
                    withCredentials: true,
                    params: queryParams,
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const BillData = res?.data?.data;
                setHistory(BillData);
                setCurrentPage(res?.data?.currentPage);
                setTotalPages(res?.data?.totalPages);
                setTotalCount(res?.data?.totalCount);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        },
        [authToken],
    );

    const GeneratePdf = async (patient_id) => {
        if (!authToken) return;

        setLoading(true);
        try {
            await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill/patientId/${patient_id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const GenerateBillHistoryPDFByPatient = async (queryParams = {}) => {
        if (!authToken) {
            setError("Authentication required");
            return;
        }

        setLoading(true);
        try {
            // Construct full URL with query params
            const baseUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Bill/GenerateBillHistoryPDFByPatient`;
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
        <BillDisplayContext.Provider
            value={{
                isBIll,
                AddBill,
                UpdateBill,
                deleteBill,
                isHistory,
                GeneratePdf,
                fetchHistory,
                TotalCount,
                isTotalPages,
                currentPage,
                loading,
                setCurrentPage,
                GenerateBillHistoryPDFByPatient,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </BillDisplayContext.Provider>
    );
};
