import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DentalHistoryContext } from "../../contexts/DentalHistoryContext/DentalHistoryContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay"; // adjust the path if needed

const DentalHistoryFormModal = ({ isOpen, onClose, initialData = {} }) => {
    const { AddDentalHistory, UpdateDentalHistory } = useContext(DentalHistoryContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: "",
        previous_conditions: "",
        surgeries: "",
        allergies: "",
        family_dental_history: "",
        last_checkup_date: "",
        status: "",
    });

    useEffect(() => {
        if (isOpen) {
            const {
                patient_id = "",
                previous_conditions = "",
                surgeries = "",
                allergies = "",
                family_dental_history = "",
                last_checkup_date = "",
                status = "",
            } = initialData || {};

            const formattedDate = last_checkup_date ? new Date(last_checkup_date).toISOString().split("T")[0] : "";

            setFormData({
                patient_id,
                previous_conditions,
                surgeries,
                allergies,
                family_dental_history,
                last_checkup_date: formattedDate,
                status,
            });
        } else {
            setFormData({
                patient_id: "",
                previous_conditions: "",
                surgeries: "",
                allergies: "",
                family_dental_history: "",
                last_checkup_date: "",
                status: "",
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (initialData && initialData._id) {
                await UpdateDentalHistory(initialData._id, formData);
                console.log("Update Data", formData);
            } else {
                await AddDentalHistory(formData);
            }
            onClose();
        } catch (err) {
            console.error("Failed to submit dental history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative mx-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:border dark:border-blue-800/50 dark:bg-blue-900/20"
                    >
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute right-4 top-4 text-2xl font-bold text-gray-500 hover:text-red-500 dark:text-blue-300 dark:hover:text-red-300 disabled:cursor-not-allowed"
                            title="Close"
                        >
                            ×
                        </button>

                        <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-800 dark:text-blue-200">
                            {initialData?._id ? "Edit Dental History" : "Add New Dental History"}
                        </h2>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {[
                                { label: "Patient ID", name: "patient_id", type: "text", required: true, readOnly: !!initialData?._id },
                                { label: "Previous Conditions", name: "previous_conditions", type: "textarea" },
                                { label: "Surgeries", name: "surgeries", type: "text" },
                                { label: "Allergies", name: "allergies", type: "text" },
                                { label: "Family Dental History", name: "family_dental_history", type: "textarea" },
                                { label: "Last Checkup Date", name: "last_checkup_date", type: "date" },
                            ].map((field) => (
                                <div className="space-y-1" key={field.name}>
                                    <label
                                        htmlFor={field.name}
                                        className="block text-sm font-medium text-blue-800 dark:text-blue-200"
                                    >
                                        {field.label}
                                    </label>
                                    {field.type === "textarea" ? (
                                        <textarea
                                            id={field.name}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                        />
                                    ) : (
                                        <input
                                            id={field.name}
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            required={field.required}
                                            readOnly={field.readOnly}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white disabled:cursor-not-allowed"
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="mt-6 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-lg bg-blue-700 px-6 py-2 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? initialData?._id
                                            ? "Updating..."
                                            : "Submitting..."
                                        : initialData?._id
                                        ? "Update"
                                        : "Submit"}
                                </button>
                            </div>
                        </form>

                        {isLoading && <LoadingOverlay message="Submitting dental history..." />}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DentalHistoryFormModal;
