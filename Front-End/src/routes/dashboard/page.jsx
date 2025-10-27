import { TrendingUp } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import LayoutGraphAndrecentAppoint from "../../component/DashboardAdminComponent/GraphandAppointment/LayoutGraphAndrecentAppoint";
import PieGraphandcard from "../../component/DashboardAdminComponent/CardAndPieGraph/LayoutCardandGraph";
import DashboardLayout from "../../component/PatientDashboardComponents/DashboardLayout";
import DoctorDashboardLayout from "../../component/DoctorDashboard/DoctorDashboardLayout";
import StaffLayout from "../../component/StaffDashboardComponent/StaffLayout";
import { Footer } from "@/layouts/footer";

const DashboardPage = () => {
    const { role } = useContext(AuthContext);

    return (
        <div className="flex flex-col gap-4 xs:gap-2 2xs:gap-2 lg:gap-4  py-4 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                Welcome back, {role}!
            </h1>

            <p className="text-sm text-gray-700 dark:text-blue-300">
                {role === "admin"
                    ? "You're logged in as an Administrator. Here are the modules available to you:"
                    : role === "doctor"
                    ? "You're logged in as a Doctor. Here are the modules available to you:"
                    : role === "staff"
                    ? "You're logged in as Staff. Here are the modules available to you:"
                    : role === "patient"
                    ? "You're logged in as a Patient. Here are the available modules for you:"
                    : "Welcome! Please check your assigned modules."}
            </p>

            {/* Admin Dashboard */}
            {role === "admin" && (
                <div className="w-full">
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
                        <div className="w-full lg:w-[35%]">
                            <PieGraphandcard />
                        </div>
                        <div className="w-full lg:w-[65%]">
                            <LayoutGraphAndrecentAppoint />
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Dashboard */}
            {role === "patient" && (
                <div className="w-full">
                    <DashboardLayout />
                </div>
            )}

            {/* Staff Dashboard */}
            {role === "staff" && (
                <div className="w-full">
                    <StaffLayout />
                </div>
            )}

            {/* Doctor Dashboard */}
            {role === "doctor" && (
                <div className="w-full">
                    <DoctorDashboardLayout />
                </div>
            )}

            <Footer />
        </div>
    );
};

// StatCard component (na-retain, walang binago sa logic)
const StatCard = ({ icon, title, value, trend, description }) => {
    const trendDirection = trend?.direction || "up";
    const trendValue = trend?.value || "0%";

    return (
        <div className="card bg-blue-50 p-3 dark:bg-blue-900/20 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-800/50 dark:text-blue-300">
                    {icon}
                </div>
                <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        trendDirection === "up"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300"
                            : "bg-blue-200 text-blue-800 dark:bg-blue-700/50 dark:text-blue-300"
                    }`}
                >
                    <TrendingUp
                        size={14}
                        className={trendDirection === "down" ? "rotate-180 transform" : ""}
                    />
                    {trendValue}
                </span>
            </div>
            <div className="mt-3 sm:mt-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 sm:text-sm">{title}</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-200 sm:text-2xl">{value}</p>
                {description && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{description}</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;