import React, { useState, useContext, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  ListPlus,
  CalendarCheck,
  XCircle,
  CheckCircle,
} from "lucide-react";

import { motion } from "framer-motion"; // ✅ Import motion

import StatCard from "../DoctorDashboard/StatCard";
import AppointmentTable from "../DoctorDashboard/AppointmentTable";
import PatientTable from "../DoctorDashboard/PatientTable";
import AddAppointmentForm from "../DoctorDashboard/AddApointmentForm";
import ManagePatientsView from "../DoctorDashboard/ManagementPatientView";

import { AppointmentDisplayContext } from "../../contexts/AppointmentContext/appointmentContext";
import { AuthContext } from "../../contexts/AuthContext";

const DoctorDashboardLayout = () => {
  const { linkId } = useContext(AuthContext);
  const { appointment, specificAppointment } = useContext(AppointmentDisplayContext);

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredAppointments = useMemo(() => {
    return appointment.filter((appt) => appt.doctor_info?._id === linkId);
  }, [appointment, linkId]);

  const uniquePatients = useMemo(() => {
    return specificAppointment.filter((appt) => appt.doctor_info?._id === linkId);
  }, [specificAppointment, linkId]);

  const totalPending = filteredAppointments.filter(
    (app) => app.appointment_status === "Pending"
  ).length;
  const totalConfirmed = filteredAppointments.filter(
    (app) => app.appointment_status === "Confirmed"
  ).length;
  const totalCancelled = filteredAppointments.filter(
    (app) => app.appointment_status === "Cancelled"
  ).length;

  const MainContent = () => {
    const today = new Date().toISOString().split("T")[0];

    const todaysAppointments = filteredAppointments.filter((appointment) => {
      const apptDate = new Date(appointment.appointment_date)
        .toISOString()
        .split("T")[0];
      return apptDate === today;
    });

    const upcomingAppointments = filteredAppointments.filter((appointment) => {
      if (!selectedDate) return true;
      const appointmentDate = new Date(appointment.appointment_date)
        .toISOString()
        .split("T")[0];
      return appointmentDate === selectedDate;
    });

    if (currentView === "addAppointment") {
      return <AddAppointmentForm onBack={() => setCurrentView("dashboard")} />;
    }

    if (currentView === "managePatients") {
      return (
        <ManagePatientsView
          patients={uniquePatients}
          onBack={() => setCurrentView("dashboard")}
        />
      );
    }
    return (
      <div className="space-y-8 ">
        {/* Stat Cards Section with Slide Down */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard
            icon={<Users size={32} />}
            title="Today's Patients"
            value={todaysAppointments.length}
            trend={{ value: "5%", direction: "up" }}
            description="Patients scheduled for today"
          />
          <StatCard
            icon={<CalendarCheck size={32} />}
            title="Pending Appointments"
            value={totalPending}
            trend={{ value: "2%", direction: "down" }}
            description="Appointments awaiting confirmation"
          />
          <StatCard
            icon={<CheckCircle size={32} />}
            title="Confirmed Appointments"
            value={totalConfirmed}
            trend={{ value: "8%", direction: "up" }}
            description="Total confirmed appointments"
          />
          <StatCard
            icon={<XCircle size={32} />}
            title="Cancelled Appointments"
            value={totalCancelled}
            trend={{ value: "1%", direction: "up" }}
            description="Appointments cancelled this month"
          />
        </motion.div>

        {/* Today's Appointments with Scale/Fade */}
        <motion.div
          className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="mb-6 flex items-center text-2xl font-bold text-gray-800 dark:text-white">
            <Clock size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
            Today's Appointments (
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            )
          </h3>
          <AppointmentTable appointments={todaysAppointments} />
        </motion.div>

        {/* Upcoming Appointments with Slide-In */}
        <motion.div
          className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center text-2xl font-bold text-gray-800 dark:text-white">
              <Calendar className="mr-3 text-blue-600 dark:text-blue-400" /> Upcoming Appointments
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                aria-label="Select Appointment Date"
              />
            </div>
          </div>
          <AppointmentTable appointments={upcomingAppointments} />
        </motion.div>

        {/* Recent Patients with Fade In */}
        <motion.div
          className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center text-2xl font-bold text-gray-800 dark:text-white">
              <Users className="mr-3 text-blue-600 dark:text-blue-400" /> Recent Patients
            </h3>
          </div>
          <PatientTable patients={uniquePatients} />
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col font-sans ">
      <div className="flex-1 overflow-y-auto">
        <MainContent />
      </div>
    </div>
  );
};

export default DoctorDashboardLayout;
