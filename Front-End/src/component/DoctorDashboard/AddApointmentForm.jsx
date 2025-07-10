import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddAppointmentForm = ({ onBack }) => {
  const [patientName, setPatientName] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [service, setService] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`New Appointment: Patient: ${patientName}, Date: ${apptDate}, Time: ${apptTime}, Service: ${service}`);
    onBack();
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-xl">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Plus size={24} className="mr-3 text-blue-600" /> Add New Appointment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="patientName" className="block text-lg font-medium text-gray-700 mb-2">Patient Name</label>
          <input
            type="text"
            id="patientName"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="apptDate" className="block text-lg font-medium text-gray-700 mb-2">Appointment Date</label>
          <input
            type="date"
            id="apptDate"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={apptDate}
            onChange={(e) => setApptDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="apptTime" className="block text-lg font-medium text-gray-700 mb-2">Appointment Time</label>
          <input
            type="time"
            id="apptTime"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={apptTime}
            onChange={(e) => setApptTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="service" className="block text-lg font-medium text-gray-700 mb-2">Service</label>
          <input
            type="text"
            id="service"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow-md transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-all duration-200"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppointmentForm;