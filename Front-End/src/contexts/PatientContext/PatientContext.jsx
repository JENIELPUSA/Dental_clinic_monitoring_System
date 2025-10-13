import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import OTPform from "../../component/Login/OTPform";
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const PatientDisplayContext = createContext();
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
export const PatientDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, role } = useContext(AuthContext);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState();
    const [TotalPatients, setTotalPatients] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [usersPerPage, setusersPerPage] = useState(6);
    const [isTotal, setTotal] = useState("");
    const [isMale, setMale] = useState("");
    const [isFemale, setFemale] = useState("");
    const [isOTPModal, setOTPModal] = useState(false);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        if (!authToken) {
            setPatients([]);
            setLoading(false);
            return;
        }

        fetchPatientData();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchPatientData = async (queryParams = {}) => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Patient`, {
                withCredentials: true,
                params: queryParams,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const patient = res?.data.data;
            setPatients(patient);
            setTotalPages(res?.data.totalPages);
            setCurrentPage(res?.data.currentPage);
            setTotalPatients(res?.data.totalPatients);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data");
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const UpdatePatient = async (initialID, values) => {
        try {
            const dataToSend = new FormData();
            if (values.avatar instanceof File) {
                dataToSend.append("avatar", values.avatar); // if user selected new image
            }
            dataToSend.append("first_name", values.first_name || "");
            dataToSend.append("last_name", values.last_name || "");
            dataToSend.append("gender", values.gender || "Male");
            dataToSend.append("dob", values.dob || "");
            dataToSend.append("email", values.email || "");

            dataToSend.append("emergency_contact_namee", values.emergency_contact_name || "");
            dataToSend.append("emergency_contact_number", values.emergency_contact_number || "");
            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Patient/${initialID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                setPatients((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));

                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: response };
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

    const DeleteNewBorn = async (newbordID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Patient/${newbordID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setPatients((prevUsers) => prevUsers.filter((user) => user._id !== newbordID));
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

    const handleOTP = (userId) => {
        setOTPModal(true);
        setUserId(userId);
    };

    const AddPatient = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                {
                    first_name: values.first_name || "",
                    last_name: values.last_name || "",
                    gender: values.gender || "Male",
                    dob: values.dob || "",
                    email: values.email || "",
                    password: values.password || "",
                    role: values.role || "",
                    address: values.address || "",
                    emergency_contact_name: values.emergency_contact_name || "",
                    emergency_contact_number: values.emergency_contact_number || "",
                    avatar: values.avatar || null,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "Success") {
                if (role !== "admin") {
                    handleOTP(res.data.user._id);
                }
                fetchPatientData();
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
        <PatientDisplayContext.Provider
            value={{
                customError,
                patients,
                DeleteNewBorn,
                UpdatePatient,
                AddPatient,
                TotalPatients,
                TotalPages,
                currentPage,
                fetchPatientData,
                loading,
            }}
        >
            {children}

            <OTPform
                isOpen={isOTPModal}
                onClose={() => setOTPModal(false)}
                userId={userId}
            />

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </PatientDisplayContext.Provider>
    );
};
