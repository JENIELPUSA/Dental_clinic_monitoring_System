import React, { useState, useContext, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SchedDisplayContext } from "../../contexts/Schedule/ScheduleContext";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const formatLocalIsoDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayName = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getDay()];
};

export default function Schedule({ isOpen, onClose, selectedDoctorId, doctorName, selectedScheduleId, selectedDateForBooking }) {
  const { AddSchedDoctor, UpdateSchedDoctor } = useContext(SchedDisplayContext);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Select Date" },
    { title: "Add Time Slots" },
    { title: "Review & Save" },
  ];

  const [specificSchedules, setSpecificSchedules] = useState([]);
  const [currentSlotDetails, setCurrentSlotDetails] = useState({
    start: "",
    end: "",
    maxPatientsPerSlot: "",
  });
  const [selectedDateForSlots, setSelectedDateForSlots] = useState(""); 
  const [previewSlot, setPreviewSlot] = useState(null); 

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [tempReason, setTempReason] = useState("");
  const [editingExistingSlot, setEditingExistingSlot] = useState(null);

  useEffect(() => {
    const parsedMaxPatientsPerSlot = parseInt(currentSlotDetails.maxPatientsPerSlot);
    if (currentSlotDetails.start && currentSlotDetails.end && parsedMaxPatientsPerSlot > 0 && selectedDateForSlots) {
      setPreviewSlot({
        start: currentSlotDetails.start,
        end: currentSlotDetails.end,
        maxPatientsPerSlot: parsedMaxPatientsPerSlot,
        date: formatLocalIsoDate(selectedDateForSlots),
        day: getDayName(selectedDateForSlots),
        reason: tempReason,
      });
    } else {
      setPreviewSlot(null);
    }
  }, [currentSlotDetails, selectedDateForSlots, tempReason]);

  useEffect(() => {
    if (selectedScheduleId) {
      const dateObject = new Date(selectedScheduleId.date);
      const formattedDate = formatLocalIsoDate(dateObject);
      setSelectedDateForSlots(formattedDate);
      setSpecificSchedules([
        {
          date: formattedDate,
          day: selectedScheduleId.day,
          timeSlots: selectedScheduleId.timeSlots?.length > 0
            ? selectedScheduleId.timeSlots.map(slot => ({
                start: slot.start,
                end: slot.end,
                maxPatientsPerSlot: slot.maxPatientsPerSlot,
                reason: slot.reason || "",
                _id: slot._id 
              }))
            : [],
        },
      ]);
      setCurrentStep(1);
      setCurrentSlotDetails({ start: "", end: "", maxPatientsPerSlot: "" });
      setTempReason("");
      setEditingExistingSlot(null);
    } else if (selectedDateForBooking) {
      const formattedDate = formatLocalIsoDate(selectedDateForBooking);
      setSelectedDateForSlots(formattedDate);
      setSpecificSchedules([{ date: formattedDate, day: getDayName(selectedDateForBooking), timeSlots: [] }]);
      setCurrentStep(1);
      setCurrentSlotDetails({ start: "", end: "", maxPatientsPerSlot: "" });
      setTempReason("");
      setEditingExistingSlot(null);
    } else {
      setCurrentSlotDetails({ start: "", end: "", maxPatientsPerSlot: "" });
      setSelectedDateForSlots("");
      setSpecificSchedules([]);
      setTempReason("");
      setEditingExistingSlot(null);
      setCurrentStep(0);
    }
  }, [selectedScheduleId, selectedDateForBooking]);

  const handleDateSelection = (e) => setSelectedDateForSlots(e.target.value);

  const handleGoToTimeSlotsStep = () => {
    if (!selectedDateForSlots) {
      alert("Please select a date first.");
      return;
    }
    const formattedDate = formatLocalIsoDate(selectedDateForSlots);
    const existingEntry = specificSchedules.find(s => s.date === formattedDate);
    if (!existingEntry) {
      setSpecificSchedules(prev => [
        ...prev,
        { date: formattedDate, day: getDayName(selectedDateForSlots), timeSlots: [] }
      ].sort((a,b) => new Date(a.date) - new Date(b.date)));
    }
    setCurrentStep(1);
  };

  const handleEditSlot = (date, slotId) => {
    const scheduleEntry = specificSchedules.find(s => s.date === date);
    if (scheduleEntry) {
      const slotToEdit = scheduleEntry.timeSlots.find(slot => slot._id === slotId);
      if (slotToEdit) {
        setCurrentSlotDetails({
          start: slotToEdit.start,
          end: slotToEdit.end,
          maxPatientsPerSlot: slotToEdit.maxPatientsPerSlot.toString(),
        });
        setTempReason(slotToEdit.reason || "");
        setEditingExistingSlot({ date, slotId, slotData: slotToEdit });
      }
    }
  };

  const handleAddOrUpdateSlotClick = () => {
    if (!currentSlotDetails.start || !currentSlotDetails.end) {
      alert("Please fill Start and End Times.");
      return;
    }
    if (currentSlotDetails.start >= currentSlotDetails.end) {
      alert("Start time must be earlier than end time.");
      return;
    }
    const parsedMaxPatientsPerSlot = parseInt(currentSlotDetails.maxPatientsPerSlot);
    if (isNaN(parsedMaxPatientsPerSlot) || parsedMaxPatientsPerSlot <= 0) {
      alert("Please provide a valid Max Patients per Slot (must be a positive number).");
      return;
    }
    if (!selectedDateForSlots) {
      alert("Please select a specific date before adding time slots.");
      return;
    }

    if (selectedScheduleId && editingExistingSlot) {
      setShowReasonModal(true);
    } else {
      handleAddUpdateSlotWithReason(tempReason);
    }
  };

  const handleAddUpdateSlotWithReason = (reason) => {
    setTempReason(reason);
    setShowReasonModal(false);

    const parsedMaxPatientsPerSlot = parseInt(currentSlotDetails.maxPatientsPerSlot);
    const newOrUpdatedTimeSlot = {
      start: currentSlotDetails.start,
      end: currentSlotDetails.end,
      maxPatientsPerSlot: parsedMaxPatientsPerSlot,
      reason: reason,
      ...(editingExistingSlot?.slotData?._id && { _id: editingExistingSlot.slotData._id }),
    };

    setSpecificSchedules(prevSchedules => {
      const targetDate = formatLocalIsoDate(selectedDateForSlots);
      let updatedSchedules = [...prevSchedules];
      const existingScheduleIndex = updatedSchedules.findIndex(sched => sched.date === targetDate);

      const existingScheduleEntry = updatedSchedules[existingScheduleIndex];
      const existingTimeSlots = existingScheduleEntry?.timeSlots || [];
      const isOverlap = existingTimeSlots.some(slot => {
        if (editingExistingSlot && slot._id === editingExistingSlot.slotId) return false;
        return (
          (newOrUpdatedTimeSlot.start < slot.end && newOrUpdatedTimeSlot.end > slot.start) ||
          (slot.start < newOrUpdatedTimeSlot.end && slot.end > newOrUpdatedTimeSlot.start) ||
          (newOrUpdatedTimeSlot.start === slot.start && newOrUpdatedTimeSlot.end === slot.end)
        );
      });

      if (isOverlap) {
        alert(`Time slot ${newOrUpdatedTimeSlot.start}-${newOrUpdatedTimeSlot.end} overlaps with an existing slot for ${new Date(targetDate).toLocaleDateString()}. Please adjust the times.`);
        return prevSchedules;
      }

      if (editingExistingSlot) {
        const { date: originalDate, slotId: originalSlotId } = editingExistingSlot;
        const originalScheduleEntryIndex = updatedSchedules.findIndex(s => s.date === originalDate);

        if (originalScheduleEntryIndex !== -1) {
          const originalScheduleEntry = { ...updatedSchedules[originalScheduleEntryIndex] };
          let updatedTimeSlotsForOriginalDate = [...originalScheduleEntry.timeSlots];

          if (originalDate !== targetDate) {
            updatedTimeSlotsForOriginalDate = updatedTimeSlotsForOriginalDate.filter(slot => slot._id !== originalSlotId);
            if (updatedTimeSlotsForOriginalDate.length === 0) {
              updatedSchedules.splice(originalScheduleEntryIndex, 1);
            } else {
              updatedSchedules[originalScheduleEntryIndex] = {
                ...originalScheduleEntry,
                timeSlots: updatedTimeSlotsForOriginalDate,
              };
            }

            const targetScheduleIndex = updatedSchedules.findIndex(sched => sched.date === targetDate);
            if (targetScheduleIndex !== -1) {
              updatedSchedules[targetScheduleIndex] = {
                ...updatedSchedules[targetScheduleIndex],
                timeSlots: [...updatedSchedules[targetScheduleIndex].timeSlots, newOrUpdatedTimeSlot].sort((a,b) => a.start.localeCompare(b.start)),
              };
            } else {
              updatedSchedules.push({
                date: targetDate,
                day: getDayName(new Date(targetDate)),
                timeSlots: [newOrUpdatedTimeSlot],
              });
            }
          } else {
            const slotIndexToUpdate = updatedTimeSlotsForOriginalDate.findIndex(slot => slot._id === originalSlotId);
            if (slotIndexToUpdate !== -1) {
              updatedTimeSlotsForOriginalDate[slotIndexToUpdate] = newOrUpdatedTimeSlot;
              updatedTimeSlotsForOriginalDate.sort((a,b) => a.start.localeCompare(b.start));
              updatedSchedules[originalScheduleEntryIndex] = {
                ...originalScheduleEntry,
                timeSlots: updatedTimeSlotsForOriginalDate,
              };
            }
          }
          return updatedSchedules;
        }
      } else {
        if (existingScheduleIndex !== -1) {
          const existingEntry = updatedSchedules[existingScheduleIndex];
          const updatedTimeSlotsForEntry = [...existingEntry.timeSlots, newOrUpdatedTimeSlot];
          updatedTimeSlotsForEntry.sort((a,b) => a.start.localeCompare(b.start));
          return updatedSchedules.map((sched, index) =>
            index === existingScheduleIndex
              ? { ...sched, timeSlots: updatedTimeSlotsForEntry }
              : sched
          );
        } else {
          return [
            ...prevSchedules,
            {
              date: targetDate,
              day: getDayName(new Date(targetDate)),
              timeSlots: [newOrUpdatedTimeSlot],
            },
          ].sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      }
      return updatedSchedules;
    });

    setCurrentSlotDetails({ start: "", end: "", maxPatientsPerSlot: "" });
    setTempReason("");
    setEditingExistingSlot(null);
    setPreviewSlot(null);
  };

  const handleRemoveSlot = (dateToRemoveFrom, slotIdToRemove) => {
    setSpecificSchedules(prevSchedules => {
      let updatedSchedules = prevSchedules.map(scheduleEntry => {
        if (scheduleEntry.date === dateToRemoveFrom) {
          const updatedTimeSlots = scheduleEntry.timeSlots.filter(slot => slot._id !== slotIdToRemove);
          return updatedTimeSlots.length === 0 ? null : { ...scheduleEntry, timeSlots: updatedTimeSlots };
        }
        return scheduleEntry;
      }).filter(Boolean);

      if (editingExistingSlot && editingExistingSlot.slotId === slotIdToRemove) {
        setEditingExistingSlot(null);
        setCurrentSlotDetails({ start: "", end: "", maxPatientsPerSlot: "" });
        setTempReason("");
      }
      return updatedSchedules;
    });
  };

  const handleSaveAllSchedules = async () => {
    if (specificSchedules.length === 0 || specificSchedules.every(s => s.timeSlots.length === 0)) {
      alert("No schedules added to save. Please add time slots.");
      return;
    }

    const schedulesToSend = specificSchedules
      .filter(schedEntry => schedEntry.timeSlots?.length > 0)
      .map(schedEntry => ({
        date: schedEntry.date,
        day: schedEntry.day,
        timeSlots: schedEntry.timeSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          maxPatientsPerSlot: slot.maxPatientsPerSlot,
          reason: slot.reason || "",
          ...(slot._id && { _id: slot._id })
        }))
      }));

    try {
      if (selectedScheduleId) {
        const scheduleToUpdate = schedulesToSend.find(s => formatLocalIsoDate(selectedScheduleId.date) === s.date);
        if (scheduleToUpdate) {
          await UpdateSchedDoctor(selectedScheduleId._id, scheduleToUpdate);
        } else {
          alert("Error: Schedule to update not found in current state.");
        }
      } else {
        if (!selectedDoctorId) {
          alert("Error: Doctor ID not provided.");
          return;
        }
        await AddSchedDoctor(selectedDoctorId, schedulesToSend);
      }
      onClose();
    } catch (error) {
      console.error("Error saving schedules:", error);
      alert("An unexpected error occurred while saving schedules. Please try again.");
    }
  };

  if (!isOpen) return null;

  const currentSelectedScheduleEntry = specificSchedules.find(
    s => s.date === formatLocalIsoDate(selectedDateForSlots)
  );
  const slotsForSelectedDate = currentSelectedScheduleEntry ? currentSelectedScheduleEntry.timeSlots : [];

  // ✅ Responsive Stepper
  const Stepper = ({ currentStep, steps }) => (
    <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-white transition-colors
              ${index === currentStep ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}
            `}
            initial={false}
            animate={{ backgroundColor: index === currentStep ? '#2563EB' : '#9CA3AF' }}
          >
            {index + 1}
          </motion.div>
          <span className={`ml-1.5 text-xs font-medium sm:text-sm ${
            index === currentStep ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {step.title}
          </span>
          {index < steps.length - 1 && (
            <div className="hidden sm:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2 mt-3.5"></div>
          )}
        </div>
      ))}
    </div>
  );

  const ReasonInputModal = ({ isOpen, onClose, onSaveReason, currentReason }) => {
    const [reason, setReason] = useState(currentReason);

    useEffect(() => setReason(currentReason), [currentReason]);

    const handleSave = () => {
      onSaveReason(reason);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Reason for Update
          </h3>
          <textarea
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md mb-3 dark:bg-gray-800 dark:text-white"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for updating this schedule slot..."
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Reason
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-start p-2 sm:p-4 pt-10 z-[999] overflow-y-auto"
    >
      <motion.div
        initial={{ y: "100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "100vh" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-800 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold text-gray-600 hover:text-red-600 focus:outline-none dark:text-gray-400 dark:hover:text-red-400 sm:top-4 sm:right-4 sm:text-2xl"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-white mb-4">
          {selectedScheduleId ? "Update Schedule" : "Set Specific Schedule"} for {doctorName}
        </h2>

        <Stepper currentStep={currentStep} steps={steps} />

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Step 1: Select Date
              </h3>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Choose a Specific Date
                </label>
                <input
                  type="date"
                  value={selectedDateForSlots}
                  onChange={handleDateSelection}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white sm:px-4 sm:py-2.5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the date you want to manage time slots for.
                </p>
                {selectedDateForSlots && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Selected Date: </span>
                    <span className="inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs mr-1 mt-1">
                      {new Date(selectedDateForSlots).toLocaleDateString()} ({getDayName(selectedDateForSlots)})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleGoToTimeSlotsStep}
                  disabled={!selectedDateForSlots}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 sm:px-5 sm:py-2.5 sm:text-base"
                >
                  Next: Add Time Slots
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Step 2: Add/Edit Time Slots for {selectedDateForSlots ? new Date(selectedDateForSlots).toLocaleDateString() : 'Selected Date'}
              </h3>
              {/* ✅ Responsive Grid: 1-col on mobile, 2 on sm, 3 on md+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={currentSlotDetails.start}
                    onChange={(e) => setCurrentSlotDetails(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white sm:px-4 sm:py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={currentSlotDetails.end}
                    onChange={(e) => setCurrentSlotDetails(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white sm:px-4 sm:py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Patients per Slot
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentSlotDetails.maxPatientsPerSlot}
                    onChange={(e) => setCurrentSlotDetails(prev => ({ ...prev, maxPatientsPerSlot: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white sm:px-4 sm:py-2.5"
                  />
                </div>
              </div>

              <button
                onClick={handleAddOrUpdateSlotClick}
                disabled={!currentSlotDetails.start || !currentSlotDetails.end || !currentSlotDetails.maxPatientsPerSlot}
                className="w-full bg-blue-600 text-white py-2 text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4 sm:py-2.5 sm:text-base"
              >
                {editingExistingSlot ? "Update Time Slot" : "Add Time Slot"}
              </button>

              {previewSlot && !editingExistingSlot && (
                <div className="bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 text-xs sm:text-sm text-blue-800 dark:text-blue-300 mb-4">
                  <span className="font-semibold">Preview (will be added):</span>
                  <div>
                    {previewSlot.start} - {previewSlot.end} ({previewSlot.maxPatientsPerSlot} max/slot)
                    {previewSlot.reason && <span className="ml-1 italic opacity-80">({previewSlot.reason})</span>}
                  </div>
                </div>
              )}

              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 max-h-48 sm:max-h-60 overflow-y-auto mb-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-2 border-b pb-1 border-gray-200 dark:border-gray-700">
                  Current Time Slots for {selectedDateForSlots ? new Date(selectedDateForSlots).toLocaleDateString() : ''}
                </h4>
                {slotsForSelectedDate.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No time slots added for this date yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {slotsForSelectedDate.map((slot) => (
                      <li
                        key={slot._id || `${selectedDateForSlots}-${slot.start}-${slot.end}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {slot.start} - {slot.end} ({slot.maxPatientsPerSlot} max/slot)
                          {slot.reason && <span className="ml-1 italic opacity-80">({slot.reason})</span>}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSlot(selectedDateForSlots, slot._id)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveSlot(selectedDateForSlots, slot._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 sm:px-5 sm:py-2.5"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={slotsForSelectedDate.length === 0}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 sm:px-5 sm:py-2.5"
                >
                  Next: Review & Save
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Step 3: Review All Schedules
              </h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 max-h-64 sm:max-h-96 overflow-y-auto mb-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-2 border-b pb-1 border-gray-200 dark:border-gray-700">
                  Schedules to be Saved
                </h4>
                {specificSchedules.filter(entry => entry.timeSlots.length > 0).length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No schedules added yet.</p>
                ) : (
                  specificSchedules
                    .filter(entry => entry.timeSlots.length > 0)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((scheduleEntry) => (
                      <div key={scheduleEntry.date} className="mb-3 last:mb-0">
                        <h5 className="font-bold text-xs sm:text-sm text-gray-800 dark:text-white">
                          {scheduleEntry.day}, {new Date(scheduleEntry.date).toLocaleDateString()}
                        </h5>
                        <ul className="space-y-1 ml-1 mt-1">
                          {scheduleEntry.timeSlots.map((slot) => (
                            <li
                              key={slot._id || `${scheduleEntry.date}-${slot.start}-${slot.end}`}
                              className="text-xs sm:text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                            >
                              {slot.start} - {slot.end} ({slot.maxPatientsPerSlot} max/slot)
                              {slot.reason && <span className="ml-1 italic opacity-80">({slot.reason})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 sm:px-5 sm:py-2.5"
                >
                  Previous
                </button>
                <button
                  onClick={handleSaveAllSchedules}
                  disabled={specificSchedules.length === 0 || specificSchedules.every(s => s.timeSlots.length === 0)}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 sm:px-5 sm:py-2.5"
                >
                  {selectedScheduleId ? "Update Schedule" : "Save All Schedules"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {selectedScheduleId && (
        <ReasonInputModal
          isOpen={showReasonModal}
          onClose={() => setShowReasonModal(false)}
          onSaveReason={handleAddUpdateSlotWithReason}
          currentReason={tempReason}
        />
      )}
    </motion.div>
  );
}