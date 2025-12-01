import React, { useState, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { BillDisplayContext } from "../../contexts/BillContext/BillContext";
import ExportPdfModal from "../../component/Bills/ExportPDFHistory"

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// Skeleton for Table (Desktop)
const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
        {[...Array(7)].map((_, i) => (
            <td
                key={i}
                className="border px-3 py-3"
            >
                <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
            </td>
        ))}
    </tr>
);

// Skeleton for Mobile Cards
const MobileSkeletonCard = () => (
    <div className="animate-pulse rounded-lg border border-blue-100 p-4 dark:border-blue-800/30">
        <div className="mb-2 h-4 w-3/4 rounded bg-blue-100 dark:bg-blue-800/40"></div>
        <div className="mb-1 h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
        <div className="mb-3 h-3 w-5/6 rounded bg-blue-100 dark:bg-blue-800/40"></div>
        <div className="flex justify-between">
            <div className="h-6 w-16 rounded bg-blue-100 dark:bg-blue-800/40"></div>
            <div className="h-6 w-12 rounded bg-blue-100 dark:bg-blue-800/40"></div>
        </div>
    </div>
);

function HistoryTable() {
    const { isHistory, TotalCount, isTotalPages, currentPage, loading, setCurrentPage, fetchHistory, GenerateBillHistoryPDFByPatient } =
        useContext(BillDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [fromBillDate, setFromBillDate] = useState("");
    const [toBillDate, setToBillDate] = useState("");

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({
        from: "",
        to: "",
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        fetchHistory({
            page: currentPage,
            search: debouncedSearchTerm || undefined,
            from: fromBillDate || undefined,
            to: toBillDate || undefined,
        });
    }, [currentPage, debouncedSearchTerm, fromBillDate, toBillDate, fetchHistory]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Updated: Include status in export logic
    const handleGeneratePDF = () => {
        if (!exportDates.from || !exportDates.to) {
            alert("Please select both 'From' and 'To' dates.");
            return;
        }
        if (new Date(exportDates.from) > new Date(exportDates.to)) {
            alert("'From' date cannot be later than 'To' date.");
            return;
        }

        // Include exportStatus in the payload
        GenerateBillHistoryPDFByPatient({
            from: exportDates.from,
            to: exportDates.to,
        });

        setShowExportModal(false);
    };

    const handleFromChange = (e) => {
        setFromBillDate(e.target.value);
        setCurrentPage(1);
    };

    const handleToChange = (e) => {
        setToBillDate(e.target.value);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };
        return new Date(dateString).toLocaleString("en-US", options);
    };

    const getStatusBadge = (status) => {
        let badgeClasses = "px-2 py-1 rounded-full text-xs font-semibold text-white ";
        switch (status?.toLowerCase()) {
            case "paid":
                badgeClasses += "bg-green-500";
                break;
            case "partial":
                badgeClasses += "bg-yellow-500";
                break;
            case "unpaid":
                badgeClasses += "bg-red-500";
                break;
            default:
                badgeClasses += "bg-gray-500";
                break;
        }
        return <span className={badgeClasses}>{status || "N/A"}</span>;
    };

    const totalPages = Number(isTotalPages) || 0;
    const itemsPerPage = 5;
    const startEntry = TotalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, TotalCount);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPaginationItems = () => {
        const maxVisible = 5;
        const pages = [];

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("ellipsis-end");
            } else if (currentPage >= totalPages - 2) {
                pages.push("ellipsis-start");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push("ellipsis-start");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
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
        <div className="w-full rounded-2xl bg-white p-4 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Payment History</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-64"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="date"
                        value={fromBillDate}
                        onChange={handleFromChange}
                        className="rounded-lg border px-4 py-2 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                    />
                    <input
                        type="date"
                        value={toBillDate}
                        onChange={handleToChange}
                        className="rounded-lg border px-4 py-2 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                    />
                </div>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow hover:bg-blue-700 active:scale-95 dark:bg-blue-700 dark:hover:bg-blue-600 sm:text-sm"
                >
                    Export PDF Report
                </button>
            </div>

            {/* DESKTOP: Table View */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                    <thead>
                        <tr className="bg-blue-50 dark:bg-blue-900/30">
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name (ID)</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Treatment Description</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Bill Date & Time</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Total Amount</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Amount Paid</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Balance</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                        ) : isHistory && isHistory.length > 0 ? (
                            isHistory.map((bill) => (
                                <tr
                                    key={bill._id}
                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        <User className="mr-1 inline h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        {bill.patient_first_name} {bill.patient_last_name} <br />
                                        <span className="text-xs text-gray-500">{bill.patient_id}</span>
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {bill.treatment_description || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(bill.treatment_date)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        ₱ {parseFloat(bill.total_amount || 0).toFixed(2)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        ₱ {parseFloat(bill.amount_paid || 0).toFixed(2)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        ₱ {parseFloat(bill.balance || 0).toFixed(2)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {getStatusBadge(bill.payment_status)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE: List View (Cards) */}
            <div className="space-y-4 md:hidden">
                {loading ? (
                    [...Array(5)].map((_, i) => <MobileSkeletonCard key={i} />)
                ) : isHistory && isHistory.length > 0 ? (
                    isHistory.map((bill) => (
                        <div
                            key={bill._id}
                            className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-800/30 dark:bg-blue-900/20"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span className="font-medium text-blue-800 dark:text-blue-200">
                                            {bill.patient_first_name} {bill.patient_last_name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {bill.patient_id}</p>
                                </div>
                                <div>{getStatusBadge(bill.payment_status)}</div>
                            </div>

                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                <p className="font-medium">{bill.treatment_description || "N/A"}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(bill.treatment_date)}</p>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                    <p className="font-medium">₱{parseFloat(bill.total_amount || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                                    <p className="font-medium">₱{parseFloat(bill.amount_paid || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                                    <p className="font-medium">₱{parseFloat(bill.balance || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center text-blue-800 dark:text-blue-200">No history found.</div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 0 && TotalCount > 0 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                        <span className="font-medium">{TotalCount}</span> entries
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3"
                        >
                            «
                        </button>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3"
                        >
                            ‹
                        </button>

                        {renderPaginationItems()}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded border px-2 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => paginate(totalPages)}
                            disabled={currentPage === totalPages}
                            className="rounded border px-2 py-1 text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Export Modal with Status */}
            <ExportPdfModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onGenerate={handleGeneratePDF}
                exportDates={exportDates}
                setExportDates={setExportDates}
            />
        </div>
    );
}

export default HistoryTable;
