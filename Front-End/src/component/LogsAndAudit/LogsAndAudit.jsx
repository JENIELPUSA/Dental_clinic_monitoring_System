import React, { useState, useEffect, useMemo, useContext } from "react";
import { LogsDisplayContext } from "../../contexts/LogsAndAudit/LogsAndAudit";

const LogsAndAudit = () => {
    const {
        isLogs,
        isTotalPages,
        currentPage,
        isTotalLogs,
        loading,
        fetchLogsData,
        setCurrentPage,
    } = useContext(LogsDisplayContext);

    const [expandedLog, setExpandedLog] = useState(null);
    const [filterActionType, setFilterActionType] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchLogsData({
            page: currentPage,
            action_type: filterActionType === "All" ? undefined : filterActionType,
            from: startDate || undefined,
            to: endDate || undefined,
        });
    }, [currentPage, filterActionType, startDate, endDate, fetchLogsData]);

    const handleFilterChange = (event) => {
        setFilterActionType(event.target.value);
        setCurrentPage(1);
        setExpandedLog(null);
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
        setCurrentPage(1);
        setExpandedLog(null);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
        setCurrentPage(1);
        setExpandedLog(null);
    };

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= (isTotalPages || 1)) {
            setCurrentPage(pageNumber);
            setExpandedLog(null);
        }
    };

    const toggleExpand = (log) => {
        setExpandedLog(expandedLog && expandedLog._id === log._id ? null : log);
    };

    const formatTimestamp = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    const uniqueActionTypes = useMemo(() => {
        const types = new Set((isLogs || []).map((log) => log.action_type));
        return ["All", ...Array.from(types).sort()];
    }, [isLogs]);

    const itemsPerPage = 6;
    const startEntry = isTotalLogs > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, isTotalLogs || 0);

    // Determine if we should show mobile view (you can adjust breakpoint)
    const isMobile = window.innerWidth < 640; // or use a custom hook if needed

    return (
        <div className="min-h-screen font-sans">
            <div className="mx-auto max-w-7xl rounded-2xl p-4 sm:p-6 shadow-md dark:border dark:border-blue-800/50">
                <h1 className="mb-4 border-b-2 pb-2 text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200">
                    Logs and Audit Trail
                </h1>

                {/* Filters */}
                <div className="mb-4 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-gray-600 dark:text-blue-200">
                        Total Results: <span className="font-semibold">{isTotalLogs || 0}</span>
                    </p>

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        {/* Action Type Filter */}
                        <div className="w-full sm:w-auto">
                            <label htmlFor="actionTypeFilter" className="sr-only sm:not-sr-only text-sm font-medium text-blue-800 dark:text-blue-200 mb-1 block">
                                Filter by Action Type:
                            </label>
                            <select
                                id="actionTypeFilter"
                                className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                value={filterActionType}
                                onChange={handleFilterChange}
                            >
                                {uniqueActionTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="w-full space-y-2 sm:w-auto sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                            <div className="flex items-center gap-1">
                                <label htmlFor="startDate" className="sr-only sm:not-sr-only text-sm font-medium text-blue-800 dark:text-blue-200">
                                    From:
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="w-full rounded-md border border-blue-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    max={endDate || undefined}
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <label htmlFor="endDate" className="sr-only sm:not-sr-only text-sm font-medium text-blue-800 dark:text-blue-200">
                                    To:
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="w-full rounded-md border border-blue-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    min={startDate || undefined}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading & Empty States */}
                {loading ? (
                    <div className="py-6 text-center text-blue-800 dark:text-blue-200">Loading logs...</div>
                ) : Array.isArray(isLogs) && isLogs.length > 0 ? (
                    <>
                        {/* Desktop Table — hidden on mobile */}
                        <div className="hidden sm:block overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                            <table className="w-full text-sm dark:border-blue-800/50">
                                <thead>
                                    <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                                        <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action Type</th>
                                        <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Module</th>
                                        <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Description</th>
                                        <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Performed By</th>
                                        <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Role</th>
                                        <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLogs.map((log) => (
                                        <React.Fragment key={log._id}>
                                            <tr
                                                className="cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                                onClick={() => toggleExpand(log)}
                                            >
                                                <td className="border px-3 py-2">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                                                        log.action_type === "DELETE" ? "bg-red-100 text-red-800" :
                                                        log.action_type === "CREATE" ? "bg-green-100 text-green-800" :
                                                        log.action_type === "UPDATE" ? "bg-blue-100 text-blue-800" :
                                                        "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {log.action_type}
                                                    </span>
                                                </td>
                                                <td className="border px-3 py-2 text-blue-800 dark:text-blue-300">{log.module}</td>
                                                <td className="max-w-xs break-words border px-3 py-2 text-blue-800 dark:text-blue-300">{log.description}</td>
                                                <td className="border px-3 py-2 text-blue-800 dark:text-blue-300">{log.performed_by_name || "N/A"}</td>
                                                <td className="border px-3 py-2 text-blue-800 dark:text-blue-300">{log.role || "N/A"}</td>
                                                <td className="border px-3 py-2 text-blue-800 dark:text-blue-300">{formatTimestamp(log.timestamp)}</td>
                                            </tr>
                                            {expandedLog && expandedLog._id === log._id && (
                                                <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                                                    <td colSpan="6" className="px-6 py-4 text-sm text-blue-800 dark:text-blue-300">
                                                        <ExpandedLogDetails log={log} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View — shown on small screens */}
                        <div className="sm:hidden space-y-3">
                            {isLogs.map((log) => (
                                <div
                                    key={log._id}
                                    className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                log.action_type === "DELETE" ? "bg-red-100 text-red-800" :
                                                log.action_type === "CREATE" ? "bg-green-100 text-green-800" :
                                                log.action_type === "UPDATE" ? "bg-blue-100 text-blue-800" :
                                                "bg-gray-100 text-gray-800"
                                            }`}>
                                                {log.action_type}
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-blue-800 dark:text-blue-200">{log.module}</p>
                                            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 line-clamp-2">{log.description}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(log)}
                                            className="text-blue-600 dark:text-blue-300 text-sm font-medium"
                                        >
                                            {expandedLog && expandedLog._id === log._id ? "Less" : "More"}
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                                        <p>By: {log.performed_by_name || "N/A"} • {log.role || "N/A"}</p>
                                        <p>{formatTimestamp(log.timestamp)}</p>
                                    </div>

                                    {expandedLog && expandedLog._id === log._id && (
                                        <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800/30">
                                            <ExpandedLogDetails log={log} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-6 text-center text-blue-800 dark:text-blue-200">
                        No audit logs available with the current filters.
                    </div>
                )}

                {/* Pagination */}
                {!loading && isTotalPages > 1 && (
                    <nav className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 text-center sm:text-left">
                            Showing <span className="font-medium">{startEntry}</span> to{" "}
                            <span className="font-medium">{endEntry}</span> of{" "}
                            <span className="font-medium">{isTotalLogs || 0}</span> entries
                        </div>
                        <div className="flex flex-wrap justify-center gap-1">
                            <PaginationButton onClick={() => paginate(1)} disabled={currentPage === 1} label="«" />
                            <PaginationButton onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} label="‹" />

                            {Array.from({ length: Math.min(5, isTotalPages) }, (_, i) => {
                                let pageNum;
                                if (isTotalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= isTotalPages - 2) {
                                    pageNum = isTotalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <PaginationButton
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        active={currentPage === pageNum}
                                        label={pageNum}
                                    />
                                );
                            })}

                            <PaginationButton onClick={() => paginate(currentPage + 1)} disabled={currentPage === isTotalPages} label="›" />
                            <PaginationButton onClick={() => paginate(isTotalPages)} disabled={currentPage === isTotalPages} label="»" />
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};

// Reusable components for cleaner JSX
const ExpandedLogDetails = ({ log }) => (
    <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
            <div>
                <p className="mb-1 font-semibold text-blue-800 dark:text-blue-200">Old Data:</p>
                <pre className="overflow-auto rounded-md bg-blue-100 p-2 text-[10px] dark:bg-blue-900/30 dark:text-white">
                    {log.old_data ? JSON.stringify(log.old_data, null, 2) : "No old data"}
                </pre>
            </div>
            <div>
                <p className="mb-1 font-semibold text-blue-800 dark:text-blue-200">New Data:</p>
                <pre className="overflow-auto rounded-md bg-blue-100 p-2 text-[10px] dark:bg-blue-900/30 dark:text-white">
                    {log.new_data ? JSON.stringify(log.new_data, null, 2) : "No new data"}
                </pre>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <p><span className="font-semibold">IP:</span> {log.ip_address || "N/A"}</p>
            <p><span className="font-semibold">Ref ID:</span> {log.reference_id || "N/A"}</p>
            <p><span className="font-semibold">Log ID:</span> {log._id}</p>
            <p><span className="font-semibold">User ID:</span> {log.performed_by || "N/A"}</p>
        </div>
    </div>
);

const PaginationButton = ({ onClick, disabled, active, label }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`rounded border px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm ${
            active
                ? "bg-blue-100 font-bold dark:bg-blue-800/50"
                : "text-blue-800 dark:text-blue-200"
        } dark:border-blue-800/50 disabled:opacity-50`}
    >
        {label}
    </button>
);

export default LogsAndAudit;