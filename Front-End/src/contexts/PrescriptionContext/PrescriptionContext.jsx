import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";

export const PrescriptionDisplayContext = createContext();

export const PrescriptionDisplayProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [Prescription, setPrescription] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [modalStatus, setModalStatus] = useState("success");
    useEffect(() => {
        if (!authToken) {
            setPrescription([]);
            setLoading(false);
            return;
        }

        fetchPrescription();
    }, [authToken]);
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);
    const fetchPrescription = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Prescription`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const TreatmentData = res?.data?.data;
            setPrescription(TreatmentData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const AddPrescription = async (values) => {
        try {
            // Format postCare dates if provided
            const formattedPostCare = {
                instructions: values.postCare?.instructions || "",
                medication: values.postCare?.medication || "",
                nextVisit: values.postCare?.nextVisit ? new Date(values.postCare.nextVisit).toISOString() : null,
            };

            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Prescription`,
                {
                    appointment_id: values.appointment_id || "",
                    medications:
                        values.medications?.map((med) => ({
                            medication_name: med.medication_name || "",
                            dosage: med.dosage || "",
                            frequency: med.frequency || "",
                            start_date: med.start_date ? new Date(med.start_date).toISOString() : null,
                            end_date: med.end_date ? new Date(med.end_date).toISOString() : null,
                        })) || [],
                    postCare: formattedPostCare,
                    fileUrl: values.fileUrl || null,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                let newPrescriptionData = res.data.data;
                setPrescription((prev) => [...prev, newPrescriptionData]);
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                toast.error("Unexpected response from server.");
            }
        } catch (error) {
            let message = "Something went wrong.";
            if (error.response?.data) {
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

    const DeletePrescription = async (Id) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Prescription/${Id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setPrescription((prevPrescription) => prevPrescription.filter((treatment) => treatment._id !== Id));
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

    const fetchPrescriptionPDF = async (id) => {
        if (!id) return null;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Authentication token not found.");
            return null;
        }

        // Buuin ang URL para sa API endpoint
        const url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Prescription/prescription/${id}`;

        try {
            const res = await axios.get(url, {
                responseType: "blob", // Hinihingi ang response bilang isang Blob (para sa file/PDF)
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // I-verify na ang nakuha ay isang PDF (optional check)
            if (res.data.type !== "application/pdf") {
                console.error("Received data is not a PDF type:", res.data.type);
                return null;
            }

            return res.data; // Ito na ang PDF Blob
        } catch (error) {
            // Handling ng error
            console.error("Axios fetch error:", error.response?.statusText || error.message);
            return null;
        }
    };

    const UpdatePrescription = async (dataId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Prescription/${dataId}`,
                {
                    appointment_id: payload.appointment_id,
                    dosage: payload.dosage,
                    end_date: payload.end_date,
                    frequency: payload.frequency,
                    medication_name: payload.medication_name,
                    start_date: payload.start_date,
                },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data && response.data.status === "success") {
                const updatedItem = response.data.data;

                if (updatedItem && updatedItem._id) {
                    setPrescription((prev) => prev.map((u) => (u._id === updatedItem._id ? { ...u, ...updatedItem } : u)));
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

    return (
        <PrescriptionDisplayContext.Provider
            value={{
                Prescription,
                AddPrescription,
                DeletePrescription,
                UpdatePrescription,
                fetchPrescriptionPDF,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </PrescriptionDisplayContext.Provider>
    );
};
