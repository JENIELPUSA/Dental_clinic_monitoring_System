import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // para sa linkId
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const NotificationDisplayContext = createContext();

export const NotificationDisplayProvider = ({ children }) => {
    const { authToken, linkId } = useAuth();
    const [notify, setNotify] = useState([]);

    const fetchNotifications = async () => {
        if (!linkId || !authToken) return;
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Notification/getByLink/${linkId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setNotify(res.data.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [linkId, authToken]);

    const markNotificationAsRead = async (notifId) => {
        if (!authToken || !linkId) return;

        try {
            const result = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Notification/${notifId}/mark-read`,
                { linkId },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );
            setNotify((prev) =>
                prev.map((n) => {
                    if (n._id === notifId) console.log("MATCHED", n);
                    return n._id === notifId ? { ...n, isRead: true } : n;
                }),
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <NotificationDisplayContext.Provider
            value={{
                notify,
                setNotify,
                markNotificationAsRead,
            }}
        >
            {children}
        </NotificationDisplayContext.Provider>
    );
};

export const useNotificationDisplay = () => useContext(NotificationDisplayContext);
