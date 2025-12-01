import React, { useContext, useState, useEffect, useMemo } from "react";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";
import { Pencil, PlusCircle } from "lucide-react";
import InventoryFormModal from "./InventoryFormModal";
import StatusVerification from "../../ReusableFolder/StatusModal";
import ExportPdfModal from "../../component/Inventory/ExportInventoryPDF";

// Utility to detect mobile
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // sm breakpoint
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
};

const SkeletonCard = () => (
    <div className="animate-pulse rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20">
        <div className="h-4 w-3/4 rounded bg-blue-100 dark:bg-blue-800/40"></div>
        <div className="mt-2 space-y-2">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="h-3.5 w-full rounded bg-blue-100 dark:bg-blue-800/40"
                ></div>
            ))}
        </div>
    </div>
);

const InventoryTable = () => {
    const {
        inventory,
        deleteInventory,
        updateInventory,
        addInventory,
        TotalInventory,
        isTotalPages,
        currentPage,
        setCurrentPage,
        fetchInventory,
        loading,fetchInventoryReportPDF
    } = useContext(InventoryDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({
        from: "",
        to: "",
    });

    const isMobile = useIsMobile();

    useEffect(() => {
        fetchInventory({
            page: currentPage,
            search: searchTerm || undefined,
        });
    }, [currentPage, searchTerm, fetchInventory]);

    const handleCloseModal = () => {
        setVerification(false);
        setShowModal(false);
        setItemToEdit(null);
    };

    
    // Updated: Include status in export logic
 const handleGeneratePDF = () => {
    if (!exportDates.from || !exportDates.to) {
        alert("Please select both 'From' and 'To' dates.");
        return;
    }
    if (new Date(exportDates.from) > new Date(exportDates.to)) {
        alert("'From' date cannot be later than 'To' date.");
        return;
    }

    // Include exportStatus in the payload
    fetchInventoryReportPDF({
        from: exportDates.from,
        to: exportDates.to
    });

    setShowExportModal(false);
};

    const handleDelete = (itemId) => {
        setIsDeleteId(itemId);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        await deleteInventory(isDeleteID);
        fetchInventory({ page: currentPage, search: searchTerm || undefined });
        handleCloseModal();
    };

    const handleAddClick = () => {
        setItemToEdit(null);
        setShowModal(true);
    };

    

    const handleEditClick = (itemData) => {
        setItemToEdit(itemData);
        setShowModal(true);
    };

    const handleSaveItem = async (itemData) => {
        try {
            if (itemToEdit) {
                await updateInventory(itemToEdit._id, itemData);
            } else {
                await addInventory(itemData);
            }
            fetchInventory({ page: currentPage, search: searchTerm || undefined });
            handleCloseModal();
        } catch (error) {
            console.error("Error saving inventory:", error);
        }
    };

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= isTotalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const itemsPerPage = 5;
    const startEntry = TotalInventory > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, TotalInventory);

    // Memoize inventory list for performance
    const inventoryList = useMemo(() => inventory || [], [inventory]);

    return (
        <div className="w-full rounded-2xl bg-white p-3 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
            {/* Header */}
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 sm:text-lg">Inventory</h2>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Inventory..."
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:px-4 sm:py-2 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100 sm:right-3 sm:top-2"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleAddClick}
                        className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 sm:px-4 sm:py-2 sm:text-sm"
                    >
                        <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Add Inventory</span>
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow hover:bg-blue-700 active:scale-95 dark:bg-blue-700 dark:hover:bg-blue-600 sm:text-sm"
                    >
                        Export PDF Report
                    </button>
                </div>
            </div>

            {/* Conditional Rendering: Table vs Card List */}
            {isMobile ? (
                /* Mobile: Card List View */
                <div className="space-y-3">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : inventoryList.length > 0 ? (
                        inventoryList.map((data, index) => (
                            <div
                                key={data._id}
                                className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                            {(currentPage - 1) * itemsPerPage + index + 1}. {data.itemName || "N/A"}
                                        </div>
                                        <div className="mt-1 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                            <div>
                                                <span className="font-medium">Category:</span> {data.category?.name || "N/A"}
                                            </div>
                                            <div>
                                                <span className="font-medium">Brand:</span> {data.brand || "Generic"}
                                            </div>
                                            <div>
                                                <span className="font-medium">Stock:</span> {data.stockQuantity} {data.unit}
                                            </div>
                                            <div>
                                                <span className="font-medium">Status:</span> {data.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditClick(data)}
                                            className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        {/* Uncomment if delete is needed */}
                                        {/* <button
                      onClick={() => handleDelete(data._id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button> */}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-sm text-blue-800 dark:text-blue-200">No inventory data found.</div>
                    )}
                </div>
            ) : (
                /* Desktop: Table View */
                <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                                <th className="border px-3 py-2">#</th>
                                <th className="border px-3 py-2">Item</th>
                                <th className="border px-3 py-2">Category</th>
                                <th className="border px-3 py-2">Brand</th>
                                <th className="border px-3 py-2">Stock</th>
                                <th className="border px-3 py-2">Status</th>
                                <th className="border px-3 py-2">Expiration</th>
                                <th className="border px-3 py-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <>
                                    <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
                                        {[...Array(7)].map((_, i) => (
                                            <td
                                                key={i}
                                                className="border px-3 py-3"
                                            >
                                                <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Repeat 4 more if needed */}
                                </>
                            ) : inventoryList.length > 0 ? (
                                inventoryList.map((data, index) => (
                                    <tr
                                        key={data._id}
                                        className="border-b border-blue-100 hover:bg-blue-50/50 dark:border-blue-800/30 dark:hover:bg-blue-900/20"
                                    >
                                        <td className="border px-3 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="border px-3 py-3">{data.itemName || "N/A"}</td>
                                        <td className="border px-3 py-3">{data.category?.name || "N/A"}</td>
                                        <td className="border px-3 py-3">{data.brand || "Generic"}</td>
                                        <td className="border px-3 py-3">
                                            {data.stockQuantity} {data.unit}
                                        </td>
                                        <td className="border px-3 py-3">{data.status}</td>
                                        <td className="border px-3 py-3">
                                            {new Date(data.expirationDate).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>

                                        <td className="border px-3 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(data)}
                                                    className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10"
                                                    title="Edit Item"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                {/* <button
                          onClick={() => handleDelete(data._id)}
                          className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-3 py-6 text-center"
                                    >
                                        No inventory data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination (same for both views) */}
            {!loading && isTotalPages > 1 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-200 sm:flex-row sm:text-sm">
                    <div>
                        Showing <span className="font-medium">{startEntry}</span> to <span className="font-medium">{endEntry}</span> of{" "}
                        <span className="font-medium">{TotalInventory}</span> entries
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-800/20"
                        >
                            «
                        </button>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-800/20"
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
                                            ? "bg-blue-100 font-bold text-blue-800 dark:bg-blue-800/50 dark:text-blue-200"
                                            : "hover:bg-blue-100 dark:hover:bg-blue-800/20"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === isTotalPages}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-800/20"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => paginate(isTotalPages)}
                            disabled={currentPage === isTotalPages}
                            className="rounded border px-2 py-1 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-800/20"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <InventoryFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                initialData={itemToEdit}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
            {/* Export Modal with Status */}
            <ExportPdfModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onGenerate={handleGeneratePDF}
                exportDates={exportDates}
                setExportDates={setExportDates}
            />
        </div>
    );
};

export default InventoryTable;
