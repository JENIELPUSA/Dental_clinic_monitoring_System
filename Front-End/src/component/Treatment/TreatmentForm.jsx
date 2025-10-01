import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import ProgressImageUploader from "./ProgressImageUploader";

const initialProgressState = {
  description: "",
  stage: "Initial",
  beforeFile: null, // File Object
  afterFile: null,  // File Object
  beforeFileName: "", // For display
  afterFileName: "", // For display
  resultType: "general", 
  overallNotes: "",
};

// BAGONG FUNCTION: Para i-convert ang File object sa Base64 string
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // Siguraduhin na ang Base64 string lang ang i-reread (data URL)
        reader.onload = () => resolve(reader.result); 
        reader.onerror = (error) => reject(error);
    });
};


function TreatmentForm({ isOpen, onClose, selectedTreatment }) {
  const isEditMode = Boolean(selectedTreatment);

  const [formData, setFormData] = useState({
    appointmentId: "",
    treatmentDate: "",
    description: "",
    cost: "",
  });

  const [progressData, setProgressData] = useState(initialProgressState);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

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
      setProgressData(initialProgressState); 
    } else {
      setFormData({
        appointmentId: "",
        treatmentDate: "",
        description: "",
        cost: "",
      });
      setProgressData(initialProgressState);
    }
  }, [selectedTreatment]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploaderClose = () => {
    setIsUploaderOpen(false);
  };

  const handleProgressSave = (data) => {
    // Tumatanggap ng files at data mula sa modal
    setProgressData({
        ...data,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.appointmentId) {
    alert("Appointment ID is required.");
    return;
  }

  setIsLoading(true);

  try {
    let base64BeforeImage = null;
    let base64AfterImage = null;

    // Convert sa base64 kung may file
    if (!isEditMode && (progressData.beforeFile || progressData.afterFile)) {
      const [beforeBase64, afterBase64] = await Promise.all([
        fileToBase64(progressData.beforeFile),
        fileToBase64(progressData.afterFile),
      ]);

      base64BeforeImage = beforeBase64;
      base64AfterImage = afterBase64;
    }

    const basePayload = {
      appointment_id: formData.appointmentId,
      treatment_description: formData.description,
      treatment_date: formData.treatmentDate,
      treatment_cost: parseFloat(formData.cost) || 0,
    };

    let fullPayload = basePayload;

    if (!isEditMode) {
      fullPayload = {
        ...basePayload,
        resultType: progressData.resultType || "general",
        overallNotes: progressData.overallNotes || "",
        progress: [
          {
            description: progressData.description,
            stage: progressData.stage,
            beforeImageBase64: base64BeforeImage,
            afterImageBase64: base64AfterImage,
          },
        ],
      };
    }

    // Call context
    if (isEditMode) {
      await UpdateTreatment(selectedTreatment._id, basePayload);
    } else {
      await AddTreatment(fullPayload);
    }

    onClose();
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong during image processing or saving. Check console for details.");
  } finally {
    setIsLoading(false);
  }
};


return (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="treatment-form-modal"
        className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          // 👇 Responsive width: mas lapad sa landscape
          className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-lg bg-white p-4 sm:p-6 shadow-xl dark:bg-gray-900"
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-2xl font-bold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            &times;
          </button>
          <h2 className="mb-5 text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
            {isEditMode ? "Update Treatment" : "Add New Treatment"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Appointment ID */}
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Appointment ID
              </label>
              <input
                type="text"
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleFormChange}
                readOnly={isEditMode}
                className={`w-full rounded-lg border px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
                  isEditMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "border-gray-300"
                }`}
              />
            </div>

            {/* Treatment Date & Cost Side-by-Side on Landscape */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Treatment Date
                </label>
                <input
                  type="date"
                  name="treatmentDate"
                  value={formData.treatmentDate}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost (₱)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Description - Full Width */}
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Treatment Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="2" // ↓ mas maikli sa landscape
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
              ></textarea>
            </div>

            {/* Image Upload Section (Add Mode Only) */}
            {!isEditMode && (
              <div className="border-t pt-3 dark:border-gray-700">
                <h3 className="mb-2 text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
                  Treatment Result & Progress
                </h3>

                <div className="mt-2 mb-3 p-2 sm:p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Result Type: <span className="font-bold text-blue-600">{progressData.resultType}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {progressData.overallNotes
                      ? `Notes: ${progressData.overallNotes.substring(0, 40)}...`
                      : "No notes added."}
                  </p>
                  {(progressData.beforeFile || progressData.afterFile) ? (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Images: {progressData.beforeFileName}, {progressData.afterFileName} • Stage:{" "}
                      <span className="text-green-600 font-semibold">{progressData.stage}</span>
                    </p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">No images selected.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsUploaderOpen(true)}
                  className="w-full rounded-lg bg-green-600 px-3 py-2 sm:px-4 sm:py-2.5 font-bold text-white shadow-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 text-xs sm:text-sm"
                >
                  📝 Edit Result/Progress Images
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 sm:py-3 font-bold text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {isLoading ? "Processing..." : isEditMode ? "Update Treatment" : "Add Treatment"}
            </button>
          </form>

          {isLoading && <LoadingOverlay message="Processing Images & Saving..." />}
        </motion.div>
      </motion.div>
    )}

    <ProgressImageUploader
      isOpen={isUploaderOpen}
      onClose={handleUploaderClose}
      onSave={handleProgressSave}
      initialData={progressData}
    />
  </AnimatePresence>
);
}

export default TreatmentForm;