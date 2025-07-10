import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck, Sun, Moon, Info, X } from 'lucide-react'; // Added X icon for modal

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper function to generate avatar URL
const getPatientAvatar = (patientInfo) => {
    if (patientInfo && patientInfo.avatar) {
        return patientInfo.avatar; // Use actual avatar if available
    }
    // Generate initials for placeholder
    const initials = patientInfo && patientInfo.first_name && patientInfo.last_name
        ? `${patientInfo.first_name[0]}${patientInfo.last_name[0]}`.toUpperCase()
        : '??'; // Default if no name
    
    // Simple hash code to generate a consistent background color for initials
    const hashCode = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = "#";
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ("00" + value.toString(16)).substr(-2);
        }
        return color;
    };
    const bgColor = hashCode(initials).substring(1);
    const textColor = 'FFFFFF'; // White text for contrast

    return `https://placehold.co/40x40/${bgColor}/${textColor}?text=${initials}`;
};


// Component for displaying appointment details in a modal
const AppointmentDetailModal = ({ isOpen, onClose, appointment }) => {
    if (!isOpen || !appointment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative w-11/12 max-w-lg p-6 rounded-xl shadow-2xl bg-white dark:bg-gray-800 animate-scale-in" onClick={e => e.stopPropagation()}>
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24} /> {/* X icon for closing */}
                </button>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Detalye ng Appointment</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p><strong>Pasyente:</strong> {appointment.patient_info.first_name} {appointment.patient_info.last_name}</p>
                    <p><strong>Petsa:</strong> {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p><strong>Oras:</strong> {appointment.start_time} - {appointment.end_time}</p>
                    <p><strong>Serbisyo:</strong> {appointment.service}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.appointment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                        appointment.appointment_status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>{appointment.appointment_status}</span></p>
                    <p><strong>Doktor:</strong> Dr. {appointment.doctor_info.first_name} {appointment.doctor_info.last_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Appointment ID: {appointment._id}</p>
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                        Isara
                    </button>
                </div>
            </div>
        </div>
    );
};

const DoctorCalendar = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('theme');
            return savedMode === 'dark';
        }
        return false;
    });

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

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const loggedInDoctorId = "6854f5ee08f5208e51f21b4a"; // Example: Dr. Nellisa Amistoso's ID
    const dummyAppointments = [
        {
            "_id": "685582a1f7a5491b595900d8",
            "patient_id": "68515a76feea738f13576815",
            "doctor_id": "6854f5ee08f5208e51f21b4a", // This is the logged-in doctor's appointment
            "appointment_date": "2025-06-21T00:00:00.000Z",
            "slot_id": "6855826ff7a5491b59590097",
            "start_time": "07:46",
            "end_time": "12:46",
            "service": "Dental Checkup",
            "appointment_status": "Confirmed", // Changed to Confirmed for visual
            "created_at": "2025-06-20T15:47:45.918Z",
            "__v": 0,
            "patient_info": {
                "_id": "68515a76feea738f13576815",
                "avatar": null, // Can be a URL, but we'll use initials for now
                "first_name": "Juan",
                "last_name": "Dela Cruz",
                "dob": "2025-06-11T00:00:00.000Z",
                "gender": "Male",
                "email": "mhewmhew12300@gmail.com",
                "address": "jytjytjt",
                "emergency_contact_name": "yrytryr",
                "emergency_contact_number": "09356358408",
                "created_at": "2025-06-17T12:07:18.935Z",
                "__v": 0
            },
            "doctor_info": {
                "_id": "6854f5ee08f5208e51f21b4a",
                "first_name": "Nellisa",
                "last_name": "Amistoso",
                "specialty": "hrhrthrt",
                "contact_number": "09356358408",
                "email": "jeniel123600@gmail.com",
                "created_at": "2025-06-20T05:47:26.239Z",
                "__v": 0,
                "scheduled": true
            }
        },
        {
            "_id": "68558b98f7a5491b59590225",
            "patient_id": "68515a76feea738f13576815",
            "doctor_id": "6854f5ee08f5208e51f21b4a", // This is logged-in doctor's appointment
            "appointment_date": "2025-06-21T00:00:00.000Z",
            "slot_id": "68558af8f7a5491b595901d3",
            "start_time": "14:00", // Adjusted time
            "end_time": "15:00",
            "service": "Tooth Filling",
            "appointment_status": "Pending",
            "created_at": "2025-06-20T16:26:00.886Z",
            "__v": 0,
            "patient_info": {
                "_id": "68515a76feea738f13576815",
                "avatar": null,
                "first_name": "Maria",
                "last_name": "Santos",
                "dob": "2025-06-11T00:00:00.000Z",
                "gender": "Female",
                "email": "mhewmhew12300@gmail.com",
                "address": "jytjytjt",
                "emergency_contact_name": "yrytryr",
                "emergency_contact_number": "09356358408",
                "created_at": "2025-06-17T12:07:18.935Z",
                "__v": 0
            },
            "doctor_info": {
                "_id": "6854f5ee08f5208e51f21b4a",
                "first_name": "Nellisa",
                "last_name": "Amistoso",
                "specialty": "hrhrthrt",
                "contact_number": "09356358408",
                "email": "jeniel123600@gmail.com",
                "created_at": "2025-06-20T05:47:26.239Z",
                "__v": 0,
                "scheduled": true
            }
        },
        {
            "_id": "68558c03f7a5491b59590234",
            "patient_id": "some_other_patient_id",
            "doctor_id": "6854f5ee08f5208e51f21b4a", // Logged-in doctor
            "appointment_date": "2025-06-25T00:00:00.000Z",
            "slot_id": "some_slot_id",
            "start_time": "09:00",
            "end_time": "10:00",
            "service": "Dental Checkup",
            "appointment_status": "Confirmed",
            "created_at": "2025-06-20T16:26:00.886Z",
            "__v": 0,
            "patient_info": {
                "_id": "some_other_patient_id",
                "avatar": null,
                "first_name": "Pedro",
                "last_name": "Penduko",
                "dob": "2025-01-01T00:00:00.000Z",
                "gender": "Male",
                "email": "pedro@example.com",
                "address": "Somewhere in PH",
                "emergency_contact_name": "Juanita",
                "emergency_contact_number": "09123456789",
                "created_at": "2025-06-17T12:07:18.935Z",
                "__v": 0
            },
            "doctor_info": {
                "_id": "6854f5ee08f5208e51f21b4a",
                "first_name": "Nellisa",
                "last_name": "Amistoso",
                "specialty": "hrhrthrt",
                "contact_number": "09356358408",
                "email": "jeniel123600@gmail.com",
                "created_at": "2025-06-20T05:47:26.239Z",
                "__v": 0,
                "scheduled": true
            }
        },
        {
            "_id": "68558c03f7a5491b59590235",
            "patient_id": "another_patient_id",
            "doctor_id": "6854f5ee08f5208e51f21b4a", // Logged-in doctor
            "appointment_date": "2025-06-25T00:00:00.000Z",
            "slot_id": "another_slot_id",
            "start_time": "10:30",
            "end_time": "11:30",
            "service": "Cleaning",
            "appointment_status": "Confirmed",
            "created_at": "2025-06-20T16:26:00.886Z",
            "__v": 0,
            "patient_info": {
                "_id": "another_patient_id",
                "avatar": null,
                "first_name": "Josefa",
                "last_name": "Rica",
                "dob": "2025-02-01T00:00:00.000Z",
                "gender": "Female",
                "email": "josefa@example.com",
                "address": "Somewhere in PH",
                "emergency_contact_name": "Maria",
                "emergency_contact_number": "09987654321",
                "created_at": "2025-06-17T12:07:18.935Z",
                "__v": 0
            },
            "doctor_info": {
                "_id": "6854f5ee08f5208e51f21b4a",
                "first_name": "Nellisa",
                "last_name": "Amistoso",
                "specialty": "hrhrthrt",
                "contact_number": "09356358408",
                "email": "jeniel123600@gmail.com",
                "created_at": "2025-06-20T05:47:26.239Z",
                "__v": 0,
                "scheduled": true
            }
        },
        {
            "_id": "68558c03f7a5491b59590236",
            "patient_id": "third_patient_id",
            "doctor_id": "6854f5ee08f5208e51f21b4a", // Logged-in doctor
            "appointment_date": "2025-06-25T00:00:00.000Z",
            "slot_id": "third_slot_id",
            "start_time": "13:00",
            "end_time": "14:00",
            "service": "X-Ray",
            "appointment_status": "Pending",
            "created_at": "2025-06-20T16:26:00.886Z",
            "__v": 0,
            "patient_info": {
                "_id": "third_patient_id",
                "avatar": null,
                "first_name": "Crispin",
                "last_name": "Basilio",
                "dob": "2025-03-01T00:00:00.000Z",
                "gender": "Male",
                "email": "crispin@example.com",
                "address": "Somewhere in PH",
                "emergency_contact_name": "Sisa",
                "emergency_contact_number": "09123456780",
                "created_at": "2025-06-17T12:07:18.935Z",
                "__v": 0
            },
            "doctor_info": {
                "_id": "6854f5ee08f5208e51f21b4a",
                "first_name": "Nellisa",
                "last_name": "Amistoso",
                "specialty": "hrhrthrt",
                "contact_number": "09356358408",
                "email": "jeniel123600@gmail.com",
                "created_at": "2025-06-20T05:47:26.239Z",
                "__v": 0,
                "scheduled": true
            }
        },
        {
            "_id": "68558c03f7a5491b59590237",
            "patient_id": "fourth_patient_id",
            "doctor_id": "68554950549668076a59d206", // Another doctor
            "appointment_date": "2025-07-03T00:00:00.000Z",
            "slot_id": "fourth_slot_id",
            "start_time": "11:00",
            "end_time": "12:00",
            "service": "Filling",
            "appointment_status": "Confirmed",
            "created_at": "2025-06-20T16:26:00.886Z",
            "__v": 0,
            "patient_info": {
                "_id": "fourth_patient_id",
                "avatar": null,
                "first_name": "Kiko",
                "last_name": "Matanglawin",
                "dob": "2025-04-01T00:00:00.000Z",
                "gender": "Male",
                "email": "kiko@example.com",
                "address": "Somewhere in PH",
                "emergency_contact_name": "Juan",
                "emergency_contact_number": "09123456788",
                "created_at": "2025-06-17T12:07:18.935Z",
                "__v": 0
            },
            "doctor_info": {
                "_id": "68554950549668076a59d206",
                "first_name": "yrtyrty",
                "last_name": "Amistoso",
                "specialty": "gergregeg",
                "contact_number": "09356358408",
                "email": "France@gmail.com",
                "created_at": "2025-06-20T11:43:12.369Z",
                "__v": 0,
                "scheduled": true
            }
        },
    ];

    // Filter dummy appointments for the logged-in doctor only
    const filteredDummyAppointments = dummyAppointments.filter(
        (appt) => appt.doctor_id === loggedInDoctorId
    );


    // Function to show a custom message box
    const showMessageBox = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000); // Hide message after 3 seconds
    };

    // Helper to get days in a month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const numDays = lastDay.getDate();

        const calendarDays = [];
        let day = new Date(firstDay);

        // Add padding days from previous month
        const startDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarDays.push(null); // Placeholder for days before the 1st
        }

        // Add actual days of the month
        for (let i = 1; i <= numDays; i++) {
            calendarDays.push(new Date(year, month, i));
        }

        return calendarDays;
    };

    const daysInMonth = getDaysInMonth(currentMonth);

    // Filter appointments for a specific day based on the new data structure
    const getAppointmentsForDay = (date) => {
        if (!date) return [];
        const formattedDate = formatDateToYYYYMMDD(date);
        return filteredDummyAppointments.filter(appt => formatDateToYYYYMMDD(appt.appointment_date) === formattedDate);
    };

    // Handle day click
    const handleDayClick = (day) => {
        if (day) {
            setSelectedDate(day);
            setSelectedDateAppointments(getAppointmentsForDay(day));
        }
    };

    // Handle month navigation
    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
        setSelectedDate(null); // Clear selected date when changing month
        setSelectedDateAppointments([]);
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
        setSelectedDate(null); // Clear selected date when changing month
        setSelectedDateAppointments([]);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
        setSelectedDateAppointments(getAppointmentsForDay(today));
    };

    // Open modal with appointment details
    const openAppointmentModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    // Close modal
    const closeAppointmentModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300 p-4">
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

            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 transform transition-transform hover:scale-[1.01] duration-300 mt-12">
                <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8 flex items-center justify-center">
                    <CalendarCheck size={32} className="mr-3" /> Iskedyul ng Pasyente (Dr. Nellisa Amistoso)
                </h2>

                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6 px-4">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200"
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200"
                        aria-label="Next month"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* "Today" Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        Ngayon
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="font-semibold text-gray-600 dark:text-gray-300">
                            {day}
                        </div>
                    ))}
                    {daysInMonth.map((day, index) => {
                        const dayAppointments = day ? getAppointmentsForDay(day) : [];
                        const hasAppointments = dayAppointments.length > 0;
                        const isToday = day && formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date());
                        const isSelected = day && selectedDate && formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(selectedDate);

                        return (
                            <div
                                key={index}
                                // Added flex properties for better layout within cell
                                className={`relative p-2 rounded-lg cursor-pointer transition-colors duration-150 flex flex-col justify-between h-24
                                    ${day ? 'hover:bg-blue-100 dark:hover:bg-blue-700' : 'cursor-default'}
                                    ${isToday ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-bold' : ''}
                                    ${hasAppointments && !isToday ? 'bg-green-100 dark:bg-green-800' : ''} /* Background for days with appointments, if not today */
                                    ${isSelected ? 'border-2 border-blue-500 bg-blue-300 dark:bg-blue-600' : ''}
                                    ${!day ? 'opacity-0' : 'bg-gray-50 dark:bg-gray-700'} /* Default background for empty cells */
                                `}
                                onClick={() => handleDayClick(day)}
                            >
                                {day && (
                                    // self-start to keep date at top-left
                                    <span className={`self-start relative z-20 text-sm font-semibold
                                        ${isToday || isSelected ? 'text-white dark:text-white' : 'text-gray-800 dark:text-gray-200'}
                                        ${hasAppointments && !isToday && !isSelected ? 'text-green-900 dark:text-green-100' : ''}
                                    `}>
                                        {day.getDate()}
                                    </span>
                                )}
                                {hasAppointments && (
                                    // mt-auto to push avatars to bottom, justify-center to center horizontally
                                    <div className="flex justify-center items-center mt-auto mb-1 relative z-10">
                                        {dayAppointments.slice(0, 2).map((appt, idx) => (
                                            <img
                                                key={appt._id}
                                                src={getPatientAvatar(appt.patient_info)}
                                                alt={`${appt.patient_info.first_name} ${appt.patient_info.last_name}`}
                                                // Smaller avatars, tighter overlap, clear border
                                                className={`w-5 h-5 rounded-full border border-white dark:border-gray-800 shadow-sm object-cover ${idx === 1 ? '-ml-1.5' : ''}`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = getPatientAvatar(appt.patient_info); }}
                                            />
                                        ))}
                                        {dayAppointments.length > 2 && (
                                            <span className="ml-1 text-xs font-bold text-gray-700 dark:text-gray-200">
                                                +{dayAppointments.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Selected Date Appointments List */}
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-inner">
                    <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
                        <CalendarCheck size={20} className="mr-2" />
                        Mga Appointment sa {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Walang napiling petsa'}
                    </h3>
                    {selectedDateAppointments.length > 0 ? (
                        <ul className="space-y-3">
                            {selectedDateAppointments.map(appt => (
                                <li
                                    key={appt._id}
                                    className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    onClick={() => openAppointmentModal(appt)}
                                >
                                    <div>
                                        <p className="font-semibold">{appt.patient_info.first_name} {appt.patient_info.last_name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{appt.service}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <span className="font-medium text-blue-600 dark:text-blue-400">{appt.start_time} - {appt.end_time}</span>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            appt.appointment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                            appt.appointment_status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                        }`}>
                                            {appt.appointment_status}
                                        </span>
                                        <Info size={18} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center">Walang appointment para sa petsang ito.</p>
                    )}
                </div>
            </div>

            {/* Appointment Detail Modal */}
            <AppointmentDetailModal
                isOpen={isModalOpen}
                onClose={closeAppointmentModal}
                appointment={selectedAppointment}
            />
        </div>
    );
};

export default DoctorCalendar;
