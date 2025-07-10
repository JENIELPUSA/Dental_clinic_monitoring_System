import React, { useEffect } from 'react';

// Helper function to format 24-hour time to 12-hour AM/PM format
const formatTime = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const ScheduleModal = ({ isOpen, onClose, doctor, selectedDate, scheduleSlots, onBookSchedule }) => {

  if (!isOpen) return null;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape); // Clean up event listener
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Allows closing the modal by clicking on the backdrop
    >
      <div
        className="relative w-11/12 max-w-lg animate-scale-in rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
      >
        {/* Close button for the modal */}
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        {/* Modal Title and Date */}
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Book Schedule for Dr. {doctor?.name}
        </h2>
        <p className="mb-6 text-center text-lg text-gray-600 dark:text-gray-300">
          Date: {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not specified"}
        </p>

        {/* Displaying available time slots */}
        {scheduleSlots && scheduleSlots.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scheduleSlots
              .sort((a, b) => a.start.localeCompare(b.start)) // Sort slots by start time for better display
              .map((slot) => (
              <div
                key={slot._id || `${slot.start}-${slot.end}`} // Use _id as key for stability, fallback for new/unsaved slots
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  slot.maxPatientsPerSlot > 0
                    ? "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900"
                    : "border-gray-300 bg-gray-100 opacity-60 dark:border-gray-600 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`text-lg font-semibold ${
                    slot.maxPatientsPerSlot > 0
                      ? "text-blue-800 dark:text-blue-200"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatTime(slot.start)} - {formatTime(slot.end)}
                  {/* Display reason if available */}
                  {slot.reason && <span className="ml-2 text-xs italic text-gray-500 dark:text-gray-400">({slot.reason})</span>}
                </span>
                {slot.maxPatientsPerSlot > 0 ? (
                  <button
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => onBookSchedule(doctor, slot, selectedDate)}
                  >
                    Book Now ({slot.maxPatientsPerSlot} left)
                  </button>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Fully Booked
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-300">
            No available time slots for this doctor on this date.
          </p>
        )}

        {/* Footer with a close button */}
        <div className="mt-6 text-center">
          <button
            className="rounded-md bg-gray-300 px-6 py-2 text-gray-800 transition duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;