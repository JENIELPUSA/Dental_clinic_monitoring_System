import React, { useContext, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { TaskDisplayContext } from '../../contexts/TaskContext/TaskContext';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const TasksTable = ({ upcomingTasks }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(upcomingTasks.length / itemsPerPage);
  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = upcomingTasks.slice(indexOfFirstTask, indexOfLastTask);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Status badge class helper
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200';
      case 'High Priority':
        return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800 border-t-4 border-blue-600">
      <h3 className="mb-4 flex items-center text-lg font-bold text-gray-800 dark:text-white sm:mb-6 sm:text-xl">
        <ClipboardList size={20} className="mr-2 text-blue-600 dark:text-blue-400 sm:mr-3 sm:size-6" />
        Pending Tasks
      </h3>

      {/* DESKTOP: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 rounded-tl-lg">
                Description
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 rounded-tr-lg">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentTasks.length > 0 ? (
              currentTasks.map((task, index) => (
                <tr
                  key={task._id}
                  className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
                >
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl break-words">
                    {task.description}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClasses(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No pending tasks.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE: Card View */}
      <div className="md:hidden space-y-3">
        {currentTasks.length > 0 ? (
          currentTasks.map((task) => (
            <div
              key={task._id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex justify-between">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {task.description}
                </p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusClasses(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {formatDate(task.dueDate)}
              </p>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No pending tasks.
          </div>
        )}
      </div>

      {/* Pagination Controls - Responsive */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1 sm:mt-6 sm:gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded border px-2.5 py-1 text-xs font-medium disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            Prev
          </button>

          {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`rounded px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border bg-white text-gray-700 dark:bg-gray-700 dark:text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && (
            <span className="flex items-center px-2.5 py-1 text-xs text-gray-500 sm:px-3 sm:py-1.5 sm:text-sm">
              ...
            </span>
          )}

          {totalPages > 5 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="rounded border px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 sm:text-sm"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded border px-2.5 py-1 text-xs font-medium disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

function TaskTable() {
  const { isTask } = useContext(TaskDisplayContext);
  const mappedTasks = Array.isArray(isTask)
    ? isTask.map(task => ({
        _id: task._id,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
      }))
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-2 lg:p-0 sm:p-4 xs:p-0 md:p-6">
      <TasksTable upcomingTasks={mappedTasks} />
    </div>
  );
}

export default TaskTable;