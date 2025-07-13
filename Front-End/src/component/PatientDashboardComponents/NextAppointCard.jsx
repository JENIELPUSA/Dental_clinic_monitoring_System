import React, { useState, useEffect, useContext } from 'react';
import { AppointmentDisplayContext } from '../../contexts/AppointmentContext/appointmentContext';
import { AuthContext } from '../../contexts/AuthContext';

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

                        const timeStr = app.start_time.padStart(5, '0'); // e.g., "2:44" → "02:44"
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
            <div className="flex items-center justify-center min-h-[250px] bg-gray-100 p-4 rounded-2xl dark:bg-gray-900">
                <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading appointment...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[250px] bg-red-100 p-4 rounded-2xl dark:bg-red-900/20 border border-red-400">
                <span className="text-red-700 text-lg dark:text-red-300">{error}</span>
            </div>
        );
    }

    return (
        <div className="mx-auto border-t-4 border-blue-600 bg-white p-6 rounded-2xl shadow-lg border dark:bg-blue-900/20 dark:shadow-xl">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center dark:text-blue-200">
                <svg className="w-7 h-7 mr-3 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Your Next Appointment
            </h2>

            {nextAppointment ? (
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p className="text-lg"><span className="font-medium">Date:</span> {nextAppointment.date}</p>
                    <p className="text-lg"><span className="font-medium">Time:</span> {nextAppointment.time} - {nextAppointment.endTime}</p>
                    <p className="text-lg"><span className="font-medium">Dentist:</span> {nextAppointment.dentist}</p>
                    <p className="text-lg flex items-center">
                        <span className="font-medium mr-2">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(nextAppointment.status)}`}>
                            {nextAppointment.status}
                        </span>
                    </p>
                </div>
            ) : (
                <p className="text-gray-600 text-lg dark:text-gray-300">You have no upcoming confirmed appointments.</p>
            )}
        </div>
    );
}

export default NextAppointCard;
