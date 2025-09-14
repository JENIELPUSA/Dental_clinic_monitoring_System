import React, { useState, useEffect, useContext } from "react";
import { ReleaseHistoryContext } from "../../contexts/ReleaseHistoryContext/ReleaseHistoryContext"; // adjust path
import ReleaseFormModal from "./ReleaseFormModal";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";

const InventoryRelease = () => {
  const { releaseItems, fetchReleaseItems, addReleaseItem } = useContext(ReleaseHistoryContext);
  const { inventory } = useContext(InventoryDisplayContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState("weekly");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchReleaseItems();
  }, []);

  const handleStockOut = async (itemId, serialNumber) => {
    await addReleaseItem(itemId, serialNumber);
  };

  const releaseHistory = releaseItems;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = releaseHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(releaseHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex flex-col items-center font-sans bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Release History
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Release Stock
            </button>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-lg font-bold"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                  #
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Petsa
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Serial Number
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                  Brand
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item._id}
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-700"
                    }
                  >
                    <td className="px-5 py-5 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                      {item.item}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                      {item.serialNumber}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                      {item.category}
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                      {item.brand}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-5 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Walang nakitang release history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {releaseHistory.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, releaseHistory.length)} of{" "}
              {releaseHistory.length} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="rounded border px-3 py-1 dark:border-gray-600 disabled:opacity-50"
              >
                «
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded border px-3 py-1 dark:border-gray-600 disabled:opacity-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`rounded border px-3 py-1 dark:border-gray-600 ${
                      currentPage === pageNum
                        ? "bg-blue-100 dark:bg-blue-800 font-bold"
                        : ""
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded border px-3 py-1 dark:border-gray-600 disabled:opacity-50"
              >
                ›
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded border px-3 py-1 dark:border-gray-600 disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      <ReleaseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        releaseHistory={inventory}
        onSubmit={handleStockOut}
      />
    </div>
  );
};

export default InventoryRelease;
