import React, { useState, useMemo, useContext } from 'react';
import { LogsDisplayContext } from '../../contexts/LogsAndAudit/LogsAndAudit';

const LogsAndAudit = () => {
    const { isLogs } = useContext(LogsDisplayContext);
    const [expandedLog, setExpandedLog] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [filterActionType, setFilterActionType] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredLogs = useMemo(() => {
        let logs = Array.isArray(isLogs) ? isLogs : [];

        if (filterActionType !== 'All') {
            logs = logs.filter(log => log.action_type === filterActionType);
        }

        if (startDate) {
            const startDateTime = new Date(startDate);
            startDateTime.setHours(0, 0, 0, 0);
            logs = logs.filter(log => new Date(log.timestamp) >= startDateTime);
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            logs = logs.filter(log => new Date(log.timestamp) <= endDateTime);
        }

        return logs;
    }, [isLogs, filterActionType, startDate, endDate]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const uniqueActionTypes = useMemo(() => {
        const types = new Set((isLogs || []).map(log => log.action_type));
        return ['All', ...Array.from(types).sort()];
    }, [isLogs]);

    const indexOfLastLog = currentPage * itemsPerPage;
    const indexOfFirstLog = indexOfLastLog - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setExpandedLog(null);
    };

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

return (
    <div className="min-h-screen font-sans">
        <div className="max-w-7xl mx-auto rounded-2xl p-6 shadow-md dark:border dark:border-blue-800/50">
            <h1 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-6 border-b-2 pb-2">Logs and Audit Trail</h1>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-gray-600 dark:text-blue-200">Total Results: <span className="font-semibold">{filteredLogs.length}</span> (Filtered)</p>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <label htmlFor="actionTypeFilter" className="text-blue-800 text-sm font-medium dark:text-blue-200">Filter by Action Type:</label>
                        <select
                            id="actionTypeFilter"
                            className="block w-full sm:w-auto px-3 py-2 border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:text-sm"
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
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <label htmlFor="startDate" className="text-blue-800 text-sm font-medium dark:text-blue-200">From:</label>
                        <input
                            type="date"
                            id="startDate"
                            className="block w-full sm:w-auto px-3 py-2 border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                        <label htmlFor="endDate" className="text-blue-800 text-sm font-medium dark:text-blue-200">To:</label>
                        <input
                            type="date"
                            id="endDate"
                            className="block w-full sm:w-auto px-3 py-2 border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                            value={endDate}
                            onChange={handleEndDateChange}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
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
                        {currentLogs.map((log) => (
                            <React.Fragment key={log._id}>
                                <tr className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-200 dark:hover:bg-blue-900/20" onClick={() => toggleExpand(log)}>
                                    <td className="border px-3 py-2 text-sm font-medium dark:border-blue-800/50">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            log.action_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                                            log.action_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                                            log.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{log.module}</td>
                                    <td className="border px-3 py-2 text-sm text-blue-800 break-words max-w-xs dark:border-blue-800/50 dark:text-blue-300">{log.description}</td>
                                    <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{log.performed_by_name || 'N/A'}</td>
                                    <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{log.role || 'N/A'}</td>
                                    <td className="border px-3 py-2 text-sm text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{formatTimestamp(log.timestamp)}</td>
                                </tr>
                                {expandedLog && expandedLog._id === log._id && (
                                    <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                                        <td colSpan="6" className="px-6 py-4 text-sm text-blue-800 dark:text-blue-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="font-semibold text-blue-800 mb-2 dark:text-blue-200">Old Data:</p>
                                                    <pre className="bg-blue-100 p-3 rounded-md overflow-auto text-xs sm:text-sm dark:bg-blue-900/30 dark:text-white">
                                                        {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'No old data'}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-blue-800 mb-2 dark:text-blue-200">New Data:</p>
                                                    <pre className="bg-blue-100 p-3 rounded-md overflow-auto text-xs sm:text-sm dark:bg-blue-900/30 dark:text-white">
                                                        {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'No new data'}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">IP Address: <span className="font-normal">{log.ip_address}</span></p>
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">Reference ID: <span className="font-normal">{log.reference_id || 'N/A'}</span></p>
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">Log ID: <span className="font-normal">{log._id}</span></p>
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">Performed By ID: <span className="font-normal">{log.performed_by || 'N/A'}</span></p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {currentLogs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    No audit logs available for this page with the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <nav className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to <span className="font-medium">{Math.min(indexOfLastLog, filteredLogs.length)}</span> of{' '}
                        <span className="font-medium">{filteredLogs.length}</span> entries
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => paginate(1)} disabled={currentPage === 1} className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200">«</button>
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200">‹</button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    aria-current={currentPage === pageNum ? 'page' : undefined}
                                    className={`rounded border px-3 py-1 ${currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"} dark:border-blue-800/50`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200">›</button>
                        <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="rounded border px-3 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200">»</button>
                    </div>
                </nav>
            )}
        </div>
    </div>
);

};

export default LogsAndAudit;