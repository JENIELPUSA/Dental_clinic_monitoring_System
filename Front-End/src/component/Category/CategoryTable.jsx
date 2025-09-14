import React, { useContext, useState } from "react";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react";
import { CategoryDisplayContext } from "../../contexts/CategoryContext";

const CategoryTable = () => {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useContext(CategoryDisplayContext);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handleSave = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory._id, newCategory);
    } else {
      await addCategory(newCategory);
    }
    setNewCategory({ name: "", description: "" });
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg bg-white p-6 shadow-md dark:bg-blue-900/30">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-100">
          Manage Categories
        </h2>
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

      {/* Table */}
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
            {currentItems.length > 0 ? (
              currentItems.map((cat, i) => (
                <tr key={cat._id}>
                  <td className="border px-3 py-2">{(currentPage - 1) * itemsPerPage + i + 1}</td>
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
                      onClick={() => deleteCategory(cat._id)}
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

      {/* Pagination */}
      {categories.length > itemsPerPage && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ›
          </button>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-black">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-800 dark:text-gray-100">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="h-6 w-6 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
              </button>
            </div>

            {/* Form */}
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
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100"
                rows={4}
              />
            </div>

            {/* Buttons */}
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
