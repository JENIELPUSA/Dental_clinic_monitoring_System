import React, { useState, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { BillDisplayContext } from "../../contexts/BillContext/BillContext";

function HistoryTable() {
    const { isHistory } = useContext(BillDisplayContext);
    const historyData = isHistory || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [fromBillDate, setFromBillDate] = useState("");
    const [toBillDate, setToBillDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    const filteredHistory = historyData.filter((record) => {
        const searchLower = searchTerm.toLowerCase();

        const textMatches =
            record.patient_first_name?.toLowerCase().includes(searchLower) ||
            record.patient_last_name?.toLowerCase().includes(searchLower) ||
            record.treatment_name?.toLowerCase().includes(searchLower) ||
            record.payment_status?.toLowerCase().includes(searchLower);

        let dateMatches = true;
        if (record.payment_date) {
            const paymentDate = new Date(record.payment_date);
            if (fromBillDate) {
                const from = new Date(fromBillDate);
                from.setHours(0, 0, 0, 0);
                dateMatches = dateMatches && paymentDate >= from;
            }
            if (toBillDate) {
                const to = new Date(toBillDate);
                to.setHours(23, 59, 59, 999);
                dateMatches = dateMatches && paymentDate <= to;
            }
        } else if (fromBillDate || toBillDate) {
            dateMatches = false;
        }

        return textMatches && dateMatches;
    });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBills = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromBillDate, toBillDate]);

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Payment History</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <input
                        type="date"
                        value={fromBillDate}
                        onChange={(e) => setFromBillDate(e.target.value)}
                        className="rounded-lg border px-4 py-2 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                    />
                    <input
                        type="date"
                        value={toBillDate}
                        onChange={(e) => setToBillDate(e.target.value)}
                        className="rounded-lg border px-4 py-2 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
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
                        {currentBills.length > 0 ? (
                            currentBills.map((bill) => (
                                <tr
                                    key={bill._id}
                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        <User className="mr-1 inline h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        {bill.patient_first_name} {bill.patient_last_name} <br />
                                        <span className="text-xs text-gray-500">{bill.patient_id}</span>
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{bill.treatment_description || "N/A"}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{formatDate(bill.treatment_date)}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">₱ {parseFloat(bill.total_amount || 0).toFixed(2)}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">₱ {parseFloat(bill.amount_paid || 0).toFixed(2)}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">₱ {parseFloat(bill.balance || 0).toFixed(2)}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{getStatusBadge(bill.payment_status)}</td>
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

      {filteredHistory?.length > 0 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} entries
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
                                    className={`rounded border px-3 py-1 ${currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:border-blue-800/50 dark:text-blue-200"}`}
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
    );
}

export default HistoryTable;
