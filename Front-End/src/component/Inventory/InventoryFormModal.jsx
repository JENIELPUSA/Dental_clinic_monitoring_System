import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryDisplayContext } from "../../contexts/InventoryContext/InventoryContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import { CategoryDisplayContext } from "../../contexts/CategoryContext";
import {dentalItems} from "./DentalItem"


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

        // Filter dentalItems for suggestions
        if (name === "itemName") {
            const filtered = dentalItems.filter(item =>
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
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-md sm:px-6 md:px-8"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative mx-auto w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:max-h-[90vh] sm:p-8"
                    >
                        <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-800 dark:text-blue-200">
                            {initialData?._id ? "Edit Inventory" : "Add New Inventory"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Item Name with Autocomplete */}
                                <div className="space-y-1 sm:col-span-2 relative">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleChange}
                                        required
                                        autoComplete="off"
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-white dark:bg-blue-900/80 dark:border-blue-800/50">
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
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Stock Quantity */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Unit */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Unit
                                    </label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        required
                                        placeholder="pcs, box, bottle"
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Expiration Date */}
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Expiration Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expirationDate"
                                        value={formData.expirationDate}
                                        onChange={handleChange}
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Category Dropdown */}
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
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

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-blue-800 hover:bg-gray-100 dark:border-blue-700 dark:text-blue-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-800"
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
