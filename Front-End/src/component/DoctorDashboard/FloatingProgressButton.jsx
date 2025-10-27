import React from 'react';
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const FloatingProgressButton = ({ onClick }) => {
    return (
        <motion.button
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            aria-label="View Progress Statistics"
        >
            <BarChart3 size={24} className="text-white" />
        </motion.button>
    );
};

export default FloatingProgressButton;