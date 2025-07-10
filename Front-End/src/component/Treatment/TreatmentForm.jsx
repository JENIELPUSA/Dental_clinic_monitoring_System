import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay"; // Adjust path if needed

function TreatmentForm({ isOpen, onClose, selectedTreatment }) {
  const isEditMode = Boolean(selectedTreatment);

  const [formData, setFormData] = useState({
    appointmentId: "",
    treatmentDate: "",
    description: "",
    cost: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const { AddTreatment, UpdateTreatment } = useContext(TreatmentDisplayContext);

  useEffect(() => {
    if (selectedTreatment) {
      setFormData({
        appointmentId: selectedTreatment.appointment_id || "",
        treatmentDate: selectedTreatment.treatment_date?.substring(0, 10) || "",
        description: selectedTreatment.treatment_description || "",
        cost: selectedTreatment.treatment_cost || "",
      });
    } else {
      setFormData({
        appointmentId: "",
        treatmentDate: "",
        description: "",
        cost: "",
      });
    }
  }, [selectedTreatment]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appointmentId) {
      alert("Appointment ID is required.");
      return;
    }

    const payload = {
      appointment_id: formData.appointmentId,
      treatment_description: formData.description,
      treatment_date: formData.treatmentDate,
      treatment_cost: parseFloat(formData.cost),
    };

    try {
      setIsLoading(true);
      if (isEditMode) {
        await UpdateTreatment(selectedTreatment._id, payload);
      } else {
        await AddTreatment(payload);
      }

      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-2xl font-bold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              &times;
            </button>
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
              {isEditMode ? "Update Treatment" : "Add New Treatment"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Appointment ID
                </label>
                <input
                  type="text"
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleFormChange}
                  readOnly={isEditMode}
                  className={`w-full rounded-lg border px-4 py-2 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
                    isEditMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Treatment Date
                </label>
                <input
                  type="date"
                  name="treatmentDate"
                  value={formData.treatmentDate}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                ></textarea>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost (₱)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                {isEditMode ? "Update" : "Add Treatment"}
              </button>
            </form>

            {/* ✅ Show overlay loading while submitting */}
            {isLoading && <LoadingOverlay message="Naglo-load, pakihintay..." />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TreatmentForm;
