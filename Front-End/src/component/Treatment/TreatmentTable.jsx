import { useState, useEffect, useContext, useMemo } from "react";
import { PencilIcon, TrashIcon, PlusCircle } from "lucide-react";
import TreatmentForm from "./TreatmentForm";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";
import ExportPdfModal from "../Treatment/ExportTreatmentPDF";

// Hook to detect mobile (< 640px)
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
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40"
                ></div>
            ))}
        </div>
    </div>
);

const TreatmentTable = () => {
    const { authToken, linkId, role } = useContext(AuthContext);
    const { Treatment, DeleteTreatment, fetchSpecificTreatment, isSpecifyTreatment, fetchTreatmentReportPDF } = useContext(TreatmentDisplayContext);

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

    const [exportPatientName, setExportPatientName] = useState("");
    const [exportDescription, setExportDescription] = useState("");
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({
        from: "",
        to: "",
    });

    const isMobile = useIsMobile();
    const itemsPerPage = 5;

    const treatmentList = useMemo(() => {
        return role === "patient" ? isSpecifyTreatment || [] : Treatment || [];
    }, [role, isSpecifyTreatment, Treatment]);

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
            month: "short",
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

    const filteredTreatments = useMemo(() => {
        return treatmentList.filter((treatment) => {
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
    }, [treatmentList, searchTerm, fromDate, toDate]);

    const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTreatments = filteredTreatments.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromDate, toDate]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    fetchTreatmentReportPDF({
    from: exportDates.from || undefined,
    to: exportDates.to || undefined,
    patientName: exportPatientName.trim() !== "" ? exportPatientName.trim() : undefined,
    description: exportDescription.trim() !== "" ? exportDescription.trim() : undefined,
  });

    setShowExportModal(false);
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
        <div className="w-full rounded-2xl bg-white p-3 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
            {loading && <LoadingOverlay />}

            {/* Header & Filters */}
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:mb-4 md:flex-row md:items-center">
                <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 sm:text-lg">Treatment Records</h2>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search treatments..."
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:px-4 sm:py-2 sm:text-sm"
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

                    {/* Date Filters */}
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow hover:bg-blue-700 active:scale-95 dark:bg-blue-700 dark:hover:bg-blue-600 sm:text-sm"
                    >
                        Export PDF Report
                    </button>
                </div>

                {/* Add Button (only if not patient/staff) */}
                {role !== "staff" && role !== "patient" && (
                    <button
                        onClick={onAddTreatment}
                        className="mt-2 self-end rounded-full bg-blue-500 p-1.5 text-white hover:bg-green-600 md:mt-0"
                        title="Add Treatment"
                    >
                        <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                )}
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
                    ) : currentTreatments.length > 0 ? (
                        currentTreatments.map((treatment, index) => (
                            <div
                                key={treatment._id}
                                className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                            {indexOfFirstItem + index + 1}. {treatment.treatment_description || "N/A"}
                                        </div>
                                        <div className="mt-1 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                            <div>
                                                <span className="font-medium">ID:</span> {treatment._id?.slice(-6) || "N/A"}
                                            </div>
                                            {role !== "patient" && (
                                                <div>
                                                    <span className="font-medium">Patient:</span> {treatment.patient_name || "N/A"}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Date:</span> {formatDate(treatment.treatment_date)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Cost:</span> {formatCurrency(treatment.treatment_cost)}
                                            </div>
                                        </div>
                                    </div>
                                    {role !== "staff" && role !== "patient" && (
                                        <button
                                            onClick={() => onTreatmentSelect(treatment)}
                                            className="ml-2 rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-sm text-blue-800 dark:text-blue-200">No treatment records found</div>
                    )}
                </div>
            ) : (
                /* Desktop: Table View */
                <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <table className="w-full text-sm">
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
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTreatments.length > 0 ? (
                                currentTreatments.map((treatment, index) => (
                                    <tr
                                        key={treatment._id}
                                        className="border-b hover:bg-blue-50/50 dark:border-blue-800/50 dark:hover:bg-blue-900/20"
                                    >
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {treatment._id || "N/A"}
                                        </td>
                                        {role !== "patient" && (
                                            <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                                {treatment.patient_name || "N/A"}
                                            </td>
                                        )}
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {treatment.treatment_description || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatDate(treatment.treatment_date)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatCurrency(treatment.treatment_cost)}
                                        </td>
                                        {role !== "staff" && role !== "patient" && (
                                            <td className="border px-3 py-2.5 text-center dark:border-blue-800/50">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => onTreatmentSelect(treatment)}
                                                        className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleDeleteTreatment(treatment._id)}
                                                        className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button> */}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={role !== "staff" && role !== "patient" ? 7 : 6}
                                        className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                    >
                                        No treatment records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {filteredTreatments.length > 0 && (
                <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-200 sm:mt-4 sm:flex-row sm:text-sm">
                    <div>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTreatments.length)} of {filteredTreatments.length}{" "}
                        entries
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            «
                        </button>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
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
                                        currentPage === pageNum
                                            ? "bg-blue-100 font-bold dark:bg-blue-800/50"
                                            : "hover:bg-blue-100 dark:hover:bg-blue-800/20"
                                    } sm:px-3 sm:py-1`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => paginate(totalPages)}
                            disabled={currentPage === totalPages}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
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
            {/* Export Modal with Status */}
            <ExportPdfModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onGenerate={handleGeneratePDF}
                exportDates={exportDates}
                setExportDates={setExportDates}
                setExportPatientName={setExportPatientName}
                exportPatientName={exportPatientName}
                exportDescription={exportDescription}
                setExportDescription={setExportDescription}

            />
        </div>
    );
};

export default TreatmentTable;
