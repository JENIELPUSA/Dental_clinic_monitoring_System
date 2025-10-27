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
        <div className="flex flex-col gap-1 2xs:gap-3 xs:gap-3 sm:gap-4 lg:gap-6 py-2 2xs:py-3 xs:py-4 sm:py-5 lg:py-6 max-w-7xl mx-auto w-full px-2 2xs:px-0 xs:px-0 sm:px-6">
            <h1 className="text-xl 2xs:text-2xl sm:text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">
                Welcome back, {role}!
            </h1>

            <p className="text-[10px] 2xs:text-xs xs:text-sm text-gray-700 dark:text-blue-300 leading-relaxed">
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

            {/* Admin Dashboard — Responsive Row/Column */}
            {role === "admin" && (
                <div className="w-full min-h-0">
                    <div className="flex flex-col gap-4 2xs:gap-5 xs:gap-6 lg:flex-row lg:gap-6 min-h-0">
                        {/* Left: Stats + Pie Chart */}
                        <div className="w-full lg:w-[35%] flex flex-col min-h-0">
                            <div className="w-full h-full min-h-0 rounded-xl overflow-hidden">
                                <PieGraphandcard />
                            </div>
                        </div>

                        {/* Right: Graph + Appointments */}
                        <div className="w-full lg:w-[65%] flex flex-col min-h-0">
                            <div className="w-full h-full min-h-0 rounded-xl overflow-hidden">
                                <LayoutGraphAndrecentAppoint />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Roles — Full Width */}
            {role === "patient" && (
                <div className="w-full min-h-0">
                    <DashboardLayout />
                </div>
            )}

            {role === "staff" && (
                <div className="w-full min-h-0">
                    <StaffLayout />
                </div>
            )}

            {role === "doctor" && (
                <div className="w-full min-h-0">
                    <DoctorDashboardLayout />
                </div>
            )}
        </div>
    );
};
export default DashboardPage;