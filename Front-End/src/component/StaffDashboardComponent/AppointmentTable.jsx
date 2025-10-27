import React from 'react';
import { Clock } from 'lucide-react';

const TodayAppointmentsTable = ({ todayAppointments, showMessageBox }) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800 border-t-4 border-blue-600 sm:p-6">
      <h3 className="mb-4 flex items-center text-lg font-bold text-gray-800 dark:text-white sm:mb-6 sm:text-xl">
        <Clock size={20} className="mr-2 text-blue-600 dark:text-blue-400 sm:mr-3 sm:size-6" />
        Today's Appointments ({today})
      </h3>

      {/* DESKTOP: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Patient Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Doctor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 sm:px-6">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appt, index) => (
                <tr
                  key={appt.id}
                  className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white sm:px-6">
                    {appt.patientName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                    {appt.time}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300 sm:px-6">
                    {appt.doctor}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        appt.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200'
                          : appt.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                  No appointments today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE: Card View */}
      <div className="md:hidden space-y-3">
        {todayAppointments.length > 0 ? (
          todayAppointments.map((appt) => (
            <div
              key={appt.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex justify-between">
                <p className="font-medium text-gray-900 dark:text-white">{appt.patientName}</p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    appt.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200'
                      : appt.status === 'Confirmed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200'
                  }`}
                >
                  {appt.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                  {appt.time}
                </div>
                <div>Doctor: {appt.doctor}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No appointments today.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayAppointmentsTable;