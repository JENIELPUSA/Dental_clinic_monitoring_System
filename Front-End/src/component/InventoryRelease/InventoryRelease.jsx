import React, { useState, useEffect, useContext, useMemo } from "react";
import { ReleaseHistoryContext } from "../../contexts/ReleaseHistoryContext/ReleaseHistoryContext";
import ReleaseFormModal from "./ReleaseFormModal";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";

// Hook to detect mobile (< sm = 640px)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-800">
    <div className="h-3.5 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="mt-2 space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
      ))}
    </div>
  </div>
);

const InventoryRelease = () => {
  const {
    releaseItems,
    fetchReleaseItems,
    addReleaseItem,
    TotalRelease,
    isTotalPages,
    currentPage,
    setCurrentPage,
    loading,
  } = useContext(ReleaseHistoryContext);

  const { inventory } = useContext(InventoryDisplayContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState("all"); // default to "all" to match select options

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchReleaseItems({
      page: currentPage,
      period: viewType,
    });
  }, [currentPage, viewType, fetchReleaseItems]);

  const handleStockOut = async (itemId, serialNumber) => {
    await addReleaseItem(itemId, serialNumber);
    fetchReleaseItems({ page: currentPage, period: viewType });
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= isTotalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const itemsPerPage = 5;
  const startEntry = TotalRelease > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, TotalRelease);

  const releaseList = useMemo(() => releaseItems || [], [releaseItems]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 font-sans dark:bg-gray-900">
      <div className="w-full max-w-5xl rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 sm:p-8">
        {/* Header */}
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">Release History</h2>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
            >
              Release Stock
            </button>
            <select
              value={viewType}
              onChange={(e) => {
                setViewType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-800 dark:bg-gray-700 dark:text-gray-100 sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
            >
              <option value="all">All Release</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Conditional Rendering */}
        {isMobile ? (
          /* Mobile: Card ListView */
          <div className="space-y-3">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : releaseList.length > 0 ? (
              releaseList.map((item, index) => (
                <div
                  key={item._id}
                  className="rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    {(currentPage - 1) * itemsPerPage + index + 1}. {item.item}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="font-medium">Petsa:</span> {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Serial Number:</span> {item.serialNumber}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {item.category}
                    </div>
                    <div>
                      <span className="font-medium">Brand:</span> {item.brand}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Walang nakitang release history.
              </div>
            )}
          </div>
        ) : (
          /* Desktop: Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm leading-normal">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                  <th className="rounded-tl-lg px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    #
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Petsa
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Item
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Serial Number
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Category
                  </th>
                  <th className="rounded-tr-lg px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Brand
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-5">
                      <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : releaseList.length > 0 ? (
                  releaseList.map((item, index) => (
                    <tr
                      key={item._id}
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
                    >
                      <td className="border-b border-gray-200 px-5 py-4 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="border-b border-gray-200 px-5 py-4 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="border-b border-gray-200 px-5 py-4 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                        {item.item}
                      </td>
                      <td className="border-b border-gray-200 px-5 py-4 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                        {item.serialNumber}
                      </td>
                      <td className="border-b border-gray-200 px-5 py-4 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                        {item.category}
                      </td>
                      <td className="border-b border-gray-200 px-5 py-4 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                        {item.brand}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-5 text-center text-sm text-gray-500 dark:text-gray-400">
                      Walang nakitang release history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && isTotalPages > 1 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 sm:flex-row sm:text-sm">
            <div>
              Showing <span className="font-medium">{startEntry}</span> to{" "}
              <span className="font-medium">{endEntry}</span> of{" "}
              <span className="font-medium">{TotalRelease}</span> entries
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-3 sm:py-1"
              >
                «
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-3 sm:py-1"
              >
                ‹
              </button>

              {Array.from({ length: Math.min(5, isTotalPages) }, (_, i) => {
                let pageNum;
                if (isTotalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= isTotalPages - 2) pageNum = isTotalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`rounded border px-2 py-1 ${
                      currentPage === pageNum
                        ? "bg-blue-100 font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    } sm:px-3 sm:py-1`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === isTotalPages}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-3 sm:py-1"
              >
                ›
              </button>
              <button
                onClick={() => paginate(isTotalPages)}
                disabled={currentPage === isTotalPages}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-3 sm:py-1"
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