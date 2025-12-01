import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrescriptionDisplayContext } from "../../contexts/PrescriptionContext/PrescriptionContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";

// Static suggestion lists
const MEDICATION_SUGGESTIONS = [
  "Amoxicillin", "Paracetamol", "Ibuprofen", "Cetirizine", "Metformin",
  "Lisinopril", "Atorvastatin", "Omeprazole", "Azithromycin", "Diazepam",
  "Albuterol", "Levothyroxine", "Prednisone", "Insulin", "Aspirin",
  "Simvastatin", "Gabapentin", "Sertraline", "Tramadol", "Clopidogrel"
];

const DOSAGE_SUGGESTIONS = [
  "250mg", "500mg", "1g", "10mg", "20mg", "40mg", "5mg", "100mg", "200mg",
  "1 tablet", "2 tablets", "5mL", "10mL", "1 puff", "2 puffs", "0.5mg", "50mg"
];

const FREQUENCY_SUGGESTIONS = [
  "Once daily", "Twice daily", "3x daily", "4x daily", "Every 6 hours",
  "Every 8 hours", "Every 12 hours", "As needed", "Before meals", "At bedtime",
  "With food", "On empty stomach", "Every 4 hours", "Once weekly"
];

const PrescriptionForm = ({ isOpen, onClose, selectedPrescription }) => {
  const { AddPrescription, UpdatePrescription } = useContext(PrescriptionDisplayContext);
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(0);
  const [appointmentId, setAppointmentId] = useState("");
  const [medications, setMedications] = useState([
    { medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }
  ]);
  const [postCare, setPostCare] = useState({
    instructions: "",
    medication: "",
    nextVisit: "",
  });

  const [dropdownField, setDropdownField] = useState(null); // e.g., "med-0-medication_name"

  // 🔧 Handle outside click using mousedown + data attributes
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownField) return;

      const clickedInput = event.target.closest('input[data-field]');
      const clickedDropdown = event.target.closest('[data-dropdown]');

      if (
        (clickedInput && clickedInput.getAttribute('data-field') === dropdownField) ||
        clickedDropdown
      ) {
        return;
      }

      setDropdownField(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownField]);

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

      const pc = selectedPrescription.postCare || {};
      setPostCare({
        instructions: pc.instructions || "",
        medication: pc.medication || "",
        nextVisit: pc.nextVisit
          ? new Date(pc.nextVisit).toISOString().split("T")[0]
          : "",
      });
      setStep(0);
    } else {
      setAppointmentId("");
      setMedications([{ medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }]);
      setPostCare({ instructions: "", medication: "", nextVisit: "" });
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
      postCare: {
        instructions: postCare.instructions.trim() || "",
        medication: postCare.medication.trim() || "",
        nextVisit: postCare.nextVisit ? new Date(postCare.nextVisit) : null,
      },
    };

    try {
      if (selectedPrescription) {
        await UpdatePrescription(selectedPrescription._id, prescriptionData);
      } else {
        await AddPrescription(prescriptionData);
      }

      setAppointmentId("");
      setMedications([{ medication_name: "", dosage: "", frequency: "", start_date: "", end_date: "" }]);
      setPostCare({ instructions: "", medication: "", nextVisit: "" });
      setStep(0);
      setTimeout(() => onClose(), 800);
    } catch (error) {
      console.error("Prescription submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = medications.length + 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const getStepLabel = () => {
    if (step === 0) return "Appointment Details";
    if (step > 0 && step <= medications.length) return `Medication ${step}`;
    if (step === medications.length + 1) return "Post-Care Instructions";
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

  const renderFieldWithDropdown = (index, fieldKey, label, placeholder, suggestions) => {
    const med = medications[index];
    const value = med[fieldKey];
    const fieldId = `med-${index}-${fieldKey}`;
    const isOpen = dropdownField === fieldId;
    const filtered = value
      ? suggestions.filter(item => item.toLowerCase().includes(value.toLowerCase()))
      : suggestions;

    return (
      <div className="relative">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          data-field={fieldId}
          onFocus={() => setDropdownField(fieldId)}
          onChange={(e) => handleMedicationChange(index, fieldKey, e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700 h-11"
        />
        {isOpen && filtered.length > 0 && (
          <div 
            className="absolute z-10 w-full mt-1"
            data-dropdown // ✅ Added for outside click detection
          >
            <ul className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filtered.map((item, i) => (
                <li
                  key={i}
                  data-suggestion
                  onClick={() => {
                    handleMedicationChange(index, fieldKey, item);
                    setDropdownField(null);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Appointment ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              disabled={!!selectedPrescription}
              placeholder="Enter appointment ID"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white h-11"
            />
          </div>
        </motion.div>
      );
    }

    if (step > 0 && step <= medications.length) {
      const index = step - 1;
      const med = medications[index];
      return (
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Medication {step} of {medications.length}
            </h4>
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Remove
              </button>
            )}
          </div>

          {/* Medication Name with Dropdown */}
          {renderFieldWithDropdown(
            index,
            "medication_name",
            "Medication Name",
            "e.g., Amoxicillin",
            MEDICATION_SUGGESTIONS
          )}

          {/* Dosage & Frequency */}
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            <div>
              {renderFieldWithDropdown(
                index,
                "dosage",
                "Dosage",
                "e.g., 500mg",
                DOSAGE_SUGGESTIONS
              )}
            </div>
            <div>
              {renderFieldWithDropdown(
                index,
                "frequency",
                "Frequency",
                "e.g., 3x daily",
                FREQUENCY_SUGGESTIONS
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={med.start_date}
                onChange={(e) => handleMedicationChange(index, "start_date", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700 h-11"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={med.end_date}
                onChange={(e) => handleMedicationChange(index, "end_date", e.target.value)}
                min={med.start_date}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700 h-11"
              />
            </div>
          </div>
        </motion.div>
      );
    }

    if (step === medications.length + 1) {
      return (
        <motion.div
          key="post-care"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Post-Care Instructions
          </h4>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Care Instructions
            </label>
            <textarea
              value={postCare.instructions}
              onChange={(e) => setPostCare({ ...postCare, instructions: e.target.value })}
              placeholder="e.g., Rest for 24 hours, avoid heavy lifting..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Medication (if any)
            </label>
            <input
              type="text"
              value={postCare.medication}
              onChange={(e) => setPostCare({ ...postCare, medication: e.target.value })}
              placeholder="e.g., Paracetamol as needed"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700 h-11"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Next Visit Date
            </label>
            <input
              type="date"
              value={postCare.nextVisit}
              onChange={(e) => setPostCare({ ...postCare, nextVisit: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-700 h-11"
            />
          </div>
        </motion.div>
      );
    }

    if (step === medications.length + 2) {
      return (
        <motion.div
          key="review"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Review Prescription
          </h4>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Appointment ID</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{appointmentId}</p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Medications ({medications.length})
            </p>
            {medications.map((m, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-1"
              >
                <div className="flex items-start justify-between">
                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {i + 1}. {m.medication_name}
                  </h5>
                </div>
                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <div><span className="font-medium">Dosage:</span> {m.dosage}</div>
                  <div><span className="font-medium">Frequency:</span> {m.frequency}</div>
                  <div><span className="font-medium">Start:</span> {m.start_date}</div>
                  <div><span className="font-medium">End:</span> {m.end_date || "N/A"}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Post-Care Instructions</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
              {postCare.instructions || "None provided"}
              {postCare.medication && (
                <div className="mt-2">
                  <span className="font-medium">Additional Meds:</span> {postCare.medication}
                </div>
              )}
              {postCare.nextVisit && (
                <div className="mt-1">
                  <span className="font-medium">Next Visit:</span> {postCare.nextVisit}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 p-4 pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-900"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white sm:text-xl">
                  {selectedPrescription ? "Edit Prescription" : "New Prescription"}
                </h3>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                  <span>{getStepLabel()}</span>
                  <span className="font-medium">Step {step + 1} of {totalSteps}</span>
                </div>
                <div className="w-full bg-blue-800 bg-opacity-40 rounded-full h-1.5 overflow-hidden">
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
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="min-h-[280px]">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 h-11 sm:w-auto"
                >
                  Back
                </button>

                <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto sm:gap-3">
                  {step === medications.length && (
                    <button
                      type="button"
                      onClick={addMedication}
                      className="w-full rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-green-700 h-11 sm:w-auto"
                    >
                      + Add Another Medication
                    </button>
                  )}

                  {step < medications.length + 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 h-11 sm:w-auto"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 h-11 sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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