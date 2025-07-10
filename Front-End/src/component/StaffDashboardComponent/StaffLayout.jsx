import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import StatCard from "../StaffDashboardComponent/StatCard";
import TodayAppointmentsTable from "../StaffDashboardComponent/AppointmentTable";
import TasksTable from "../StaffDashboardComponent/TaskTable";
import { AppointmentDisplayContext } from "../../contexts/AppointmentContext/appointmentContext";
import { TaskDisplayContext } from "../../contexts/TaskContext/TaskContext";
import { CalendarCheck, ClipboardList, MessageSquare, Calendar } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
const StaffLayout = () => {
    const {linkId}=useContext(AuthContext)
    const { isTask } = useContext(TaskDisplayContext);
    const { appointment } = useContext(AppointmentDisplayContext);
    const appointments = appointment;

    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [newBookingsToday, setNewBookingsToday] = useState(0);
    const [completedAppointments, setCompletedAppointments] = useState(0);


    console.log("USERID",linkId)

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":");
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    const formatDateToPhilippine = (isoDateString) => {
        const date = new Date(isoDateString);
        const options = { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString("fil-PH", options);
    };

    useEffect(() => {
        if (!appointments || !Array.isArray(appointments)) {
            console.log("Appointment data not ready or invalid.");
            return;
        }

        const now = new Date();
        const phDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
        const todayFormatted = phDate.toISOString().split("T")[0];

        const mappedAppointments = (appointments || [])
            .filter((appointment) => appointment?.patient_info && appointment?.doctor_info)
            .map((appointment) => {
                const patientName = `${appointment.patient_info.first_name || "N/A"} ${appointment.patient_info.last_name || "N/A"}`;
                const doctorName = `Dr. ${appointment.doctor_info.last_name || "N/A"}`;
                const appointmentTime = formatTime(appointment.start_time || "00:00");
                const patientGender = appointment.patient_info.gender === "Male" ? "Other" : appointment.patient_info.gender || "N/A";

                return {
                    id: appointment._id,
                    patientName,
                    time: appointmentTime,
                    doctor: doctorName,
                    status: appointment.appointment_status || "Pending",
                    patientGender,
                    appointmentDate: formatDateToPhilippine(appointment.appointment_date),
                    originalAppointmentDate: new Date(appointment.appointment_date).toISOString().split("T")[0],
                    createdAtDate: new Date(appointment.created_at).toISOString().split("T")[0],
                };
            });

        const todayAppointmentsData = mappedAppointments.filter((appt) => appt.originalAppointmentDate === todayFormatted);
        setTodayAppointments(todayAppointmentsData);
        setTotalAppointments(mappedAppointments.length);

        const completedCount = mappedAppointments.filter((appt) => appt.status?.toLowerCase() === "completed").length;
        setCompletedAppointments(completedCount);

        const generatedTasks = mappedAppointments.slice(0, 3).map((appt, index) => {
            const apptDate = new Date(appt.originalAppointmentDate);
            apptDate.setDate(apptDate.getDate() - 1);
            return {
                id: `task-${index + 1}`,
                description: `Prepare ${appt.patientName}'s file for ${appt.appointmentDate} appointment`,
                dueDate: formatDateToPhilippine(apptDate),
                status: index === 0 ? "Pending" : index === 1 ? "High Priority" : "Completed",
            };
        });
        setUpcomingTasks(generatedTasks);

        const newBookingsCount = mappedAppointments.filter((appt) => appt.createdAtDate === todayFormatted).length;
        setNewBookingsToday(newBookingsCount);
        if (Array.isArray(isTask)) {
            setTotalTasks(isTask.length);
        }
    }, [appointments, isTask]);

    const showMessageBox = (message, type = "success") => {
        const messageBox = document.createElement("div");
        messageBox.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg z-[1000] animate-fadeInOut ${
            type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`;
        messageBox.innerText = message;
        document.body.appendChild(messageBox);

        setTimeout(() => {
            document.body.removeChild(messageBox);
        }, 3000);
    };

    return (
        <motion.div
            className="flex flex-col font-sans transition-colors duration-300"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8 }}
        >
            <div className="flex-1 overflow-y-auto">
                <motion.div
                    className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <StatCard
                        icon={<CalendarCheck size={32} />}
                        title="Total Appointments"
                        value={totalAppointments}
                        trend={{ value: "8%", direction: "up" }}
                        description="Overall appointments managed"
                    />
                    <StatCard
                        icon={<ClipboardList size={32} />}
                        title="Total Tasks"
                        value={totalTasks}
                        trend={{ value: "3%", direction: "up" }}
                        description="All tasks created in system"
                    />
                    <StatCard
                        icon={<MessageSquare size={32} />}
                        title="Completed Appointments"
                        value={completedAppointments}
                        trend={{ value: "10%", direction: "up" }}
                        description="Successfully finished visits"
                    />
                    <StatCard
                        icon={<Calendar size={32} />}
                        title="New Bookings Today"
                        value={newBookingsToday}
                        trend={{ value: "5%", direction: "up" }}
                        description="Appointments booked today"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <TodayAppointmentsTable
                        todayAppointments={todayAppointments}
                        showMessageBox={showMessageBox}
                    />
                    <TasksTable
                        upcomingTasks={upcomingTasks}
                        showMessageBox={showMessageBox}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default StaffLayout;
