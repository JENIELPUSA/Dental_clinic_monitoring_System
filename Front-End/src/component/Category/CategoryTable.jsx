import React, { useContext, useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react";
import { CategoryDisplayContext } from "../../contexts/CategoryContext";

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-blue-100 dark:border-blue-800/30">
    {[...Array(4)].map((_, i) => (
      <td key={i} className="border px-3 py-3">
        <div className="h-4 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
      </td>
    ))}
  </tr>
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

    return (
        <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-6 shadow-md dark:bg-blue-900/30">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-100">Manage Categories</h2>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setNewCategory({ name: "", description: "" });
                        setIsFormOpen(true);
                    }}
                    className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                    <PlusCircle className="h-4 w-4" /> Add Category
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border text-sm">
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
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : categories && categories.length > 0 ? (
                            categories.map((cat, index) => (
                                <tr key={cat._id}>
                                    <td className="border px-3 py-2">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="border px-3 py-2">{cat.name}</td>
                                    <td className="border px-3 py-2">{cat.description}</td>
                                    <td className="border px-3 py-2 text-center">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(cat);
                                                setNewCategory({
                                                    name: cat.name,
                                                    description: cat.description,
                                                });
                                                setIsFormOpen(true);
                                            }}
                                            className="mr-2 text-blue-500 hover:text-blue-700"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && isTotalPages > 1 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{startEntry}</span> to{" "}
                        <span className="font-medium">{endEntry}</span> of{" "}
                        <span className="font-medium">{TotalCategories}</span> entries
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            «
                        </button>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
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
                                    className={`rounded border px-3 py-1 text-sm ${
                                        currentPage === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === isTotalPages}
                            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => paginate(isTotalPages)}
                            disabled={currentPage === isTotalPages}
                            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-black">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-blue-800 dark:text-gray-100">
                                {editingCategory ? "Edit Category" : "Add Category"}
                            </h2>
                            <button onClick={() => setIsFormOpen(false)}>
                                <X className="h-6 w-6 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100"
                            />
                            <textarea
                                placeholder="Description"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100"
                                rows={4}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-blue-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
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