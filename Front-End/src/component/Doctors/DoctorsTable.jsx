// components/DoctorTable.jsx
import { useContext, useState, useEffect } from "react";
import { DoctorDisplayContext } from "../../contexts/DoctorContext/doctorContext";
import { PencilIcon, TrashIcon, CalendarCheck, UserRoundPlus, User } from "lucide-react";
import DoctorFormModal from "./DoctorAddDorm";
import Schdedule from "../Schedule/Schedule";
import Register from "../Login/Register";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";

const DoctorTable = () => {
    const { role } = useContext(AuthContext);
    const { doctor = [], Deletedata, isTotalDoctors, isTotalPages, currentPage, loading, fetchDoctortData } = useContext(DoctorDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [isDoctorModal, setDoctorModal] = useState(false);
    const [isDoctorData, setDoctorData] = useState(null);
    const [isScheduleModal, setScheduleModal] = useState(false);
    const [isScheduleData, setScheduleData] = useState("");
    const [isRegisterModal, setRegisterModal] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const itemsPerPage = 5;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US");
    };

    // Debounced search — reset to page 1 on new search
    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchDoctortData({
                page: 1,
                search: searchTerm || undefined,
            });
        }, 400);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    // Initial load
    useEffect(() => {
        if (!loading && doctor.length === 0 && isTotalDoctors === undefined) {
            fetchDoctortData({ page: 1 });
        }
    }, []);

    const goToPage = (page) => {
        if (page >= 1 && page <= isTotalPages) {
            fetchDoctortData({
                page,
                search: searchTerm || undefined,
            });
        }
    };

    const onDoctortSelect = (dr) => {
        setDoctorModal(true);
        setDoctorData(dr);
    };

    const handleDeleteUser = (doctorId) => {
        setIsDeleteId(doctorId);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await Deletedata(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const onAddSchedule = (doctorId) => {
        setScheduleData(doctorId);
        setScheduleModal(true);
    };

    const onAddDoctor = () => {
        setRegisterModal(true);
    };

    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, isTotalDoctors || 0);

    return (
        <div className="w-full rounded-2xl bg-white p-4 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200 sm:text-xl">List Of Doctors</h2>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300"
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

            {/* Table Container */}
            <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">No.</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Avatar</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Name</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Specialty</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Email</th>
                            <th className="border px-3 py-2.5 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date Created</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                <div className="flex items-center justify-center">
                                    {role === "staff" ? (
                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 sm:text-sm">Action</span>
                                    ) : (
                                        <button
                                            onClick={onAddDoctor}
                                            className="rounded p-1.5 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-300/10"
                                            aria-label="Add doctor"
                                        >
                                            <UserRoundPlus className="h-4 w-4 stroke-blue-500 dark:stroke-blue-500" />
                                        </button>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctor.length > 0 ? (
                            doctor.map((dr, index) => (
                                <tr
                                    key={dr._id || `doctor-${index}`}
                                    className="border-b border-blue-100 hover:bg-blue-50/50 dark:border-blue-800/30 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {dr.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${dr.avatar.replace(/\\/g, "/")}`}
                                                alt={`${dr.first_name} ${dr.last_name} Avatar`}
                                                className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 sm:h-10 sm:w-10">
                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-200" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {`${dr.first_name || "N/A"} ${dr.last_name || "N/A"}`}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {dr.specialty || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {dr.email || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(dr.created_at)}
                                    </td>
                                    <td className="border px-3 py-2.5 text-center dark:border-blue-800/50">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {role !== "staff" && (
                                                <>
                                                    <button
                                                        onClick={() => onDoctortSelect(dr)}
                                                        className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4 stroke-blue-500 dark:stroke-blue-300" />
                                                    </button>
                                                    {/* 
<button
    onClick={() => handleDeleteUser(dr._id)}
    className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
    title="Delete"
>
    <TrashIcon className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
</button>
*/}
                                                </>
                                            )}
                                            {dr.scheduled !== true && (
                                                <button
                                                    onClick={() => onAddSchedule(dr._id)}
                                                    className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    title="Add Schedule"
                                                >
                                                    <CalendarCheck className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-3 py-6 text-center text-blue-800 dark:text-blue-200"
                                >
                                    {loading ? "Loading..." : "No doctors found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && isTotalPages > 1 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                        <span className="font-medium">{isTotalDoctors || 0}</span> entries
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className={`rounded border px-2.5 py-1 text-sm ${
                                currentPage === 1
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            }`}
                        >
                            «
                        </button>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`rounded border px-2.5 py-1 text-sm ${
                                currentPage === 1
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            }`}
                        >
                            ‹
                        </button>

                        <button className="rounded border bg-blue-100 px-2.5 py-1 text-sm font-bold text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
                            {currentPage}
                        </button>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === isTotalPages}
                            className={`rounded border px-2.5 py-1 text-sm ${
                                currentPage === isTotalPages
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            }`}
                        >
                            ›
                        </button>
                        <button
                            onClick={() => goToPage(isTotalPages)}
                            disabled={currentPage === isTotalPages}
                            className={`rounded border px-2.5 py-1 text-sm ${
                                currentPage === isTotalPages
                                    ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                                    : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
                            }`}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <DoctorFormModal
                isOpen={isDoctorModal}
                onClose={() => setDoctorModal(false)}
                initialData={isDoctorData}
            />
            <Register
                isOpen={isRegisterModal}
                onClose={() => setRegisterModal(false)}
                role="doctor"
            />
            <Schdedule
                isOpen={isScheduleModal}
                onClose={() => setScheduleModal(false)}
                selectedDoctorId={isScheduleData}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default DoctorTable;
