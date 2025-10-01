// components/TreatmentResultModal.jsx
import { useEffect, useContext } from "react";
import { TreatmentProgressContext } from "../../contexts/TreatmentProgressContext/TreatmentProgressContext";
import { X } from "lucide-react";

import BeforeAfterImageSlider from "../Patients/BeforeAfterImageSlider";

const TreatmentResultModal = ({ isOpen, onClose, patientId }) => {
    const {
        fetchTreatmentResultsByPatient,
        treatmentResults,
        setTreatmentResults,
        isLoadingTreatmentResults,
        setisLoadingTreatmentResults
    } = useContext(TreatmentProgressContext);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-PH", { year: 'numeric', month: 'long', day: 'numeric' });
    };

    useEffect(() => {
        if (!isOpen || !patientId) {
            setTreatmentResults([]);
            return;
        }

        const fetchTreatmentResults = async () => {
            try {
                setisLoadingTreatmentResults(true);
                await fetchTreatmentResultsByPatient(patientId);
            } catch (error) {
                console.error("Error fetching treatment results:", error);
                setTreatmentResults([]);
            } finally {
                setisLoadingTreatmentResults(false);
            }
        };

        fetchTreatmentResults();
    }, [isOpen, patientId, fetchTreatmentResultsByPatient, setTreatmentResults, setisLoadingTreatmentResults]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[95vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-800">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-blue-50 px-6 py-4 dark:bg-blue-900/40">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">Treatment Results</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-blue-800/50 dark:hover:text-blue-100 transition"
                        aria-label="Close modal"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="max-h-[75vh] overflow-y-auto p-6">
                    {isLoadingTreatmentResults ? (
                        <div className="flex h-48 items-center justify-center">
                            <p className="text-lg text-blue-600 dark:text-blue-400">Loading treatment progress...</p>
                        </div>
                    ) : treatmentResults.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-lg text-gray-500 dark:text-gray-400">No treatment progress records found for this patient. 😔</p>
                        </div>
                    ) : (
                        
                        <div className="grid gap-8">
                            {treatmentResults.map((result, index) => {
                                const overallNotes = result.overallNotes?.join(" | ") || "N/A";
                                const displayDate = result.treatmentInfo?.treatment_date;
                                const cost = result.treatmentInfo?.treatment_cost;
                                const beforeUrl = result.beforeImage?.url;
                                const afterUrl = result.afterImage?.url;

                                return (
                                    <div
                                        key={result.treatmentInfo?._id || index}
                                        className="rounded-lg border border-blue-200 p-6 shadow-md transition hover:shadow-lg dark:border-blue-700 dark:bg-blue-900/20"
                                    >
                                        <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-blue-700/50">
                                            <h4 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                                                {result.resultType ? result.resultType.toUpperCase() : "TREATMENT RESULT"}
                                            </h4>
                                            <span className="text-md font-medium text-gray-600 dark:text-gray-400">
                                                Date: **{displayDate ? formatDate(displayDate) : "N/A"}**
                                            </span>
                                        </div>

                                        
                                        <div className="mb-6">
                                            {beforeUrl && afterUrl ? (
                                                <div className="space-y-4">
                                                    <h5 className="text-lg font-medium text-blue-800 dark:text-blue-200 text-center">
                                                        Progress Comparison
                                                    </h5>
                                                    
                                                    {/* Inayos ang container ng image slider */}
                                                    <div className="bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-700/50">
                                                        <BeforeAfterImageSlider 
                                                            beforeImageUrl={beforeUrl} 
                                                            afterImageUrl={afterUrl}
                                                            aspectRatio="4/3"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 bg-gray-50 rounded-lg dark:bg-gray-700/30">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">No complete Before/After images available for comparison.</p>
                                                    
                                                    {beforeUrl && <a href={beforeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-block">View Before Image</a>}
                                                    {afterUrl && <a href={afterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-block ml-2">View After Image</a>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 text-sm">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <strong className="font-semibold text-blue-900 dark:text-blue-100">Description:</strong> {result.treatmentInfo?.treatment_description || "N/A"}
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <strong className="font-semibold text-blue-900 dark:text-blue-100">Overall Notes:</strong> {overallNotes}
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <strong className="font-semibold text-blue-900 dark:text-blue-100">Cost (PHP):</strong> <span className="text-green-600 font-bold dark:text-green-400">
                                                    {cost !== undefined && cost !== null ? cost.toLocaleString("en-PH") : "N/A"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreatmentResultModal;