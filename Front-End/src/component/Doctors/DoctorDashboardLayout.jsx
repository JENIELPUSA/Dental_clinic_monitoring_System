import React, { useState, useEffect } from 'react';

// Mock data for the logged-in doctor
const mockLoggedInDoctorId = "6846dba5512d57616f971150"; // Mark Mista's doctorId

// Raw doctor schedule data (provided by user)
const rawDoctorScheduleData = [
  {
      "_id": "68498076591c4d0e2edb9b68",
      "date": "2025-06-04T00:00:00.000Z",
      "day": "Wednesday",
      "status": "Approved",
      "isActive": true,
      "createdAt": "2025-06-11T13:11:18.806Z",
      "updatedAt": "2025-06-15T16:54:48.723Z",
      "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
      "doctorId": "683928e28d81ce708237f53c",
      "doctorName": "Juan Dela Cruz",
      "specialty": "Pediatrics",
      "timeSlots": [
          {
              "start": "09:10",
              "end": "23:10",
              "maxPatientsPerSlot": 13,
              "reason": "Ok na po ang unit ko",
              "_id": "68498076591c4d0e2edb9b69"
          }
      ]
  },
  {
      "_id": "68498076591c4d0e2edb9b6b",
      "date": "2025-06-16T00:00:00.000Z",
      "day": "Monday",
      "status": "Re-Assigned",
      "isActive": true,
      "createdAt": "2025-06-11T13:11:18.816Z",
      "updatedAt": "2025-06-16T04:06:21.245Z",
      "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
      "doctorId": "683928e28d81ce708237f53c",
      "doctorName": "Juan Dela Cruz",
      "specialty": "Pediatrics",
      "timeSlots": [
          {
              "start": "10:10",
              "end": "23:10",
              "maxPatientsPerSlot": 5,
              "reason": "Ihave a meating",
              "_id": "68498076591c4d0e2edb9b6c"
          }
      ]
  },
  {
      "_id": "68498076591c4d0e2edb9b6e",
      "date": "2025-06-02T00:00:00.000Z",
      "day": "Monday",
      "status": "Approved",
      "isActive": true,
      "createdAt": "2025-06-11T13:11:18.823Z",
      "updatedAt": "2025-06-16T04:05:43.852Z",
      "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
      "doctorId": "683928e28d81ce708237f53c",
      "doctorName": "Juan Dela Cruz",
      "specialty": "Pediatrics",
      "timeSlots": [
          {
              "start": "09:10",
              "end": "23:10",
              "maxPatientsPerSlot": 6,
              "reason": "I have a meating that date",
              "_id": "68498076591c4d0e2edb9b6f"
          }
      ]
  },
  {
      "_id": "68498d72038b8a673185c064",
      "date": "2025-06-20T00:00:00.000Z",
      "day": "Friday",
      "status": "Approved",
      "isActive": true,
      "createdAt": "2025-06-11T14:06:42.439Z",
      "updatedAt": "2025-06-16T03:48:19.718Z",
      "avatar": "uploads\\1749475223225-bipsu_new.png",
      "doctorId": "6846dba5512d57616f971150",
      "doctorName": "Mark Mista",
      "specialty": "Pediatrics",
      "timeSlots": [
          {
              "start": "10:06",
              "end": "18:06",
              "maxPatientsPerSlot": 8,
              "reason": "I have a meating in 9:20jytjtj",
              "_id": "68498d72038b8a673185c065"
          }
      ]
  },
  {
      "_id": "6849ab89fa2377995bf02e23",
      "date": "2025-06-01T00:00:00.000Z",
      "day": "Sunday",
      "status": "Approved",
      "isActive": true,
      "createdAt": "2025-06-11T16:15:05.475Z",
      "updatedAt": "2025-06-16T04:05:38.211Z",
      "avatar": "uploads\\1748782266645-CamScanner 11-19-2024 14.53 (2).jpg",
      "doctorId": "683b46804a034939100ffcb4",
      "doctorName": "ELIZABETH AMIS",
      "specialty": "fwefewf",
      "timeSlots": [
          {
              "start": "01:14",
              "end": "17:14",
              "maxPatientsPerSlot": 7,
              "reason": "geghjehgetyjytj",
              "_id": "6849ab89fa2377995bf02e24"
          }
      ]
  },
  {
      "_id": "684f922e67f30e4ba65cc5eb",
      "date": "2025-06-19T00:00:00.000Z",
      "day": "Thursday",
      "status": "Approved",
      "isActive": true,
      "createdAt": "2025-06-16T03:40:30.175Z",
      "updatedAt": "2025-06-16T03:40:48.021Z",
      "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
      "doctorId": "684a9eefa108918ffe5e0dff",
      "doctorName": "ELIZABETH Dela Pusa",
      "specialty": "vgergerge",
      "timeSlots": [
          {
              "start": "01:40",
              "end": "15:40",
              "maxPatientsPerSlot": 6,
              "_id": "684f922e67f30e4ba65cc5ec"
          }
      ]
  },
  {
      "_id": "684f98d167f30e4ba65cc652",
      "date": "2025-06-18T00:00:00.000Z",
      "day": "Wednesday",
      "status": "Pending",
      "isActive": true,
      "createdAt": "2025-06-16T04:08:49.758Z",
      "updatedAt": "2025-06-16T04:08:49.758Z",
      "doctorId": "684a9f2fa108918ffe5e0dff",
      "doctorName": "ELIZABETH Martinez",
      "specialty": "gegreg",
      "timeSlots": [
          {
              "start": "01:08",
              "end": "14:08",
              "maxPatientsPerSlot": 5,
              "_id": "684f98d167f30e4ba65cc653"
          }
      ]
  },
  {
      "_id": "684f98d167f30e4ba65cc655",
      "date": "2025-06-17T00:00:00.000Z",
      "day": "Tuesday",
      "status": "Pending",
      "isActive": true,
      "createdAt": "2025-06-16T04:08:49.769Z",
      "updatedAt": "2025-06-16T04:08:49.769Z",
      "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
      "doctorId": "684a9f2fa108918ffe5e0dff",
      "doctorName": "ELIZABETH Martinez",
      "specialty": "gegreg",
      "timeSlots": [
          {
              "start": "01:08",
              "end": "14:08",
              "maxPatientsPerSlot": 5,
              "_id": "684f98d167f30e4ba65cc656"
          }
      ]
  }
];

