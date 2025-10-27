import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DentalHistoryContext } from "../../contexts/DentalHistoryContext/DentalHistoryContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";

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
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-md p-4 pt-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl dark:border dark:border-blue-800/50 dark:bg-blue-900/20"
          >
            <h2 className="mb-4 text-center text-lg font-bold text-blue-800 dark:text-blue-200 sm:text-xl">
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
                    className="block text-xs font-medium text-blue-800 dark:text-blue-200"
                  >
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      rows="2"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white min-h-[44px]"
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
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white disabled:cursor-not-allowed h-11"
                    />
                  )}
                </div>
              ))}

              {/* ✅ ACTION BUTTONS: Cancel + Submit */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm font-medium text-blue-800 hover:bg-gray-100 disabled:opacity-70 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/30 h-11 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-blue-700 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500 h-11 sm:w-auto"
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