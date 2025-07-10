import React, { useContext, useState, useEffect } from "react";
import { StaffDisplayContext } from "../../contexts/StaffContext/StaffContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import { Pencil, Trash2, PlusCircle, User } from "lucide-react";
import StaffFormModal from "./StaffFormModal";
import Register from "../Login/Register";
import StatusVerification from "../../ReusableFolder/StatusModal";
const StaffTable = () => {
    const { isStaff, DeleteStaff, updateStaff, addStaff } = useContext(StaffDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState(null);
    const [isRegisterModal, setRegisterModal] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");

    const filteredStaff = isStaff.filter((staff) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            staff.first_name?.toLowerCase().includes(searchLower) ||
            staff.last_name?.toLowerCase().includes(searchLower) ||
            staff.contact_number?.toLowerCase().includes(searchLower) ||
            staff.email?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleCloseModal = () => {
        setVerification(false);
        setRegisterModal(false);
        setShowModal(false);
        setStaffToEdit(null);
    };

    const handleDelete = (staffId) => {
        try {
            setLoading(true);
            setIsDeleteId(staffId);
            setVerification(true);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        await DeleteStaff(isDeleteID);
        handleCloseModal();
    };

    const handleAddStaffClick = () => {
        setStaffToEdit(null);
        setRegisterModal(true);
    };

    const handleEditClick = (staffData) => {
        setStaffToEdit(staffData);
        setShowModal(true);
    };

    const handleSaveStaff = async (staffData) => {
        setLoading(true);
        try {
            if (staffToEdit) {
                // Update staff
                await updateStaff(staffToEdit._id, staffData);
            } else {
                // Add new staff
                await addStaff(staffData);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving staff:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            {loading && <LoadingOverlay />}

            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Staff List</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Staff..."
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
                    <button
                        onClick={handleAddStaffClick}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                        <PlusCircle className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">#</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Avatar</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Name</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Contact Number</th>
                            <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Email</th>
                            <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStaff.length > 0 ? (
                            currentStaff.map((data, index) => (
                                <tr
                                    key={data._id}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                                >
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {data.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${data.avatar.replace("\\", "/")}`}
                                                alt={`${data.first_name} ${data.last_name} Avatar`}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                                                <User className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {(data.first_name || "") + " " + (data.last_name || "") || "N/A"}
                                    </td>

                                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {data.contact_number || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2 dark:border-blue-800/50 dark:text-blue-300">{data.email || "N/A"}</td>
                                    <td className="bg-transparent p-3 align-top">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(data)}
                                                className="rounded bg-transparent p-1.5 text-blue-500 transition-colors duration-200 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                title="Edit Staff"
                                            >
                                                <Pencil className="h-4 w-4 stroke-blue-500 dark:stroke-blue-300" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(data._id)}
                                                className="rounded bg-transparent p-1.5 text-red-500 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                                                title="Delete Staff"
                                            >
                                                <Trash2 className="h-4 w-4 stroke-red-500 dark:stroke-red-300" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                >
                                    No staff data found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {filteredStaff.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} entries
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
            <StaffFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveStaff}
                initialData={staffToEdit}
            />
            <Register
                isOpen={isRegisterModal}
                onClose={() => setRegisterModal(false)}
                role="staff"
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default StaffTable;
