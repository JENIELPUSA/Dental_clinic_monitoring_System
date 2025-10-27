import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

const TrackingContext = createContext();

export const TrackingDisplayContext = TrackingContext;
export const useTrack = () => useContext(TrackingContext);

export const TrackingProcessProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const [inventory, setTracking] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotalPages, setTotalPages] = useState();
    const [TotalInventory, setTotalInventory] = useState();

    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

      useEffect(() => {
            if (!authToken) {
                setTracking([]);
                setLoading(false);
                return;
            }
    
            fetchTrackingData();
        }, [authToken]);
    
        useEffect(() => {
            if (customError) {
                const timer = setTimeout(() => {
                    setCustomError(null);
                }, 5000);
    
                return () => clearTimeout(timer);
            }
        }, [customError]);

    const fetchTrackingData = useCallback(
        async (queryParams = {}) => {
            try {
                if (!authToken) return;
                setLoading(true);

                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TrackProcess`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    params: queryParams,
                });


            

                const data = res.data;

                console.log("data",data)

                setTracking(data.data || []);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(data.currentPage || 1);
                setTotalInventory(data.totalInventory || 0);
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching inventory");
            } finally {
                setLoading(false);
            }
        },
        [authToken],
    );
    return (
        <TrackingContext.Provider
            value={{
                inventory,
                loading,
                error,
                fetchTrackingData,
                TotalInventory,
                isTotalPages,
                currentPage,
                setCurrentPage,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </TrackingContext.Provider>
    );
};
