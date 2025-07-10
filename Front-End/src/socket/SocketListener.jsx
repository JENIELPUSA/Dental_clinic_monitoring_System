import { useEffect, useContext } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNotificationDisplay } from "../contexts/NotificationContext/NotificationContext.jsx";
import { AppointmentDisplayContext } from "../contexts/AppointmentContext/appointmentContext.jsx";
import socket from "../socket.js";
import { toast } from "react-toastify";
import { SchedDisplayContext } from "../contexts/Schedule/ScheduleContext.jsx";
import { TreatmentDisplayContext } from "../contexts/TreatmentContext/TreatmentContext.jsx";

const SocketListener = () => {
  const { AddSocketTreatment } = useContext(TreatmentDisplayContext);
  const { AddSchedule, updateStatusSocketData, fetchSchedData } = useContext(SchedDisplayContext);
  const { role, linkId } = useAuth();
  const { setNotify } = useNotificationDisplay();
  const { addAppointment, updateAppointmentSocketData } = useContext(AppointmentDisplayContext);

  // Helper to format socket notification into UI state format
  const formatNotification = (data, fallbackMessage = "You have a new notification") => ({
    _id: data._id || Math.random().toString(36).substr(2, 9),
    message: data.message || fallbackMessage,
    createdAt: data.createdAt || new Date().toISOString(),
    viewers: [
      {
        user: linkId,
        isRead: false,
      },
    ],
  });

  // Register user on socket connection
  useEffect(() => {
    if (!linkId || !role) return;
    console.log("📡 Registering socket:", linkId, role);
    socket.emit("register-user", linkId, role);
  }, [linkId, role]);

  // Listen to socket events
  useEffect(() => {
    if (!linkId || !role) return;

    const handleAdminNotification = (data) => {
      setNotify((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [formatNotification(data), ...prev];
      });
    };

    const handleSMSNotification = (data) => {
      setNotify((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [formatNotification(data), ...prev];
      });
    };

    const handleAppointmentConfirmed = (data) => {
      setNotify((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [formatNotification(data), ...prev];
      });
    };

    const handleNotificationReset = ({ count }) => {
      toast.dismiss();
    };

    const handleScheduleAssigned = (data) => {
      setNotify((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [formatNotification(data), ...prev];
      });
      AddSchedule(data);
    };

    const handleBillNotification = (data) => {
      setNotify((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [formatNotification(data), ...prev];
      });
    };

    const handleTreatmentNotification = (data) => {
      setNotify((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [formatNotification(data), ...prev];
      });
    };

    const handleAppointmentUpdated = (data) => {
      updateAppointmentSocketData(data);
      fetchSchedData();
    };

    const handleStatusSched = (data) => {
      updateStatusSocketData(data);
    };

    const handleNewAppointment = (data) => {
      addAppointment(data);
      fetchSchedData();
    };

    const handleNewTreatment = (data) => {
      AddSocketTreatment(data);
    };

    // Register listeners
    socket.on("adminNotification", handleAdminNotification);
    socket.on("SMSNotification", handleSMSNotification);
    socket.on("appointmentConfirmed", handleAppointmentConfirmed);
    socket.on("notificationCountReset", handleNotificationReset);
    socket.on("scheduleAssigned", handleScheduleAssigned);
    socket.on("billNotification", handleBillNotification);
    socket.on("treatmentNotification", handleTreatmentNotification);
    socket.on("updated-appointment", handleAppointmentUpdated);
    socket.on("scheduleStatusUpdated", handleStatusSched);
    socket.on("new-appointment", handleNewAppointment);
    socket.on("new-treatment", handleNewTreatment);

    // Cleanup listeners on unmount
    return () => {
      socket.off("adminNotification", handleAdminNotification);
      socket.off("SMSNotification", handleSMSNotification);
      socket.off("appointmentConfirmed", handleAppointmentConfirmed);
      socket.off("notificationCountReset", handleNotificationReset);
      socket.off("scheduleAssigned", handleScheduleAssigned);
      socket.off("billNotification", handleBillNotification);
      socket.off("treatmentNotification", handleTreatmentNotification);
      socket.off("updated-appointment", handleAppointmentUpdated);
      socket.off("scheduleStatusUpdated", handleStatusSched);
      socket.off("new-appointment", handleNewAppointment);
      socket.off("new-treatment", handleNewTreatment);
    };
  }, [linkId, role, setNotify, addAppointment, fetchSchedData]);

  return null; // This component only handles socket listeners
};

export default SocketListener;
