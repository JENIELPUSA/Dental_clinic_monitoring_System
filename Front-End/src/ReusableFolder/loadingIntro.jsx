import { motion } from "framer-motion";

const DentalLoading = () => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-blue-950/70 backdrop-blur-sm p-4">
      <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
        {/* Main Spinner - Smaller on mobile */}
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-blue-700 border-t-blue-500 sm:h-24 sm:w-24"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />

        {/* Loading Text - Smaller on mobile */}
        <motion.p
          className="text-center text-lg font-semibold tracking-wide text-blue-200 sm:text-2xl"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          Loading data...
        </motion.p>
      </div>
    </div>
  );
};

export default DentalLoading;