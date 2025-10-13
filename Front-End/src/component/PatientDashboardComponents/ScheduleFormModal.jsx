import React, { useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthContext } from "../../contexts/AuthContext";
import { AppointmentDisplayContext } from '../../contexts/AppointmentContext/appointmentContext';
import { TreatmentDisplayContext } from '../../contexts/TreatmentContext/TreatmentContext';
import LoadingOverlay from '../../component/ReusableComponents/LoadingOverlay'; // Import the LoadingOverlay component
import { SchedDisplayContext } from '../../contexts/Schedule/ScheduleContext';
function ScheduleFormModal({
  isOpen,
  onClose,
  selectedDoctorNameForForm,
  selectedDoctorTimeStartForForm,
  selectedDoctorTimeEndForForm,
  selectedDoctorIdForForm,
  selectedTimeSlotIdForForm,
  selectedDateForForm,
  patientId,
}) {
  const {fetchSchedData}=useContext(SchedDisplayContext)
  const { linkId } = useContext(AuthContext);
  const { AddBooking } = useContext(AppointmentDisplayContext);
  const { Treatment } = useContext(TreatmentDisplayContext);

  const [loading, setLoading] = useState(false); // State to track loading status

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading overlay

    const formData = {
      doctor_id: selectedDoctorIdForForm,
      patient_id: linkId,
      appointment_date: selectedDateForForm,
      slot_id: selectedTimeSlotIdForForm,
      appointment_status: 'Pending',
    };

    try {
      await AddBooking(formData);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false); // Hide loading overlay after submission
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {loading && <LoadingOverlay />} {/* Show LoadingOverlay while loading */}

          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              className="relative mx-4 w-full max-w-md rounded-xl border border-blue-400 bg-white/20 p-6 shadow-lg backdrop-blur-md dark:border-blue-700 dark:bg-white/10"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <button
                onClick={onClose}
                type="button"
                className="absolute right-3 top-3 text-2xl font-bold text-white hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                &times;
              </button>

              <h3 className="mb-4 text-xl font-semibold text-white dark:text-blue-200">
                Book Appointment
              </h3>

              <div className="space-y-3">
                <p className="flex items-center text-white dark:text-gray-200">
                  <strong className="mr-2">Doctor:</strong>
                  <span className="font-mono">{selectedDoctorNameForForm}</span>
                </p>
                <p className="flex items-center text-white dark:text-gray-200">
                  <strong className="mr-2">Time:</strong>
                  <span className="font-mono">
                    {selectedDoctorTimeStartForForm} - {selectedDoctorTimeEndForForm}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-6 py-2 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ScheduleFormModal;
