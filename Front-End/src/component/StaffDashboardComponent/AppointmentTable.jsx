import React from 'react';
import { Clock } from 'lucide-react';

const TodayAppointmentsTable = ({ todayAppointments, showMessageBox }) => {
    return (
        <div className="rounded-xl bg-white p-8 shadow-xl mb-8 dark:bg-gray-800 mx-auto border-t-4 border-blue-600">
            <h3 className="mb-6 flex items-center text-2xl font-bold text-gray-800 dark:text-white">
                <Clock size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
                Today's Appointments ({new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })})
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Patient Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map((appt, index) => (
                                <tr key={appt.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{appt.patientName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{appt.time}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{appt.doctor}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            appt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                            appt.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                        }`}>{appt.status}</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No appointments today.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TodayAppointmentsTable;
