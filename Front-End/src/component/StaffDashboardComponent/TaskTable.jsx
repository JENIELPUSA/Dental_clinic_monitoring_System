import React, { useContext, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { TaskDisplayContext } from '../../contexts/TaskContext/TaskContext';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
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

  // Compute total pages
  const totalPages = Math.ceil(upcomingTasks.length / itemsPerPage);

  // Compute tasks to show
  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = upcomingTasks.slice(indexOfFirstTask, indexOfLastTask);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="rounded-xl bg-white sm:p-8 shadow-xl dark:bg-gray-800 w-full  mx-auto border-t-4 border-blue-600">
      <h3 className="mb-6 flex items-center text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
        <ClipboardList size={28} className="mr-3 text-blue-600 dark:text-blue-400" />
        Pending Tasks
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 rounded-tl-lg">Description</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {currentTasks.length > 0 ? (
              currentTasks.map((task, index) => (
                <tr key={task._id} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}>
                  <td className="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg break-words">
                    {task.description}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'Normal' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      task.status === 'High Priority' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 animate-pulse' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No pending tasks.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 gap-2 text-sm">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:text-white"
        >
          Prev
        </button>

        {[...Array(totalPages).keys()].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 dark:text-white'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

function TaskTable() {
  const { isTask } = useContext(TaskDisplayContext);
  const mappedTasks = isTask.map(task => ({
    _id: task._id,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
  }));

  return (
    <div className="flex flex-col items-center bg-gray-100 font-sans dark:bg-gray-900">
      <TasksTable upcomingTasks={mappedTasks} />
    </div>
  );
}

export default TaskTable;
