import React from 'react';
import { Users, Plus } from 'lucide-react';
import PatientTable from './PatientTable'; // Import the PatientTable component

const ManagePatientsView = ({ patients, onBack }) => (
  <div className="p-8 bg-white rounded-xl shadow-xl dark:bg-gray-800 dark:shadow-2xl">
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center dark:text-white">
        <Users size={24} className="mr-3 text-blue-600 dark:text-blue-400" /> All Patients
      </h3>
    </div>
    <PatientTable patients={patients} /> {/* Use the PatientTable component */}
    <div className="flex justify-end mt-8">
      <button
        onClick={onBack}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow-md transition-all duration-200
                   dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
      >
        Back
      </button>
    </div>
  </div>
);

export default ManagePatientsView;