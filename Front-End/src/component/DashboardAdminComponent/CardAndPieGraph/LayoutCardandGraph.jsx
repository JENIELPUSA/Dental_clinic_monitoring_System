import PieGraph from "./PieGraph";
import CardData from "./Card";
import { AuthContext } from "../../../contexts/AuthContext";
import { useContext } from "react";
import RecentAppoinment from "./../GraphandAppointment/Recentappointment";
import { motion } from "framer-motion";

const PieGraphandcard = () => {
    const { role } = useContext(AuthContext);

    return (
        <motion.div
            className="flex flex-col gap-6 lg:flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {role === "admin" && (
                <>
                    <CardData />
                    <PieGraph />
                    <RecentAppoinment />
                </>
            )}
        </motion.div>
    );
};

export default PieGraphandcard;
