import { useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { CheckCircle, Clock, FileText, Pill, Stethoscope, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Copy, XCircle } from "lucide-react";
import { TrackingDisplayContext } from "../../contexts/TrackProcessContext/TrackProcessContext";

const steps = [
  { id: 1, label: "Appointment", icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: 2, label: "Confirmation", icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: 3, label: "Treatment", icon: <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: 4, label: "Prescription", icon: <Pill className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: 5, label: "Completed", icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { id: 6, label: "Payment", icon: <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" /> },
];

const getStatusColor = (step, currentStep, isFullyCompleted) => {
  if (isFullyCompleted && step.id === 6) return "bg-green-500 text-white shadow-md";
  if (step.id < currentStep) return "bg-green-500 text-white shadow-md";
  if (step.id === currentStep) return "bg-blue-500 text-white ring-2 ring-blue-300";
  return "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
};

const ITEMS_PER_PAGE = 5;

const ProgressOverview = ({ isOpen, onClose }) => {
  const { role, linkId } = useContext(AuthContext);
  const { inventory } = useContext(TrackingDisplayContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const appointments = useMemo(() => {
    return inventory
      .filter((item) => role.toLowerCase() === "doctor" ? item.appointmentInfo?.doctor_id === linkId : true)
      .map((item) => ({
        _id: item._id || item.appointmentId,
        appointmentId: item.appointmentId,
        currentStep: item.currentStep || 1,
        overallStatus: item.overallStatus || "Pending",
      }));
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md sm:max-w-2xl h-[85vh] rounded-xl bg-white shadow-2xl dark:bg-gray-800 flex flex-col"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                Appointment Progress Tracking
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Close progress view"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
                {appointments.length === 0 ? (
                  <motion.div
                    className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FileText className="mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">No appointments found</h3>
                    <p className="mt-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                      There are no appointments to display at the moment.
                    </p>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto p-3 space-y-3">
                      {currentAppointments.map((appt) => (
                        <motion.div
                          key={appt._id}
                          className="rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div
                            className="flex cursor-pointer flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3"
                            onClick={() => toggleExpand(appt.appointmentId)}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-blue-500 text-white sm:h-12 sm:w-12">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="min-w-0">
                                <h2 className="text-sm sm:text-base text-gray-500">Appointment ID</h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="max-w-[150px] sm:max-w-xs truncate text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">
                                    {appt.appointmentId}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(appt.appointmentId, appt._id);
                                    }}
                                    className="flex-shrink-0 text-gray-500 transition-colors hover:text-blue-600"
                                    title="Copy Appointment ID"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                  {copiedId === appt._id && (
                                    <span className="flex-shrink-0 whitespace-nowrap text-sm text-green-500">Copied!</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-shrink-0 items-center gap-3 mt-2 sm:mt-0">
                              <div className="text-right text-sm">
                                <p className="text-gray-500">Progress</p>
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                  {appt.currentStep}/{steps.length}
                                </p>
                              </div>
                              {expandedId === appt.appointmentId ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedId === appt.appointmentId && (
                              <motion.div
                                className="px-4 pb-3"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 overflow-x-auto">
                                  <div className="inline-flex min-w-max items-center gap-4">
                                    {steps.map((step, index) => {
                                      const validStep = Math.min(appt.currentStep || 1, 6);
                                      const isCompleted = validStep === 6 && appt.overallStatus?.toLowerCase() === "completed";
                                      const effective = isCompleted ? 6 : validStep;

                                      return (
                                        <div key={step.id} className="relative flex flex-col items-center">
                                          <motion.div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${getStatusColor(step, effective, isCompleted)}`}
                                            whileHover={{ scale: 1.1 }}
                                          >
                                            {step.icon}
                                          </motion.div>
                                          <p className={`mt-1 text-center text-xs sm:text-sm font-medium ${step.id <= effective ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                                            {step.label}
                                          </p>
                                          {index !== steps.length - 1 && (
                                            <div className={`absolute left-full top-4 h-[2px] w-5 ${step.id < effective ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}></div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>

                    {appointments.length > 0 && totalPages > 1 && (
                      <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm sm:px-3 sm:py-1 sm:text-sm font-medium transition-colors ${
                            currentPage === 1 ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700" : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <span className="text-sm sm:text-base">{currentPage} / {totalPages}</span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm sm:px-3 sm:py-1 sm:text-sm font-medium transition-colors ${
                            currentPage === totalPages ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700" : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          Next <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressOverview;
