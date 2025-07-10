import React, { useState, useMemo, useContext, useEffect } from "react";
import { InsuranceDisplayContext } from "../../contexts/InsuranceContext/InsuranceContext";
import InsuranceFormModal from "./InsuranceFormModal";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import StatusVerification from "../../ReusableFolder/StatusModal";
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
};

const InsuranceTable = () => {
    const { isInsurance, DeleteInsurance } = useContext(InsuranceDisplayContext);

    const [formData, setFormData] = useState({
        patient_id: "",
        insurance_provider: "",
        policy_number: "",
        coverage_details: "",
        valid_from: "",
        valid_until: "",
    });

    const [editingRecordId, setEditingRecordId] = useState(null);
    const [insuranceRecords, setInsuranceRecords] = useState(isInsurance);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [submittedData, setSubmittedData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setInsuranceRecords(isInsurance);
    }, [isInsurance]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleAddNewRecord = () => {
        setFormData({
            patient_id: "",
            insurance_provider: "",
            policy_number: "",
            coverage_details: "",
            valid_from: "",
            valid_until: "",
        });
        setEditingRecordId(null);
        setIsModalOpen(true);
    };

    const handleEditRecord = (record) => {
        setFormData({
            patient_id: record.patient_id,
            insurance_provider: record.insurance_provider,
            policy_number: record.policy_number,
            coverage_details: record.coverage_details,
            valid_from: record.valid_from.split("T")[0],
            valid_until: record.valid_until.split("T")[0],
        });
        setEditingRecordId(record._id);
        setIsModalOpen(true);
    };

    const handleDeleteRecord = (idToDelete) => {
        try {
            setLoading(true);
            setIsDeleteId(idToDelete);
            setVerification(true);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        await DeleteInsurance(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingRecordId) {
            setInsuranceRecords((prev) =>
                prev.map((record) => (record._id === editingRecordId ? { ...formData, _id: editingRecordId, __v: record.__v } : record)),
            );
            setSubmittedData({ ...formData, _id: editingRecordId });
        } else {
            const newRecord = { ...formData, _id: `GEN-${Date.now()}`, __v: 0 };
            setInsuranceRecords((prev) => [...prev, newRecord]);
            setSubmittedData(newRecord);
        }

        setFormData({
            patient_id: "",
            insurance_provider: "",
            policy_number: "",
            coverage_details: "",
            valid_from: "",
            valid_until: "",
        });
        setEditingRecordId(null);
        setIsModalOpen(false);
    };

    const filteredRecords = useMemo(() => {
        if (!searchTerm) return insuranceRecords;
        const lower = searchTerm.toLowerCase();
        return insuranceRecords.filter(
            (record) =>
                record.patient_id.toLowerCase().includes(lower) ||
                record.insurance_provider.toLowerCase().includes(lower) ||
                record.policy_number.toLowerCase().includes(lower) ||
                record.coverage_details.toLowerCase().includes(lower),
        );
    }, [insuranceRecords, searchTerm]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="font-inter flex min-h-[80vh] flex-col items-center justify-start bg-transparent p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Insurance Records List</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Insurance Records..."
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                        <thead>
                            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient ID</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Provider</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Policy Number</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Coverage Details</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Valid From</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Valid Until</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    <button
                                        onClick={handleAddNewRecord}
                                        className="flex w-full items-center justify-center rounded-md bg-blue-500 px-2 py-1 text-white transition duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        title="Add New Record"
                                    >
                                        <PlusCircle className="h-5 w-5" />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map((record, index) => (
                                    <tr
                                        key={record._id}
                                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                    >
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {record.patient_id}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {record.patient_name}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {record.insurance_provider}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {record.policy_number}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {record.coverage_details}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatDate(record.start_date)}
                                        </td>
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatDate(record.end_date)}
                                        </td>
                                        <td className="bg-transparent p-3 align-top">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                    title="Edit Record"
                                                    onClick={() => handleEditRecord(record)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    title="Delete Record"
                                                    onClick={() => handleDeleteRecord(record._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                    >
                                        No insurance records found.
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

            <InsuranceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                editingRecordId={editingRecordId}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default InsuranceTable;
