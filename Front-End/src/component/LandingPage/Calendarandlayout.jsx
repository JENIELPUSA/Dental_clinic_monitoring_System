import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CalendarSchedule from "./CalendarSchedule";

const Calendarandlayout = () => {
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
            days.push({
                day: i,
                type: "current",
            });
        }

        setCalendarDays(days);
    };

    // Motion Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans md:p-8">
            {/* Header with improved design */}
            <motion.div
                className="mb-8 w-full max-w-6xl text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                <h1 className="mb-2 text-3xl font-extrabold text-indigo-900 md:text-5xl">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        Book Your Dental Appointment
                    </span>
                </h1>
                <p className="text-md text-gray-700 md:text-lg">
                    Easily schedule your next visit with our online booking system.
                </p>
            </motion.div>

            {/* Main content container */}
            <motion.div
                className="container mx-auto flex max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex-row"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                {/* Left Section: Clinic Info */}
                <motion.div
                    className="flex w-full flex-col justify-center bg-gradient-to-b from-white to-blue-50 p-8 md:p-10 lg:w-2/5 lg:p-12"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0, transition: { duration: 0.8 } }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="mb-6">
                        <div className="mb-4 flex items-center">
                            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
                                <span className="text-2xl text-white">🦷</span>
                            </div>
                            <h1 className="text-3xl font-bold text-indigo-900">Dental Clinic</h1>
                        </div>
                        <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-800 md:text-3xl">
                            Book Your Dental Clinic Appointment
                        </h2>
                        <p className="text-md mb-6 text-gray-600">
                            Welcome to our dental clinic! We offer a full range of services for your dental health.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="mb-3 text-lg font-semibold text-gray-800">Our Services:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span>
                                <span>Regular Check-ups</span>
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span>
                                <span>Teeth Cleaning</span>
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span>
                                <span>Cosmetic Dentistry</span>
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span>
                                <span>Orthodontics</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>

                {/* Right Section: Calendar */}
                <motion.div
                    className="flex w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 md:p-8 lg:w-3/5 lg:p-10"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0, transition: { duration: 0.8 } }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <CalendarSchedule />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Calendarandlayout;
