import React, { useContext } from 'react';
import { AuthContext } from "../../../contexts/AuthContext"; 
import { PatientDisplayContext } from '../../../contexts/PatientContext/PatientContext';
import { AppointmentDisplayContext } from '../../../contexts/AppointmentContext/appointmentContext';
import { TreatmentDisplayContext } from '../../../contexts/TreatmentContext/TreatmentContext';
import {
    Bandage,
    TrendingUp,
    Users,
    User,
    CalendarCheck,
} from "lucide-react";

const StatCard = ({ icon, title, value, trend, description }) => {
    const trendDirection = trend?.direction || "up";
    const trendValue = trend?.value || "0%";

    const trendTextColorClass = trendDirection === "down" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
    const trendBgClass = trendDirection === "down" ? "bg-red-100 dark:bg-red-800/50" : "bg-green-100 dark:bg-green-800/50";

    const styledIcon = React.cloneElement(icon, {
        className: 'text-blue-600 dark:text-blue-300'
    });

    return (
        <div className="card bg-blue-50 p-3 sm:p-4 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800/50">
                    {styledIcon}
                </div>
                <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendBgClass} ${trendTextColorClass}`}
                >
                    <TrendingUp
                        size={14}
                        className={trendDirection === "down" ? "rotate-180 transform" : ""}
                    />
                    {trendValue}
                </span>
            </div>
            <div className="mt-3 sm:mt-4">
                <h3 className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">{title}</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {value}
                </p>
                {description && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

const CardData = () => {
    const { role } = useContext(AuthContext);
    const { patients } = useContext(PatientDisplayContext);
    const {appointment}=useContext(AppointmentDisplayContext)
    const {Treatment}=useContext(TreatmentDisplayContext)



    if (role !== "admin") return null;

    const totalActivePatients = patients.length;

    const today = new Date();
    const currentMonth = today.getMonth(); 
    const currentYear = today.getFullYear(); 

    const newPatientsThisMonth = patients.filter(patient => {
        const createdAt = new Date(patient.created_at);
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    }).length;

    const totalTreatments = Treatment.length;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const completedAppointmentsThisWeek = appointment.filter(app => {
        const date = new Date(app.appointment_date);
        return (
            app.appointment_status === "Completed" &&
            date >= startOfWeek &&
            date <= endOfWeek
        );
    }).length;

    return (
        <div className="grid grid-cols-2 gap-4">
            <StatCard
                icon={<Bandage size={20} />}
                title="Total Treatments"
                value={totalTreatments.toString()}
                trend={{ value: "21%", direction: "up" }} 
                description="Overall treatments recorded"
            />
            <StatCard
                icon={<User size={20} />}
                title="Active Patients"
                value={totalActivePatients.toString()}
                trend={{ value: "12%", direction: "up" }}
                description="Currently registered"
            />
            <StatCard
                icon={<Users size={20} />}
                title="New Patients"
                value={newPatientsThisMonth.toString()}
                trend={{ value: "5%", direction: "down" }}
                description="This month"
            />
            <StatCard
                icon={<CalendarCheck size={20} />}
                title="Completed Appointments"
                value={completedAppointmentsThisWeek.toString()}
                trend={{ value: "8%", direction: "up" }}
                description="This week"
            />
        </div>
    );
};

export default CardData;
