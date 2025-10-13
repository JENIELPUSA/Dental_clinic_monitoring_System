import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";

export const AppointmentDisplayContext = createContext();

export const AppointmentDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, linkId, role } = useContext(AuthContext);
    const [appointment, setAppointment] = useState([]);
    const [specificAppointment, setSpecificAppointment] = useState([]);
    const [isPatientData, setPatientData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [totalPages, setTotalPages] = useState();
    const [TotalAppointment, setTotalAppointment] = useState();

    const addAppointment = (newApp) => {
        setAppointment((prev) => [...prev, newApp]);
        console.log("Appointmrnt", newApp);
    };

    const updateAppointmentSocketData = (updatedApp) => {
        setAppointment((prev) => prev.map((app) => (app._id === updatedApp._id ? updatedApp : app)));
    };

    useEffect(() => {
        if (!authToken) {
            setAppointment([]);
            setSpecificAppointment([]);
            setLoading(false);
            return;
        }

        fetchAppointmentData();
        GetPatientAppointment();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchAppointmentData = async (queryParams = {}) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Appointment`, {
                withCredentials: true,
                params: queryParams,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            let fetchedData = res?.data?.data;
            if (fetchedData && !Array.isArray(fetchedData)) {
                fetchedData = [fetchedData];
            } else if (!fetchedData) {
                fetchedData = [];
            }

            if (role === "patient") {
                const filtered = fetchedData.filter((item) => item.patient_id === linkId);
                setAppointment(filtered);
            } else if (role === "admin" || role === "staff") {
                setAppointment(fetchedData);
                setTotalPages(res.data.totalPages);
                setCurrentPage(res.data.currentPage);
                setTotalAppointment(res.data.totalAppointments);
            } else {
                const filtered = fetchedData.filter((item) => item.doctor_id === linkId);
                setAppointment(filtered);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const fetchPdfSpecificAppointment = async (dataId) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Appointment/GetSpecificByAppointment/${dataId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                    responseType: "blob",
                },
            );

            const file = new Blob([res.data], { type: "application/pdf" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(file);
            link.download = `Appointment_${dataId.slice(-6)}.pdf`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error("Failed to download PDF. Please try again later.");
            setError("Failed to download PDF");
        } finally {
            setLoading(false);
        }
    };

    const GetPatientAppointment = async (dataId) => {
        if (!dataId || !authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Appointment/GetPatientAppointment/${dataId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            const Patient = res?.data.data;
            setPatientData(Patient);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const AddBooking = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Appointment`,
                {
                    patient_id: values.patient_id || "",
                    doctor_id: values.doctor_id || "",
                    appointment_date: values.appointment_date || "",
                    slot_id: values.slot_id || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                let newAppointmentData = res.data.data;
                if (newAppointmentData && !Array.isArray(newAppointmentData)) {
                    newAppointmentData = [newAppointmentData];
                }
                fetchAppointmentData();
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: res?.data.data };
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

    const UpdateStatus = async (dataId, statusData) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Appointment/UpdateStatus/${dataId}`,
                { appointment_status: statusData },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            console.log("Response Data:", response.data);

            if (response.data && response.data.status === "success") {
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

    const deleteAppointment = async (Id) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Appointment/${Id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setAppointment((prevBill) => prevBill.filter((treatment) => treatment._id !== Id));
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
        <AppointmentDisplayContext.Provider
            value={{
                UpdateStatus,
                customError,
                appointment,
                setAppointment,
                AddBooking,
                loading,
                error,
                fetchAppointmentData,
                specificAppointment,
                fetchPdfSpecificAppointment,
                addAppointment,
                updateAppointmentSocketData,
                isPatientData,
                GetPatientAppointment,
                deleteAppointment,
                totalPages,
                currentPage,
                TotalAppointment,
                setCurrentPage,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </AppointmentDisplayContext.Provider>
    );
};