// Helper function to process raw doctor data
const processDoctorData = (rawData, doctorIdFilter = null) => {
  const doctorsMap = new Map();
  const dailySchedules = {};
  const doctorAppointments = []; // Appointments relevant to a specific doctor (if filtered)

  rawData.forEach(entry => {
    // Collect unique doctor info
    if (!doctorsMap.has(entry.doctorId)) {
      const hashCode = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
          const value = (hash >> (i * 8)) & 0xFF;
          color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
      };
      const avatarBgColor = hashCode(entry.doctorName).substring(1);
      const avatarTextColor = '000000';

      doctorsMap.set(entry.doctorId, {
        id: entry.doctorId,
        name: entry.doctorName,
        specialty: entry.specialty,
        image: `https://placehold.co/100x100/${avatarBgColor}/${avatarTextColor}?text=${entry.doctorName.split(' ').map(n => n[0]).join('')}`
      });
    }

    // Populate daily schedules for calendar
    const date = new Date(entry.date);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    if (!dailySchedules[formattedDate]) {
      dailySchedules[formattedDate] = [];
    }
    if (entry.status === 'Approved' && entry.isActive) {
        // Only add doctor to available list if their schedule is approved and active
        dailySchedules[formattedDate].push(entry.doctorId);
    }

    // Filter and format appointments for the specific doctor (if doctorIdFilter is provided)
    if (doctorIdFilter && entry.doctorId === doctorIdFilter && entry.status === 'Approved' && entry.isActive) {
      entry.timeSlots.forEach(slot => {
        // Mock patient name and service for demo
        const mockPatientName = `Pasyente ${Math.floor(Math.random() * 100) + 1}`;
        const mockService = ['Dental Check-up', 'Cleaning', 'Filling', 'Extraction', 'Braces Adjustment'][Math.floor(Math.random() * 5)];

        doctorAppointments.push({
          id: slot._id,
          date: formattedDate,
          time: `${slot.start} - ${slot.end}`,
          patientName: mockPatientName,
          service: mockService,
          status: entry.status, // Status of the schedule entry
          reason: slot.reason || 'Walang ibinigay na dahilan'
        });
      });
    }
  });

  return {
    doctors: Array.from(doctorsMap.values()),
    dailySchedules: dailySchedules,
    doctorAppointments: doctorAppointments
  };
};

const processedDoctorData = processDoctorData(rawDoctorScheduleData, mockLoggedInDoctorId);
const mockDoctors = processedDoctorData.doctors; // List of all doctors
const mockDoctorDailySchedules = processedDoctorData.dailySchedules; // Overall clinic schedule (from all doctors' approved active schedules)
const mockDoctorAppointments = processedDoctorData.doctorAppointments; // Appointments specifically for the logged-in doctor, based on their approved active schedules

