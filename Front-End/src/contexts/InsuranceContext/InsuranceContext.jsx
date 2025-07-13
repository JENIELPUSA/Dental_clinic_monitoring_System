import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const InsuranceDisplayContext = createContext();

export const InsuranceDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isInsurance, setInsurance] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authToken) {
            setInsurance([]);
            setLoading(false);
            return;
        }

        fetchInsurance();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchInsurance = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Insurance`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const insurance = res?.data.data;
            setInsurance(insurance);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const AddInsurance = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Insurance`,
                {
                    coverage_details: values.coverage_details || "",
                    insurance_provider: values.insurance_provider || "",
                    patient_id: values.patient_id || "",
                    policy_number: values.policy_number || "",
                    valid_from: values.valid_from || "",
                    valid_until: values.valid_until || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                let newInsuranceData = res.data.data;
                console.log("Adding new insurance:", newInsuranceData);
                setInsurance((prev) => {
                    const updated = [...prev, newInsuranceData];
                    console.log("Updated insurance list:", updated);
                    return updated;
                });
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

    const UpdateInsurance = async (dataId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Insurance/${dataId}`,
                {
                    coverage_details: payload.coverage_details,
                    insurance_provider: payload.insurance_provider,
                    patient_id: payload.patient_id,
                    policy_number: payload.policy_number,
                    valid_from: payload.valid_from,
                    valid_until: payload.valid_until,
                },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data && response.data.status === "success") {
                const updatedItem = response.data.data;

                if (updatedItem && updatedItem._id) {
                    setInsurance((prev) => prev.map((u) => (u._id === updatedItem._id ? { ...u, ...updatedItem } : u)));
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


        const DeleteInsurance = async (Id) => {
            try {
                const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Insurance/${Id}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
    
                if (response.data.status === "success") {
                    setInsurance((prevInsurance) => prevInsurance.filter((insurance) => insurance._id !== Id));
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
        <InsuranceDisplayContext.Provider value={{ isInsurance, AddInsurance, UpdateInsurance,DeleteInsurance }}>
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </InsuranceDisplayContext.Provider>
    );
};
