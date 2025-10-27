import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // ✅ import motion
import TreatmentPlan from "./TreatmentPlan";
import PieChartModal from "./PieChartModal";
import NextAppointCard from "./NextAppointCard";
import CalendarSchedule from "./CalendarSchedule";
import EducationGuide from "./EducationGuide";
import FastAction from "./FastAction";
import AvailableDoctor from "./AvailableDoctor";
import BookingForm from "./BookingForm";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans transition-colors duration-500 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mx-auto overflow-hidden rounded-3xl bg-white shadow-xl transition-colors duration-500 dark:bg-gray-800 dark:shadow-2xl"
            >
                <div className="grid grid-cols-1 gap-6 p-4 xs:p-1 2xs:p-1 sm:p-6 lg:grid-cols-3 lg:p-8">
                    <motion.div
                        className="space-y-6 lg:col-span-2"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <PieChartModal />
                        <AvailableDoctor />
                        <NextAppointCard />
                    </motion.div>
                    <motion.div
                        className="space-y-6 lg:col-span-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <CalendarSchedule />
                        <EducationGuide />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardLayout;
