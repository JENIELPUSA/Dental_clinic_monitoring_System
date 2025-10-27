import React, { useState, useMemo } from 'react';

const PatientTable = ({ patients }) => {
  // Filter to include only patients with completed appointments
  const completedPatients = useMemo(() => 
    patients.filter(p => p.appointment_status === "Completed"), 
    [patients]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentTableData = useMemo(() => {
    return completedPatients.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, completedPatients, itemsPerPage]);

  const totalPages = Math.ceil(completedPatients.length / itemsPerPage);

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

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full rounded-xl bg-white p-4 dark:bg-gray-800">
      {/* DESKTOP: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Last Visit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Total Visits
              </th>
              <th className="relative px-4 py-3 sm:px-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentTableData.length > 0 ? (
              currentTableData.map((patient) => (
                <tr
                  key={patient.patient_info._id}
                  className="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white sm:px-6">
                    {patient.patient_info.first_name} {patient.patient_info.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                    {formatDate(patient.lastVisit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                    {patient.totalVisits}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium sm:px-6">
                    <div className="flex justify-end gap-3">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6"
                >
                  No patients to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE: Card View */}
      <div className="md:hidden space-y-3">
        {currentTableData.length > 0 ? (
          currentTableData.map((patient) => (
            <div
              key={patient.patient_info._id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {patient.patient_info.first_name} {patient.patient_info.last_name}
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Last Visit:</span> {formatDate(patient.lastVisit)}
                </div>
                <div>
                  <span className="font-medium">Total Visits:</span> {patient.totalVisits}
                </div>
              </div>
              <div className="mt-3 flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 rounded bg-blue-50 px-2 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-800/30 dark:text-blue-200 dark:hover:bg-blue-800/50">
                  View
                </button>
                <button className="flex-1 rounded bg-green-50 px-2 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-200 dark:hover:bg-green-800/50">
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No patients to display.
          </div>
        )}
      </div>

      {/* Pagination Controls - Responsive */}
      {completedPatients.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">{Math.min(indexOfLastItem, completedPatients.length)}</span> of{" "}
            <span className="font-medium">{completedPatients.length}</span> entries
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <button 
              onClick={() => paginate(1)} 
              disabled={currentPage === 1} 
              className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1 sm:text-sm"
            >
              «
            </button>
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1 sm:text-sm"
            >
              ‹
            </button>
            {getPaginationPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                className={`rounded border px-2 py-1 text-xs font-medium 
                  ${currentPage === pageNum 
                    ? "bg-blue-100 font-bold dark:bg-blue-800/50" 
                    : "text-blue-800 dark:text-blue-200"} 
                  dark:border-blue-800/50 sm:px-3 sm:py-1 sm:text-sm`}
              >
                {pageNum}
              </button>
            ))}
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1 sm:text-sm"
            >
              ›
            </button>
            <button 
              onClick={() => paginate(totalPages)} 
              disabled={currentPage === totalPages} 
              className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1 sm:text-sm"
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