import React, { createContext, useState, useCallback } from "react";
import axios from "axios";

// 1. Paglikha ng Context Object
// Ito ang gagamitin para sa useContext() hook sa ibang components.
export const TreatmentProgressContext = createContext();

// 2. Ang Provider Component
export const TreatmentProgressProvider = ({ children }) => {
    // State Management
    const [treatmentResults, setTreatmentResults] = useState([]);
    const [isLoadingTreatmentResults, setisLoadingTreatmentResults] = useState(false);
    const [error, setError] = useState("");

    // Function: Magdagdag ng Bagong Treatment Progress (C - Create)
    const addTreatmentProgress = useCallback(async (formData) => {
        try {
            setisLoadingTreatmentResults(true);
            setError("");

            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Result/progress`, formData, {
                // Mahalaga ang header na ito para sa pag-upload ng files (e.g., images)
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Idagdag ang bagong resulta sa listahan
            setTreatmentResults((prev) => [...prev, res.data.data]);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add treatment progress");
            throw err;
        } finally {
            setisLoadingTreatmentResults(false);
        }
    }, []);

    // Function: Kumuha ng Treatment Results Batay sa Patient ID (R - Read)
    const fetchTreatmentResultsByPatient = useCallback(async (patientId) => {
        if (!patientId) return;

        try {
            setisLoadingTreatmentResults(true);
            setError("");

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Result/patient/${patientId}`);

            if (res.data.success) {
                // I-set ang listahan ng resulta
                setTreatmentResults(res.data.data);
            } else {
                setError("Failed to fetch treatment results");
            }
        } catch (err) {
            console.error("Error fetching treatment results:", err);
            setError(err.response?.data?.message || "Failed to fetch treatment results");
        } finally {
            setisLoadingTreatmentResults(false);
        }
    }, []);

    // 3. Pagpasa ng Value sa Provider
    return (
        <TreatmentProgressContext.Provider
            value={{
                treatmentResults,
                isLoadingTreatmentResults,
                setisLoadingTreatmentResults,
                error,
                addTreatmentProgress,
                fetchTreatmentResultsByPatient,
                setTreatmentResults,
            }}
        >
            {children}
        </TreatmentProgressContext.Provider>
    );
};
