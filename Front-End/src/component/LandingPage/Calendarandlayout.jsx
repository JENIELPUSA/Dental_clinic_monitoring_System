import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CalendarSchedule from "./CalendarSchedule";

const Calendarandlayout = () => {
    // State logic remains unchanged
    const [date, setDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [showTimeSlots, setShowTimeSlots] = useState(false);

    useEffect(() => {
        renderCalendar();
    }, [date]);

    const renderCalendar = () => {
        const firstDayIndex = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

        const days = [];

        for (let i = firstDayIndex === 0 ? 6 : firstDayIndex - 1; i > 0; i--) {
            days.push({ day: prevLastDay - i + 1, type: "prev" });
        }
        for (let i = 1; i <= lastDay; i++) {
            days.push({ day: i, type: "current" });
        }

        setCalendarDays(days);
    };

    // Motion Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    };

    return (
        <div className="flex min-h-screen flex-col items-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 font-sans">
            {/* Header */}
            <motion.div
                className="mb-6 w-full max-w-4xl text-center sm:mb-8 md:mb-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                <h1 className="mb-2 text-2xl font-extrabold text-indigo-900 sm:text-3xl md:text-4xl lg:text-5xl">
                    <span className="bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent">
                        Book Your Dental Appointment
                    </span>
                </h1>
                <p className="text-sm text-gray-200 sm:text-base md:text-lg">
                    Easily schedule your next visit with our online booking system.
                </p>
            </motion.div>

            {/* Main Content Card */}
            <motion.div
                className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl sm:shadow-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                <div className="flex flex-col lg:flex-row">
                    {/* Left: Clinic Info */}
                    <motion.div
                        className="w-full bg-gradient-to-b from-white to-blue-50 p-5 sm:p-6 md:p-8 lg:w-2/5 lg:p-10"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.1 } }}
                        viewport={{ once: true }}
                    >
                        <div className="mb-5 sm:mb-6">
                            <div className="mb-3 flex items-center">
                                <div className="mr-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 sm:h-12 sm:w-12">
                                    <span className="text-xl text-white sm:text-2xl">🦷</span>
                                </div>
                                <h1 className="text-xl font-bold text-indigo-900 sm:text-2xl">Dental Clinic</h1>
                            </div>
                            <h2 className="mb-3 text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
                                Book Your Dental Appointment
                            </h2>
                            <p className="text-xs text-gray-600 sm:text-sm md:text-base">
                                Welcome to our dental clinic! We offer a full range of services for your dental health.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-gray-800 sm:text-base">Our Services:</h3>
                            <ul className="space-y-1.5 sm:space-y-2">
                                {[
                                    "Regular Check-ups",
                                    "Teeth Cleaning",
                                    "Cosmetic Dentistry",
                                    "Orthodontics"
                                ].map((service, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="mt-0.5 mr-2 text-green-500">✓</span>
                                        <span className="text-xs text-gray-700 sm:text-sm">{service}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right: Calendar */}
                    <motion.div
                        className="flex w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 sm:p-6 md:p-8 lg:w-3/5"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.2 } }}
                        viewport={{ once: true }}
                    >
                        <div className="w-full max-w-md">
                            <CalendarSchedule />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Calendarandlayout;