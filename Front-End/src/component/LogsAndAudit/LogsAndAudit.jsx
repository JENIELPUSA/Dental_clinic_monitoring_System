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

    // ✅ Fetch from server ONLY — no client-side filtering or slicing
    useEffect(() => {
        fetchLogsData({
            page: currentPage,
            action_type: filterActionType === "All" ? undefined : filterActionType,
            from: startDate || undefined,
            to: endDate || undefined,
        });
    }, [currentPage, filterActionType, startDate, endDate, fetchLogsData]);

    // ✅ Reset to page 1 on filter change
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
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZoneName: "short",
        }).format(date);
    };

    // ✅ Unique action types — still okay client-side (lightweight)
    const uniqueActionTypes = useMemo(() => {
        const types = new Set((isLogs || []).map((log) => log.action_type));
        return ["All", ...Array.from(types).sort()];
    }, [isLogs]);

    // ✅ Compute "Showing X to Y" using SERVER metadata
    const itemsPerPage = 6; // assuming backend uses 6 per page
    const startEntry = isTotalLogs > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, isTotalLogs || 0);

    return (
        <div className="min-h-screen font-sans">
            <div className="mx-auto max-w-7xl rounded-2xl p-6 shadow-md dark:border dark:border-blue-800/50">
                <h1 className="mb-6 border-b-2 pb-2 text-xl font-bold text-blue-800 dark:text-blue-200">
                    Logs and Audit Trail
                </h1>
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-gray-600 dark:text-blue-200">
                        Total Results: <span className="font-semibold">{isTotalLogs || 0}</span>
                    </p>
                    <div className="flex w-full flex-col items-center space-y-4 sm:w-auto sm:flex-row sm:space-x-4 sm:space-y-0">
                        <div className="flex w-full items-center space-x-2 sm:w-auto">
                            <label
                                htmlFor="actionTypeFilter"
                                className="text-sm font-medium text-blue-800 dark:text-blue-200"
                            >
                                Filter by Action Type:
                            </label>
                            <select
                                id="actionTypeFilter"
                                className="block w-full rounded-md border border-blue-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:w-auto sm:text-sm"
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
                        <div className="flex w-full flex-col items-center space-y-2 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                            <label
                                htmlFor="startDate"
                                className="text-sm font-medium text-blue-800 dark:text-blue-200"
                            >
                                From:
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                className="block w-full rounded-md border border-blue-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:w-auto"
                                value={startDate}
                                onChange={handleStartDateChange}
                                max={endDate || undefined}
                            />
                            <label
                                htmlFor="endDate"
                                className="text-sm font-medium text-blue-800 dark:text-blue-200"
                            >
                                To:
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                className="block w-full rounded-md border border-blue-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:w-auto"
                                value={endDate}
                                onChange={handleEndDateChange}
                                min={startDate || undefined}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <table className="w-full text-sm dark:border-blue-800/50">
                        <thead>
                            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Action Type
                                </th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Module
                                </th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Description
                                </th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Performed By
                                </th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Role
                                </th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Timestamp
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-3 py-4 text-center text-blue-800 dark:text-blue-200">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : Array.isArray(isLogs) && isLogs.length > 0 ? (
                                isLogs.map((log) => (
                                    <React.Fragment key={log._id}>
                                        <tr
                                            className="cursor-pointer transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                            onClick={() => toggleExpand(log)}
                                        >
                                            <td className="border px-3 py-2 text-sm font-medium dark:border-blue-800/50">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        log.action_type === "DELETE"
                                                            ? "bg-red-100 text-red-800"
                                                            : log.action_type === "CREATE"
                                                              ? "bg-green-100 text-green-800"
                                                              : log.action_type === "UPDATE"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {log.module}
                                            </td>
                                            <td className="max-w-xs break-words border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {log.description}
                                            </td>
                                            <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {log.performed_by_name || "N/A"}
                                            </td>
                                            <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {log.role || "N/A"}
                                            </td>
                                            <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {formatTimestamp(log.timestamp)}
                                            </td>
                                        </tr>
                                        {expandedLog && expandedLog._id === log._id && (
                                            <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                                                <td colSpan="6" className="px-6 py-4 text-sm text-blue-800 dark:text-blue-300">
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <p className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                                                                Old Data:
                                                            </p>
                                                            <pre className="overflow-auto rounded-md bg-blue-100 p-3 text-xs dark:bg-blue-900/30 dark:text-white sm:text-sm">
                                                                {log.old_data
                                                                    ? JSON.stringify(log.old_data, null, 2)
                                                                    : "No old data"}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <p className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                                                                New Data:
                                                            </p>
                                                            <pre className="overflow-auto rounded-md bg-blue-100 p-3 text-xs dark:bg-blue-900/30 dark:text-white sm:text-sm">
                                                                {log.new_data
                                                                    ? JSON.stringify(log.new_data, null, 2)
                                                                    : "No new data"}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                            IP Address: <span className="font-normal">{log.ip_address}</span>
                                                        </p>
                                                        <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                            Reference ID:{" "}
                                                            <span className="font-normal">{log.reference_id || "N/A"}</span>
                                                        </p>
                                                        <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                            Log ID: <span className="font-normal">{log._id}</span>
                                                        </p>
                                                        <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                            Performed By ID:{" "}
                                                            <span className="font-normal">{log.performed_by || "N/A"}</span>
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200"
                                    >
                                        No audit logs available with the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✅ Pagination — purely based on server response */}
                {!loading && isTotalPages > 1 && (
                    <nav className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing <span className="font-medium">{startEntry}</span> to{" "}
                            <span className="font-medium">{endEntry}</span> of{" "}
                            <span className="font-medium">{isTotalLogs || 0}</span> entries
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
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`rounded border px-3 py-1 ${
                                            currentPage === pageNum
                                                ? "bg-blue-100 font-bold dark:bg-blue-800/50"
                                                : "text-blue-800 dark:text-blue-200"
                                        } dark:border-blue-800/50`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === isTotalPages}
                                className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200"
                            >
                                ›
                            </button>
                            <button
                                onClick={() => paginate(isTotalPages)}
                                disabled={currentPage === isTotalPages}
                                className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200"
                            >
                                »
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default LogsAndAudit;