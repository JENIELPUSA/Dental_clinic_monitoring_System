import React, { useState, useEffect, useContext, useMemo } from "react";
import { PencilIcon, TrashIcon, CirclePlus } from "lucide-react";
import { DentalHistoryContext } from "../../contexts/DentalHistoryContext/DentalHistoryContext";
import DentalHistoryFormModal from "../DentalHistory/AddForm";
import StatusVerification from "../../ReusableFolder/StatusModal";

// Hook to detect mobile (< sm = 640px)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20">
    <div className="h-3.5 w-1/2 rounded bg-blue-100 dark:bg-blue-800/40"></div>
    <div className="mt-2 space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
      ))}
    </div>
  </div>
);

const DentalHistoryTable = () => {
  const { isDentalHistory, deleteBill } = useContext(DentalHistoryContext);
  const [dentalRecords, setDentalRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromCheckupDate, setFromCheckupDate] = useState("");
  const [toCheckupDate, setToCheckupDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isVerification, setVerification] = useState(false);
  const [isDeleteID, setIsDeleteId] = useState("");
  const [loading, setLoading] = useState(false);

  const isMobile = useIsMobile();
  const itemsPerPage = 5;

  useEffect(() => {
    if (!isDentalHistory || !Array.isArray(isDentalHistory)) return;
    const processedData = isDentalHistory.map((record) => ({
      ...record,
      patient_name: `${record.patient_info?.first_name || "N/A"} ${record.patient_info?.last_name || ""}`,
      treatment_description: record.previous_conditions,
    }));
    setDentalRecords(processedData);
  }, [isDentalHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRecords = useMemo(() => {
    if (!dentalRecords) return [];
    return dentalRecords.filter((record) => {
      if (!record) return false;
      const searchLower = searchTerm.toLowerCase();

      const textMatches =
        record.patient_name?.toLowerCase().includes(searchLower) ||
        record.previous_conditions?.toLowerCase().includes(searchLower) ||
        record._id?.toLowerCase().includes(searchLower) ||
        record.surgeries?.toLowerCase().includes(searchLower) ||
        record.allergies?.toLowerCase().includes(searchLower);

      let dateMatches = true;
      if (record.last_checkup_date) {
        const checkupDate = new Date(record.last_checkup_date);
        if (fromCheckupDate) {
          const from = new Date(fromCheckupDate);
          from.setHours(0, 0, 0, 0);
          dateMatches = dateMatches && checkupDate >= from;
        }
        if (toCheckupDate) {
          const to = new Date(toCheckupDate);
          to.setHours(23, 59, 59, 999);
          dateMatches = dateMatches && checkupDate <= to;
        }
      } else if (fromCheckupDate || toCheckupDate) {
        dateMatches = false;
      }

      return textMatches && dateMatches;
    });
  }, [dentalRecords, searchTerm, fromCheckupDate, toCheckupDate]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromCheckupDate, toCheckupDate]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setVerification(false);
  };

  const handleDeleteRecord = (recordId) => {
    setLoading(true);
    setIsDeleteId(recordId);
    setVerification(true);
    setLoading(false);
  };

  const handleConfirmDelete = async () => {
    await deleteBill(isDeleteID);
    handleCloseModal();
  };

  return (
    <div className="w-full rounded-2xl bg-white p-3 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
      {/* Header */}
      <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:mb-4 md:flex-row md:items-center">
        <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 sm:text-lg">Dental Patient Records</h2>
        <div className="flex w-full flex-col items-start gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search records..."
              className="w-full rounded-lg border border-blue-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:px-4 sm:py-2 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100 sm:right-3 sm:top-2"
              >
                ×
              </button>
            )}
          </div>

          {/* Date Filters - Stack on mobile */}
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-2">
            <input
              type="date"
              value={fromCheckupDate}
              onChange={(e) => setFromCheckupDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={toCheckupDate}
              onChange={(e) => setToCheckupDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
              placeholder="To"
            />
          </div>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="mt-2 self-end rounded-full bg-blue-500 p-1.5 text-white hover:bg-green-600 md:mt-0"
          title="Add New Record"
        >
          <CirclePlus className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Conditional Rendering */}
      {isMobile ? (
        /* Mobile: Card ListView */
        <div className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : currentRecords.length > 0 ? (
            currentRecords.map((record, index) => (
              <div
                key={record._id}
                className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                      {indexOfFirstItem + index + 1}. {record.patient_name || "N/A"}
                    </div>
                    <div className="mt-1 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                      <div>
                        <span className="font-medium">ID:</span> {record._id?.slice(-6) || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Surgeries:</span> {record.surgeries || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Allergies:</span> {record.allergies || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Conditions:</span> {record.previous_conditions || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Last Checkup:</span> {formatDate(record.last_checkup_date)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(record)}
                    className="ml-2 rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-blue-800 dark:text-blue-200">
              No dental records found
            </div>
          )}
        </div>
      ) : (
        /* Desktop: Table View */
        <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Record ID</th>
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name</th>
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Surgeries</th>
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Allergies</th>
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Previous Conditions</th>
                <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Last Checkup Date</th>
                <th className="border-b px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((record, index) => (
                  <tr
                    key={record._id}
                    className="border-b hover:bg-blue-50/50 dark:border-blue-800/50 dark:hover:bg-blue-900/20"
                  >
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {record._id || "N/A"}
                    </td>
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {record.patient_name || "N/A"}
                    </td>
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {record.surgeries || "N/A"}
                    </td>
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {record.allergies || "N/A"}
                    </td>
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {record.previous_conditions || "N/A"}
                    </td>
                    <td className="border-r px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                      {formatDate(record.last_checkup_date)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(record)}
                          className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                          title="Edit Record"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {/* <button
                          onClick={() => handleDeleteRecord(record._id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                          title="Delete Record"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-blue-800 dark:text-blue-200">
                    No dental records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-200 sm:mt-4 sm:flex-row sm:text-sm">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} entries
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
            >
              «
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
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
                  className={`rounded border px-2 py-1 ${
                    currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "hover:bg-blue-100 dark:hover:bg-blue-800/20"
                  } sm:px-3 sm:py-1`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
            >
              ›
            </button>
            <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DentalHistoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedRecord}
      />
      <StatusVerification
        isOpen={isVerification}
        onConfirmDelete={handleConfirmDelete}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DentalHistoryTable;