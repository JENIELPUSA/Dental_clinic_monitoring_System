import { motion } from "framer-motion";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirmDelete,
}) {
  return isOpen ? (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full relative text-center border border-gray-200 dark:border-gray-700"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full p-1"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-blue-500 shadow-lg"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-4xl text-white" // Changed to white for better contrast with blue background
          >
            ⚠️
          </motion.div>
        </motion.div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          Are you sure?
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 text-base mb-8 leading-relaxed">
          This action cannot be undone. All associated data will be permanently removed. Are you sure you want to delete this item?
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 font-medium text-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 font-bold text-lg shadow-md"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  ) : null;
}
