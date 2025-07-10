import React, { useState, useMemo } from "react";

const AppointmentTable = ({ appointments }) => {
    const filteredTreatments = appointments;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentTableData = useMemo(() => {
        return filteredTreatments.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, filteredTreatments, itemsPerPage, indexOfFirstItem, indexOfLastItem]);

    const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPaginationPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;

        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxPageButtons; i++) {
                    pageNumbers.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxPageButtons + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pageNumbers.push(i);
                }
            }
        }
        return pageNumbers;
    };

    return (
        <div className="overflow-x-auto">
            {filteredTreatments.length > 0 ? (
                <>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Patient
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Time
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {currentTableData.map((appointment) => (
                                <tr
                                    key={appointment._id}
                                    className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {`${appointment.patient_info?.first_name || "N/A"} ${appointment.patient_info?.last_name || ""}`}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{appointment.start_time}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                appointment.appointment_status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                                    : appointment.appointment_status === "Confirmed"
                                                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                                      : appointment.appointment_status === "Completed"
                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                                        : appointment.appointment_status === "Cancelled"
                                                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                            }`}
                                        >
                                            {appointment.appointment_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

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
                            {getPaginationPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    className={`rounded border px-3 py-1 ${
                                        currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "text-blue-800 dark:text-blue-200"
                                    } dark:border-blue-800/50`}
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
                </>
            ) : (
                <p className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No appointments found.</p>
            )}
        </div>
    );
};

export default AppointmentTable;
