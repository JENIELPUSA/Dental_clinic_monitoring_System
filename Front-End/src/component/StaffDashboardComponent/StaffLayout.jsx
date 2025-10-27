import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import StatCard from "../StaffDashboardComponent/StatCard";
import TodayAppointmentsTable from "../StaffDashboardComponent/AppointmentTable";
import TasksTable from "../StaffDashboardComponent/TaskTable";
import { AppointmentDisplayContext } from "../../contexts/AppointmentContext/appointmentContext";
import { TaskDisplayContext } from "../../contexts/TaskContext/TaskContext";
import { CalendarCheck, ClipboardList, MessageSquare, Calendar } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import AppointmentStepper from "../Appointment/AppointmentStepper";

const StaffLayout = () => {
    const { linkId } = useContext(AuthContext);
    const { isTask } = useContext(TaskDisplayContext);
    const { appointment } = useContext(AppointmentDisplayContext);
    const appointments = appointment;
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [newBookingsToday, setNewBookingsToday] = useState(0);
    const [completedAppointments, setCompletedAppointments] = useState(0);

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
  className="flex min-h-0 flex-col font-sans transition-colors duration-300"
  initial={{ opacity: 0, x: 100 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -100 }}
  transition={{ duration: 0.8 }}
>
  <div className="flex-1 overflow-y-auto px-2 py-2 2xs:px-0 2xs:py-0 xs:px-0 sm:px-6">
   <div className="flex flex-col gap-6 md:flex-row md:gap-6">
  {/* LEFT COLUMN: Stat Cards + Tables — Wider */}
  <div className="flex flex-col gap-6 md:w-2/3">
    {/* Stat Cards Grid */}
    <motion.div
      className="grid grid-cols-1 gap-3 2xs:grid-cols-2 xs:grid-cols-2 xs:gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StatCard
        icon={<CalendarCheck size={28} />}
        title="Total Appointments"
        value={totalAppointments}
        trend={{ value: "8%", direction: "up" }}
        description="Overall appointments managed"
      />
      <StatCard
        icon={<ClipboardList size={28} />}
        title="Total Tasks"
        value={totalTasks}
        trend={{ value: "3%", direction: "up" }}
        description="All tasks created in system"
      />
      <StatCard
        icon={<MessageSquare size={28} />}
        title="Completed Appointments"
        value={completedAppointments}
        trend={{ value: "10%", direction: "up" }}
        description="Successfully finished visits"
      />
      <StatCard
        icon={<Calendar size={28} />}
        title="New Bookings Today"
        value={newBookingsToday}
        trend={{ value: "5%", direction: "up" }}
        description="Appointments booked today"
      />
    </motion.div>

    <TodayAppointmentsTable
      todayAppointments={todayAppointments}
      showMessageBox={showMessageBox}
    />

    <TasksTable
      upcomingTasks={upcomingTasks}
      showMessageBox={showMessageBox}
    />
  </div>
  <div className="md:w-1/3">
    <div className="flex flex-col rounded-xl bg-white p-3 sm:p-4 shadow-lg dark:bg-gray-900
                h-full min-h-[250px] max-h-[640px]">
  <h2 className="mb-3 text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-200">
    Appointment Progress
  </h2>
  <div className="min-w-0 flex-1 overflow-auto">
    <AppointmentStepper />
  </div>
</div>
  </div>
</div>
  </div>
</motion.div>
    );
};

export default StaffLayout;
