import React, { useState, useEffect, useContext } from "react";
import { CalendarSync, Ban, CalendarCheck,User } from "lucide-react";
import { SchedDisplayContext } from "../../contexts/Schedule/ScheduleContext";
import Schdedule from "../Schedule/Schedule";
import { AuthContext } from "../../contexts/AuthContext";

const DoctorTable = () => {
    const { doctor, UpdateSchedData, Deletedata } = useContext(SchedDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    // State for "From" and "To" dates for the specific schedule date
    const [fromSpecificDate, setFromSpecificDate] = useState("");
    const [toSpecificDate, setToSpecificDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isScheduleModal, setScheduleModal] = useState(false);
    const [isScheduleData, setScheduleData] = useState("");
    const { role } = useContext(AuthContext);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US");
    };

    const getStatusBadge = (status) => {
        let badgeClasses = "px-2 py-1 rounded-full text-xs font-semibold text-white ";

        switch (status?.toLowerCase()) {
            case "pending":
                badgeClasses += "bg-yellow-500";
                break;
            case "approved":
                badgeClasses += "bg-green-500";
                break;
            case "re-assigned":
                badgeClasses += "bg-orange-500";
                break;
            case "cancelled":
                badgeClasses += "bg-red-500";
                break;
            default:
                badgeClasses += "bg-gray-500";
                break;
        }

        return <span className={badgeClasses}>{status || "N/A"}</span>;
    };

    const filteredSchedules =
        doctor?.filter((schedule) => {
            if (!schedule) return false;
            const searchLower = searchTerm.toLowerCase();

            const matchesDoctorName = schedule.doctorName?.toLowerCase().includes(searchLower);
            const matchesDay = schedule.day?.toLowerCase().includes(searchLower);
            const matchesTimeSlot =
                Array.isArray(schedule.timeSlots) &&
                schedule.timeSlots.some(
                    (slot) =>
                        slot.start?.includes(searchLower) ||
                        slot.end?.includes(searchLower) ||
                        // Removed slot.date from text search as it will be handled by specific date filter
                        String(slot.maxPatients).includes(searchLower),
                );

            // Date filtering logic for the specific schedule date (sch.date)
            let specificDateMatches = true;
            if (schedule.date) {
                // Only apply if a specific date exists for the schedule
                const scheduleSpecificDate = new Date(schedule.date);
                if (fromSpecificDate) {
                    const from = new Date(fromSpecificDate);
                    from.setHours(0, 0, 0, 0); // Set to start of the day
                    specificDateMatches = specificDateMatches && scheduleSpecificDate >= from;
                }
                if (toSpecificDate) {
                    const to = new Date(toSpecificDate);
                    to.setHours(23, 59, 59, 999); // Set to end of the day
                    specificDateMatches = specificDateMatches && scheduleSpecificDate <= to;
                }
            } else if (fromSpecificDate || toSpecificDate) {
                // If filters are set but schedule.date is N/A, it doesn't match
                specificDateMatches = false;
            }

            return (matchesDoctorName || matchesDay || matchesTimeSlot) && specificDateMatches;
        }) || [];

    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSchedules = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromSpecificDate, toSpecificDate]); // Update dependency array

    const handleEditSchedule = (schedule) => {
        setScheduleModal(true);
        setScheduleData(schedule);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        await Deletedata(scheduleId);
    };

    const handleApprovedSchedule = async (scheduleId, statusData) => {
        const status = "Approved";
        await UpdateSchedData(scheduleId, status);
    };

    const handleCancelSchedule = async (scheduleId) => {
        const status = "Cancelled";
        await UpdateSchedData(scheduleId, status);
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Doctor Schedules</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search schedules..."
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* From Specific Date Filter */}
                    <div className="relative">
                        <label
                            htmlFor="fromSpecificDate"
                            className="sr-only"
                        >
                            From Specific Date
                        </label>
                        <input
                            type="date"
                            id="fromSpecificDate"
                            value={fromSpecificDate}
                            onChange={(e) => setFromSpecificDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-48"
                            title="Filter from specific schedule date"
                        />
                    </div>

                    {/* To Specific Date Filter */}
                    <div className="relative">
                        <label
                            htmlFor="toSpecificDate"
                            className="sr-only"
                        >
                            To Specific Date
                        </label>
                        <input
                            type="date"
                            id="toSpecificDate"
                            value={toSpecificDate}
                            onChange={(e) => setToSpecificDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-48"
                            title="Filter to specific schedule date"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                            {role !== "doctor" && (
                                <>
                                    <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Avatar</th>
                                    <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Doctor</th>
                                    <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Specialty</th>
                                </>
                            )}
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Day (Specific Date)</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Time Slots & Max Patients</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Created On</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Reason</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Status</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSchedules.length > 0 ? (
                            currentSchedules.map((sch, index) => (
                                <tr
                                    key={sch._id || `schedule-${index}`}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    {role !== "doctor" && (
                                        <>
                                            <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {sch.avatar ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${sch.avatar.replace("\\", "/")}`}
                                                        alt={`${sch.doctorName} Avatar`}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {sch.doctorName || "N/A"}
                                            </td>
                                            <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {sch.specialty || "N/A"}
                                            </td>
                                        </>
                                    )}
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {sch.day || "N/A"} {sch.date && `(${formatDate(sch.date)})`}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {Array.isArray(sch.timeSlots) && sch.timeSlots.length > 0
                                            ? sch.timeSlots.map((slot, i) => (
                                                  <div key={i}>
                                                      {slot.start} - {slot.end} ({slot.maxPatientsPerSlot} pts)
                                                  </div>
                                              ))
                                            : "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(sch.createdAt)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {Array.isArray(sch.timeSlots) && sch.timeSlots.length > 0
                                            ? sch.timeSlots.map((slot, i) => <div key={i}>{slot.reason}</div>)
                                            : "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {getStatusBadge(sch.status || "N/A")}
                                    </td>
                                    <td className="align-center bg-transparent p-3">
                                        <div className="flex gap-2">
                                            {sch.status !== "Re-Assigned" && sch.status !== "Approved" && sch.status !== "Cancelled" && (
                                                <button
                                                    onClick={() => handleEditSchedule(sch)}
                                                    className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                    title="Edit Schedule"
                                                >
                                                    <CalendarSync className="h-4 w-4" />
                                                </button>
                                            )}

                                            {sch.status !== "Cancelled" && sch.status !== "Approved" && (
                                                <button
                                                    onClick={() => handleCancelSchedule(sch._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    title="Cancel Schedule"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            )}

                                            {sch.status !== "Approved" &&
                                                sch.status !== "Cancelled" &&
                                                !(role === "doctor" && sch.status === "Re-Assigned") && (
                                                    <button
                                                        onClick={() => handleApprovedSchedule(sch._id)}
                                                        className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-green-500/10 dark:text-blue-300 dark:hover:bg-green-300/10"
                                                        title="Approve Schedule"
                                                    >
                                                        <CalendarCheck className="h-4 w-4" />
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No schedules found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredSchedules.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSchedules.length)} of {filteredSchedules.length}{" "}
                            entries
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                                className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200"
                            >
                                «
                            </button>
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200"
                            >
                                ‹
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`rounded border px-3 py-1 ${currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"} dark:border-blue-800/50`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200"
                            >
                                ›
                            </button>
                            <button
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                                className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Schdedule
                isOpen={isScheduleModal}
                onClose={() => setScheduleModal(false)}
                selectedScheduleId={isScheduleData}
            />
        </div>
    );
};

export default DoctorTable;
