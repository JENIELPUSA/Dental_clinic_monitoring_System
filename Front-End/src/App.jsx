import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";

// ROUTES
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import LayoutPatient from "./component/Patients/Layout";
import AllPatientsLayout from "./component/Patients/AllPatientsLayout";
import Login from "./component/Login/Login";
import DoctorLayout from "./component/Doctors/DotorLayout";
import AppointmentLayout from "./component/Appointment/AppointmentLayout";
import BookingDisplay from "./component/Booking/BookingDisplay";
import LayoutSchedule from "./component/Schedule/LayoutSched";
import ForgotPassword from "./component/Login/ForgotPassword";
import ResetPassword from "./component/Login/ResetPassword";
import TreatmentTable from "./component/Treatment/TreatmentTable";
import Prescription from "./component/Prescription/PrescriptionTable";
import BillTable from "./component/Bills/BillTable";
import InsuranceTable from "./component/insurance/insuranceTable";
import DentalHistoryTable from "./component/DentalHistory/DentalHistoryTable";
import UpdatePassword from "./component/Login/UpdatePassword";
import StaffTable from "./component/Staff/StaffTable";
import BillsLayout from "./component/Bills/BillsLayoutslide";
import PrivateRoute from "./component/PrivateRoute/PrivateRoute";
import PublicRoute from "./component/PublicRoute/PublicRoute";
import InventoryLayout from "./component/Inventory/InventoryLayout";
import ManageLayout from "./component/DashboardAdminComponent/ManageAccountLayout";
import LandingPage from "./component/LandingPage/landingPage";
import AuditLogs from "./component/LogsAndAudit/LogsAndAudit";
import Reports from "./component/Reports/GenerateReport"

function App() {
    const router = createBrowserRouter([
        {
            element: <PublicRoute />,
            children: [
                { path: "/login", element: <LandingPage /> },
                { path: "/reset-password/:token", element: <ResetPassword /> },
                { path: "/", element: <LandingPage /> },
            ],
        },

        // PRIVATE ROUTES (Dashboard)
        {
            path: "/dashboard",
            element: <PrivateRoute />,
            children: [
                {
                    path: "",
                    element: <Layout />,
                    children: [
                        { index: true, element: <DashboardPage /> },
                        { path: "dentalhistory", element: <DentalHistoryTable /> },
                        { path: "appointment", element: <AppointmentLayout /> },
                        { path: "bill", element: <BillsLayout /> },
                        { path: "booking", element: <BookingDisplay /> },
                        { path: "prescription", element: <Prescription /> },
                        { path: "Schedule", element: <LayoutSchedule /> },
                        { path: "Change-Password", element: <UpdatePassword /> },
                        { path: "Treatment", element: <TreatmentTable /> },
                        { path: "Insurance", element: <InsuranceTable /> },
                        { path: "Inventory", element: <InventoryLayout /> },
                        { path: "Accounts", element: <ManageLayout /> },
                        { path: "Logs", element: <AuditLogs /> },
                        { path: "Reports", element: <Reports /> },
         
                    ],
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
