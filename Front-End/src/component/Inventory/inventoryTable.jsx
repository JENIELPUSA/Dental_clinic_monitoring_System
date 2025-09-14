import React, { useContext, useState, useEffect } from "react";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import InventoryFormModal from "./InventoryFormModal";
import StatusVerification from "../../ReusableFolder/StatusModal";

const InventoryTable = () => {
  const { inventory, deleteInventory, updateInventory, addInventory } =
    useContext(InventoryDisplayContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isVerification, setVerification] = useState(false);
  const [isDeleteID, setIsDeleteId] = useState("");

  const filteredInventory = inventory.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower) ||
      item.supplier?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCloseModal = () => {
    setVerification(false);
    setShowModal(false);
    setItemToEdit(null);
  };

  const handleDelete = (itemId) => {
    setIsDeleteId(itemId);
    setVerification(true);
  };

  const handleConfirmDelete = async () => {
    await deleteInventory(isDeleteID);
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
    setLoading(true);
    try {
      if (itemToEdit) {
        await updateInventory(itemToEdit._id, itemData);
      } else {
        await addInventory(itemData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
      {loading && <LoadingOverlay />}

      {/* Header + Search */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">
          Inventory
        </h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Inventory..."
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
              >
                ×
              </button>
            )}
          </div>

          {/* Add Inventory Button */}
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <PlusCircle className="h-5 w-5 mr-1" /> Add Inventory
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-blue-200 text-sm dark:border-blue-800/50">
          <thead>
            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Item</th>
              <th className="border px-3 py-2">Category</th>
              <th className="border px-3 py-2">Brand</th>
              <th className="border px-3 py-2">Stock</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((data, index) => (
                <tr
                  key={data._id}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                >
                  <td className="border px-3 py-2">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="border px-3 py-2">{data.itemName || "N/A"}</td>
                  <td className="border px-3 py-2">
                    {data.category?.name || "N/A"}
                  </td>
                  <td className="border px-3 py-2">{data.brand || "Generic"}</td>
                  <td className="border px-3 py-2">
                    {data.stockQuantity} {data.unit}
                  </td>
                  <td className="border px-3 py-2">{data.status}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(data)}
                        className="rounded bg-transparent p-1.5 text-blue-500 hover:bg-blue-500/10"
                        title="Edit Item"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(data._id)}
                        className="rounded bg-transparent p-1.5 text-red-500 hover:bg-red-500/10"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-3 py-4 text-center">
                  No inventory data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredInventory.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-sm">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredInventory.length)} of{" "}
            {filteredInventory.length} entries
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`rounded border px-3 py-1 ${
                    currentPage === pageNum ? "bg-blue-100 font-bold" : ""
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded border px-3 py-1 disabled:opacity-50"
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
    </div>
  );
};

export default InventoryTable;
