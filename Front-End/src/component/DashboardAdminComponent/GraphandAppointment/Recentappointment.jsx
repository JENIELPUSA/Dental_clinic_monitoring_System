import React, { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { CalendarCheck, Clock, User } from "lucide-react";
import { AppointmentDisplayContext } from "../../../contexts/AppointmentContext/appointmentContext";

const RecentAppointment = () => {
  const { role } = useContext(AuthContext);
  const { appointment } = useContext(AppointmentDisplayContext);

  if (role === "patient") return null;

  const formatAppointmentDateTime = (dateString, startTime, endTime) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-PH", options);
    return `${formattedDate} ${startTime} - ${endTime}`;
  };

  const filteredAppointments = Array.isArray(appointment)
    ? appointment
        .filter((app) =>
          ["Confirmed", "Pending"].includes(app.appointment_status)
        )
        .sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        .slice(0, 5)
    : [];
  return (
    <div className="card bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-md">
      <div className="card-header p-4 border-b border-blue-200 dark:border-blue-700">
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          Recent Appointments
        </h2>
      </div>
      <div className="h-[250px] sm:h-[300px] overflow-y-auto p-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => (
            <AppointmentCard
              key={app._id}
              appointment={app}
              formatAppointmentDateTime={formatAppointmentDateTime}
            />
          ))
        ) : (
          <p className="text-center text-sm text-blue-600 dark:text-blue-300">
            No appointments found.
          </p>
        )}
      </div>
    </div>
  );
};

const AppointmentCard = ({ appointment, formatAppointmentDateTime }) => (
  <div className="border-b border-blue-100 p-3 sm:p-4 last:border-0 hover:bg-blue-100/50 dark:border-blue-800/50 dark:hover:bg-blue-900/30 rounded-lg mb-2">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-blue-800 dark:text-blue-200">
          Appointment for{" "}
          {appointment?.patient_info?.first_name || "N/A"}{" "}
          {appointment?.patient_info?.last_name || ""} with{" "}
          {appointment?.doctor_info?.first_name || "N/A"}{" "}
          {appointment?.doctor_info?.last_name || ""}
        </h3>
        <div className="mt-1 flex flex-col gap-1 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <User size={14} className="text-blue-600 dark:text-blue-400" />
            <span>
              Patient:{" "}
              {appointment?.patient_info?.first_name || "N/A"}{" "}
              {appointment?.patient_info?.last_name || ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck size={14} className="text-blue-600 dark:text-blue-400" />
            <span>
              Doctor:{" "}
              {appointment?.doctor_info?.first_name || "N/A"}{" "}
              {appointment?.doctor_info?.last_name || ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-blue-600 dark:text-blue-400" />
            <span>
              {formatAppointmentDateTime(
                appointment?.appointment_date,
                appointment?.start_time,
                appointment?.end_time
              )}
            </span>
          </div>
        </div>
      </div>
      <StatusBadge status={appointment?.appointment_status} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Confirmed: "bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-300",
    Completed: "bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-300",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
        statusStyles[status] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default RecentAppointment;
