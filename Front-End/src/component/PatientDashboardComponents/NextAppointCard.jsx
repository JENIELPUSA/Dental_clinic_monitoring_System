import React, { useState, useEffect, useContext } from 'react';
import { AppointmentDisplayContext } from '../../contexts/AppointmentContext/appointmentContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Calendar, CalendarX, Clock, User, CheckCircle } from 'lucide-react';

function NextAppointCard() {
  const { linkId } = useContext(AuthContext);
  const { appointment } = useContext(AppointmentDisplayContext);

  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNextAppointment = () => {
      try {
        const now = new Date();
        const appointmentsArray = Array.isArray(appointment?.data)
          ? appointment.data
          : Array.isArray(appointment)
          ? appointment
          : [];

        if (!Array.isArray(appointmentsArray) || appointmentsArray.length === 0) {
          setError("No appointment data available.");
          setLoading(false);
          return;
        }

        const validAppointments = appointmentsArray
          .filter(app =>
            app?.patient_info?._id?.toString() === linkId &&
            app?.appointment_status === 'Confirmed' &&
            app.appointment_date &&
            app.start_time
          )
          .map(app => {
            const dateStr = app.appointment_date.split('T')[0];
            const timeStr = app.start_time.padStart(5, '0');
            const [hours, minutes] = timeStr.split(':').map(Number);
            const [year, month, day] = dateStr.split('-').map(Number);
            const datetime = new Date(Date.UTC(year, month - 1, day, hours, minutes));
            return {
              ...app,
              datetime,
              isValid: !isNaN(datetime.getTime())
            };
          })
          .filter(app => app.isValid && app.datetime > now);

        validAppointments.sort((a, b) => a.datetime - b.datetime);

        if (validAppointments.length > 0) {
          const next = validAppointments[0];
          const formattedDate = next.datetime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          setNextAppointment({
            date: formattedDate,
            time: next.start_time,
            endTime: next.end_time,
            dentist: `${next.doctor_info?.first_name || ''} ${next.doctor_info?.last_name || ''}`.trim(),
            service: next.service,
            status: next.appointment_status,
            location: 'Clinic Location TBD',
          });
        } else {
          setNextAppointment(null);
        }
      } catch (err) {
        console.error("❌ Failed to process appointment data:", err);
        setError("Failed to process appointment data.");
      } finally {
        setLoading(false);
      }
    };

    if (linkId && appointment) {
      fetchNextAppointment();
    }
  }, [appointment, linkId]);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl bg-gray-100 p-6 text-center dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-700 dark:text-gray-300">Loading your appointment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl bg-red-100 p-6 text-center dark:bg-red-900/20 border border-red-400">
        <CalendarX className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border-t-4 border-blue-600 bg-white p-4 shadow-lg dark:bg-blue-900/20 dark:shadow-xl sm:p-6">
      <h2 className="mb-4 flex items-center text-xl font-semibold text-blue-800 dark:text-blue-200 sm:text-2xl">
        <Calendar className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-300 sm:mr-3 sm:h-7 sm:w-7" />
        Your Next Appointment
      </h2>

      {nextAppointment ? (
        <div className="space-y-2 text-gray-700 dark:text-gray-300 sm:space-y-3">
          <div className="flex items-start">
            <Calendar className="mr-2 mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400 sm:h-5 sm:w-5" />
            <p className="text-base sm:text-lg">
              <span className="font-medium">Date:</span> {nextAppointment.date}
            </p>
          </div>
          <div className="flex items-start">
            <Clock className="mr-2 mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400 sm:h-5 sm:w-5" />
            <p className="text-base sm:text-lg">
              <span className="font-medium">Time:</span> {nextAppointment.time} – {nextAppointment.endTime}
            </p>
          </div>
          <div className="flex items-start">
            <User className="mr-2 mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400 sm:h-5 sm:w-5" />
            <p className="text-base sm:text-lg">
              <span className="font-medium">Dentist:</span> {nextAppointment.dentist}
            </p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400 sm:h-5 sm:w-5" />
            <p className="text-base sm:text-lg">
              <span className="font-medium mr-1">Status:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full sm:px-3 sm:py-1 sm:text-sm ${getStatusClasses(nextAppointment.status)}`}>
                {nextAppointment.status}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CalendarX className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-300">
            You have no upcoming confirmed appointments.
          </p>
        </div>
      )}
    </div>
  );
}

export default NextAppointCard;