// Mock data for a selected patient's profile (for modal display)
const mockSelectedPatientProfile = {
  id: 'patient_xyz',
  name: 'Maria Clara',
  contact: '0917-123-4567',
  dob: '1990-05-20',
  medicalHistory: 'Walang kilalang alerhiya sa gamot. Mayroong mild hypertension, kontrolado ng gamot.',
  pastTreatments: [
    { date: '2024-11-10', service: 'Dental Cleaning', notes: 'Routine cleaning, good oral hygiene.' },
    { date: '2023-08-22', service: 'Tooth Filling (#4)', notes: 'Composite filling, no complications.' }
  ],
  currentMedications: 'Losartan 50mg (once daily)',
  notes: 'Pasyenteng may kaunting kaba sa dentista. Kailangan ng malumanay na approach.'
};

// Component for Patient Profile Modal
const PatientProfileModal = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 transition-all duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-2xl font-bold text-blue-800">Profile ng Pasyente: {patient.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="space-y-4 text-gray-700">
            <p><span className="font-semibold">Contact:</span> {patient.contact}</p>
            <p><span className="font-semibold">Petsa ng Kapanganakan:</span> {patient.dob}</p>

            <div>
              <h4 className="text-lg font-semibold text-blue-700 mt-4 mb-2">Medical History:</h4>
              <p className="p-3 bg-gray-50 rounded-lg border border-gray-200">{patient.medicalHistory}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-700 mt-4 mb-2">Kasaysayan ng Paggamot:</h4>
              {patient.pastTreatments.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {patient.pastTreatments.map((treatment, index) => (
                    <li key={index} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-medium">{treatment.date}:</span> {treatment.service} - {treatment.notes}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Walang nakaraang paggamot na naitala.</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-700 mt-4 mb-2">Kasalukuyang Gamot:</h4>
              <p className="p-3 bg-gray-50 rounded-lg border border-gray-200">{patient.currentMedications}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-blue-700 mt-4 mb-2">Mga Tala ng Doktor:</h4>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                value={patient.notes}
                onChange={(e) => console.log('Notes updated:', e.target.value)} // In a real app, save this
                placeholder="Idagdag ang mga clinical notes dito..."
              ></textarea>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                Gumawa ng Reseta
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-5 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                I-update ang Chart
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Isara
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Main App Component
const App = () => {
  const [loggedInDoctor, setLoggedInDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Para sa calendar view
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [currentViewDate, setCurrentViewDate] = useState(new Date()); // Date selected in calendar
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Simulate fetching logged-in doctor's data
    const doctorProfile = mockDoctors.find(doc => doc.id === mockLoggedInDoctorId);
    if (doctorProfile) {
      setLoggedInDoctor(doctorProfile);

      // Filter today's appointments for the logged-in doctor
      const today = new Date();
      const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const appointmentsForToday = mockDoctorAppointments.filter(app => app.date === todayFormatted);
      setTodayAppointments(appointmentsForToday);

    } else {
      console.error("Logged-in doctor not found in mock data.");
    }
    setLoading(false);
  }, []);

  // --- Calendar Logic ---
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 for Sunday, 1 for Monday...
  };

  const getCalendarDays = () => {
    const numDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth); // Day of week (0-6)
    const days = [];

    // Add empty placeholders for days before the 1st of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    return days;
  };

  const dayNames = ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'];

  const formatDateForSchedule = (year, month, day) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const handleMonthChange = (offset) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + offset, 1);
      return newMonth;
    });
  };

  const handleDayClick = (day) => {
    if (day) {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setCurrentViewDate(selectedDate);
    }
  };

  const handleViewPatientProfile = (patientData) => {
    // In a real app, you would fetch the full patient profile using patientData.id
    // For now, we'll use a mock profile
    setSelectedPatient(mockSelectedPatientProfile); // Use the mock patient profile for now
    setShowPatientProfileModal(true);
  };

  const handleClosePatientProfileModal = () => {
    setShowPatientProfileModal(false);
    setSelectedPatient(null);
  };

  // Filter appointments for the currently viewed date in the calendar
  const appointmentsForViewDate = mockDoctorAppointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate.toDateString() === currentViewDate.toDateString();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  if (!loggedInDoctor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-4 rounded-lg shadow-md">
        <div className="text-red-700 text-lg">Hindi nahanap ang impormasyon ng doktor.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 text-white p-6 sm:p-8 rounded-t-3xl flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-1">Kumusta, Dr. {loggedInDoctor.name}!</h1>
            <p className="text-blue-200 text-lg">Maligayang pagdating sa iyong Doctor Dashboard.</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Doctor Profile Image */}
            <img
              src={loggedInDoctor.image}
              alt={loggedInDoctor.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/CCCCCC/000000?text=Dr" }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Overview Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
              <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                </svg>
                Pangkalahatang Tanaw Ngayong Araw
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-blue-700">{todayAppointments.length}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-green-700">
                    {todayAppointments.filter(app => app.status === 'Approved').length}
                  </p>
                  <p className="text-sm text-gray-600">Confirmed Appointments</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-yellow-700">
                    {todayAppointments.filter(app => app.status === 'Pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Appointments</p>
                </div>
              </div>
            </div>

            {/* My Performance Metrics Card (New Addition) */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-200">
              <h2 className="text-2xl font-semibold text-teal-800 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h.01a1 1 0 100-2H3zm0 4a1 1 0 000 2h3a1 1 0 100-2H3zm7 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                </svg>
                Aking Performance (Buwanan)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-purple-700">75</p>
                  <p className="text-sm text-gray-600">Nakita na Pasyente</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-orange-700">120 min</p>
                  <p className="text-sm text-gray-600">Average Appointment</p>
                </div>
              </div>
            </div>

            {/* Appointments for Selected Date Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Mga Appointment sa {currentViewDate.toLocaleDateString('tl-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              {appointmentsForViewDate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                          Oras
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pasyente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serbisyo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksyon
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointmentsForViewDate.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.patientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.service}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewPatientProfile(appointment)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Tingnan ang Profile
                            </button>
                            <button className="text-red-600 hover:text-red-900">Mag-reschedule</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-lg">Walang appointment para sa araw na ito.</p>
              )}
            </div>
            
            {/* Patient Search / Quick Access Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-200">
              <h2 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                </svg>
                Paghahanap ng Pasyente
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Hanapin ang Pasyente (Pangalan/ID)"
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                  Hanapin
                </button>
              </div>
              {/* Maaaring magdagdag ng listahan ng resulta ng paghahanap dito */}
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar Schedule Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-200">
              <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Iskedyul Ko
              </h2>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 rounded-full hover:bg-gray-200 transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </button>
                <span className="text-lg font-semibold text-gray-800">
                  {currentMonth.toLocaleString('tl-PH', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-2 rounded-full hover:bg-gray-200 transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {dayNames.map(day => (
                  <div key={day} className="font-medium text-gray-600 py-2">
                    {day.substring(0, 3)} {/* First 3 letters of day name */}
                  </div>
                ))}
                {getCalendarDays().map((day, index) => {
                  const today = new Date();
                  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                  const isToday = day && isCurrentMonth && day === today.getDate();
                  const dateKey = day ? formatDateForSchedule(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                  
                  // Check if the LOGGED-IN doctor is available on this day
                  const isDoctorAvailable = dateKey && mockDoctorDailySchedules[dateKey] && mockDoctorDailySchedules[dateKey].includes(mockLoggedInDoctorId);
                  
                  // Check if this date has appointments for the logged-in doctor
                  const hasAppointmentsOnDay = mockDoctorAppointments.some(app => {
                    const appDate = new Date(app.date);
                    return day && appDate.getDate() === day && appDate.getMonth() === currentMonth.getMonth() && appDate.getFullYear() === currentMonth.getFullYear();
                  });

                  return (
                    <div
                      key={index}
                      className={`p-1 rounded-md flex flex-col items-center justify-center min-h-[50px] relative ${
                        day ? (isToday ? 'bg-blue-200 text-blue-900 font-bold' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer') : 'bg-gray-100'
                      }`}
                      onClick={() => handleDayClick(day)}
                    >
                      {day}
                      {day && (
                        <div className="flex mt-1 space-x-1">
                          {isDoctorAvailable && (
                            <span className="w-3 h-3 rounded-full bg-green-500 border border-white" title="Available"></span>
                          )}
                          {hasAppointmentsOnDay && (
                            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white" title="May Appointment"></span>
                          )}
                          {!isDoctorAvailable && !hasAppointmentsOnDay && day && (
                             <span className="w-3 h-3 rounded-full bg-red-300 border border-white" title="Hindi Available"></span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span> Available
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-2 mr-2"></span> May Appointment
                <span className="inline-block w-3 h-3 rounded-full bg-red-300 ml-2 mr-2"></span> Hindi Available
              </p>
            </div>

            {/* Manage My Schedule Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-200">
              <h2 className="text-2xl font-semibold text-orange-800 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                </svg>
                Pamahalaan ang Aking Iskedyul
              </h2>
              <p className="text-gray-600 mb-4">
                I-update ang iyong availability at time slots para sa mga pasyente.
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 w-full">
                I-update ang Availability
              </button>
            </div>

            {/* Patient Profile Modal (Render conditionally) */}
            {showPatientProfileModal && (
              <PatientProfileModal
                patient={selectedPatient}
                onClose={handleClosePatientProfileModal}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
