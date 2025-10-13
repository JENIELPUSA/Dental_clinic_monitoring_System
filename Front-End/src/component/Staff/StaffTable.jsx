// components/StaffTable.jsx
import React, { useContext, useState, useEffect } from "react";
import { StaffDisplayContext } from "../../contexts/StaffContext/StaffContext";
import { Pencil, Trash2, PlusCircle, User } from "lucide-react";
import StaffFormModal from "./StaffFormModal";
import Register from "../Login/Register";
import StatusVerification from "../../ReusableFolder/StatusModal";

const StaffTable = () => {
    const {
        isStaff = [],
        DeleteStaff,
        updateStaff,
        addStaff,
        fetchStaff,
        currentPage,
        isTotalPages,
        isTotalStaff,
        loading,
    } = useContext(StaffDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState(null);
    const [isRegisterModal, setRegisterModal] = useState(false);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const itemsPerPage = 5;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US");
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchStaff({ page: 1, search: searchTerm || undefined });
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (!loading && isStaff.length === 0 && isTotalStaff === undefined) {
            fetchStaff({ page: 1 });
        }
    }, []);

    const goToPage = (page) => {
        if (page >= 1 && page <= isTotalPages) {
            fetchStaff({ page, search: searchTerm || undefined });
        }
    };

    const handleCloseModal = () => {
        setVerification(false);
        setRegisterModal(false);
        setShowModal(false);
        setStaffToEdit(null);
    };

    const handleDelete = (staffId) => {
        setIsDeleteId(staffId);
        setVerification(true);
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
        try {
            if (staffToEdit) {
                await updateStaff(staffToEdit._id, staffData);
            } else {
                await addStaff(staffData);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving staff:", error);
        }
    };

    // Pagination display
    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, isTotalStaff || 0);

    return (
        <div className="w-full rounded-2xl bg-white p-4 sm:p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200 sm:text-xl">Staff List</h2>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Staff..."
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
                    <button
                        onClick={handleAddStaffClick}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        aria-label="Add staff"
                    >
                        <PlusCircle className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">No.</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Avatar</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Name</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Contact Number</th>
                            <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Email</th>
                            <th className="border px-3 py-2.5 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isStaff.length > 0 ? (
                            isStaff.map((data, index) => (
                                <tr
                                    key={data._id}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30"
                                >
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {data.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${data.avatar.replace(/\\/g, "/")}`}
                                                alt={`${data.first_name} ${data.last_name} Avatar`}
                                                className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 sm:h-10 sm:w-10">
                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-200" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {`${data.first_name || "N/A"} ${data.last_name || "N/A"}`}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {data.contact_number || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                        {data.email || "N/A"}
                                    </td>
                                    <td className="border px-3 py-2.5 text-center dark:border-blue-800/50">
                                        <div className="flex justify-center gap-1.5">
                                            <button
                                                onClick={() => handleEditClick(data)}
                                                className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                title="Edit Staff"
                                            >
                                                <Pencil className="h-4 w-4 stroke-blue-500 dark:stroke-blue-300" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(data._id)}
                                                className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
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
                                <td colSpan="6" className="px-3 py-6 text-center text-blue-800 dark:text-blue-200">
                                    {loading ? "Loading..." : "No staff data found."}
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
                        Showing <span className="font-medium">{startEntry}</span> to{" "}
                        <span className="font-medium">{endEntry}</span> of{" "}
                        <span className="font-medium">{isTotalStaff || 0}</span> entries
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

                        <button className="rounded border bg-blue-100 px-2.5 py-1 font-bold text-sm text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
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