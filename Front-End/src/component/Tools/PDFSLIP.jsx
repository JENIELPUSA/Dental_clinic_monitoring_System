import React, { useState, useEffect } from 'react';

// Helper function to format dates
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper function to format time (e.g., "01:07" to "01:07 AM/PM")
const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const App = () => {
    // Sample data for the appointment confirmation.
    // In a real application, this would likely be fetched from an API.
    const [appointmentData, setAppointmentData] = useState({
        _id: "68597c5537e55922050a5140",
        patient_id: "68515a76feea738f13576815",
        doctor_id: "6854f5ee08f5208e51f21b4a",
        appointment_date: "2025-06-27T00:00:00.000Z",
        slot_id: "68597bd137e55922050a50d2",
        start_time: "01:07",
        end_time: "09:07",
        appointment_status: "Completed",
        created_at: "2025-06-23T16:09:57.475Z",
        __v: 0,
        patient_info: {
            _id: "68515a76feea738f13576815",
            avatar: null,
            first_name: "yrtyrt",
            last_name: "utyutyu",
            dob: "2025-06-11T00:00:00.000Z",
            gender: "Male",
            email: "mhewmhew12300@gmail.com",
            address: "jytjytjt",
            emergency_contact_name: "yrytryr",
            emergency_contact_number: "09356358408",
            created_at: "2025-06-17T12:07:18.935Z",
            __v: 0
        },
        doctor_info: {
            _id: "6854f5ee08f5208e51f21b4a",
            first_name: "Nellisa",
            last_name: "Amistoso",
            specialty: "hrhrthrt",
            contact_number: "09356358408",
            email: "jeniel123600@gmail.com",
            created_at: "2025-06-20T05:47:26.239Z",
            __v: 0,
            scheduled: true
        }
    });

    // Static clinic details
    const clinic = {
        name: "BrightSmile Dental Clinic",
        address: "123 Healthway, Cityville, PH 1001",
        email: "clinic@email.com",
        phone: "(02) 123-4567"
    };

    // Use useEffect to potentially fetch data or perform actions on mount
    useEffect(() => {
        // In a real app, you would fetch appointment data here
        // For example:
        // fetch('/api/appointment/68597c5537e55922050a5140')
        //   .then(response => response.json())
        //   .then(data => setAppointmentData(data));
    }, []);

    // Handle print action
    const handlePrint = () => {
        window.print();
    };

    if (!appointmentData || !appointmentData.patient_info || !appointmentData.doctor_info) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700 text-lg">Loading appointment details...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-4xl w-full bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-200">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200">
                    <div className="text-left mb-4 md:mb-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Appointment Confirmation Slip</h1>
                        <p className="text-sm text-gray-600 mt-1">Katibayan ng Nakatakdang Appointment sa Ngipin</p>
                    </div>
                    <div className="text-right">
                        <img src="https://placehold.co/120x80/ADD8E6/000000?text=Clinic+Logo" alt="Clinic Logo" className="h-20 w-30 object-contain mx-auto md:ml-auto md:mr-0 rounded-lg"/>
                        <p className="text-lg font-semibold text-gray-800 mt-2">{clinic.name}</p>
                        <p className="text-sm text-gray-600">{clinic.address}</p>
                        <p className="text-sm text-gray-600">{clinic.email} | {clinic.phone}</p>
                    </div>
                </div>

                {/* Patient Details Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Detalye ng Pasyente:</h2>
                    <p className="text-lg text-gray-700 font-medium">{`${appointmentData.patient_info.first_name} ${appointmentData.patient_info.last_name}`}</p>
                    <p className="text-gray-600">{appointmentData.patient_info.address}</p>
                    <p className="text-gray-600">Telepono: {appointmentData.patient_info.emergency_contact_number || 'N/A'}</p>
                    <p className="text-gray-600">Email: {appointmentData.patient_info.email}</p>
                </div>

                {/* Appointment Details Section (Highlighted) */}
                <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200 shadow-md">
                    <h2 className="text-xl font-bold text-blue-800 mb-4">Detalye ng Appointment:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-blue-700"><span className="font-medium">Appointment ID:</span> {appointmentData._id}</p>
                            <p className="text-blue-700"><span className="font-medium">Petsa ng Pag-isyu:</span> {formatDate(appointmentData.created_at)}</p>
                            <p className="text-blue-700"><span className="font-medium">Petsa ng Appointment:</span> {formatDate(appointmentData.appointment_date)}</p>
                        </div>
                        <div>
                            <p className="text-blue-700"><span className="font-medium">Oras ng Appointment:</span> {formatTime(appointmentData.start_time)}</p>
                            <p className="text-blue-700"><span className="font-medium">Dentista:</span> {`Dr. ${appointmentData.doctor_info.first_name} ${appointmentData.doctor_info.last_name}`}</p>
                            <p className="text-blue-700"><span className="font-medium">Status ng Appointment:</span> {appointmentData.appointment_status}</p>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">Mahalagang Paalala:</h2>
                    <ul className="list-disc list-inside text-yellow-700 text-sm">
                        <li>Mangyaring dumating 15 minuto bago ang iyong nakatakdang oras.</li>
                        <li>Ipakita ang confirmation slip na ito sa reception.</li>
                        <li>Para sa pagbabago ng iskedyul o pagkansela, mangyaring makipag-ugnayan sa amin nang maaga.</li>
                    </ul>
                </div>

                {/* Footer / Thank You */}
                <div className="text-center text-gray-600 text-sm mt-8">
                    <p>Maraming salamat sa pagpili sa {clinic.name}!</p>
                    <p>Para sa mga katanungan, mangyaring makipag-ugnayan sa amin sa {clinic.phone}.</p>
                </div>

                {/* Print Button (hidden in print view) */}
                <div className="text-center mt-8 no-print">
                    <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                        I-print ang Confirmation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
