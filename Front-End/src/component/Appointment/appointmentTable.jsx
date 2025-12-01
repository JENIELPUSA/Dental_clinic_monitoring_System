import React, { useContext, useState, useEffect, useMemo } from "react";
import { AppointmentDisplayContext } from "../../contexts/AppointmentContext/appointmentContext";
import { Ban, CalendarCheck, CircleCheckBig, User, FileDown } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import StatusVerification from "../../ReusableFolder/StatusModal";
import ExportPdfModal from "./ExportPdf"; 

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
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
            ))}
        </div>
    </div>
);

const AppointmentTable = () => {
    const { linkId, role } = useContext(AuthContext);
    const {
        appointment,
        isPatientData,
        UpdateStatus,
        fetchPdfSpecificAppointment,
        GetPatientAppointment,
        deleteAppointment,
        totalPages,
        currentPage,
        fetchAppointmentData,
        TotalAppointment,
        loading,
        setCurrentPage,fetchAppointmentReportPDF
    } = useContext(AppointmentDisplayContext);

    const [searchFilters, setSearchFilters] = useState({
        searchTerm: "",
        From: "",
        To: "",
    });
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");

    const isMobile = useIsMobile();

    const appointmentList = useMemo(() => {
        return role === "patient" ? isPatientData || [] : appointment || [];
    }, [role, isPatientData, appointment]);

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({
        from: "",
        to: "",
    });
    const [exportStatus, setExportStatus] = useState(""); // Status state for export

    const itemsPerPage = 5;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    // Fetch patient data kapag patient ang role
    useEffect(() => {
        if (linkId && role === "patient") {
            GetPatientAppointment(linkId);
        }
    }, [linkId, role]);

    // Debounced fetch for search/date filters (non-patient only)
    useEffect(() => {
        if (role === "patient") return;

        const delayDebounce = setTimeout(() => {
            fetchAppointmentData({
                page: 1,
                search: searchFilters.searchTerm || undefined,
                From: searchFilters.From || undefined,
                To: searchFilters.To || undefined,
            });
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [searchFilters, role]);

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
    fetchAppointmentReportPDF({
        from: exportDates.from,
        to: exportDates.to,
        status: exportStatus || undefined, // Pass undefined if empty to ignore filter
    });

    setShowExportModal(false);
};

    const getStatusBadge = (status) => {
        let badgeClasses = "px-2 py-0.5 rounded-full text-xs font-semibold text-white ";
        switch (status?.toLowerCase()) {
            case "pending":
                badgeClasses += "bg-yellow-500";
                break;
            case "confirmed":
                badgeClasses += "bg-green-500";
                break;
            case "cancelled":
                badgeClasses += "bg-red-500";
                break;
            case "completed":
                badgeClasses += "bg-blue-500";
                break;
            default:
                badgeClasses += "bg-gray-500";
                break;
        }
        return <span className={badgeClasses}>{status || "N/A"}</span>;
    };

    const handleCancelAppointment = async (Id) => {
        await UpdateStatus(Id, "Cancelled");
    };

    const handleStatusApproved = async (Id) => {
        await UpdateStatus(Id, "Confirmed");
    };

    const handleCompleteAppointment = async (Id) => {
        await UpdateStatus(Id, "Completed");
    };

    const handleDownloadPdf = async (id) => {
        await fetchPdfSpecificAppointment(id);
    };

    const handleDelete = (id) => {
        setIsDeleteId(id);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await deleteAppointment(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchAppointmentData({
                page,
                search: searchFilters.searchTerm || undefined,
                From: searchFilters.From || undefined,
                To: searchFilters.To || undefined,
            });
        }
    };

    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, TotalAppointment || 0);

    return (
        <div className="w-full rounded-2xl bg-white p-3 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
            {/* Header & Filters */}
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:mb-4 md:flex-row md:items-center">
                <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 sm:text-lg">Appointment List</h2>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Appointments..."
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:px-4 sm:py-2 sm:text-sm"
                            value={searchFilters.searchTerm}
                            onChange={(e) => setSearchFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                        />
                        {searchFilters.searchTerm && (
                            <button
                                onClick={() => setSearchFilters((prev) => ({ ...prev, searchTerm: "" }))}
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
                            value={searchFilters.From}
                            onChange={(e) => setSearchFilters((prev) => ({ ...prev, From: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
                        />
                        <input
                            type="date"
                            value={searchFilters.To}
                            onChange={(e) => setSearchFilters((prev) => ({ ...prev, To: e.target.value }))}
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
                    ) : appointmentList.length > 0 ? (
                        appointmentList.map((app, index) => (
                            <div
                                key={app._id || `appointment-${index}`}
                                className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                            {startEntry + index}. {app._id?.slice(-6) || "N/A"}
                                        </div>
                                        <div className="mt-1 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                            <div>
                                                <span className="font-medium">Patient:</span>{" "}
                                                {`${app.patient_info.first_name || "N/A"} ${app.patient_info.last_name || ""}`}
                                            </div>
                                            <div>
                                                <span className="font-medium">Date:</span> {formatDate(app.appointment_date)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Doctor:</span>{" "}
                                                {`${app.doctor_info.first_name || "N/A"} ${app.doctor_info.last_name || ""}`}
                                            </div>
                                            <div>
                                                <span className="font-medium">Status:</span> {getStatusBadge(app.appointment_status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {role !== "staff" &&
                                        role !== "doctor" &&
                                        app.appointment_status !== "Cancelled" &&
                                        app.appointment_status !== "Completed" && (
                                            <button
                                                onClick={() => handleCancelAppointment(app._id)}
                                                className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-600 hover:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
                                                title="Cancel"
                                            >
                                                Cancel
                                            </button>
                                        )}

                                    {["admin", "staff", "doctor"].includes(role) &&
                                        app.appointment_status !== "Completed" &&
                                        app.appointment_status !== "Confirmed" &&
                                        app.appointment_status !== "Cancelled" && (
                                            <button
                                                onClick={() => handleStatusApproved(app._id)}
                                                className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-600 hover:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
                                                title="Approve"
                                            >
                                                Approve
                                            </button>
                                        )}

                                    {role !== "staff" && role !== "patient" && app.appointment_status === "Confirmed" && (
                                        <button
                                            onClick={() => handleCompleteAppointment(app._id)}
                                            className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-600 hover:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30"
                                            title="Complete"
                                        >
                                            Complete
                                        </button>
                                    )}

                                    {role === "patient" && app.appointment_status === "Confirmed" && (
                                        <button
                                            onClick={() => handleDownloadPdf(app._id)}
                                            className="rounded bg-orange-500/10 px-2 py-1 text-xs text-orange-600 hover:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30"
                                            title="Download"
                                        >
                                            Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-sm text-blue-800 dark:text-blue-200">
                            {loading ? "Loading..." : "No appointments found."}
                        </div>
                    )}
                </div>
            ) : (
                /* Desktop: Table View */
                <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Appointment ID</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name (ID)</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Address</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date of Birth</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Doctor Name</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Doctor Contact
                                </th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                    Appointment Date
                                </th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Status</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Specialty</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointmentList.length > 0 ? (
                                appointmentList.map((app, index) => (
                                    <tr
                                        key={app._id || `appointment-${index}`}
                                        className="border-b hover:bg-blue-50/50 dark:border-blue-800/50 dark:hover:bg-blue-900/20"
                                    >
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {startEntry + index}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {app._id || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            <User className="mr-2 inline h-3.5 w-3.5 text-gray-500 dark:text-gray-400 sm:h-4 sm:w-4" />
                                            {`${app.patient_info.first_name || "N/A"} ${app.patient_info.last_name || "N/A"}`}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {app.patient_info.address || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatDate(app.patient_info.dob) || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {`${app.doctor_info.first_name || "N/A"} ${app.doctor_info.last_name || "N/A"}`}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {app.doctor_info.contact_number || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatDate(app.appointment_date)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-center align-middle dark:border-blue-800/50">
                                            {getStatusBadge(app.appointment_status)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {app.doctor_info.specialty || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2.5 text-center dark:border-blue-800/50">
                                            <div className="flex justify-center gap-2">
                                                {role !== "staff" &&
                                                    role !== "doctor" &&
                                                    app.appointment_status !== "Cancelled" &&
                                                    app.appointment_status !== "Completed" && (
                                                        <button
                                                            onClick={() => handleCancelAppointment(app._id)}
                                                            className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                            title="Cancel"
                                                        >
                                                            <Ban className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
                                                        </button>
                                                    )}

                                                {["admin", "staff", "doctor"].includes(role) &&
                                                    app.appointment_status !== "Completed" &&
                                                    app.appointment_status !== "Confirmed" &&
                                                    app.appointment_status !== "Cancelled" && (
                                                        <button
                                                            onClick={() => handleStatusApproved(app._id)}
                                                            className="rounded p-1.5 text-green-600 hover:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                                                            title="Approve"
                                                        >
                                                            <CalendarCheck className="h-4 w-4 stroke-current" />
                                                        </button>
                                                    )}

                                                {role !== "staff" && role !== "patient" && app.appointment_status === "Confirmed" && (
                                                    <button
                                                        onClick={() => handleCompleteAppointment(app._id)}
                                                        className="rounded p-1.5 text-blue-600 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                        title="Complete"
                                                    >
                                                        <CircleCheckBig className="h-4 w-4 stroke-current" />
                                                    </button>
                                                )}

                                                {role === "patient" && app.appointment_status === "Confirmed" && (
                                                    <button
                                                        onClick={() => handleDownloadPdf(app._id)}
                                                        className="rounded p-1.5 text-orange-500 hover:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-300/10"
                                                        title="Download"
                                                    >
                                                        <FileDown className="h-4 w-4 stroke-current" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="11"
                                        className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                    >
                                        {loading ? "Loading..." : "No appointments found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-200 sm:mt-4 sm:flex-row sm:text-sm">
                    <div>
                        Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                        <span className="font-medium">{TotalAppointment || 0}</span> entries
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className={`rounded border px-2 py-1 ${
                                currentPage === 1
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            } sm:px-3 sm:py-1`}
                        >
                            «
                        </button>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`rounded border px-2 py-1 ${
                                currentPage === 1
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            } sm:px-3 sm:py-1`}
                        >
                            ‹
                        </button>

                        <button className="rounded border bg-blue-100 px-2 py-1 font-bold text-blue-800 dark:bg-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1">
                            {currentPage}
                        </button>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`rounded border px-2 py-1 ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            } sm:px-3 sm:py-1`}
                        >
                            ›
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`rounded border px-2 py-1 ${
                                currentPage === totalPages
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            } sm:px-3 sm:py-1`}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

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
                exportStatus={exportStatus}
                setExportStatus={setExportStatus}
            />
        </div>
    );
};

export default AppointmentTable;