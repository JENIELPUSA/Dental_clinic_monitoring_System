import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const DentalHistoryContext = createContext();

export const DentalHistoryProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [isDentalHistory, setDentalHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    useEffect(() => {
        if (!authToken) {
            setDentalHistory([]);
            setLoading(false);
            return;
        }
        fetchDentalHistory();
    }, [authToken]);

    const fetchDentalHistory = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/DentalHistory`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const BillData = res?.data?.data;
            setDentalHistory(BillData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const AddDentalHistory = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/DentalHistory`,
                {
                    allergies: values.allergies || "",
                    family_dental_history: values.family_dental_history || "",
                    last_checkup_date: values.last_checkup_date || "",
                    patient_id: values.patient_id || "",
                    previous_conditions: values.previous_conditions || "",
                    surgeries: values.surgeries || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                setDentalHistory((prevHistory) => [...prevHistory, res.data.data]); // fixed here
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: res.data.data };
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
            setModalStatus("failed");
            setShowModal(true);
        }
    };

    const UpdateDentalHistory = async (dataId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/DentalHistory/${dataId}`,
                {
                    allergies: payload.allergies,
                    family_dental_history: payload.family_dental_history,
                    last_checkup_date: payload.treatment_date,
                    patient_id: payload.patient_id,
                    previous_conditions: payload.previous_conditions,
                    surgeries: payload.surgeries,
                },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data && response.data.status === "success") {
                const updatedItem = response.data.data;

                if (updatedItem && updatedItem._id) {
                    setDentalHistory((prev) => prev.map((u) => (u._id === updatedItem._id ? { ...u, ...updatedItem } : u)));
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
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/DentalHistory/${Id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setDentalHistory((prevBill) => prevBill.filter((treatment) => treatment._id !== Id));
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

    return (
        <DentalHistoryContext.Provider value={{ isDentalHistory, loading, error, fetchDentalHistory, AddDentalHistory, deleteBill,UpdateDentalHistory }}>
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </DentalHistoryContext.Provider>
    );
};
