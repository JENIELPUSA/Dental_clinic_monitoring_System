import React, { useState } from 'react';

export default function DateTimePickerShowcase() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDateTimeLocal, setSelectedDateTimeLocal] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-blue-50 to-blue-100 p-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-blue-900 dark:text-blue-100 mb-12">
        <span className="block text-blue-700 dark:text-blue-300">Iba't Ibang Uri ng Date at Time Pickers</span>
        sa React at HTML
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">

        {/* Date Picker */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pumili ng Petsa (`type="date"`)</h2>
          <input
            type="date"
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm w-full"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Napiling Petsa: <span className="font-semibold">{selectedDate || 'Wala'}</span></p>
        </div>

        {/* Time Picker */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pumili ng Oras (`type="time"`)</h2>
          <input
            type="time"
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm w-full"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Napiling Oras: <span className="font-semibold">{selectedTime || 'Wala'}</span></p>
        </div>

        {/* Date and Time Picker (Local) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Petsa at Oras (`type="datetime-local"`)</h2>
          <input
            type="datetime-local"
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm w-full"
            value={selectedDateTimeLocal}
            onChange={(e) => setSelectedDateTimeLocal(e.target.value)}
          />
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Napiling Petsa/Oras: <span className="font-semibold">{selectedDateTimeLocal || 'Wala'}</span></p>
        </div>

        {/* Month Picker */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pumili ng Buwan (`type="month"`)</h2>
          <input
            type="month"
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm w-full"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Napiling Buwan: <span className="font-semibold">{selectedMonth || 'Wala'}</span></p>
        </div>

        {/* Week Picker */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pumili ng Linggo (`type="week"`)</h2>
          <input
            type="week"
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm w-full"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          />
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Napiling Linggo: <span className="font-semibold">{selectedWeek || 'Wala'}</span></p>
        </div>
      </div>
    </div>
  );
}
