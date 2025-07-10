import React, { useState, useCallback, useMemo, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SchedDisplayContext } from "../../contexts/Schedule/ScheduleContext";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO,
    isToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addDays,
} from "date-fns";

const useIsMobile = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const handleWindowSizeChange = useCallback(() => {
        setWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    }, [handleWindowSizeChange]);

    return width <= 768;
};

const DentalClinicCalendar = () => {
    const { doctor } = useContext(SchedDisplayContext);
    const rawCalendardata = Array.isArray(doctor) ? doctor : [];
    const isMobile = useIsMobile();

    const calendardata = useMemo(() => {
        return rawCalendardata.filter((entry) => entry.status === "Approved" && entry.timeSlots && entry.timeSlots.length > 0);
    }, [rawCalendardata]);

    const [currentMonth, setCurrentMonth] = useState(new Date("2025-06-12T00:00:00.000Z"));

    const groupedAppointments = useMemo(() => {
        const groups = new Map();

        calendardata.forEach((entry) => {
            const entryDate = parseISO(entry.date);
            const dayKey = format(entryDate, "yyyy-MM-dd");

            if (!groups.has(dayKey)) {
                groups.set(dayKey, []);
            }
            entry.timeSlots.forEach((slot) => {
                groups.get(dayKey).push({
                    id: `${entry._id}-${slot._id}`,
                    title: entry.doctorName,
                    specialty: entry.specialty,
                    timeStart: slot.start,
                    timeEnd: slot.end,
                    reason: slot.reason,
                    date: entryDate,
                });
            });
        });

        groups.forEach((appointments) => {
            appointments.sort((a, b) => {
                const timeA = parseISO(`2000-01-01T${a.timeStart}`);
                const timeB = parseISO(`2000-01-01T${b.timeStart}`);
                return timeA.getTime() - timeB.getTime();
            });
        });

        return groups;
    }, [calendardata]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const CalendarEventCard = ({ event }) => {
        const eventColorClass = "bg-blue-600 dark:bg-indigo-700";
        const eventBarColor = "bg-yellow-400 dark:bg-amber-400";
        const eventTextColor = "text-white";

        const safeTitle = event?.title || "Unknown Doctor";
        const safeSpecialty = event?.specialty || "";
        const truncatedTitle = safeTitle.length > (isMobile ? 10 : 15) ? safeTitle.substring(0, isMobile ? 7 : 12) + "..." : safeTitle;

        const formatTimeForCard = (timeStr) => {
            if (!timeStr || typeof timeStr !== "string") return "??";
            const [hours, minutes] = timeStr.split(":");
            const hourNum = parseInt(hours, 10);
            const ampm = hourNum >= 12 ? "p" : "a";
            const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
            return `${formattedHour}:${minutes}${ampm}`;
        };

        return (
            <div
                className={`relative mb-1 overflow-hidden whitespace-nowrap rounded-md py-1 pl-3 text-xs font-semibold sm:text-sm ${eventColorClass} ${eventTextColor} transform transition-opacity duration-200 ease-out hover:scale-[1.01] hover:opacity-90`}
            >
                <div className={`absolute bottom-0 left-0 top-0 w-1 ${eventBarColor}`}></div>
                <span className="ml-1 leading-tight">
                    {formatTimeForCard(event?.timeStart)} - {formatTimeForCard(event?.timeEnd)}{" "}
                    <span className="block font-bold sm:inline">{truncatedTitle}</span>
                    {safeSpecialty && <span className="ml-1 text-[0.7rem] font-normal italic">({safeSpecialty})</span>}
                </span>
            </div>
        );
    };

    const renderHeader = () => (
        <div className="mb-6 rounded-lg bg-white p-4 text-gray-900 shadow-xl dark:bg-gray-800 dark:text-white sm:p-6">
            <div className="mb-4 flex flex-col items-center justify-between md:mb-0 md:flex-row">
                <h1 className="mb-2 text-center text-2xl font-semibold md:mb-0 md:text-left md:text-3xl">Calendar</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                        Home &gt; <span className="font-medium text-blue-600 dark:text-blue-400">Calendar</span>
                    </span>
                </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
                <div className="mb-3 flex items-center space-x-2 md:mb-0 md:space-x-3">
                    <button
                        onClick={handlePrevMonth}
                        className="transform rounded-full bg-gray-200 p-2 text-gray-800 shadow-md transition-colors hover:scale-105 hover:bg-gray-300 hover:shadow-lg dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        aria-label="Previous Month"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                            ></path>
                        </svg>
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="transform rounded-full bg-gray-200 p-2 text-gray-800 shadow-md transition-colors hover:scale-105 hover:bg-gray-300 hover:shadow-lg dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        aria-label="Next Month"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                            ></path>
                        </svg>
                    </button>
                    <button
                        className="transform rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:scale-105 hover:bg-blue-600 hover:shadow-lg"
                        onClick={handleToday}
                    >
                        TODAY
                    </button>
                </div>
                <div className="my-3 flex-grow text-center text-3xl font-extrabold text-blue-700 dark:text-blue-300 md:my-0 md:text-4xl">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={format(currentMonth, "MMMM-yyyy")}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {format(currentMonth, "MMMM yyyy")}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    const renderDaysOfWeek = () => {
        const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return (
            <div className="mb-2 grid grid-cols-7 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="mx-0.5 rounded-md bg-gray-200 py-2.5 shadow-sm dark:bg-gray-700"
                    >
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = [];
        let day = startDate;

        while (day <= endDate) {
            const formattedDate = format(day, "yyyy-MM-dd");
            const dayAppointments = groupedAppointments.get(formattedDate) || [];
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isTodayDay = isToday(day);

            days.push(
                <div
                    key={formattedDate}
                    className={`relative min-h-[100px] rounded-lg p-1.5 shadow-sm sm:min-h-[120px] sm:p-2 lg:min-h-[140px] ${
                        isCurrentMonthDay
                            ? "border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                            : "border border-gray-200 bg-gray-50 opacity-80 dark:border-gray-800 dark:bg-gray-900"
                    } ${
                        isTodayDay ? "border-2 border-blue-500 font-bold ring-2 ring-blue-500 dark:border-blue-400 dark:ring-blue-400" : ""
                    } cursor-pointer transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-gray-700`}
                >
                    <span
                        className={`absolute left-2 top-2 text-sm font-semibold sm:text-base ${isTodayDay ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"} ${!isCurrentMonthDay ? "text-gray-500 dark:text-gray-400" : ""}`}
                    >
                        {format(day, "d")}
                    </span>

                    <div className="scrollbar-hide mt-7 max-h-[85px] space-y-1 overflow-y-auto sm:mt-9 sm:max-h-[100px] lg:max-h-[120px]">
                        {dayAppointments.map((event) => (
                            <CalendarEventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                </div>,
            );
            day = addDays(day, 1);
        }

        return <div className="grid grid-cols-7 gap-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800 sm:gap-2">{days}</div>;
    };

    return (
        <motion.div
            className="mx-auto min-h-screen w-full max-w-full bg-gray-100 p-2 font-sans text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:p-4 lg:max-w-[1200px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {renderHeader()}
            {renderDaysOfWeek()}
            {renderCells()}
        </motion.div>
    );
};

export default DentalClinicCalendar;
