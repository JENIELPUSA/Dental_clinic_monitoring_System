import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrescriptionDisplayContext } from "../../contexts/PrescriptionContext/PrescriptionContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";

const PrescriptionForm = ({ isOpen, onClose, selectedPrescription }) => {
  const { AddPrescription, UpdatePrescription } = useContext(PrescriptionDisplayContext);
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(0);
  const [appointmentId, setAppointmentId] = useState("");
  const [medications, setMedications] = useState([
    { medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }
  ]);

  useEffect(() => {
    if (selectedPrescription) {
      setAppointmentId(selectedPrescription.appointment_id || "");
      setMedications(
        selectedPrescription.medications?.length > 0
          ? selectedPrescription.medications.map((med) => ({
              medication_name: med.medication_name || "",
              dosage: med.dosage || "",
              frequency: med.frequency || "",
              start_date: med.start_date ? new Date(med.start_date).toISOString().split("T")[0] : "",
              end_date: med.end_date ? new Date(med.end_date).toISOString().split("T")[0] : ""
            }))
          : [{ medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }]
      );
      setStep(0); // Always start at step 0 when editing
    } else {
      // Reset to initial state for new prescription
      setAppointmentId("");
      setMedications([{ medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }]);
      setStep(0);
    }
  }, [selectedPrescription]);

  const handleMedicationChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }
    ]);
    setStep(medications.length);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const updated = medications.filter((_, i) => i !== index);
      setMedications(updated);
      if (step >= updated.length) {
        setStep(updated.length - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const prescriptionData = {
      appointment_id: appointmentId,
      medications: medications.map((m) => ({
        ...m,
        start_date: m.start_date ? new Date(m.start_date) : null,
        end_date: m.end_date ? new Date(m.end_date) : null,
      })),
    };

    try {
      if (selectedPrescription) {
        await UpdatePrescription(selectedPrescription._id, prescriptionData);
      } else {
        await AddPrescription(prescriptionData);
      }

      // ✅ CLEAR FORM AFTER SUCCESSFUL SUBMISSION
      setAppointmentId("");
      setMedications([{ medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }]);
      setStep(0);

      setTimeout(() => onClose(), 800);
    } catch (error) {
      console.error("Prescription submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = medications.length + 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const getStepLabel = () => {
    if (step === 0) return "Appointment Details";
    if (step > 0 && step <= medications.length) return `Medication ${step}`;
    return "Review & Submit";
  };

  const canProceed = () => {
    if (step === 0) return appointmentId.trim() !== "";
    if (step > 0 && step <= medications.length) {
      const med = medications[step - 1];
      return med.medication_name && med.dosage && med.frequency && med.start_date;
    }
    return true;
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <motion.div
          key="step-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appointment ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              disabled={!!selectedPrescription}
              placeholder="Enter appointment ID"
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </motion.div>
      );
    }

    if (step > 0 && step <= medications.length) {
      const med = medications[step - 1];
      const index = step - 1;
      return (
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Medication {step} of {medications.length}
            </h4>
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medication Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Amoxicillin"
              value={med.medication_name}
              onChange={(e) => handleMedicationChange(index, "medication_name", e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dosage <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 500mg"
                value={med.dosage}
                onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequency <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 3x daily"
                value={med.frequency}
                onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={med.start_date}
                onChange={(e) => handleMedicationChange(index, "start_date", e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={med.end_date}
                onChange={(e) => handleMedicationChange(index, "end_date", e.target.value)}
                min={med.start_date}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700 transition-all"
              />
            </div>
          </div>
        </motion.div>
      );
    }

    if (step === medications.length + 1) {
      return (
        <motion.div
          key="review"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Review Prescription
          </h4>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Appointment ID</p>
            <p className="font-medium text-gray-900 dark:text-white">{appointmentId}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Medications ({medications.length})
            </p>
            {medications.map((m, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    {i + 1}. {m.medication_name}
                  </h5>
                  <button
                    type="button"
                    onClick={() => setStep(i + 1)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Dosage:</span> {m.dosage}
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span> {m.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Start:</span> {m.start_date}
                  </div>
                  <div>
                    <span className="font-medium">End:</span> {m.end_date || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-white">
                  {selectedPrescription ? "Edit Prescription" : "New Prescription"}
                </h3>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{getStepLabel()}</span>
                  <span className="font-medium">Step {step + 1} of {totalSteps}</span>
                </div>
                <div className="w-full bg-blue-800 bg-opacity-40 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-white h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Back
                </button>

                <div className="flex gap-3">
                  {step === medications.length && (
                    <button
                      type="button"
                      onClick={addMedication}
                      className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
                    >
                      + Add Another Medication
                    </button>
                  )}

                  {step < medications.length + 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Prescription
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>

            {isLoading && <LoadingOverlay message="Saving prescription..." />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PrescriptionForm;