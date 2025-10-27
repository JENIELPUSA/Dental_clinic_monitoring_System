import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import TreatmentPlan from "./TreatmentPlan";
import PieChartModal from "./PieChartModal";
import NextAppointCard from "./NextAppointCard";
import CalendarSchedule from "./CalendarSchedule";
import EducationGuide from "./EducationGuide";
import FastAction from "./FastAction";
import AvailableDoctor from "./AvailableDoctor";
import BookingForm from "./BookingForm";
import ProgressOverview from "../DoctorDashboard/ProgressOverview";

const DashboardLayout = () => {
    const [showProgress, setShowProgress] = useState(false);

    // Floating Progress Button Component
    const FloatingProgressButton = () => {
        return (
            <motion.button
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProgress(true)}
                aria-label="View Progress Statistics"
            >
                <BarChart3 size={24} className="text-white" />
            </motion.button>
        );
    };

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
                        className="space-y-6 2xs:space-y-0 xs:space-y-0  lg:col-span-2"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <PieChartModal />
                        <AvailableDoctor />
                        <NextAppointCard />
                    </motion.div>
                    <motion.div
                        className="space-y-6 xs:space-y-2 2xs:space-y-2  lg:col-span-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <CalendarSchedule />
                        <EducationGuide />
                    </motion.div>
                </div>
            </motion.div>

            {/* Floating Progress Button */}
            <FloatingProgressButton />

            {/* Progress Overview Modal */}
            <ProgressOverview 
                isOpen={showProgress}
                onClose={() => setShowProgress(false)}
            />
        </div>
    );
};

export default DashboardLayout;