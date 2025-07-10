import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SchedDisplayContext } from '../../contexts/Schedule/ScheduleContext';
import ScheduleModal from './Schedule';

const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const toYYYYMMDD = (dateInput) => {
    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput.includes('T') ? dateInput : dateInput + 'T00:00:00Z');
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return '';
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CalendarGuide = () => {
    const { doctor, loadingDoctors } = useContext(SchedDisplayContext);

    const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
    const [triggeredSearchQuery, setTriggeredSearchQuery] = useState('');
    const [foundDoctors, setFoundDoctors] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

    const [schedules, setSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingModalDoctorId, setBookingModalDoctorId] = useState(null);
    const [bookingModalDoctorName, setBookingModalDoctorName] = useState(null);
    const [bookingModalDate, setBookingModalDate] = useState(null);

    const { doctorsList, schedulesByDoctor } = useMemo(() => {
        const tempDoctorsList = [];
        const tempSchedulesByDoctor = {};

        const actualDoctorSchedules = Array.isArray(doctor) ? doctor : [];

        const validDoctorSchedules = actualDoctorSchedules.filter(schedule => {
            if (!schedule.doctorId || typeof schedule.doctorName !== 'string') {
                return false;
            }
            return true;
        });

        if (validDoctorSchedules.length > 0) {
            validDoctorSchedules.forEach(schedule => {
                const existingDoctor = tempDoctorsList.find(doc => doc._id === schedule.doctorId);
                if (!existingDoctor) {
                    tempDoctorsList.push({ _id: schedule.doctorId, name: schedule.doctorName, specialty: schedule.specialty });
                }

                if (!tempSchedulesByDoctor[schedule.doctorId]) {
                    tempSchedulesByDoctor[schedule.doctorId] = [];
                }
                tempSchedulesByDoctor[schedule.doctorId].push(schedule);
            });
        }
        return { doctorsList: tempDoctorsList, schedulesByDoctor: tempSchedulesByDoctor };
    }, [doctor]);

    const availableDates = useMemo(() => {
        const dates = new Set();
        schedules.forEach(sched => {
            dates.add(toYYYYMMDD(sched.date));
        });
        return dates;
    }, [schedules]);

    const fetchDoctorSchedules = useCallback(async () => {
        if (!selectedDoctor?._id) {
            setSchedules([]);
            setScheduleLoading(false);
            setScheduleError("No doctor selected to display schedules.");
            return;
        }

        setScheduleLoading(true);
        setScheduleError(null);
        await new Promise(resolve => setTimeout(resolve, 500));

        const doctorId = selectedDoctor._id;
        const actualSchedulesForDoctor = schedulesByDoctor[doctorId] || [];

        setSchedules(actualSchedulesForDoctor);
        if (actualSchedulesForDoctor.length === 0) {
            setScheduleError(`No schedules found for Dr. ${selectedDoctor.name} at this time.`);
        } else {
            setScheduleError(null);
        }
        setScheduleLoading(false);
    }, [selectedDoctor, schedulesByDoctor]);

    useEffect(() => {
        if (loadingDoctors) {
            setFoundDoctors([]);
            setSearchLoading(true);
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        const handler = setTimeout(() => {
            if (!triggeredSearchQuery.trim()) {
                setFoundDoctors(doctorsList);
            } else {
                const lowerCaseQuery = triggeredSearchQuery.toLowerCase();
                const filteredDoctors = doctorsList.filter(dr =>
                    typeof dr.name === 'string' && dr.name.toLowerCase().includes(lowerCaseQuery)
                );
                setFoundDoctors(filteredDoctors);
            }
            setSearchLoading(false);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [triggeredSearchQuery, doctorsList, loadingDoctors]);

    const handleSearchButtonClick = () => {
        setTriggeredSearchQuery(doctorSearchQuery);
        setSelectedDoctor(null);
    };

    useEffect(() => {
        if (!loadingDoctors && doctorsList.length > 0 && triggeredSearchQuery === '') {
            setTriggeredSearchQuery('');
        }
    }, [doctorsList, loadingDoctors, triggeredSearchQuery]);

    useEffect(() => {
        if (selectedDoctor?._id) {
            fetchDoctorSchedules();
        } else {
            setSchedules([]);
            setScheduleError(null);
            setSelectedCalendarDate(null);
        }
    }, [selectedDoctor, fetchDoctorSchedules]);

    const renderCalendar = () => {
        const startDayLocal = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDayLocal = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const numDaysInMonth = endDayLocal.getDate();
        const firstDayOfWeek = startDayLocal.getDay();

        const calendarDays = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-0.5 border rounded-sm border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs"></div>);
        }

        for (let day = 1; day <= numDaysInMonth; day++) {
            const currentDateLocal = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

            const currentDateUTCForComparison = new Date(Date.UTC(currentDateLocal.getFullYear(), currentDateLocal.getMonth(), currentDateLocal.getDate()));
            const formattedDateKey = toYYYYMMDD(currentDateUTCForComparison);

            const hasSchedule = availableDates.has(formattedDateKey);
            const isSelected = selectedCalendarDate === formattedDateKey;

            const todayFormattedUTC = toYYYYMMDD(new Date());
            const isToday = todayFormattedUTC === formattedDateKey;

            const dateForPastComparison = new Date(currentDateLocal.getFullYear(), currentDateLocal.getMonth(), currentDateLocal.getDate());
            dateForPastComparison.setUTCHours(0, 0, 0, 0);
            const todayMidnightUTC = new Date();
            todayMidnightUTC.setUTCHours(0, 0, 0, 0);

            const isPastDate = dateForPastComparison.getTime() < todayMidnightUTC.getTime();

            calendarDays.push(
                <motion.div
                    key={formattedDateKey}
                    className={`p-0.5 sm:p-1.5 border rounded-sm transition-all duration-200 cursor-pointer flex flex-col items-center justify-center relative
                        ${hasSchedule && !isPastDate ? 'bg-blue-200 dark:bg-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600 font-bold text-blue-800 dark:text-blue-100 shadow-sm' : ''}
                        ${isSelected ? 'ring-1 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 bg-blue-300 dark:bg-blue-600 !text-blue-900 dark:!text-white' : ''}
                        ${!hasSchedule && !isPastDate ? 'bg-white dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200' : ''}
                        ${isPastDate && !hasSchedule ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70' : ''}
                        ${isPastDate && hasSchedule && !isSelected ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 opacity-80 cursor-not-allowed' : ''}
                        ${isToday && !isSelected ? 'border-1 border-green-500 dark:border-green-400' : ''}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (hasSchedule && !isPastDate) {
                            setSelectedCalendarDate(formattedDateKey);
                        } else if (!hasSchedule && selectedDoctor && !isPastDate) {
                            setBookingModalDoctorId(selectedDoctor._id);
                            setBookingModalDoctorName(selectedDoctor.name);
                            setBookingModalDate(formattedDateKey);
                            setIsBookingModalOpen(true);
                        } else {
                            setSelectedCalendarDate(null);
                        }
                    }}
                >
                    <span className="text-sm font-bold">{day}</span>
                    {hasSchedule && (
                        <div className="absolute bottom-0 right-0 w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    )}
                </motion.div>
            );
        }
        return calendarDays;
    };

    const currentMonthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const goToPrevMonth = () => {
        setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
        setSelectedCalendarDate(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
        setSelectedCalendarDate(null);
    };

    const selectedDaySchedule = useMemo(() => {
        if (!selectedCalendarDate) return null;
        return schedules.find(sched => toYYYYMMDD(sched.date) === selectedCalendarDate);
    }, [selectedCalendarDate, schedules]);

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        setBookingModalDoctorId(null);
        setBookingModalDoctorName(null);
        setBookingModalDate(null);
    };

    return (
        <div className="container mx-auto p-1 sm:p-2 lg:p-3 font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl">
            <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 text-blue-700 dark:text-blue-400">
                Doctor Schedule
            </h1>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <label htmlFor="doctorSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Search Doctor by Name:
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="doctorSearch"
                        className="flex-grow px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 text-xs"
                        placeholder="Enter doctor's name..."
                        value={doctorSearchQuery}
                        onChange={(e) => {
                            setDoctorSearchQuery(e.target.value);
                            setSelectedDoctor(null);
                            if (e.target.value.trim() === '') {
                                setTriggeredSearchQuery('');
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchButtonClick();
                            }
                        }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearchButtonClick}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition text-xs font-semibold"
                        disabled={loadingDoctors || searchLoading}
                    >
                        Search
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {loadingDoctors && (
                        <motion.div
                            key="initialLoading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center mt-2 text-blue-600 dark:text-blue-300 text-xs"
                        >
                            <div className="animate-spin rounded-full h-4 w-4 border-b-1 border-blue-600 dark:border-blue-300"></div>
                            <p className="ml-1">Loading doctor data...</p>
                        </motion.div>
                    )}

                    {!loadingDoctors && searchLoading && (
                        <motion.div
                            key="searchLoading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center mt-2 text-blue-600 dark:text-blue-300 text-xs"
                        >
                            <div className="animate-spin rounded-full h-4 w-4 border-b-1 border-blue-600 dark:border-blue-300"></div>
                            <p className="ml-1">Searching...</p>
                        </motion.div>
                    )}

                    {!loadingDoctors && searchError && !searchLoading && (
                        <motion.div
                            key="searchError"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 p-1.5 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-xs"
                        >
                            <p>Search Error: {searchError}</p>
                        </motion.div>
                    )}

                    {!loadingDoctors && !searchLoading && !searchError && !selectedDoctor && (
                        <>
                            {triggeredSearchQuery.trim() !== '' ? (
                                foundDoctors.length > 0 ? (
                                    <motion.div
                                        key="searchResults"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600"
                                    >
                                        <h3 className="text-xs font-semibold p-1.5 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                                            Search Results:
                                        </h3>
                                        <ul>
                                            {foundDoctors.map((doc) => (
                                                <li
                                                    key={doc._id}
                                                    className="flex justify-between items-center p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-xs"
                                                    onClick={() => {
                                                        setSelectedDoctor({ _id: doc._id, name: doc.name, specialty: doc.specialty });
                                                        setDoctorSearchQuery(doc.name);
                                                        setFoundDoctors([]);
                                                    }}
                                                >
                                                    <span className="font-medium text-gray-800 dark:text-gray-100">{doc.name}</span>
                                                    <span className="text-2xs text-gray-500 dark:text-gray-400">Specialty: {doc.specialty}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="noSearchResults"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-2 p-1.5 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-md text-xs"
                                    >
                                        <p>No doctors found matching "{triggeredSearchQuery}".</p>
                                    </motion.div>
                                )
                            ) : (
                                doctorsList.length > 0 ? (
                                    <motion.div
                                        key="allDoctors"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600"
                                    >
                                        <h3 className="text-xs font-semibold p-1.5 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                                            All Available Doctors:
                                        </h3>
                                        <ul>
                                            {doctorsList.map((doc) => (
                                                <li
                                                    key={doc._id}
                                                    className="flex justify-between items-center p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-xs"
                                                    onClick={() => {
                                                        setSelectedDoctor({ _id: doc._id, name: doc.name, specialty: doc.specialty });
                                                        setDoctorSearchQuery(doc.name);
                                                        setFoundDoctors([]);
                                                    }}
                                                >
                                                    <span className="font-medium text-gray-800 dark:text-gray-100">{doc.name}</span>
                                                    <span className="text-2xs text-gray-500 dark:text-gray-400">Specialty: {doc.specialty}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="noDoctorsAvailable"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-2 p-1.5 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-md text-xs"
                                    >
                                        <p>No doctor schedules are currently available.</p>
                                    </motion.div>
                                )
                            )}
                        </>
                    )}
                </AnimatePresence>
            </div>

            {selectedDoctor && (
                <motion.div
                    key="doctorSchedule"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                >
                    <h2 className="text-lg sm:text-xl font-bold text-center mb-3 text-green-700 dark:text-green-400">
                        Dr. <span className="text-base sm:text-lg font-semibold">{selectedDoctor.name}</span>'s Schedule
                    </h2>

                    {scheduleLoading && (
                        <div className="flex justify-center items-center h-28 rounded-lg shadow-inner">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-1 border-green-600 dark:border-green-300"></div>
                            <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">Loading Schedule...</p>
                        </div>
                    )}

                    {scheduleError && !scheduleLoading && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg shadow-md flex items-center text-xs">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p className="font-semibold">Error: {scheduleError}</p>
                        </div>
                    )}

                    {!scheduleLoading && !scheduleError && schedules.length === 0 && (
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 rounded-lg shadow-md flex items-center justify-center h-28 text-sm">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p className="font-medium">No schedules found for Dr. {selectedDoctor.name}.</p>
                        </div>
                    )}

                    {!scheduleLoading && !scheduleError && schedules.length > 0 && (
                        <motion.div
                            key="calendarView"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-3"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPrevMonth}
                                    className="px-2 py-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition text-xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </motion.button>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    {currentMonthName}
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNextMonth}
                                    className="px-2 py-1 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition text-xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </motion.button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-2xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                <div>Sun</div>
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>

                            {selectedCalendarDate && selectedDaySchedule && (
                                <motion.div
                                    key={`slots-${selectedCalendarDate}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 p-2.5 bg-white dark:bg-gray-750 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-300 mb-2 border-b pb-1 border-blue-200 dark:border-blue-700">
                                        Time Slots for {formatDisplayDate(selectedCalendarDate)}
                                    </h3>
                                    <ul className="space-y-1.5">
                                        {selectedDaySchedule.timeSlots
                                            .sort((a, b) => a.start.localeCompare(b.start))
                                            .map((slot, index) => (
                                                <li key={slot._id || index} className="flex items-center justify-between p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 text-xs">
                                                    <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                                                        {formatTime(slot.start)} - {formatTime(slot.end)}
                                                    </span>
                                                    <span className="text-2xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
                                                        {slot.maxPatientsPerSlot} patients
                                                    </span>
                                                    {slot.reason && (
                                                        <span className="text-2xs text-gray-600 dark:text-gray-400 ml-1 italic">
                                                            ({slot.reason})
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                    </ul>
                                </motion.div>
                            )}
                            {!selectedCalendarDate && (
                                <p className="mt-2.5 p-2.5 text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner text-xs">
                                    Select a marked date on the calendar to view time slots.
                                </p>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}
            {isBookingModalOpen && (
                <ScheduleModal
                    isOpen={isBookingModalOpen}
                    onClose={handleCloseBookingModal}
                    selectedDoctorId={bookingModalDoctorId}
                    doctorName={bookingModalDoctorName}
                    selectedDateForBooking={bookingModalDate}
                />
            )}
        </div>
    );
};

export default CalendarGuide;