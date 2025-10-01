import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGE_OPTIONS = [
  "Initial",
  "Mid-treatment",
  "Adjustment 1",
  "Adjustment 2",
  "Final",
  "Post-treatment"
];

const RESULT_OPTIONS = [
  { value: "general", label: "General" },
  { value: "braces", label: "Braces" },
  { value: "whitening", label: "Whitening" },
  { value: "implant", label: "Implant" },
  { value: "filling", label: "Filling" },
];

function ProgressImageUploader({ isOpen, onClose, onSave, initialData }) {
  const [progressForm, setProgressForm] = useState({
    description: initialData.description || "",
    stage: initialData.stage || STAGE_OPTIONS[0],
    beforeFile: initialData.beforeFile || null,
    afterFile: initialData.afterFile || null,
    resultType: initialData.resultType || "general",
    overallNotes: initialData.overallNotes || "",
    beforeFileName: initialData.beforeFileName || "",
    afterFileName: initialData.afterFileName || "",
  });

  useEffect(() => {
    if (isOpen) {
      setProgressForm({
        description: initialData.description || "",
        stage: initialData.stage || STAGE_OPTIONS[0],
        beforeFile: initialData.beforeFile || null,
        afterFile: initialData.afterFile || null,
        resultType: initialData.resultType || "general",
        overallNotes: initialData.overallNotes || "",
        beforeFileName: initialData.beforeFileName || "",
        afterFileName: initialData.afterFileName || "",
      });
    }
  }, [isOpen, initialData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProgressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setProgressForm((prev) => ({
        ...prev,
        [`${type}File`]: file,
        [`${type}FileName`]: file.name,
      }));
    }
  };

  const handleSave = () => {
    if (!progressForm.resultType) {
      alert("Kailangan ng Result Type.");
      return;
    }

    if (
      (progressForm.beforeFile || progressForm.afterFile) &&
      (!progressForm.description || !progressForm.stage)
    ) {
      alert("Kung may imahe, kailangan din ang Progress Description at Stage.");
      return;
    }

    onSave({
      resultType: progressForm.resultType,
      overallNotes: progressForm.overallNotes,
      description: progressForm.description,
      stage: progressForm.stage,
      beforeFile: progressForm.beforeFile,
      afterFile: progressForm.afterFile,
      beforeFileName: progressForm.beforeFileName,
      afterFileName: progressForm.afterFileName,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-70 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            // 👇 Responsive width: mas lapad sa landscape/tablet
            className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-lg bg-white p-4 sm:p-6 shadow-2xl dark:bg-gray-900"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-2xl font-bold text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 sm:right-4 sm:top-4 sm:text-3xl"
            >
              &times;
            </button>
            <h2 className="mb-4 text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              📸 Treatment Result & Progress
            </h2>

            <div className="space-y-4">
              {/* Result Type */}
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Result Type
                </label>
                <select
                  name="resultType"
                  value={progressForm.resultType}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                >
                  {RESULT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Notes */}
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Notes (Treatment Result)
                </label>
                <textarea
                  name="overallNotes"
                  value={progressForm.overallNotes}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                ></textarea>
              </div>

              <hr className="dark:border-gray-700" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white pt-2">
                Current Progress Details (Optional Images)
              </h3>

              {/* Stage */}
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stage
                </label>
                <select
                  name="stage"
                  value={progressForm.stage}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                >
                  {STAGE_OPTIONS.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description (Progress Note)
                </label>
                <textarea
                  name="description"
                  value={progressForm.description}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                ></textarea>
              </div>

              {/* Image Upload - Responsive Grid */}
              <div className="border-t pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Before */}
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Before Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "before")}
                      className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-gray-700 dark:file:text-white dark:text-gray-400"
                    />
                    {progressForm.beforeFileName && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400 truncate">
                        Selected: {progressForm.beforeFileName}
                      </p>
                    )}
                  </div>

                  {/* After */}
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      After Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "after")}
                      className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-gray-700 dark:file:text-white dark:text-gray-400"
                    />
                    {progressForm.afterFileName && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400 truncate">
                        Selected: {progressForm.afterFileName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 sm:py-3 font-bold text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm sm:text-base"
              >
                Confirm Result & Progress Data
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProgressImageUploader;