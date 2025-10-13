import React, { useState, useEffect, useContext } from "react";
import { CalendarSync, Ban, CalendarCheck, User } from "lucide-react";
import { SchedDisplayContext } from "../../contexts/Schedule/ScheduleContext";
import Schdedule from "../Schedule/Schedule";
import { AuthContext } from "../../contexts/AuthContext";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
        {/* 10 columns to match header count */}
        {[...Array(10)].map((_, i) => (
            <td
                key={i}
                className="border px-3 py-3"
            >
                <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
            </td>
        ))}
    </tr>
);

const DoctorTable = () => {
    const { doctor, UpdateSchedData, Deletedata, fetchSchedData, currentPage, setCurrentPage, TotalSchedule, isTotalPages, loading } =
        useContext(SchedDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 1000);
    const [fromSpecificDate, setFromSpecificDate] = useState("");
    const [toSpecificDate, setToSpecificDate] = useState("");
    const [isScheduleModal, setScheduleModal] = useState(false);
    const [isScheduleData, setScheduleData] = useState("");
    const { role } = useContext(AuthContext);

    // Ensure isTotalPages is treated as a number
    const totalPages = Number(isTotalPages) || 0;

    // Fetch from server on any filter or page change (uses debounced search)
    useEffect(() => {
        fetchSchedData({
            page: currentPage,
            search: debouncedSearchTerm || undefined,
            from: fromSpecificDate || undefined,
            to: toSpecificDate || undefined,
        });
    }, [currentPage, debouncedSearchTerm, fromSpecificDate, toSpecificDate, fetchSchedData]);

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

    const handleEditSchedule = (schedule) => {
        setScheduleModal(true);
        setScheduleData(schedule);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        await Deletedata(scheduleId);
        fetchSchedData({
            page: currentPage,
            search: debouncedSearchTerm || undefined,
            from: fromSpecificDate || undefined,
            to: toSpecificDate || undefined,
        });
    };

    const handleApprovedSchedule = async (scheduleId) => {
        await UpdateSchedData(scheduleId, "Approved");
        fetchSchedData({
            page: currentPage,
            search: debouncedSearchTerm || undefined,
            from: fromSpecificDate || undefined,
            to: toSpecificDate || undefined,
        });
    };

    const handleCancelSchedule = async (scheduleId) => {
        await UpdateSchedData(scheduleId, "Cancelled");
        fetchSchedData({
            page: currentPage,
            search: debouncedSearchTerm || undefined,
            from: fromSpecificDate || undefined,
            to: toSpecificDate || undefined,
        });
    };

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleFromChange = (e) => {
        setFromSpecificDate(e.target.value);
        setCurrentPage(1);
    };

    const handleToChange = (e) => {
        setToSpecificDate(e.target.value);
        setCurrentPage(1);
    };

    const itemsPerPage = 5;
    const startEntry = TotalSchedule > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, TotalSchedule);

    // Generate pagination buttons with ellipsis
    const renderPaginationItems = () => {
        const maxVisible = 5;
        const pages = [];

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("ellipsis-end");
            } else if (currentPage >= totalPages - 2) {
                pages.push("ellipsis-start");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push("ellipsis-start");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("ellipsis-end");
            }
        }

        return pages.map((page, idx) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                    <span
                        key={`${page}-${idx}`}
                        className="px-2 py-1 text-blue-800 dark:text-blue-200"
                    >
                        ...
                    </span>
                );
            }

            return (
                <button
                    key={idx}
                    onClick={() => paginate(page)}
                    className={`rounded border px-3 py-1 ${
                        currentPage === page ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"
                    } dark:border-blue-800/50`}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Doctor Schedules</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search schedules..."
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-64"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type="date"
                            value={fromSpecificDate}
                            onChange={handleFromChange}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                            title="Filter from specific schedule date"
                        />
                    </div>

                    <div className="relative">
                        <input
                            type="date"
                            value={toSpecificDate}
                            onChange={handleToChange}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
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
                        {loading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : doctor && doctor.length > 0 ? (
                            doctor.map((sch, index) => (
                                <tr
                                    key={sch._id || `schedule-${index}`}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    {role !== "doctor" && (
                                        <>
                                            <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {sch.avatar ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${sch.avatar.replace(/\\/g, "/")}`}
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
                                        {sch.date && new Date(sch.date) >= new Date() && (
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
                                                            className="rounded bg-transparent p-1.5 text-green-600 hover:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-300/10"
                                                            title="Approve Schedule"
                                                        >
                                                            <CalendarCheck className="h-4 w-4" />
                                                        </button>
                                                    )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={role !== "doctor" ? 10 : 7}
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No schedules found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {!loading && totalPages > 1 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                            <span className="font-medium">{TotalSchedule}</span> entries
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

                            {renderPaginationItems()}

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
