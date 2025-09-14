import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import SocketListener from "./socket/SocketListener.jsx";
import { PatientDisplayProvider } from "./contexts/PatientContext/PatientContext.jsx";
import { DoctorDisplayProvider } from "./contexts/DoctorContext/doctorContext.jsx";
import { AppointmentDisplayProvider } from "./contexts/AppointmentContext/appointmentContext.jsx";
import { SchedDisplayProvider } from "./contexts/Schedule/ScheduleContext.jsx";
import { UserDisplayProvider } from "./contexts/UserContext/userContext.jsx";
import { TreatmentDisplayProvider } from "./contexts/TreatmentContext/TreatmentContext.jsx";
import { PrescriptionDisplayProvider } from "./contexts/PrescriptionContext/PrescriptionContext.jsx";
import { BillDisplayProvider } from "./contexts/BillContext/BillContext.jsx";
import { InsuranceDisplayProvider } from "./contexts/InsuranceContext/InsuranceContext.jsx";
import { NotificationDisplayProvider } from "./contexts/NotificationContext/NotificationContext.jsx";
import { LogsDisplayProvider } from "./contexts/LogsAndAudit/LogsAndAudit.jsx";
import { DentalHistoryProvider } from "./contexts/DentalHistoryContext/DentalHistoryContext.jsx";
import { TaskDisplayProvider } from "./contexts/TaskContext/TaskContext.jsx";
import { UpdateDisplayProvider } from "./contexts/UpdateContext/updateContext.jsx";
import { StaffDisplayProvider } from "./contexts/StaffContext/StaffContext.jsx";
import { InventoryProvider } from "./contexts/InventoryContext/InventoryContext.jsx";
import { CategoryProvider } from "./contexts/CategoryContext.jsx";
import AxiosInterceptor from "./component/AxiosInterceptor.jsx";
import { ReleaseHistoryProvider } from "./contexts/ReleaseHistoryContext/ReleaseHistoryContext.jsx";
createRoot(document.getElementById("root")).render(
    //<StrictMode>
    <AuthProvider>
        <ReleaseHistoryProvider>
            <CategoryProvider>
                <InventoryProvider>
                    <StaffDisplayProvider>
                        <UpdateDisplayProvider>
                            <TaskDisplayProvider>
                                <DentalHistoryProvider>
                                    <LogsDisplayProvider>
                                        <NotificationDisplayProvider>
                                            <InsuranceDisplayProvider>
                                                <TreatmentDisplayProvider>
                                                    <BillDisplayProvider>
                                                        <PrescriptionDisplayProvider>
                                                            <UserDisplayProvider>
                                                                <SchedDisplayProvider>
                                                                    <AppointmentDisplayProvider>
                                                                        <DoctorDisplayProvider>
                                                                            <PatientDisplayProvider>
                                                                                <SocketListener />
                                                                                <App />
                                                                                <AxiosInterceptor />
                                                                            </PatientDisplayProvider>
                                                                        </DoctorDisplayProvider>
                                                                    </AppointmentDisplayProvider>
                                                                </SchedDisplayProvider>
                                                            </UserDisplayProvider>
                                                        </PrescriptionDisplayProvider>
                                                    </BillDisplayProvider>
                                                </TreatmentDisplayProvider>
                                            </InsuranceDisplayProvider>
                                        </NotificationDisplayProvider>
                                    </LogsDisplayProvider>
                                </DentalHistoryProvider>
                            </TaskDisplayProvider>
                        </UpdateDisplayProvider>
                    </StaffDisplayProvider>
                </InventoryProvider>
            </CategoryProvider>
        </ReleaseHistoryProvider>
    </AuthProvider>,
    //</StrictMode>,
);
