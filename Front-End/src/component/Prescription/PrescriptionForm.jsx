import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrescriptionDisplayContext } from "../../contexts/PrescriptionContext/PrescriptionContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay"; // ✅ Adjust if the path is different

const PrescriptionForm = ({ isOpen, onClose, selectedPrescription }) => {
  const { AddPrescription, UpdatePrescription } = useContext(PrescriptionDisplayContext);
  const [isLoading, setIsLoading] = useState(false); // ✅ loading state

  const title = selectedPrescription ? "Edit Prescription" : "Add Prescription";
  const buttonText = selectedPrescription ? "Update" : "Add";

  const [appointmentId, setAppointmentId] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (selectedPrescription) {
      setAppointmentId(selectedPrescription.appointment_id || "");
      setMedicationName(selectedPrescription.medication_name || "");
      setDosage(selectedPrescription.dosage || "");
      setFrequency(selectedPrescription.frequency || "");
      setStartDate(selectedPrescription.start_date ? new Date(selectedPrescription.start_date).toISOString().split("T")[0] : "");
      setEndDate(selectedPrescription.end_date ? new Date(selectedPrescription.end_date).toISOString().split("T")[0] : "");
    } else {
      setAppointmentId("");
      setMedicationName("");
      setDosage("");
      setFrequency("");
      setStartDate("");
      setEndDate("");
    }
  }, [selectedPrescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // ✅ start loading

    const prescriptionData = {
      appointment_id: appointmentId,
      medication_name: medicationName,
      dosage,
      frequency,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null,
    };

    try {
      if (selectedPrescription) {
        await UpdatePrescription(selectedPrescription._id, prescriptionData);
      } else {
        await AddPrescription(prescriptionData);
      }

      setTimeout(() => {
        onClose();
      }, 800); // ✅ slight delay for smooth UX
    } catch (error) {
      console.error("Prescription submit error:", error);
    } finally {
      setIsLoading(false); // ✅ stop loading
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="appointment_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Appointment ID
                </label>
                <input
                  type="text"
                  id="appointment_id"
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  required
                  disabled={!!selectedPrescription}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medication Name
                </label>
                <input
                  type="text"
                  id="medication_name"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dosage
                </label>
                <input
                  type="text"
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Frequency
                </label>
                <input
                  type="text"
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : buttonText}
                </button>
              </div>
            </form>

            {/* ✅ Show Loading Overlay while saving */}
            {isLoading && <LoadingOverlay message="Saving prescription..." />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PrescriptionForm;
