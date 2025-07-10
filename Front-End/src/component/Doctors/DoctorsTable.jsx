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
    const { doctor = [], Deletedata } = useContext(DoctorDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDoctorModal, setDoctorModal] = useState(false);
    const [isDoctorData, setDoctorData] = useState(null);
    const [isScheduleModal, setScheduleModal] = useState(false);
    const [isScheduleData, setScheduleData] = useState("");
    const [isRegisterModal, setRegisterModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 5;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US");
    };

    const filteredDoctors = doctor.filter((dr) => {
        if (!dr) {
            console.warn("Skipping an undefined/null doctor entry in the list.");
            return false;
        }
        const searchLower = searchTerm.toLowerCase();
        return (
            dr.first_name?.toLowerCase().includes(searchLower) ||
            dr.last_name?.toLowerCase().includes(searchLower) ||
            dr.email?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        // Idagdag ang check para sa valid pageNumber para hindi lalagpas
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const onDoctortSelect = (dr) => {
        setDoctorModal(true);
        setDoctorData(dr);
    };

    const handleDeleteUser = (doctorId) => {
        try {
            setLoading(true);
            setIsDeleteId(doctorId);
            setVerification(true);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        await Deletedata(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const onAddSchedule = async (doctorId) => {
        console.log("pick data", doctorId);
        setScheduleData(doctorId);
        setScheduleModal(true);
    };

    const onAddDoctor = async () => {
        setRegisterModal(true);
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">List Of Doctors</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search doctors..."
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
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Avatar</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Name</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Specialty</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Email</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date Created</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                                <div className="flex items-center justify-center">
                                    {role === "staff" ? (
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Action</span>
                                    ) : (
                                        <button
                                            onClick={() => onAddDoctor()}
                                            className="rounded p-1.5 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-300/10"
                                        >
                                            <UserRoundPlus className="h-4 w-4 stroke-blue-500 dark:stroke-blue-500" />
                                        </button>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDoctors.length > 0 ? (
                            currentDoctors.map((dr, index) => (
                                <tr
                                    key={dr._id || `doctor-${index}`}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {dr.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${dr.avatar.replace("\\", "/")}`} // Ensure forward slashes
                                                alt={`${dr.first_name} ${dr.last_name} Avatar`}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                                                <User className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                                            </div>
                                        )}
                                    </td>

                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {`${dr.first_name || "N/A"} ${dr.last_name || "N/A"}`}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {dr.specialty || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{dr.email || "N/A"}</td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {formatDate(dr.created_at)}
                                    </td>
                                    <td className="bg-transparent p-3">
                                        <div className="flex items-center justify-center gap-2">
                                            {role !== "staff" && (
                                                <>
                                                    <button
                                                        onClick={() => onDoctortSelect(dr)}
                                                        className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                    >
                                                        <PencilIcon className="h-4 w-4 stroke-blue-500 dark:stroke-blue-300" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(dr._id)}
                                                        className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                    >
                                                        <TrashIcon className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
                                                    </button>
                                                </>
                                            )}

                                            {dr.scheduled !== true && (
                                                <button
                                                    onClick={() => onAddSchedule(dr._id)}
                                                    className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
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
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No doctors found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredDoctors.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDoctors.length)} of {filteredDoctors.length} entries
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
