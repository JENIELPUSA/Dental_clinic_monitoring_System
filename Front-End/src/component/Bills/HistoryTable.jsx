import React, { useState, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { BillDisplayContext } from "../../contexts/BillContext/BillContext";

// Debounce hook (kung wala sa ibang file)
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

// Skeleton row (optional pero good UX)
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="border px-3 py-3">
        <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
      </td>
    ))}
  </tr>
);

function HistoryTable() {
  const {
    isHistory,
    TotalCount,
    isTotalPages,
    currentPage,
    loading,
    setCurrentPage,
    fetchHistory, // 👈 dapat available ito sa context
  } = useContext(BillDisplayContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [fromBillDate, setFromBillDate] = useState("");
  const [toBillDate, setToBillDate] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch from server whenever filters or page changes
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
    setCurrentPage(1); // Reset to first page on new search
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
  const itemsPerPage = 5; // Dapat consistent sa server
  const startEntry = TotalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, TotalCount);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Pagination rendering (simple version)
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
          <span key={`${page}-${idx}`} className="px-2 py-1 text-blue-800 dark:text-blue-200">
            ...
          </span>
        );
      }
      return (
        <button
          key={idx}
          onClick={() => paginate(page)}
          className={`rounded border px-3 py-1 ${
            currentPage === page
              ? "bg-blue-100 font-bold dark:bg-blue-800/50"
              : "text-blue-800 dark:text-blue-200"
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
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : isHistory && isHistory.length > 0 ? (
              isHistory.map((bill) => (
                <tr key={bill._id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                <td colSpan="7" className="px-3 py-4 text-center text-blue-800 dark:text-blue-200">
                  No history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 0 && TotalCount > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Showing <span className="font-medium">{startEntry}</span> to{" "}
            <span className="font-medium">{endEntry}</span> of{" "}
            <span className="font-medium">{TotalCount}</span> entries
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
  );
}

export default HistoryTable;