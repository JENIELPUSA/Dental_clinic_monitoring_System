import { useState, useEffect, useContext } from "react";
import { PencilIcon, TrashIcon, PlusCircle } from "lucide-react";
import TreatmentForm from "./TreatmentForm";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";

const TreatmentTable = () => {
    const { authToken, linkId, role } = useContext(AuthContext);
    const { Treatment, DeleteTreatment, fetchSpecificTreatment, isSpecifyTreatment } = useContext(TreatmentDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 5;

    const treatmentList = role === "patient" ? isSpecifyTreatment || [] : Treatment || [];

    useEffect(() => {
        if (linkId && role === "patient") {
            fetchSpecificTreatment(linkId);
        }
    }, [linkId, role]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "N/A";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const filteredTreatments = treatmentList.filter((treatment) => {
        if (!treatment) return false;
        const searchLower = searchTerm.toLowerCase();

        const textMatches =
            treatment.treatment_description?.toLowerCase().includes(searchLower) ||
            treatment._id?.toLowerCase().includes(searchLower) ||
            treatment.appointment_id?.toLowerCase().includes(searchLower) ||
            treatment.patient_name?.toLowerCase().includes(searchLower) ||
            String(treatment.treatment_cost).includes(searchTerm);

        const treatmentDate = new Date(treatment.treatment_date);
        let dateMatches = true;

        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            dateMatches = dateMatches && treatmentDate >= from;
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            dateMatches = dateMatches && treatmentDate <= to;
        }

        return textMatches && dateMatches;
    });

    const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTreatments = filteredTreatments.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromDate, toDate]);

    const onTreatmentSelect = (treatment) => {
        setSelectedTreatment(treatment);
        setModalOpen(true);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const handleDeleteTreatment = (treatmentId) => {
        setLoading(true);
        setIsDeleteId(treatmentId);
        setVerification(true);
        setLoading(false);
    };

    const handleConfirmDelete = async () => {
        await DeleteTreatment(isDeleteID);
        handleCloseModal();
    };

    const onAddTreatment = () => {
        setSelectedTreatment(null);
        setModalOpen(true);
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            {loading && <LoadingOverlay />}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Treatment Records</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search treatments..."
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
                    <div className="relative">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                            title="Filter from date"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white md:w-48"
                            title="Filter to date"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Treatment ID</th>
                            {role !== "patient" && (
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name</th>
                            )}
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Description</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Cost</th>
                            {role !== "staff" && role !== "patient" && (
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={onAddTreatment}
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
                        {currentTreatments.length > 0 ? (
                            currentTreatments.map((treatment, index) => (
                                <tr
                                    key={treatment._id}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {treatment._id || "N/A"}
                                    </td>
                                    {role !== "patient" && (
                                        <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {treatment.patient_name || "N/A"}
                                        </td>
                                    )}
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {treatment.treatment_description || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(treatment.treatment_date)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatCurrency(treatment.treatment_cost)}
                                    </td>
                                    {role !== "staff" && role !== "patient" && (
                                        <td className="bg-transparent p-3 align-top">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onTreatmentSelect(treatment)}
                                                    className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                {/*
                                                <button
                                                    onClick={() => handleDeleteTreatment(treatment._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>*/}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No treatment records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredTreatments.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTreatments.length)} of {filteredTreatments.length}{" "}
                            entries
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
            </div>

            <TreatmentForm
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedTreatment(null);
                }}
                selectedTreatment={selectedTreatment}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default TreatmentTable;
