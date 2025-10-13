import { useState, useEffect, useContext, useMemo } from "react";
import { PencilIcon, TrashIcon, PlusCircle, FileText } from "lucide-react";
import { PrescriptionDisplayContext } from "../../contexts/PrescriptionContext/PrescriptionContext";
import { AuthContext } from "../../contexts/AuthContext";
import PrescriptionForm from "./PrescriptionForm";
import StatusVerification from "../../ReusableFolder/StatusModal";
import PdfViewerModal from "./PdfViewerModal";

const PrescriptionTable = () => {
    const { role } = useContext(AuthContext);
    const { Prescription, DeletePrescription, fetchPrescriptionPDF } = useContext(PrescriptionDisplayContext);

    const prescriptionsData = Prescription;

    const [pdfUrl, setPdfUrl] = useState("");
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime()) || date.toString() === "Invalid Date") return "Invalid Date";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const filteredPrescriptions = useMemo(() => {
        if (!prescriptionsData || prescriptionsData.length === 0) return [];
        const searchLower = searchTerm.toLowerCase();
        return prescriptionsData.filter((prescription) => {
            if (!prescription) return false;
            const medicationMatch = prescription.medication_name?.toLowerCase().includes(searchLower);
            const dosageMatch = prescription.dosage?.toLowerCase().includes(searchLower);
            const frequencyMatch = prescription.frequency?.toLowerCase().includes(searchLower);
            const idMatch = prescription._id?.toLowerCase().includes(searchLower);
            const appointmentMatch = prescription.appointment_id?.toLowerCase().includes(searchLower);
            return medicationMatch || dosageMatch || frequencyMatch || idMatch || appointmentMatch;
        });
    }, [prescriptionsData, searchTerm]);

    const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPrescriptions = filteredPrescriptions.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    useEffect(() => setCurrentPage(1), [searchTerm]);

    const handleViewPDF = async (prescriptionId) => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl("");
        setPdfLoading(true);

        try {
            const pdfBlob = await fetchPrescriptionPDF(prescriptionId);

            if (pdfBlob) {
                const url = URL.createObjectURL(pdfBlob);
                setPdfUrl(url);
                setShowPdfModal(true);
            } else {
                console.error("No PDF available for prescription:", prescriptionId);
                setPdfUrl(null);
                setShowPdfModal(true);
            }
        } catch (error) {
            console.error("Error fetching prescription PDF:", error);
            setPdfUrl(null);
            setShowPdfModal(true);
        } finally {
            setPdfLoading(false);
        }
    };

    const onPrescriptionSelect = (prescription) => {
        setSelectedPrescription(prescription);
        setModalOpen(true);
    };

    const handleDeletePrescription = (prescriptionId) => {
        setIsDeleteId(prescriptionId);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await DeletePrescription(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => setVerification(false);

    const onAddPrescription = () => {
        setSelectedPrescription(null);
        setModalOpen(true);
    };

    useEffect(() => {
        if (!showPdfModal && pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl("");
            setPdfLoading(false);
        }
    }, [showPdfModal]);

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, []);

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Prescription ID</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Medication Name</th>
                            {role !== "staff" && (
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={onAddPrescription}
                                            className="rounded p-1.5 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-300/10"
                                            aria-label="Add new prescription"
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
                                    {/* Medication(s) column — no colSpan */}
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">
                                        {prescription.medications && prescription.medications.length > 0 ? (
                                            <ul className="list-inside list-disc space-y-1">
                                                {prescription.medications.map((med, i) => (
                                                    <li key={i}>
                                                        <span className="font-semibold">{med.medication_name}</span> - {med.dosage}, {med.frequency}{" "}
                                                        <br />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(med.start_date)} → {formatDate(med.end_date)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "No Medications"
                                        )}
                                    </td>

                                    {/* Actions column (only if not staff) */}
                                  
                                        <td className="border px-3 py-2 dark:border-blue-800/50">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewPDF(prescription._id)}
                                                    className="flex items-center gap-1 rounded bg-transparent p-1.5 text-green-500 hover:bg-green-500/10 disabled:opacity-50 dark:text-green-300 dark:hover:bg-green-300/10"
                                                    disabled={pdfLoading}
                                                    aria-label={`View PDF for prescription ${prescription._id}`}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                               {/*}
                                                <button
                                                    onClick={() => handleDeletePrescription(prescription._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    aria-label={`Delete prescription ${prescription._id}`}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                                */}
                                            </div>
                                        </td>
                                    
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={role !== "staff" ? 5 : 4}
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No prescription records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredPrescriptions.length > itemsPerPage && (
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
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((pageNum) => {
                                    if (totalPages <= 5) return true;
                                    if (currentPage <= 3) return pageNum <= 5;
                                    if (currentPage >= totalPages - 2) return pageNum >= totalPages - 4;
                                    return pageNum >= currentPage - 2 && pageNum <= currentPage + 2;
                                })
                                .map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`rounded border px-3 py-1 ${currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"} dark:border-blue-800/50`}
                                        aria-current={currentPage === pageNum ? "page" : undefined}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
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

            <PdfViewerModal
                isOpen={showPdfModal}
                onClose={() => setShowPdfModal(false)}
                pdfUrl={pdfUrl}
                isLoading={pdfLoading}
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
