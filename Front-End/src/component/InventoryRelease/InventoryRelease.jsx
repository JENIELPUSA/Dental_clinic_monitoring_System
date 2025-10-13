import React, { useState, useEffect, useContext } from "react";
import { ReleaseHistoryContext } from "../../contexts/ReleaseHistoryContext/ReleaseHistoryContext";
import ReleaseFormModal from "./ReleaseFormModal";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";

const InventoryRelease = () => {
    const { releaseItems, fetchReleaseItems, addReleaseItem, TotalRelease, isTotalPages, currentPage, setCurrentPage, loading } =
        useContext(ReleaseHistoryContext);

    const { inventory } = useContext(InventoryDisplayContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewType, setViewType] = useState("All Release");

    useEffect(() => {
        fetchReleaseItems({
            page: currentPage,
            period: viewType,
        });
    }, [currentPage, viewType, fetchReleaseItems]);

    const handleStockOut = async (itemId, serialNumber) => {
        await addReleaseItem(itemId, serialNumber);
        // Optional: refresh current view after add
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

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 font-sans dark:bg-gray-900">
            <div className="w-full max-w-5xl rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Release History</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
                        >
                            Release Stock
                        </button>
                        <select
                            value={viewType}
                            onChange={(e) => {
                                setViewType(e.target.value);
                                setCurrentPage(1); // reset to page 1 on period change
                            }}
                            className="rounded-lg bg-gray-200 px-4 py-2 font-bold text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                        >
                            <option value="all">All Release</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-12 rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
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
                                {releaseItems && releaseItems.length > 0 ? (
                                    releaseItems.map((item, index) => (
                                        <tr
                                            key={item._id}
                                            className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
                                        >
                                            <td className="border-b border-gray-200 px-5 py-5 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="border-b border-gray-200 px-5 py-5 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="border-b border-gray-200 px-5 py-5 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100">
                                                {item.item}
                                            </td>
                                            <td className="border-b border-gray-200 px-5 py-5 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100">
                                                {item.serialNumber}
                                            </td>
                                            <td className="border-b border-gray-200 px-5 py-5 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100">
                                                {item.category}
                                            </td>
                                            <td className="border-b border-gray-200 px-5 py-5 text-sm text-gray-900 dark:border-gray-600 dark:text-gray-100">
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
                )}

                {!loading && isTotalPages > 1 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                            <span className="font-medium">{TotalRelease}</span> entries
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                            >
                                «
                            </button>
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-gray-600"
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
                                        className={`rounded border px-3 py-1 dark:border-gray-600 ${
                                            currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800" : ""
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === isTotalPages}
                                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                            >
                                ›
                            </button>
                            <button
                                onClick={() => paginate(isTotalPages)}
                                disabled={currentPage === isTotalPages}
                                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-gray-600"
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
