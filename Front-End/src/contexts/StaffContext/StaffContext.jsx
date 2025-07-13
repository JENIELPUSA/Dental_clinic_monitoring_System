import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import OTPform from "../../component/Login/OTPform";
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const StaffDisplayContext = createContext();

export const StaffDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, role } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isStaff, setStaff] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isOTPModal, setOTPModal] = useState(false);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        if (!authToken) {
            setStaff([]);
            setLoading(false);
            return;
        }

        fetchStaff();
    }, [authToken]);
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    const handleOTP = (userId) => {
        setOTPModal(true);
        setUserId(userId);
    };

    const AddStaff = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                {
                    avatar: values.avatar || "",
                    first_name: values.first_name || "",
                    last_name: values.last_name || "",
                    role: values.role || "",
                    password: values.password,
                    contact_number: values.contact_number || "",
                    email: values.email || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "Success") {
                const newStaff = res.data.user;

                if (role === "admin") {
                    setUserId(newStaff._id);
                    fetchStaff();
                    setModalStatus("success");
                    setShowModal(true);
                     return { success: true, data: newStaff }; 
                } else {
                    handleOTP(newStaff._id); // Show OTP flow for non-admin
                }
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
                return { success: false, error: message }; // ✅ Return failure
            } else if (error.request) {
                setCustomError("No response from the server.");
                return { success: false, error: "No response from the server." }; // ✅ Return failure
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
                return { success: false, error: error.message || "Unexpected error" }; // ✅ Return failure
            }
        }
    };
    const fetchStaff = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Staff`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const StaffData = res?.data?.data;
            setStaff(StaffData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const DeleteStaff = async (ID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Staff/${ID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setStaff((prevUsers) => prevUsers.filter((user) => user._id !== ID));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const UpdateStaff = async (dataId, values) => {
        try {
            const formData = new FormData();

            if (values.avatar instanceof File) {
                formData.append("avatar", values.avatar); // if user uploaded new file
            } else if (typeof values.avatar === "string") {
                formData.append("avatar", values.avatar); // send existing image string path
            }

            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("contact_number", values.contact_number || "");
            formData.append("email", values.email || "");

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Staff/${dataId}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    // Content-Type will be set automatically by Axios when using FormData
                },
            });

            if (response.data && response.data.status === "success") {
                setStaff((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));
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

    return (
        <StaffDisplayContext.Provider
            value={{
                AddStaff,
                isStaff,
                DeleteStaff,
                UpdateStaff,
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
                errorMessage={customError}
            />
        </StaffDisplayContext.Provider>
    );
};
