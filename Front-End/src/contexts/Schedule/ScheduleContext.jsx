import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axiosInstance";

export const SchedDisplayContext = createContext();

export const SchedDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, linkId, role } = useContext(AuthContext);
    const [doctor, setSchedDoctors] = useState([]);
    const [doctorSched, setSchedDoctorsSched] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [TotalSchedule, setTotalSchedule] = useState();

    const fetchSchedData = useCallback(
        async (queryParams = {}) => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Schedule`, {
                    withCredentials: true,
                    params: queryParams,
                });

                const schedules = res?.data.data;
                if (role === "doctor") {
                    const filtered = schedules.filter((sched) => sched.doctorId === linkId);
                    setSchedDoctors(filtered);
                    setSchedDoctorsSched(filtered);
                } else {
                    setSchedDoctors(schedules);
                    setSchedDoctorsSched(schedules);
                    setTotalPages(res.data.totalPages || 0);
                    setCurrentPage(res.data.currentPage || 1);
                    setTotalSchedule(res.data.totalCount || 0);
                }
            } catch (error) {
                console.error("Error fetching schedule data:", error);
                setError("Failed to fetch schedule data");
            } finally {
                setLoading(false);
            }
        },
        [authToken, linkId, role],
    );

    useEffect(() => {
        fetchSchedData();
    }, [fetchSchedData]);

    const AddSchedule = useCallback((data) => {
        setSchedDoctors((prev) => [...prev, data.data]);
    }, []);

    const updateStatusSocketData = useCallback((updatedApp) => {
        setSchedDoctors((prev) => prev.map((app) => (app._id === updatedApp._id ? updatedApp : app)));
        setSchedDoctorsSched((prev) => prev.map((app) => (app._id === updatedApp._id ? updatedApp : app)));
    }, []);

    const AddSchedDoctor = async (doctorId, schedulesDataArray) => {
        setLoading(true);
        setError(null);
        try {
            const requests = schedulesDataArray.map((entry) => {
                const { date, day, timeSlots } = entry;
                if (!Array.isArray(timeSlots) || !date || !day || timeSlots.length === 0) return null;

                return axiosInstance.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Schedule`,
                    {
                        doctor: doctorId,
                        date,
                        day,
                        timeSlots: timeSlots.map((slot) => ({
                            start: slot.start,
                            end: slot.end,
                            maxPatientsPerSlot: Number(slot.maxPatientsPerSlot) || 10,
                            reason: slot.reason || "",
                        })),
                        status: "Pending",
                        isActive: true,
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } },
                );
            });

            const results = await Promise.allSettled(requests.filter(Boolean));
            let successCount = 0;
            let failedMessages = [];

            results.forEach((result, idx) => {
                if (result.status === "fulfilled") {
                    if (result.value?.data?.status === "success") successCount++;
                } else {
                    const msg = result.reason?.response?.data?.message || result.reason?.message || "Unexpected error";
                    failedMessages.push(`Entry ${idx + 1} failed: ${msg}`);
                }
            });

            fetchSchedData();

            if (failedMessages.length === 0) {
                setModalStatus("success");
                setShowModal(true);
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                setCustomError(failedMessages.join("; "));
                return { success: false, error: failedMessages };
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Unexpected error occurred";
            setModalStatus("failed");
            setShowModal(true);
            setCustomError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const UpdateSchedData = async (dataId, statusData) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Schedule/${dataId}`,
                { status: statusData },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (response.data?.status === "success") {
                const updated = response.data.data[0];
                setSchedDoctors((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Update error";
            setCustomError(msg);
            setModalStatus("failed");
            setShowModal(true);
        }
    };

    const UpdateSchedDoctor = async (dataId, values) => {
        const timeSlots = [];
        Object.values(values).forEach((daySlots) => {
            if (Array.isArray(daySlots)) {
                daySlots.forEach((slot) => {
                    timeSlots.push({
                        date: slot.date,
                        start: slot.start,
                        end: slot.end,
                        reason: slot.reason,
                        maxPatientsPerSlot: slot.maxPatientsPerSlot,
                        _id: slot._id,
                    });
                });
            }
        });

        if (!timeSlots.length) {
            setCustomError("No time slots provided.");
            return { success: false };
        }

        try {
            const res = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/schedule/update-sched/${dataId}`,
                { timeSlots, status: "Re-Assigned" },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            const updated = res.data?.data?.[0];
            if (updated?._id) {
                setSchedDoctors((prev) =>
                    prev.map((u) =>
                        u._id.toString() === updated._id.toString() ? { ...u, timeSlots: updated.timeSlots, status: updated.status } : u,
                    ),
                );
                setModalStatus("success");
                setShowModal(true);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to update schedule";
            setCustomError(msg);
            setModalStatus("failed");
            setShowModal(true);
        }
    };

    const Deletedata = async (id) => {
        try {
            const res = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Schedule/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data?.status === "success") {
                setSchedDoctors((prev) => prev.filter((d) => d._id !== id));
                setModalStatus("success");
                setShowModal(true);
            } else {
                throw new Error("Delete failed");
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete schedule.");
        }
    };

    return (
        <SchedDisplayContext.Provider
            value={{
                AddSchedDoctor,
                doctor,
                loading,
                error,
                customError,
                modalStatus,
                showModal,
                setShowModal,
                UpdateSchedData,
                UpdateSchedDoctor,
                Deletedata,
                doctorSched,
                AddSchedule,
                updateStatusSocketData,
                fetchSchedData,
                currentPage,
                setCurrentPage,
                TotalSchedule,
                isTotalPages,
                loading,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                message={customError}
            />
        </SchedDisplayContext.Provider>
    );
};
