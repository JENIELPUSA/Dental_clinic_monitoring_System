import React, { useState, useEffect, useContext } from "react";
import { PencilIcon, TrashIcon, CirclePlus } from "lucide-react";
import { DentalHistoryContext } from "../../contexts/DentalHistoryContext/DentalHistoryContext";
import DentalHistoryFormModal from "../DentalHistory/AddForm"; // Make sure this path is correct
import StatusVerification from "../../ReusableFolder/StatusModal";
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
    const itemsPerPage = 5;

    useEffect(() => {
        if (!isDentalHistory || !Array.isArray(isDentalHistory)) return;
        const processedData = isDentalHistory.map((record) => ({
            ...record,
            patient_name: `${record.patient_info?.first_name || "N/A"} ${record.patient_info?.last_name || ""}`,
            // Ensure treatment_description is correctly mapped if used elsewhere
            treatment_description: record.previous_conditions,
            // The last_checkup_date is directly used from the record
        }));
        setDentalRecords(processedData);
    }, [isDentalHistory]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const filteredRecords =
        dentalRecords?.filter((record) => {
            if (!record) return false;
            const searchLower = searchTerm.toLowerCase();

            // Text search logic
            const textMatches =
                record.patient_name?.toLowerCase().includes(searchLower) ||
                record.previous_conditions?.toLowerCase().includes(searchLower) ||
                record._id?.toLowerCase().includes(searchLower) ||
                record.surgeries?.toLowerCase().includes(searchLower) ||
                record.allergies?.toLowerCase().includes(searchLower);

            // Date filtering logic for last_checkup_date
            let dateMatches = true;
            if (record.last_checkup_date) {
                const checkupDate = new Date(record.last_checkup_date);
                if (fromCheckupDate) {
                    const from = new Date(fromCheckupDate);
                    from.setHours(0, 0, 0, 0); // Set to start of the day for inclusive filtering
                    dateMatches = dateMatches && checkupDate >= from;
                }
                if (toCheckupDate) {
                    const to = new Date(toCheckupDate);
                    to.setHours(23, 59, 59, 999); // Set to end of the day for inclusive filtering
                    dateMatches = dateMatches && checkupDate <= to;
                }
            } else if (fromCheckupDate || toCheckupDate) {
                // If date filters are active but the record has no last_checkup_date, it won't match
                dateMatches = false;
            }

            return textMatches && dateMatches; // Combine text search and date filter
        }) || [];

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromCheckupDate, toCheckupDate]); // Add new date states to dependencies

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
        try {
            setLoading(true);
            setIsDeleteId(recordId);
            setVerification(true);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        await deleteBill(isDeleteID);
        handleCloseModal();
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Dental Patient Records</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full rounded-lg border border-blue-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* From Last Checkup Date Filter (NEW) */}
                    <div className="relative">
                        <label
                            htmlFor="fromCheckupDate"
                            className="sr-only"
                        >
                            From Last Checkup Date
                        </label>
                        <input
                            type="date"
                            id="fromCheckupDate"
                            value={fromCheckupDate}
                            onChange={(e) => setFromCheckupDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-48"
                            title="Filter from last checkup date"
                        />
                    </div>

                    {/* To Last Checkup Date Filter (NEW) */}
                    <div className="relative">
                        <label
                            htmlFor="toCheckupDate"
                            className="sr-only"
                        >
                            To Last Checkup Date
                        </label>
                        <input
                            type="date"
                            id="toCheckupDate"
                            value={toCheckupDate}
                            onChange={(e) => setToCheckupDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-48"
                            title="Filter to last checkup date"
                        />
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="rounded-full bg-blue-500 p-2 text-white hover:bg-green-600"
                    title="Add New Record"
                >
                    <CirclePlus className="h-5 w-5" />
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Record ID</th>
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name</th>
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Surgeries</th>
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Allergies</th>
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                Previous Conditions
                            </th>
                            <th className="border-b border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                Last Checkup Date
                            </th>
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
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {record._id || "N/A"}
                                    </td>
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {record.patient_name || "N/A"}
                                    </td>
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {record.surgeries || "N/A"}
                                    </td>
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {record.allergies || "N/A"}
                                    </td>
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {record.previous_conditions || "N/A"}
                                    </td>
                                    <td className="border-r px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                        {formatDate(record.last_checkup_date)}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(record)}
                                                className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                title="Edit Record"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            {/*
                                            <button
                                                onClick={() => handleDeleteRecord(record._id)}
                                                className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                title="Delete Record"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>*/}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No dental records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredRecords.length > 0 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} entries
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
                                    className={`rounded border px-3 py-1 ${
                                        currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"
                                    } dark:border-blue-800/50`}
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
            {/* Modal */}
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
