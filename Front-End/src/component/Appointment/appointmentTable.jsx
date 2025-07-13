import React, { useContext, useState, useEffect } from "react";
import { AppointmentDisplayContext } from "../../contexts/AppointmentContext/appointmentContext";
import { Ban, CalendarCheck, CalendarSync, CircleCheckBig, User, FileDown, Trash } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay"; // Import the LoadingOverlay component
import StatusVerification from "../../ReusableFolder/StatusModal";
const AppointmentTable = () => {
    const { authToken, linkId, role } = useContext(AuthContext);
    const { appointment, isPatientData, UpdateStatus, fetchPdfSpecificAppointment, GetPatientAppointment, deleteAppointment } =
        useContext(AppointmentDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isDoctorModal, setDoctorModal] = useState(false);
    const [isDoctorData, setDoctorData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loading, setLoading] = useState(false);
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

    const filteredAppointments = appointmentList.filter((app) => {
        if (!app || !app.patient_info || !app.doctor_info) {
            console.warn("Skipping an appointment entry due to missing patient_info or doctor_info.");
            return false;
        }

        const searchLower = searchTerm.toLowerCase();

        const patientMatches =
            app.patient_info.first_name?.toLowerCase().includes(searchLower) ||
            app.patient_info.last_name?.toLowerCase().includes(searchLower) ||
            app.patient_info.email?.toLowerCase().includes(searchLower) ||
            app.patient_info.address?.toLowerCase().includes(searchLower);

        const doctorMatches =
            app.doctor_info.first_name?.toLowerCase().includes(searchLower) ||
            app.doctor_info.last_name?.toLowerCase().includes(searchLower) ||
            app.doctor_info.email?.toLowerCase().includes(searchLower) ||
            app.doctor_info.specialty?.toLowerCase().includes(searchLower);

        const statusMatches = app.appointment_status?.toLowerCase().includes(searchLower);

        // Date filtering logic
        const appointmentDate = new Date(app.appointment_date);
        let dateMatches = true;

        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0); // Set to start of the day
            dateMatches = dateMatches && appointmentDate >= from;
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999); // Set to end of the day
            dateMatches = dateMatches && appointmentDate <= to;
        }

        return (patientMatches || doctorMatches || statusMatches) && dateMatches;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromDate, toDate]); // Re-evaluate pagination on date filter change

    const onAppointmentSelect = (appData) => {
        setDoctorModal(true);
        setDoctorData(appData);
    };

    const handleCancelAppointment = async (Id) => {
        setLoading(true); // Show loading when the cancellation starts
        await UpdateStatus(Id, "Cancelled");
        setLoading(false); // Hide loading after the action
    };

    const handleStatusApproved = async (Id) => {
        setLoading(true); // Show loading when approval starts
        await UpdateStatus(Id, "Confirmed");
        setLoading(false); // Hide loading after the action
    };

    const handleCompleteAppointment = async (Id) => {
        setLoading(true); // Show loading when marking as completed starts
        await UpdateStatus(Id, "Completed");
        setLoading(false); // Hide loading after the action
    };

    const handleDownloadPdf = async (id) => {
        setLoading(true); // Show loading while fetching the PDF
        await fetchPdfSpecificAppointment(id);
        setLoading(false); // Hide loading after the action
    };

    const handleDelete = (id) => {
        try {
            setLoading(true);

            setIsDeleteId(id);
            setVerification(true);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        await deleteAppointment(isDeleteID);
        handleCloseModal();
    };

       const handleCloseModal = () => {
        setVerification(false);
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            {loading && <LoadingOverlay />} {/* Show LoadingOverlay while loading */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Appointment List</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Appointments..."
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

                    {/* From Date Filter */}
                    <div className="relative">
                        <label
                            htmlFor="fromDate"
                            className="sr-only"
                        >
                            From Date
                        </label>
                        <input
                            type="date"
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-48"
                            title="Filter from date"
                        />
                    </div>

                    {/* To Date Filter */}
                    <div className="relative">
                        <label
                            htmlFor="toDate"
                            className="sr-only"
                        >
                            To Date
                        </label>
                        <input
                            type="date"
                            id="toDate"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-48"
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
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Appointment ID</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name (ID)</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Address</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date of Birth</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Doctor Name</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                Doctor Contact Number
                            </th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                Appointment Date
                            </th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                Appointment Status
                            </th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Specialty</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAppointments.length > 0 ? (
                            currentAppointments.map((app, index) => (
                                <tr
                                    key={app._id || `appointment-${index}`}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{app._id || "N/A"}</td>

                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        {`${app.patient_info.first_name || "N/A"} ${app.patient_info.last_name || "N/A"}`}(
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{app.patient_id}</span>)
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
                                    <td className="bg-transparent p-3 align-top">
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
                                                        className="rounded bg-transparent p-1.5 text-red-500 transition-all duration-300 ease-in-out hover:scale-110 hover:bg-green-500/20 hover:text-green-600 dark:text-red-300 dark:hover:bg-green-500/20 dark:hover:text-green-400"
                                                        title="Mark as Approved"
                                                    >
                                                        <CalendarCheck className="h-4 w-4 stroke-current" />
                                                    </button>
                                                )}

                                            {role !== "staff" && role !== "patient" && app.appointment_status === "Confirmed" && (
                                                <button
                                                    onClick={() => handleCompleteAppointment(app._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    title="Mark as Completed"
                                                >
                                                    <CircleCheckBig className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
                                                </button>
                                            )}

                                            {role === "patient" && app.appointment_status === "Confirmed" && (
                                                <button
                                                    onClick={() => handleDownloadPdf(app._id)}
                                                    className="rounded bg-transparent p-1.5 text-orange-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    title="Download File"
                                                >
                                                    <FileDown className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
                                                </button>
                                            )}

                                            {role === "admin" && (
                                                <button
                                                    onClick={() => handleDelete(app._id)}
                                                    className="rounded bg-transparent p-1.5 text-orange-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    title="Download File"
                                                >
                                                    <Trash className="h-4 w-4 stroke-red-800 dark:stroke-red-700" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="12"
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No appointments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredAppointments.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAppointments.length)} of{" "}
                            {filteredAppointments.length} entries
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
                                            currentPage === pageNum
                                                ? "bg-blue-100 font-bold dark:bg-blue-800/50"
                                                : "text-blue-800 dark:border-blue-800/50 dark:text-blue-200"
                                        }`}
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
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default AppointmentTable;
