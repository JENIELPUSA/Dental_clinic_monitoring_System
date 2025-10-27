import { motion } from "framer-motion";
import StatisticsGraph from "./StatisticsGraph";
import LogsAndAudit from "../../LogsAndAudit/LogsAndAudit";

const LayoutGraphAndrecentAppoint = () => {
    return (
        <motion.div
            className="flex-1 flex flex-col gap-6 order-1 lg:order-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <StatisticsGraph />

            {/* Hide LogsAndAudit on mobile, show on md and above */}
            <div className="hidden md:block">
                <LogsAndAudit />
            </div>
        </motion.div>
    );
};

export default LayoutGraphAndrecentAppoint;
