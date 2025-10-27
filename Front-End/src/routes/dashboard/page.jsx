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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-2 py-2 2xs:gap-3 2xs:px-0 2xs:py-3 xs:gap-3 xs:px-0 xs:py-4 sm:gap-4 sm:px-6 sm:py-5 lg:gap-6 lg:py-6">
            <h1 className="text-xl font-bold text-blue-800 dark:text-blue-200 2xs:text-2xl sm:text-2xl md:text-3xl">Welcome back, {role}!</h1>

            <p className="text-[10px] leading-relaxed text-gray-700 dark:text-blue-300 2xs:text-xs xs:text-sm">
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
                <div className="max-h-[70vh] w-ful">
                    <div className="flex w-full flex-1 flex-col">
                        <div className="flex flex-1 flex-col gap-4 xs:gap-2 2xs:gap-2 lg:flex-row lg:gap-6">
                            <div className="flex w-full flex-col overflow-hidden rounded-xl lg:w-[35%]">
                                <PieGraphandcard />
                            </div>
                            <div className="flex w-full flex-col overflow-hidden rounded-xl lg:w-[65%]">
                                <LayoutGraphAndrecentAppoint />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Roles — Full Width */}
            {role === "patient" && (
                <div className="min-h-0 w-full">
                    <DashboardLayout />
                </div>
            )}

            {role === "staff" && (
                <div className="min-h-0 w-full">
                    <StaffLayout />
                </div>
            )}

            {role === "doctor" && (
                <div className="min-h-0 w-full">
                    <DoctorDashboardLayout />
                </div>
            )}
        </div>
    );
};
export default DashboardPage;
