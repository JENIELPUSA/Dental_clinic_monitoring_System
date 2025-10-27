import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import { CategoryDisplayContext } from "../../contexts/CategoryContext";
import { dentalItems } from "./DentalItem";

const InventoryFormModal = ({ isOpen, onClose, initialData = {} }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    brand: "",
    stockQuantity: 0,
    unit: "",
    expirationDate: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const { categories } = useContext(CategoryDisplayContext);
  const { updateInventory, addInventory } = useContext(InventoryDisplayContext);
  const [isLoading, setIsLoading] = useState(false);

  const clearForm = () => {
    setFormData({
      itemName: "",
      category: "",
      brand: "",
      stockQuantity: 0,
      unit: "",
      expirationDate: "",
    });
    setSuggestions([]);
  };

  useEffect(() => {
    if (isOpen) {
      const {
        itemName = "",
        category = "",
        brand = "",
        stockQuantity = 0,
        unit = "",
        expirationDate = "",
      } = initialData || {};

      setFormData({
        itemName,
        category: category?._id || category || "",
        brand,
        stockQuantity,
        unit,
        expirationDate: expirationDate ? expirationDate.split("T")[0] : "",
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "itemName") {
      const filtered = dentalItems.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (item) => {
    setFormData((prev) => ({ ...prev, itemName: item }));
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData && initialData._id) {
        const result = await updateInventory(initialData._id, formData);
        if (result?.success) {
          onClose();
          clearForm();
        }
      } else {
        const result = await addInventory(formData);
        if (result?.status === "success") {
          onClose();
          clearForm();
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-start justify-center bg-black/40 px-2 sm:px-4 py-8 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md sm:max-w-lg rounded-xl bg-white p-4 shadow-xl dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6"
          >
            <h2 className="mb-4 text-center text-xl font-extrabold text-blue-800 dark:text-blue-200 sm:text-2xl">
              {initialData?._id ? "Edit Inventory" : "Add New Inventory"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Full-width on mobile */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {/* Item Name with Autocomplete */}
                <div className="sm:col-span-2 relative">
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 sm:text-sm">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full rounded-md border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                  />
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-white shadow-lg dark:bg-blue-900/80 dark:border-blue-800/50 text-sm">
                      {suggestions.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(item)}
                          className="cursor-pointer px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Brand */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 sm:text-sm">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 sm:text-sm">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full rounded-md border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 sm:text-sm">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    placeholder="pcs, box, bottle"
                    className="w-full rounded-md border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>

                {/* Expiration Date */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 sm:text-sm">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 sm:text-sm">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buttons — Stacked on mobile */}
              <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-gray-100 dark:border-blue-700 dark:text-blue-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-800 sm:w-auto"
                >
                  {isLoading
                    ? "Processing..."
                    : initialData?._id
                    ? "Update Inventory"
                    : "Add Inventory"}
                </button>
              </div>
            </form>

            {isLoading && <LoadingOverlay message="Saving inventory information..." />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InventoryFormModal;