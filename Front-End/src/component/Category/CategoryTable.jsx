import React, { useContext, useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react";
import { CategoryDisplayContext } from "../../contexts/CategoryContext";

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
  <div className="animate-pulse rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/30">
    <div className="h-4 w-3/4 rounded bg-blue-100 dark:bg-blue-800/40"></div>
    <div className="mt-2 h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
  </div>
);

const CategoryTable = () => {
  const {
    categories,
    TotalCategories,
    isTotalPages,
    currentPage,
    loading,
    fetchCategories,
    setCurrentPage,
    deleteCategory,
    addCategory,
    updateCategory,
  } = useContext(CategoryDisplayContext);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCategories({ page: currentPage });
  }, [currentPage, fetchCategories]);

  const handleSave = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory._id, newCategory);
    } else {
      await addCategory(newCategory);
    }
    fetchCategories({ page: currentPage });
    setNewCategory({ name: "", description: "" });
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteCategory(id);
    fetchCategories({ page: currentPage });
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= isTotalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const itemsPerPage = 5;
  const startEntry = TotalCategories > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * itemsPerPage, TotalCategories);

  const categoryList = useMemo(() => categories || [], [categories]);

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-3 shadow-md dark:bg-blue-900/30 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-base font-bold text-blue-800 dark:text-blue-100 sm:text-lg">Manage Categories</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setNewCategory({ name: "", description: "" });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add Category
        </button>
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
          ) : categoryList.length > 0 ? (
            categoryList.map((cat, index) => (
              <div
                key={cat._id}
                className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-blue-800 dark:text-blue-100">
                      {(currentPage - 1) * itemsPerPage + index + 1}. {cat.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {cat.description}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setNewCategory({
                        name: cat.name,
                        description: cat.description,
                      });
                      setIsFormOpen(true);
                    }}
                    className="ml-2 rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No categories found.
            </div>
          )}
        </div>
      ) : (
        /* Desktop: Table View */
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-blue-100 dark:bg-blue-800">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Description</th>
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
                    {[...Array(4)].map((_, i) => (
                      <td key={i} className="border px-3 py-3">
                        <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
                      </td>
                    ))}
                  </tr>
                  {/* Repeat if needed */}
                </>
              ) : categoryList.length > 0 ? (
                categoryList.map((cat, index) => (
                  <tr key={cat._id} className="border-b hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                    <td className="border px-3 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="border px-3 py-3">{cat.name}</td>
                    <td className="border px-3 py-3">{cat.description}</td>
                    <td className="border px-3 py-3 text-center">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setNewCategory({ name: cat.name, description: cat.description });
                          setIsFormOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {/* <button
                        onClick={() => handleDelete(cat._id)}
                        className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                    No categories found.
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
            <span className="font-medium">{TotalCategories}</span> entries
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 sm:px-3 sm:py-1 sm:text-sm"
            >
              «
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 sm:px-3 sm:py-1 sm:text-sm"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(5, isTotalPages) }, (_, i) => {
              let pageNum;
              if (isTotalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= isTotalPages - 2) {
                pageNum = isTotalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`rounded border px-2 py-1 text-xs ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  } sm:px-3 sm:py-1 sm:text-sm`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === isTotalPages}
              className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 sm:px-3 sm:py-1 sm:text-sm"
            >
              ›
            </button>
            <button
              onClick={() => paginate(isTotalPages)}
              disabled={currentPage === isTotalPages}
              className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 sm:px-3 sm:py-1 sm:text-sm"
            >
              »
            </button>
          </div>
        </div>
      )}

    {/* Modal */}
{isFormOpen && (
  <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 pt-10 overflow-y-auto">
    <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl dark:bg-black sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-blue-800 dark:text-gray-100 sm:text-lg">
          {editingCategory ? "Edit Category" : "Add Category"}
        </h2>
        <button
          onClick={() => setIsFormOpen(false)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100"
        />
        <textarea
          placeholder="Description"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100"
          rows={3}
        />
      </div>

      {/* Responsive button layout */}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
        <button
          onClick={() => setIsFormOpen(false)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-neutral-800 sm:w-auto"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600 sm:w-auto"
        >
          {editingCategory ? "Update" : "Save"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default CategoryTable;