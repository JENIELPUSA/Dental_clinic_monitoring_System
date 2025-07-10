import { useState, useEffect, createContext, useContext } from "react";
import { PencilIcon, TrashIcon, PlusCircle } from "lucide-react";
import { PrescriptionDisplayContext } from "../../contexts/PrescriptionContext/PrescriptionContext";
import PrescriptionForm from "./PrescriptionForm";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";
const PrescriptionTable = () => {
    const { role } = useContext(AuthContext);
    const { Prescription, DeletePrescription } = useContext(PrescriptionDisplayContext);
    const { Prescriptions } = {
        Prescriptions: Prescription,
        DeletePrescription: (id) => {},
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
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
    const filteredPrescriptions =
        Prescriptions?.filter((prescription) => {
            if (!prescription) return false;
            const searchLower = searchTerm.toLowerCase();
            return (
                prescription.medication_name?.toLowerCase().includes(searchLower) ||
                prescription.dosage?.toLowerCase().includes(searchLower) ||
                prescription.frequency?.toLowerCase().includes(searchLower) ||
                prescription._id?.toLowerCase().includes(searchLower) ||
                prescription.appointment_id?.toLowerCase().includes(searchLower)
            );
        }) || [];

    const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPrescriptions = filteredPrescriptions.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
    const onPrescriptionSelect = (prescription) => {
        setSelectedPrescription(prescription);
        setModalOpen(true);
    };
    const handleDeletePrescription = (prescriptionId) => {
        try {
            setLoading(true);
            setIsDeleteId(prescriptionId);
            setVerification(true);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        await DeletePrescription(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };
    const onAddPrescription = () => {
        setSelectedPrescription(null);
        setModalOpen(true);
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="md:itesms-center mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Prescription Records</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Prescription ID</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Medication Name</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Dosage</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Frequency</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Start Date</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">End Date</th>
                            {role !== "staff" && (
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={onAddPrescription}
                                            className="rounded p-1.5 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-300/10"
                                        >
                                            <PlusCircle className="h-4 w-4 stroke-blue-500 dark:stroke-blue-500" />
                                        </button>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {currentPrescriptions.length > 0 ? (
                            currentPrescriptions.map((prescription, index) => (
                                <tr
                                    key={prescription._id}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">{prescription._id || "N/A"}</td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">
                                        {prescription.patient_name || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">
                                        {prescription.medication_name || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">{prescription.dosage || "N/A"}</td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">{prescription.frequency || "N/A"}</td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(prescription.start_date)}
                                    </td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(prescription.end_date)}
                                    </td>
                                    {role !== "staff" && (
                                        <td className="bg-transparent p-3 align-top">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onPrescriptionSelect(prescription)}
                                                    className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrescription(prescription._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No prescription records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredPrescriptions.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPrescriptions.length)} of{" "}
                            {filteredPrescriptions.length} entries
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
                                        className={`rounded border px-3 py-1 ${currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"} dark:border-blue-800/50`}
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

            <PrescriptionForm
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedPrescription(null);
                }}
                selectedPrescription={selectedPrescription}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default PrescriptionTable;
