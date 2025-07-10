import { useState } from "react";
import { motion } from "framer-motion";

export default function StatusModal({ isOpen, onClose, status = "success" }) {
  const isSuccess = status === "success";
  const iconColor = isSuccess ? "text-emerald-500" : "text-rose-500";
  const bgColor = isSuccess ? "bg-emerald-50" : "bg-rose-50";
  const buttonColor = isSuccess ? "bg-emerald-600" : "bg-rose-600";

  return isOpen ? (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative border dark:border-slate-700"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`mx-auto mb-5 w-16 h-16 flex items-center justify-center rounded-full ${bgColor} ${iconColor}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            {isSuccess ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </motion.div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isSuccess ? "Operation Successful!" : "Operation Failed"}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isSuccess
              ? "Your request has been processed successfully."
              : "There was an issue processing your request. Please try again."}
          </p>
        </div>

        {/* Button */}
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`${buttonColor} text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity w-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSuccess ? "focus:ring-blue-500" : "focus:ring-rose-500"}`}
          >
            {isSuccess ? "Continue" : "Try Again"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  ) : null;
}