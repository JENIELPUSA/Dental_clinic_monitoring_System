import React, { useContext, useState, useEffect } from "react";
import { AppointmentDisplayContext } from "../../contexts/AppointmentContext/appointmentContext";
import { Ban, CalendarCheck, CircleCheckBig, User, FileDown, Trash } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
// Tinanggal: import LoadingOverlay
import StatusVerification from "../../ReusableFolder/StatusModal";

// ✅ Skeleton Row Component (Pulse Animation)
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
    {/* 12 columns to match your table */}
    {[...Array(12)].map((_, i) => (
      <td key={i} className="border px-3 py-3">
        <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
      </td>
    ))}
  </tr>
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
        loading,setCurrentPage
    } = useContext(AppointmentDisplayContext);

    const [searchFilters, setSearchFilters] = useState({
        searchTerm: "",
        From: "",
        To: "",
    });
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");

    const appointmentList = role === "patient" ? isPatientData || [] : appointment || [];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    useEffect(() => {
        if (linkId && role === "patient") {
            GetPatientAppointment(linkId);
        }
    }, [linkId, role]);

    // 🔍 Debounced filter effect
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchAppointmentData({
                page: 1,
                search: searchFilters.searchTerm || undefined,
                From: searchFilters.From || undefined,
                To: searchFilters.To || undefined,
            });
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchFilters]);

    const getStatusBadge = (status) => {
        let badgeClasses = "px-2 py-1 rounded-full text-xs font-semibold text-white ";
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
        // Optional: add local loading if needed, but context loading is enough
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

    const startEntry = (currentPage - 1) * 5 + 1;
    const endEntry = Math.min(currentPage * 5, TotalAppointment || 0);

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            {/* ✅ Removed: {loading && <LoadingOverlay />} */}

            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Appointment List</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
                    <div className="relative min-w-0 flex-1">
                        <input
                            type="text"
                            placeholder="Search Appointments..."
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300"
                            value={searchFilters.searchTerm}
                            onChange={(e) => setSearchFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                        />
                        {searchFilters.searchTerm && (
                            <button
                                onClick={() => setSearchFilters((prev) => ({ ...prev, searchTerm: "" }))}
                                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-2 md:w-auto">
                        <div className="relative min-w-0 flex-1">
                            <input
                                type="date"
                                id="From"
                                value={searchFilters.From}
                                onChange={(e) => setSearchFilters((prev) => ({ ...prev, From: e.target.value }))}
                                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                title="Filter from date"
                            />
                        </div>

                        <div className="relative min-w-0 flex-1">
                            <input
                                type="date"
                                id="To"
                                value={searchFilters.To}
                                onChange={(e) => setSearchFilters((prev) => ({ ...prev, To: e.target.value }))}
                                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                title="Filter to date"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Appointment ID</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name (ID)</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Address</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date of Birth</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Doctor Name</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Doctor Contact Number</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Appointment Date</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Appointment Status</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Specialty</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // ✅ Show 5 skeleton rows while loading
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : appointmentList.length > 0 ? (
                            appointmentList.map((app, index) => (
                                <tr
                                    key={app._id || `appointment-${index}`}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {(currentPage - 1) * 5 + index + 1}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{app._id || "N/A"}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        {`${app.patient_info.first_name || "N/A"} ${app.patient_info.last_name || "N/A"} `}
                                        (<span className="text-xs text-gray-500 dark:text-gray-400">{app.patient_id}</span>)
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {app.patient_info.address || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(app.patient_info.dob) || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {`${app.doctor_info.first_name || "N/A"} ${app.doctor_info.last_name || "N/A"}`}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {app.doctor_info.contact_number || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(app.appointment_date)}
                                    </td>
                                    <td className="border px-3 py-2 text-center align-middle dark:border-blue-800/50">
                                        {getStatusBadge(app.appointment_status)}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {app.doctor_info.specialty || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50">
                                        <div className="flex gap-2">
                                            {role !== "staff" &&
                                                role !== "doctor" &&
                                                app.appointment_status !== "Cancelled" &&
                                                app.appointment_status !== "Completed" && (
                                                    <button
                                                        onClick={() => handleCancelAppointment(app._id)}
                                                        className="rounded bg-transparent p-1.5 text-red-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
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
                                                        className="rounded bg-transparent p-1.5 text-green-600 transition-all duration-300 ease-in-out hover:scale-110 hover:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                                                        title="Mark as Approved"
                                                    >
                                                        <CalendarCheck className="h-4 w-4 stroke-current" />
                                                    </button>
                                                )}

                                            {role !== "staff" && role !== "patient" && app.appointment_status === "Confirmed" && (
                                                <button
                                                    onClick={() => handleCompleteAppointment(app._id)}
                                                    className="rounded bg-transparent p-1.5 text-blue-600 transition-colors duration-200 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                    title="Mark as Completed"
                                                >
                                                    <CircleCheckBig className="h-4 w-4 stroke-current" />
                                                </button>
                                            )}

                                            {role === "patient" && app.appointment_status === "Confirmed" && (
                                                <button
                                                    onClick={() => handleDownloadPdf(app._id)}
                                                    className="rounded bg-transparent p-1.5 text-orange-500 transition-colors duration-200 hover:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-300/10"
                                                    title="Download File"
                                                >
                                                    <FileDown className="h-4 w-4 stroke-current" />
                                                </button>
                                            )}

                                            {role === "admin" && (
                                                <button
                                                    onClick={() => handleDelete(app._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-600 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-400/10"
                                                    title="Delete Appointment"
                                                >
                                                    <Trash className="h-4 w-4 stroke-current" />
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
                                    No appointments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                            <span className="font-medium">{TotalAppointment || 0}</span> entries
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className={`rounded border px-3 py-1 ${
                                    currentPage === 1
                                        ? "cursor-not-allowed text-blue-800 opacity-50 dark:text-blue-200"
                                        : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                                }`}
                            >
                                «
                            </button>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`rounded border px-3 py-1 ${
                                    currentPage === 1
                                        ? "cursor-not-allowed text-blue-800 opacity-50 dark:text-blue-200"
                                        : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                                }`}
                            >
                                ‹
                            </button>

                            <button className="rounded border bg-blue-100 px-3 py-1 font-bold text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
                                {currentPage}
                            </button>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`rounded border px-3 py-1 ${
                                    currentPage === totalPages
                                        ? "cursor-not-allowed text-blue-800 opacity-50 dark:text-blue-200"
                                        : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                                }`}
                            >
                                ›
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`rounded border px-3 py-1 ${
                                    currentPage === totalPages
                                        ? "cursor-not-allowed text-blue-800 opacity-50 dark:text-blue-200"
                                        : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                                }`}
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default AppointmentTable;