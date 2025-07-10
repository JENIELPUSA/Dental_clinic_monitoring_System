import React, { useState, useEffect, useMemo, useContext } from 'react';
import { SchedDisplayContext } from '../../contexts/Schedule/ScheduleContext';

const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const days = [];
    while (firstDay.getMonth() === month) {
        days.push(new Date(firstDay)); // Push full Date objects
        firstDay.setDate(firstDay.getDate() + 1);
    }
    return days; // Returns an array of Date objects
};

const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
};

const BookingDetailsModal = ({
    show,
    onClose,
    patientId,
    setPatientId,
    selectedDate,
    selectedTime,
    setSelectedTime,
    serviceType,
    setServiceType,
    preferredDentist,
    setPreferredDentist,
    notes,
    setNotes,
    availableDoctors,
    availableTimeSlots,
    allDoctorsData,
    handleSubmit
}) => {
    if (!show) return null;

    const selectedDentistObject = allDoctorsData.find(doc => doc.value === preferredDentist);
    const displayDentistName = selectedDentistObject ? `${selectedDentistObject.name} ${selectedDentistObject.specialty ? `(${selectedDentistObject.specialty})` : ''}` : 'Any Available';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">Complete Your Appointment Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
                </div>

                <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="modalDentist" className="block text-sm font-medium text-gray-700 mb-1">Preferred Dentist (Optional)</label>
                        {selectedDate ? (
                            availableDoctors.length > 1 ? (
                                <select
                                    id="modalDentist"
                                    name="modalDentist"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={preferredDentist}
                                    onChange={(e) => setPreferredDentist(e.target.value)}
                                >
                                    {availableDoctors.map((doctor) => (
                                        <option key={doctor.value} value={doctor.value}>
                                            {doctor.name} {doctor.specialty && `(${doctor.specialty})`}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="mt-1 text-sm text-red-600">No dentists available for {selectedDate}. Please choose another date.</p>
                            )
                        ) : (
                            <p className="mt-1 text-sm text-gray-500">Please select a date from the calendar.</p>
                        )}
                        <div className="mt-2 text-sm text-gray-600">
                            Currently selected: <span className="font-semibold">{displayDentistName}</span>
                        </div>
                    </div>

                    {selectedDate && preferredDentist && (
                        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Time Slot</label>
                            {availableTimeSlots.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {availableTimeSlots.map(timeSlotRange => {
                                        const isTimeSelected = timeSlotRange === selectedTime;
                                        return (
                                            <button
                                                type="button"
                                                key={timeSlotRange}
                                                onClick={() => setSelectedTime(timeSlotRange)}
                                                className={`
                                                    px-3 py-2 rounded-md transition text-sm
                                                    ${isTimeSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-800 hover:bg-indigo-100 border border-gray-300'}
                                                `}
                                            >
                                                {timeSlotRange}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-red-600 text-sm">No available time slots for the selected date and dentist.</p>
                            )}
                        </div>
                    )}
                    <div>
                        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                        <select
                            id="serviceType"
                            name="serviceType"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            required
                        >
                            <option value="">Select a Service</option>
                            <option value="general-checkup">General Check-up</option>
                            <option value="cleaning">Dental Cleaning</option>
                            <option value="filling">Filling</option>
                            <option value="extraction">Tooth Extraction</option>
                            <option value="consultation">Consultation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Reason for Visit (Optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            placeholder="Briefly describe your reason for visit..."
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg font-semibold"
                        >
                            Book Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const App = () => {
    const { doctor } = useContext(SchedDisplayContext);

    const [patientId, setPatientId] = useState('');

    // --- CRITICAL CHANGE: Manage currentMonth as a Date object ---
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const [serviceType, setServiceType] = useState('');
    const [preferredDentist, setPreferredDentist] = useState('any');
    const [notes, setNotes] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);

    const [processedAvailability, setProcessedAvailability] = useState({});
    const [processedAllDoctors, setProcessedAllDoctors] = useState([]);
    const [dailySchedules, setDailySchedules] = useState({});

    const [availableDoctorsOnDate, setAvailableDoctorsOnDate] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

    useEffect(() => {
        const tempAvailability = {};
        const tempUniqueDoctors = new Map();
        const tempDailySchedules = {};
        if (doctor && doctor.data && Array.isArray(doctor.data)) {
            doctor.data.forEach(item => {
                const formattedDate = item.date.split('T')[0]; // Extracts "YYYY-MM-DD"

                if (!tempUniqueDoctors.has(item.doctorId)) {
                    const avatarBgColor = hashCode(item.doctorName).substring(1);
                    const avatarTextColor = "000000";
                    tempUniqueDoctors.set(item.doctorId, {
                        value: item.doctorId,
                        name: item.doctorName,
                        specialty: item.specialty,
                        image: `https://placehold.co/100x100/${avatarBgColor}/${avatarTextColor}?text=${item.doctorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}`,
                    });
                }

                item.timeSlots.forEach(slot => {
                    const dateTimeKey = `${formattedDate} ${slot.start}`; // Creates keys like "YYYY-MM-DD HH:MM"
                    if (!tempAvailability[dateTimeKey]) {
                        tempAvailability[dateTimeKey] = [];
                    }
                    tempAvailability[dateTimeKey].push({
                        doctorId: item.doctorId,
                        doctorName: item.doctorName,
                        specialty: item.specialty,
                        timeStart: slot.start,
                        timeEnd: slot.end
                    });
                });

                // Populate tempDailySchedules with unique doctor IDs for each date
                if (item.status === "Approved" && item.isActive) {
                    if (!tempDailySchedules[formattedDate]) {
                        tempDailySchedules[formattedDate] = new Set();
                    }
                    tempDailySchedules[formattedDate].add(item.doctorId);
                }
            });
        }

        const finalDoctors = [{ value: 'any', name: 'Any Available', specialty: '' }, ...Array.from(tempUniqueDoctors.values())];

        setProcessedAvailability(tempAvailability);
        setProcessedAllDoctors(finalDoctors);
        const finalDailySchedules = {};
        for (const dateKey in tempDailySchedules) {
            finalDailySchedules[dateKey] = Array.from(tempDailySchedules[dateKey]);
        }
        setDailySchedules(finalDailySchedules);

        // console.log('Final processedAvailability after effect:', tempAvailability); // Debugging
        // console.log('Final dailySchedules after effect:', finalDailySchedules); // Debugging

    }, [doctor.data]); // Re-run this effect if doctor.data changes


    useEffect(() => {
        if (selectedDate) {
            const doctorsOnThisDateSet = new Set();
            Object.keys(processedAvailability)
                .filter(key => key.startsWith(selectedDate))
                .forEach(key => {
                    processedAvailability[key].forEach(doc => doctorsOnThisDateSet.add(doc.doctorId));
                });

            const filteredDoctors = processedAllDoctors.filter(doc =>
                doc.value === 'any' || doctorsOnThisDateSet.has(doc.value)
            );
            setAvailableDoctorsOnDate(filteredDoctors);
            setSelectedTime('');
            setPreferredDentist('any');
        } else {
            setAvailableDoctorsOnDate(processedAllDoctors);
        }
    }, [selectedDate, processedAvailability, processedAllDoctors]);


    useEffect(() => {
        if (selectedDate && preferredDentist) {
            const potentialTimeSlots = new Set();

            if (doctor && doctor.data && Array.isArray(doctor.data)) {
                doctor.data.forEach(scheduleItem => {
                    const itemDate = scheduleItem.date.split('T')[0];
                    if (itemDate === selectedDate && (preferredDentist === 'any' || scheduleItem.doctorId === preferredDentist)) {
                        scheduleItem.timeSlots.forEach(slot => {
                            potentialTimeSlots.add(`${slot.start} - ${slot.end}`);
                        });
                    }
                });
            }

            const sortedTimeSlots = Array.from(potentialTimeSlots).sort();
            setAvailableTimeSlots(sortedTimeSlots);

            if (selectedTime && !sortedTimeSlots.includes(selectedTime)) {
                setSelectedTime('');
            }

        } else {
            setAvailableTimeSlots([]);
            setSelectedTime('');
        }
    }, [selectedDate, preferredDentist, selectedTime, doctor.data]);


    // Memoized calculations for calendar grid
    // --- CHANGE: Pass currentMonthDate directly to helpers ---
    const daysInMonthArray = useMemo(() => getDaysInMonth(currentMonthDate), [currentMonthDate]);
    const firstDayOffset = useMemo(() => getFirstDayOfMonth(currentMonthDate), [currentMonthDate]);

    // Month and day names for display
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Handler for clicking a date on the calendar
    const handleDateClick = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        setShowBookingModal(true);
    };

    // Handler for navigating to the previous month
    const handlePrevMonth = () => {
        setCurrentMonthDate(prevDate => {
            // Create a new Date object to avoid direct mutation of state
            const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
            return newDate;
        });
    };

    // Handler for navigating to the next month
    const handleNextMonth = () => {
        setCurrentMonthDate(prevDate => {
            // Create a new Date object to avoid direct mutation of state
            const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
            return newDate;
        });
    };

    // Handler for booking form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Booking Appointment:', {
            patientId,
            selectedDate,
            selectedTime,
            serviceType,
            preferredDentist,
            notes,
        });
        console.log('Appointment request submitted! Check console for details.');
        setShowBookingModal(false);
    };


    return (
        <>
            {/* Tailwind CSS CDN and Google Fonts are generally better placed in public/index.html
                or configured via your build system (e.g., PostCSS, Vite, Next.js).
                Keeping them here for direct demonstration purposes. */}
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f2f5;
                }
                `}
            </style>

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                        Book a New Appointment
                    </h1>
                    <p className="text-md text-gray-600 mb-8 text-center">
                        Fill out the form below to schedule your dental appointment.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Date</label>
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 transition"
                                >
                                    &lt;
                                </button>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {/* --- CHANGE: Use currentMonthDate properties for display --- */}
                                    {currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 transition"
                                >
                                    &gt;
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-sm font-medium text-center">
                                {dayNames.map(day => (
                                    <div key={day} className="text-gray-600">{day}</div>
                                ))}
                                {/* Create empty placeholders for days before the 1st of the month */}
                                {Array.from({ length: firstDayOffset }).map((_, i) => (
                                    <div key={`empty-${i}`} className="p-2"></div>
                                ))}
                                {/* Loop directly over Date objects from daysInMonthArray */}
                                {daysInMonthArray.map(dateObject => {
                                    const day = dateObject.getDate(); // Get the day number from the Date object
                                    const formattedDate = dateObject.toISOString().split('T')[0]; // Format for comparison (e.g., "2025-06-19")
                                    const isSelected = formattedDate === selectedDate;
                                    const today = new Date(); // Get current date for "today" comparison
                                    // Simplified today comparison using toDateString() for accuracy across time
                                    const isToday = dateObject.toDateString() === today.toDateString();

                                    // Use the dailySchedules to check for availability
                                    // 'dailySchedules' should contain keys like "YYYY-MM-DD"
                                    const availableDoctorsOnThisDay = dailySchedules[formattedDate] || [];
                                    const hasAvailability = availableDoctorsOnThisDay.length > 0;

                                    return (
                                        <button
                                            type="button"
                                            key={formattedDate} // Key using formatted string for stability
                                            onClick={() => handleDateClick(dateObject)} // Pass the full Date object
                                            className={`
                                                p-2 rounded-full transition relative
                                                ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-800 hover:bg-blue-100'}
                                                ${isToday && !isSelected ? 'border-2 border-blue-500' : ''}
                                                ${hasAvailability && !isSelected ? 'font-bold text-blue-700' : ''}
                                            `}
                                        >
                                            {day}
                                            {/* Render the green dot if hasAvailability is true and the date is not currently selected */}
                                            {hasAvailability && !isSelected && (
                                                <span className="absolute bottom-1 right-1 block w-2 h-2 bg-green-500 rounded-full"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </form>

                    <p className="text-xs text-gray-500 mt-8 text-center">
                        You will receive a confirmation email shortly after booking.
                    </p>
                </div>
            </div>

            <BookingDetailsModal
                show={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                patientId={patientId}
                setPatientId={setPatientId}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                serviceType={serviceType}
                setServiceType={setServiceType}
                preferredDentist={preferredDentist}
                setPreferredDentist={setPreferredDentist}
                notes={notes}
                setNotes={setNotes}
                availableDoctors={availableDoctorsOnDate}
                availableTimeSlots={availableTimeSlots}
                allDoctorsData={processedAllDoctors}
                handleSubmit={handleSubmit}
            />
        </>
    );
};

export default App;