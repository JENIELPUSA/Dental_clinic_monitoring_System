import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, XCircle, Calendar, Pill, Clock, Sun, Moon } from 'lucide-react';

const App = () => {
    // State for dark mode, reads from localStorage for persistence
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('theme');
            return savedMode === 'dark';
        }
        return false; // Default to light mode
    });

    // Effect to apply/remove 'dark' class to the html element
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }, [isDarkMode]);

    // State for form fields
    const [formData, setFormData] = useState({
        appointment_id: '',
        medication_name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: ''
    });

    // State for form submission status or messages
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Function to handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Function to show a custom message box
    const showMessageBox = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000); // Hide message after 3 seconds
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.appointment_id || !formData.medication_name || !formData.dosage || !formData.frequency || !formData.start_date || !formData.end_date) {
            showMessageBox('Lahat ng field ay kailangan.', 'error');
            return;
        }

        // In a real application, you would send this formData to your backend API
        // For demonstration, we'll just log it and show a success message.
        console.log('Prescription Data:', formData);
        showMessageBox('Prescription na-save nang matagumpay!', 'success');

        // Reset form after submission
        setFormData({
            appointment_id: '',
            medication_name: '',
            dosage: '',
            frequency: '',
            start_date: '',
            end_date: ''
        });
    };

    // Function to clear form
    const handleClear = () => {
        setFormData({
            appointment_id: '',
            medication_name: '',
            dosage: '',
            frequency: '',
            start_date: '',
            end_date: ''
        });
        showMessageBox('Form cleared.', 'info');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
            {/* Dark Mode Toggle Button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setIsDarkMode(prevMode => !prevMode)}
                    className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? (
                        <Moon className="h-6 w-6" />
                    ) : (
                        <Sun className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Message Box */}
            {message && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-lg z-[1001] message-box ${messageType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {message}
                </div>
            )}

            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 transform transition-transform hover:scale-[1.01] duration-300">
                <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8 flex items-center justify-center">
                    <Pill size={32} className="mr-3" /> Pamamahala ng Prescription
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Appointment ID */}
                    <div>
                        <label htmlFor="appointment_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Calendar size={16} className="inline-block mr-2 text-blue-500" />
                            Appointment ID
                        </label>
                        <input
                            type="text"
                            id="appointment_id"
                            name="appointment_id"
                            value={formData.appointment_id}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            placeholder="Hal: 60d0fe4f3e02d60015b8d8c3"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            *Sa totoong app, ito ay magiging dropdown ng mga aktibong appointment.
                        </p>
                    </div>

                    {/* Medication Name */}
                    <div>
                        <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Pill size={16} className="inline-block mr-2 text-blue-500" />
                            Pangalan ng Gamot
                        </label>
                        <input
                            type="text"
                            id="medication_name"
                            name="medication_name"
                            value={formData.medication_name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            placeholder="Hal: Amoxicillin"
                            required
                        />
                    </div>

                    {/* Dosage */}
                    <div>
                        <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Clock size={16} className="inline-block mr-2 text-blue-500" />
                            Dosis
                        </label>
                        <input
                            type="text"
                            id="dosage"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            placeholder="Hal: 500mg"
                            required
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Clock size={16} className="inline-block mr-2 text-blue-500" />
                            Frequency
                        </label>
                        <input
                            type="text"
                            id="frequency"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            placeholder="Hal: Once daily, Every 8 hours"
                            required
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Calendar size={16} className="inline-block mr-2 text-blue-500" />
                            Simula ng Petsa
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            required
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Calendar size={16} className="inline-block mr-2 text-blue-500" />
                            Katapusan ng Petsa
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex items-center px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold shadow-md hover:bg-gray-400 transition-colors duration-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                        >
                            <XCircle size={20} className="mr-2" />
                            Clear
                        </button>
                        <button
                            type="submit"
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            <Save size={20} className="mr-2" />
                            Save Prescription
                        </button>
                    </div>
                </form>
            </div>

            {/* Styles for the message box animation */}
            <style jsx>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
                .message-box {
                    animation: fadeInOut 3s forwards;
                }
            `}</style>
        </div>
    );
};

export default App;
