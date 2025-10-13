import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import OTPform from "../../component/Login/OTPform";
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const DoctorDisplayContext = createContext();
export const DoctorDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, role } = useContext(AuthContext);
    const [doctor, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [isTotalDoctors, setTotalDoctors] = useState();
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isOTPModal, setOTPModal] = useState(false);
    const [userId, setUserId] = useState("");
console.log("isTotalPages",isTotalPages)
    useEffect(() => {
        if (!authToken) {
            setDoctors([]);
            setLoading(false);
            return;
        }

        fetchDoctortData();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const fetchDoctortData = async (queryParams = {}) => {
        if (!authToken) return;
        setLoading(true); // Set loading to true before fetching data
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Doctors`, {
                withCredentials: true,
                params: queryParams,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const doctor = res?.data.data;
            setDoctors(doctor);
            setTotalPages(res?.data.totalPages);
            setCurrentPage(res?.data.currentPage);
            setTotalDoctors(res?.data.totalDoctors);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false); // Set loading to false after data fetching is complete
        }
    };

    const handleOTP = (userId) => {
        setOTPModal(true);
        setUserId(userId);
    };

    const UpdateDoctor = async (dataId, values) => {
        try {
            const formData = new FormData();

            // Append each value
            if (values.avatar instanceof File) {
                formData.append("avatar", values.avatar); // if user selected new image
            }
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("specialty", values.specialty || "Male");
            formData.append("contact_number", values.contact_number || "");
            formData.append("email", values.email || "");

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Doctors/${dataId}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    // 'Content-Type' is automatically set to multipart/form-data by axiosInstance when using FormData
                },
            });

            if (response.data && response.data.status === "success") {
                setDoctors((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));

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

    const Deletedata = async (doctors) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Doctors/${doctors}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setDoctors((prevUsers) => prevUsers.filter((user) => user._id !== doctors));
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

    const AddDoctor = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                {
                    avatar: values.avatar || "",
                    first_name: values.first_name || "",
                    last_name: values.last_name || "",
                    role: values.role || "",
                    password: values.password,
                    specialty: values.specialty || "Male",
                    contact_number: values.contact_number || "",
                    email: values.email || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            console.log("Doctor", res.data.data);
            if (res.data.status === "Success") {
                if (role !== "admin") {
                    handleOTP(res.data.user._id);
                } else if (role === "admin") {
                    setModalStatus("success");
                    setShowModal(true);
                }

                fetchDoctortData();
                return { success: true, data: response?.data.data };
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
        <DoctorDisplayContext.Provider
            value={{
                customError,
                doctor,
                UpdateDoctor,
                Deletedata,
                AddDoctor,
                setUserId,
                isTotalDoctors,
                isTotalPages,
                currentPage,
                loading,
                fetchDoctortData,
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
        </DoctorDisplayContext.Provider>
    );
};
