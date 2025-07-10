import { motion } from "framer-motion";

/**
 * Loading Overlay for Dental Applications
 *
 * Displays an elegant, full-screen loading state to users during data fetching
 * or process execution. This component features a smooth, rotating spinner
 * and a gently pulsing "Loading data..." message, ensuring a clear and
 * aesthetically pleasing waiting experience.
 */
const DentalLoading = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[999]
                 bg-blue-950/70 backdrop-blur-sm
                 text-blue-100 font-sans"
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Main Spinner */}
        <motion.div
          className="w-24 h-24 rounded-full
                     border-4 border-blue-700 border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />

        {/* Loading Text */}
        <motion.p
          className="text-2xl font-semibold tracking-wide text-blue-200
                     mt-6"
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