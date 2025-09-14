import React, { useContext, useState, useEffect, createContext } from "react";
import { SchedDisplayContext } from "../../contexts/Schedule/ScheduleContext";
import AuthFormModal from "../Login/Login"

const processDoctorData = (rawData) => {
    const doctorsMap = new Map();
    const dailySchedules = {};
    if (!rawData || !Array.isArray(rawData)) {
        return { doctors: [], dailySchedules: {} };
    }

    const hashCode = (str) => {
        if (!str || typeof str !== "string") return "000000"; // fallback color
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

    rawData.forEach((entry) => {
        if (entry.status === "Approved" && entry.isActive) {
            const doctorName = entry.doctorName || "Unknown";
            const avatarBgColor = hashCode(doctorName).substring(1);
            const avatarTextColor = "FFFFFF";

            doctorsMap.set(entry.doctorId, {
                id: entry.doctorId,
                name: doctorName,
                specialty: entry.specialty || "N/A",
                image: `https://placehold.co/100x100/${avatarBgColor}/${avatarTextColor}?text=${doctorName
                    .split(" ")
                    .map((n) => n[0] || "")
                    .join("")}`,
            });

            const date = new Date(entry.date);
            const fullYear = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const formattedDate = `${fullYear}-${mm}-${dd}`;

            if (!dailySchedules[formattedDate]) {
                dailySchedules[formattedDate] = [];
            }

            if (Array.isArray(entry.timeSlots)) {
                entry.timeSlots.forEach((slot) => {
                    dailySchedules[formattedDate].push({
                        doctorId: entry.doctorId,
                        doctorName: doctorName,
                        specialty: entry.specialty || "N/A",
                        timeSlotId: slot._id,
                        timeStart: slot.start,
                        timeEnd: slot.end,
                        maxPatientsPerSlot: slot.maxPatientsPerSlot,
                        reason: slot.reason,
                    });
                });
            }
        }
    });

    return {
        doctors: Array.from(doctorsMap.values()),
        dailySchedules: dailySchedules,
    };
};


function CalendarSchedule() {
    const { doctor } = useContext(SchedDisplayContext);
    const [selectedService, setSelectedService] = useState("");

    const [processedDoctorData, setProcessedDoctorData] = useState({
        doctors: [],
        dailySchedules: {},
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [selectedDateDoctors, setSelectedDateDoctors] = useState(null);
    const [currentSelectedDate, setCurrentSelectedDate] = useState(null);

    const [selectedDoctorIdForForm, setSelectedDoctorIdForForm] = useState(null);
    const [selectedDoctorNameForForm, setSelectedDoctorNameForForm] = useState(null);
    const [selectedTimeSlotIdForForm, setSelectedTimeSlotIdForForm] = useState(null);
    const [selectedDoctorTimeStartForForm, setSelectedDoctorTimeStartForForm] = useState(null);
    const [selectedDoctorTimeEndForForm, setSelectedDoctorTimeEndForForm] = useState(null);
    const [selectedDateForForm, setSelectedDateForForm] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        if (doctor) {
            const data = processDoctorData(doctor);
            setProcessedDoctorData(data);
        } else {
            setProcessedDoctorData({ doctors: [], dailySchedules: {} });
        }
    }, [doctor]);

    const { doctors: mockDoctors, dailySchedules: mockDoctorDailySchedules } = processedDoctorData;

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getCalendarDays = () => {
        const numDays = daysInMonth(currentMonth);
        const startDay = firstDayOfMonth(currentMonth);
        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= numDays; i++) {
            days.push(i);
        }
        return days;
    };

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const formatDateForSchedule = (year, month, day) => {
        const monthStr = (month + 1).toString().padStart(2, "0");
        const dayStr = day.toString().padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    };

    const handleMonthChange = (offset) => {
        setCurrentMonth((prevMonth) => {
            const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + offset, 1);
            return newMonth;
        });
        setSelectedDateDoctors(null);
        setCurrentSelectedDate(null);
        setSelectedDoctorIdForForm(null);
        setSelectedDoctorNameForForm(null);
        setSelectedTimeSlotIdForForm(null);
        setSelectedDoctorTimeStartForForm(null);
        setSelectedDoctorTimeEndForForm(null);
        setSelectedDateForForm(null);
        setIsModalOpen(false);
    };

    const handleDayClick = (day, dateKey) => {
        if (!day) return;

        const timeSlotsOnDate = mockDoctorDailySchedules[dateKey]?.filter(slot => slot.maxPatientsPerSlot > 0);

        if (timeSlotsOnDate && timeSlotsOnDate.length > 0) {
            setSelectedDateDoctors(timeSlotsOnDate);
            setCurrentSelectedDate(dateKey);
            setSelectedDoctorIdForForm(null);
            setSelectedDoctorNameForForm(null);
            setSelectedTimeSlotIdForForm(null);
            setSelectedDoctorTimeStartForForm(null);
            setSelectedDoctorTimeEndForForm(null);
            setSelectedDateForForm(dateKey);
        } else {
            setSelectedDateDoctors(null);
            setCurrentSelectedDate(null);
            setSelectedDoctorIdForForm(null);
            setSelectedDoctorNameForForm(null);
            setSelectedTimeSlotIdForForm(null);
            setSelectedDoctorTimeStartForForm(null);
            setSelectedDoctorTimeEndForForm(null);
            setSelectedDateForForm(null);
            setIsModalOpen(false);
        }
    };

    const handleSelectDoctorForForm = (doctorId, doctorName, timeSlotId, timeStart, timeEnd, date) => {
        setSelectedDoctorIdForForm(doctorId);
        setSelectedDoctorNameForForm(doctorName);
        setSelectedTimeSlotIdForForm(timeSlotId);
        setSelectedDoctorTimeStartForForm(timeStart);
        setSelectedDoctorTimeEndForForm(timeEnd);
        setSelectedDateForForm(date);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDoctorIdForForm(null);
        setSelectedDoctorNameForForm(null);
        setSelectedTimeSlotIdForForm(null);
        setSelectedDoctorTimeStartForForm(null);
        setSelectedDoctorTimeEndForForm(null);
        setSelectedDateForForm(null);
    };

    if (!doctor) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading doctor data...</div>
            </div>
        );
    }

    return (
        <div className="flex items-start justify-center">
            <div className="w-full max-w-4xl rounded-2xl border border-indigo-200 bg-white p-6 shadow-lg dark:border-blue-800/50 dark:bg-blue-900/20">
                <h1 className="mb-6 text-center text-3xl font-bold text-indigo-900 dark:text-indigo-100">BookNow</h1>
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => handleMonthChange(-1)}
                        className="rounded-full p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Previous Month"
                    >
                        <svg
                            className="h-5 w-5 text-gray-600 dark:text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </button>
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <button
                        onClick={() => handleMonthChange(1)}
                        className="rounded-full p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Next Month"
                    >
                        <svg
                            className="h-5 w-5 text-gray-600 dark:text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {dayNames.map((day) => (
                        <div
                            key={day}
                            className="py-2 font-medium text-gray-600 dark:text-gray-400"
                        >
                            {day.substring(0, 3)}
                        </div>
                    ))}
                    {getCalendarDays().map((day, index) => {
                        const today = new Date();
                        const isCurrentMonthAndYear =
                            currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                        const isToday = day && isCurrentMonthAndYear && day === today.getDate();
                        const dateKey = day ? formatDateForSchedule(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;

                        const approvedTimeSlotsOnDate = dateKey ? mockDoctorDailySchedules[dateKey]?.filter(slot => slot.maxPatientsPerSlot > 0) : [];
                        
                        const hasAvailability = approvedTimeSlotsOnDate && approvedTimeSlotsOnDate.length > 0;

                        return (
                            <div
                                key={index}
                                className={`relative flex min-h-[70px] cursor-pointer flex-col items-center justify-center rounded-md p-1 transition-all duration-200 ${
                                    day
                                        ? isToday
                                            ? "bg-blue-200 font-bold text-blue-900 ring-2 ring-blue-500 dark:bg-blue-700 dark:text-white dark:ring-blue-300"
                                            : hasAvailability
                                                ? "bg-gray-50 hover:bg-indigo-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-indigo-900/50"
                                                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                        : "bg-gray-100 dark:bg-gray-800"
                                }`}
                                title={
                                    hasAvailability
                                        ? `Available time slots: ${approvedTimeSlotsOnDate.map((entry) => `${entry.doctorName} (${entry.timeStart}-${entry.timeEnd})`).join(", ")}`
                                        : day
                                            ? "No available time slots"
                                            : ""
                                }
                                onClick={() => handleDayClick(day, dateKey)}
                            >
                                <span className="text-lg">{day}</span>
                                {hasAvailability && (
                                    <div className="mt-1 flex space-x-1">
                                        {Array.from(new Set(approvedTimeSlotsOnDate.map((slot) => slot.doctorId)))
                                            .slice(0, 2)
                                            .map((docId) => {
                                                return (
                                                    <span
                                                        key={docId}
                                                        className="h-3 w-3 rounded-full border border-white bg-green-500 dark:border-gray-800 dark:bg-green-600"
                                                        title={mockDoctors.find((d) => d.id === docId)?.name || docId}
                                                    ></span>
                                                );
                                            })}
                                        {Array.from(new Set(approvedTimeSlotsOnDate.map((slot) => slot.doctorId))).length > 2 && (
                                            <span className="flex h-3 w-3 items-center justify-center rounded-full border border-white bg-green-500 text-[8px] text-white dark:border-gray-800 dark:bg-green-600">
                                                +{Array.from(new Set(approvedTimeSlotsOnDate.map((slot) => slot.doctorId))).length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!hasAvailability && day && (
                                    <div className="mt-1 flex">
                                        <span
                                            className="h-3 w-3 rounded-full border border-white bg-red-300 dark:border-gray-800 dark:bg-red-600"
                                            title="No available time slots"
                                        ></span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500 dark:bg-green-600"></span> Doctors/Time Slots Available
                    <span className="ml-4 mr-2 inline-block h-3 w-3 rounded-full bg-red-300 dark:bg-red-600"></span> No Doctors/Time Slots Available
                </p>

                {selectedDateDoctors && currentSelectedDate && selectedDateDoctors.length > 0 && (
                    <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-md dark:border-blue-700 dark:bg-blue-900/30">
                        <h3 className="mb-4 text-xl font-semibold text-blue-800 dark:text-blue-200">
                            Available Time Slots for {new Date(currentSelectedDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        <ul className="space-y-3">
                            {selectedDateDoctors.map((slotEntry) => {
                                const doctorInfo = mockDoctors.find((d) => d.id === slotEntry.doctorId);
                                return doctorInfo ? (
                                    <li
                                        key={slotEntry.timeSlotId}
                                        className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={doctorInfo.image}
                                                alt={doctorInfo.name}
                                                className="mr-3 h-10 w-10 rounded-full object-cover ring-1 ring-indigo-300 dark:ring-indigo-600"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    const avatarBgColor = (
                                                        doctorInfo.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 0xffffff
                                                    )
                                                        .toString(16)
                                                        .padStart(6, "0");
                                                    e.target.src = `https://placehold.co/100x100/${avatarBgColor}/FFFFFF?text=${doctorInfo.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}`;
                                                }}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{slotEntry.doctorName}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{slotEntry.specialty}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {slotEntry.timeStart} - {slotEntry.timeEnd} (Slot #: {slotEntry.maxPatientsPerSlot})
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleSelectDoctorForForm(
                                                    slotEntry.doctorId,
                                                    slotEntry.doctorName,
                                                    slotEntry.timeSlotId,
                                                    slotEntry.timeStart,
                                                    slotEntry.timeEnd,
                                                    currentSelectedDate
                                                )
                                            }
                                            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                        >
                                            Get
                                        </button>
                                    </li>
                                ) : null;
                            })}
                        </ul>
                    </div>
                )}
            </div>
            <AuthFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}

export default CalendarSchedule;