import React, { useState, useContext, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export default function ReasonInputModal({ isOpen, onClose, onSaveReason, currentReason }) {
    const [reason, setReason] = useState(currentReason || "");

    useEffect(() => {
        setReason(currentReason || "");
    }, [currentReason]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSaveReason(reason);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-[60]"
        >
            <motion.div
                initial={{ y: "-50vh" }}
                animate={{ y: "0" }}
                exit={{ y: "50vh" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="w-full max-w-sm mx-auto p-6 rounded-lg shadow-xl bg-white dark:bg-gray-800 relative"
            >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Enter Reason for Schedule Change
                </h3>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-4"
                    rows="4"
                    placeholder="E.g., Doctor will be attending a conference, Special clinic hours, etc."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Save Reason
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};