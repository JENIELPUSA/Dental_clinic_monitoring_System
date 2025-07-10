import React, { useState, useMemo } from 'react';

const PatientTable = ({ patients }) => {
    // Filter to include only patients with completed appointments
    const completedPatients = useMemo(() => 
        patients.filter(p => p.appointment_status === "Completed"), 
        [patients]
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Adjust this number as needed

    // Calculate indexes for pagination display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Get current patients for the table
    const currentTableData = useMemo(() => {
        return completedPatients.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, completedPatients, itemsPerPage, indexOfFirstItem, indexOfLastItem]);

    const totalPages = Math.ceil(completedPatients.length / itemsPerPage);

    // Function to change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Logic to determine which page numbers to show in the pagination bar
    const getPaginationPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Maximum number of page buttons to show at once

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
        <div className="overflow-x-auto rounded-xl bg-white p-4 dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Last Visit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Total Visits
                        </th>
                        <th className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {currentTableData.length > 0 ? (
                        currentTableData.map((patient) => (
                            <tr
                                key={patient.patient_info._id}
                                className="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-600"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {patient.patient_info.first_name} {patient.patient_info.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {new Date(patient.lastVisit).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {patient.totalVisits}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4 dark:text-blue-400 dark:hover:text-blue-200">
                                        View
                                    </button>
                                    <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="4"
                                className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                                No patients to display.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {completedPatients.length > 0 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, completedPatients.length)} of {completedPatients.length} entries
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
                                className={`rounded border px-3 py-1 
                                    ${currentPage === pageNum 
                                        ? "bg-blue-100 font-bold dark:bg-blue-800/50" 
                                        : "text-blue-800 dark:text-blue-200"} 
                                    dark:border-blue-800/50`}
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
    );
};

export default PatientTable;