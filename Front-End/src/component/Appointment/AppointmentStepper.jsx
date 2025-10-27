import { useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { CheckCircle, Clock, FileText, Pill, Stethoscope, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { TrackingDisplayContext } from "../../contexts/TrackProcessContext/TrackProcessContext";

const steps = [
    { id: 1, label: "Appointment", icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 2, label: "Confirmation", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 3, label: "Treatment", icon: <Stethoscope className="h-3.5 w-3.5" /> },
    { id: 4, label: "Prescription", icon: <Pill className="h-3.5 w-3.5" /> },
    { id: 5, label: "Completed", icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { id: 6, label: "Payment", icon: <DollarSign className="h-3.5 w-3.5" /> },
];

const getStatusColor = (step, currentStep, isFullyCompleted) => {
    if (isFullyCompleted && step.id === 6) return "bg-green-500 text-white shadow-sm";
    if (step.id < currentStep) return "bg-green-500 text-white shadow-sm";
    if (step.id === currentStep) return "bg-blue-500 text-white ring-2 ring-blue-300";
    return "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
};

const ITEMS_PER_PAGE = 5;

const DisplayAppointmentsStepper = () => {
    const { role, linkId } = useContext(AuthContext);
    const { inventory } = useContext(TrackingDisplayContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    console.log("inventory", inventory);

    const appointments = useMemo(() => {
        return (
            inventory
                // If role is doctor, only include items assigned to them
                .filter((item) => {
                    if (role.toLowerCase() === "doctor") {
                        return item.appointmentInfo?.doctor_id === linkId;
                    }
                    return true; // other roles see all
                })
                // Map to stepper-friendly structure
                .map((item) => ({
                    _id: item._id || item.appointmentId,
                    appointmentId: item.appointmentId,
                    currentStep: item.currentStep || 1,
                    overallStatus: item.overallStatus || "Pending",
                }))
        );
    }, [inventory, role, linkId]);

    const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentAppointments = appointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    return (
        <div className="h-full min-h-0 bg-gray-50 p-1 dark:bg-gray-900 sm:p-3">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
                {/* Main Content Area - Scrollable */}
                <div className="min-h-0 flex-1 overflow-auto">
                    {appointments.length === 0 ? (
                        <motion.div
                            className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 xs:py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <FileText className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500 xs:h-12 xs:w-12" />
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 xs:text-base">No appointments found</h3>
                            <p className="mt-1 px-4 text-xs text-gray-500 dark:text-gray-400 xs:text-sm">
                                There are no appointments to display at the moment.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3 pb-2">
                            {currentAppointments.map((appt) => (
                                <motion.div
                                    key={appt._id}
                                    className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {/* Header */}
                                    <div
                                        className="flex cursor-pointer items-center justify-between p-3"
                                        onClick={() => toggleExpand(appt.appointmentId)}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-500 text-white">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex min-w-0 items-center gap-1">
                                                <div className="min-w-0">
                                                    <h2 className="text-[11px] text-gray-500 xs:text-xs">Appointment ID</h2>
                                                    <div className="flex items-center gap-1">
                                                        <p className="max-w-[120px] truncate text-sm font-semibold text-gray-800 dark:text-gray-100 xs:max-w-[150px] sm:max-w-none">
                                                            {appt.appointmentId}
                                                        </p>
                                                        {/* Copy Icon */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(appt.appointmentId, appt._id);
                                                            }}
                                                            className="flex-shrink-0 text-gray-400 transition-colors hover:text-blue-500"
                                                            title="Copy Appointment ID"
                                                        >
                                                            <Copy className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                                                        </button>
                                                        {copiedId === appt._id && (
                                                            <span className="flex-shrink-0 whitespace-nowrap text-xs text-green-500">Copied!</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 items-center gap-3">
                                            <div className="text-right text-xs">
                                                <p className="text-gray-500">Progress</p>
                                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                                    {appt.currentStep}/{steps.length}
                                                </p>
                                            </div>
                                            {expandedId === appt.appointmentId ? (
                                                <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-600" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Stepper */}
                                    <AnimatePresence>
                                        {expandedId === appt.appointmentId && (
                                            <motion.div
                                                className="px-3 pb-3"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                                                    <div className="overflow-x-auto">
                                                        <div className="inline-flex min-w-max items-center">
                                                            {steps.map((step, index) => {
                                                                const validStep = Math.min(appt.currentStep || 1, 6);
                                                                const isCompleted =
                                                                    validStep === 6 && appt.overallStatus?.toLowerCase() === "completed";
                                                                const effective = isCompleted ? 6 : validStep;

                                                                return (
                                                                    <div
                                                                        key={step.id}
                                                                        className="relative flex flex-col items-center px-1"
                                                                    >
                                                                        <motion.div
                                                                            className={`flex h-7 w-7 items-center justify-center rounded-full xs:h-8 xs:w-8 ${getStatusColor(
                                                                                step,
                                                                                effective,
                                                                                isCompleted,
                                                                            )}`}
                                                                            whileHover={{ scale: 1.05 }}
                                                                        >
                                                                            {step.icon}
                                                                        </motion.div>
                                                                        <p
                                                                            className={`mt-1 max-w-[60px] text-center text-[10px] font-medium xs:max-w-none xs:text-xs ${
                                                                                step.id <= effective
                                                                                    ? "text-gray-800 dark:text-gray-100"
                                                                                    : "text-gray-500 dark:text-gray-400"
                                                                            }`}
                                                                        >
                                                                            {step.label}
                                                                        </p>
                                                                        {index !== steps.length - 1 && (
                                                                            <div
                                                                                className={`absolute left-full top-3.5 h-[1.5px] w-4 xs:top-4 xs:w-6 ${
                                                                                    step.id < effective
                                                                                        ? "bg-green-500"
                                                                                        : "bg-gray-300 dark:bg-gray-700"
                                                                                }`}
                                                                            ></div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination - Fixed at bottom */}
                {appointments.length > 0 && totalPages > 1 && (
                    <div className="mt-2 flex flex-shrink-0 items-center justify-center gap-3 border-t border-gray-200 pb-1 pt-3 dark:border-gray-700">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                currentPage === 1
                                    ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                        >
                            <ChevronLeft className="h-3 w-3" /> Prev
                        </button>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                            Page {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                        >
                            Next <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayAppointmentsStepper;
