import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../ReusableFolder/axiosInstance";
export const LogsDisplayContext = createContext();

export const LogsDisplayProvider = ({ children }) => {
    const [isLogs, setLogs] = useState([]);
    const { authToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!authToken) {
            console.log("NO token");
            setLogs([]);
            setLoading(false);
            return;
        }

        fetchLogsData();
    }, [authToken]);

    const fetchLogsData = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/LogsAudit`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            let fetchedData = res?.data?.data;
            if (fetchedData && !Array.isArray(fetchedData)) {
                fetchedData = [fetchedData];
            } else if (!fetchedData) {
                fetchedData = [];
            }

            setLogs(fetchedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return <LogsDisplayContext.Provider value={{ isLogs }}>{children}</LogsDisplayContext.Provider>;
};
