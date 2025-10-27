import React, { useState, useMemo } from "react";

const AppointmentTable = ({ appointments }) => {
  const filteredTreatments = appointments;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentTableData = useMemo(() => {
    return filteredTreatments.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredTreatments, itemsPerPage]);

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

  // Status badge class helper
  const getStatusClasses = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200";
      case "Confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="w-full">
      {/* DESKTOP: Table View */}
      <div className="hidden md:block overflow-x-auto">
        {filteredTreatments.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                  >
                    Patient
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-6"
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
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white sm:px-6">
                      {`${appointment.patient_info?.first_name || "N/A"} ${appointment.patient_info?.last_name || ""}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                      {appointment.start_time}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClasses(appointment.appointment_status)}`}
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
                Showing{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredTreatments.length)}
                </span>{" "}
                of <span className="font-medium">{filteredTreatments.length}</span> entries
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  «
                </button>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  ‹
                </button>
                {getPaginationPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`rounded border px-2 py-1 text-xs font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-100 font-bold dark:bg-blue-800/50"
                        : "text-blue-800 dark:text-blue-200"
                    } dark:border-blue-800/50 sm:px-3 sm:py-1.5 sm:text-sm`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  ›
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded border px-2 py-1 text-xs font-medium text-blue-800 disabled:opacity-50 dark:border-blue-800/50 dark:text-blue-200 sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  »
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6">
            No appointments found.
          </p>
        )}
      </div>

      {/* MOBILE: Card View */}
      <div className="md:hidden space-y-3">
        {filteredTreatments.length > 0 ? (
          currentTableData.map((appointment) => (
            <div
              key={appointment._id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex justify-between">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {`${appointment.patient_info?.first_name || "N/A"} ${appointment.patient_info?.last_name || ""}`}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusClasses(appointment.appointment_status)}`}
                >
                  {appointment.appointment_status}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Time:</span> {appointment.start_time}
              </p>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No appointments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentTable;