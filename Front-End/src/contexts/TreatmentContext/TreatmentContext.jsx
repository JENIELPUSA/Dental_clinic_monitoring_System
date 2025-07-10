import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";

export const TreatmentDisplayContext = createContext();

export const TreatmentDisplayProvider = ({ children }) => {
    const { authToken,linkId } = useContext(AuthContext);
    const [Treatment, setTreatment] = useState([]);
    const [isSpecifyTreatment,setSpicifyTreatment]=useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const AddSocketTreatment = () => {
       fetchTreatment();
    };

    useEffect(() => {
        if (!authToken) {
            setTreatment([]);0
            setLoading(false);
            return;
        }

        fetchTreatment();
        fetchSpecificTreatment();
        
    }, [authToken]);
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);
    const fetchTreatment = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Treatment`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const TreatmentData = res?.data?.data;
            setTreatment(TreatmentData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };



    const fetchSpecificTreatment = async (Id) => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Treatment/SpecificTreatment/${Id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const TreatmentData = res?.data?.data;
            setSpicifyTreatment(TreatmentData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const AddTreatment = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Treatment`,
                {
                    appointment_id: values.appointment_id || "",
                    treatment_description: values.treatment_description || "",
                    treatment_date: values.treatment_date || "",
                    treatment_cost: values.treatment_cost || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
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

    const DeleteTreatment = async (Id) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Treatment/${Id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setTreatment((prevTreatment) => prevTreatment.filter((treatment) => treatment._id !== Id));
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


    const UpdateTreatment = async (dataId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Treatment/${dataId}`,
                { 
                    appointment_id: payload.appointment_id,
                    treatment_cost:payload.treatment_cost,
                    treatment_date:payload.treatment_date,
                    treatment_description:payload.treatment_description
                },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data && response.data.status === "success") {
                const updatedItem = response.data.data; 

                if (updatedItem && updatedItem._id) {
                    setTreatment((prev) => prev.map((u) => (u._id === updatedItem._id ? { ...u, ...updatedItem } : u)));
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
        <TreatmentDisplayContext.Provider
            value={{
                Treatment,
                loading,
                error,
                fetchTreatment,
                AddTreatment,
                DeleteTreatment,
                UpdateTreatment,
                fetchSpecificTreatment,isSpecifyTreatment,AddSocketTreatment
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </TreatmentDisplayContext.Provider>
    );
};
