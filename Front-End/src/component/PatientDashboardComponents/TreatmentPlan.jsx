import React, { useState, useEffect } from 'react';

const mockPatientData = {
    id: 'patient_123',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    phone: '+639171234567',
    nextAppointment: {
        date: 'June 20, 2025',
        time: '10:00 AM',
        dentist: 'Mark Mista',
        service: 'Dental Check-up and Cleaning',
        status: 'Confirmed',
        location: 'Suite 301, ABC Dental Clinic'
    },
    recentAppointments: [
        {
            id: 'app_001',
            date: 'May 15, 2025',
            time: '02:00 PM',
            dentist: 'Dr. Maria Santos',
            service: 'Tooth Extraction',
            status: 'Completed'
        },
        {
            id: 'app_002',
            date: 'April 10, 2025',
            time: '09:00 AM',
            dentist: 'Dr. Jose Rizal',
            service: 'Dental X-ray',
            status: 'Completed'
        },
        {
            id: 'app_003',
            date: 'March 5, 2025',
            time: '01:00 PM',
            dentist: 'Dr. Maria Santos',
            service: 'Dental Check-up and Cleaning',
            status: 'Completed'
        },
        {
            id: 'app_004',
            date: 'February 1, 2025',
            time: '03:00 PM',
            dentist: 'Dr. Jose Rizal',
            service: 'Tooth Filling',
            status: 'Completed'
        },
        {
            id: 'app_005',
            date: 'January 20, 2025',
            time: '11:00 AM',
            dentist: 'Dr. Maria Santos',
            service: 'Dental Check-up and Cleaning',
            status: 'Completed'
        }
    ],
    treatmentPlan: [
        {
            id: 'tp_001',
            description: 'Root Canal Treatment on #7',
            status: 'Pending',
            startDate: 'June 25, 2025',
            cost: '₱15,000.00'
        },
        {
            id: 'tp_002',
            description: 'Teeth Whitening',
            status: 'Completed',
            startDate: 'May 10, 2025',
            cost: '₱8,000.00'
        }
    ],
    notifications: [
        { id: 'notif_001', message: 'Reminder: Your appointment on June 20 is approaching!', type: 'info' },
        { id: 'notif_002', message: 'New treatment plan added: Root Canal Treatment.', type: 'alert' }
    ],
    billingHistory: [
        {
            id: 'bill_001',
            date: 'May 15, 2025',
            service: 'Tooth Extraction',
            amount: '₱3,500.00',
            status: 'Paid'
        },
        {
            id: 'bill_002',
            date: 'April 10, 2025',
            service: 'Dental X-ray',
            amount: '₱1,000.00',
            status: 'Paid'
        },
        {
            id: 'bill_003',
            date: 'June 20, 2025',
            service: 'Dental Check-up and Cleaning',
            amount: '₱2,000.00',
            status: 'Pending'
        }
    ]
};

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
                "reason": "My unit is okay now",
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
                "reason": "I have a meeting",
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
                "reason": "I have a meeting that date",
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
                "reason": "I have a meeting in 9:20jytjtj",
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
        "avatar": "uploads\\1748781389426-logo-removebg-preview.png",
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

const processDoctorData = (rawData) => {
    const doctorsMap = new Map();
    const dailySchedules = {};

    rawData.forEach(entry => {
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

        const date = new Date(entry.date);
        const year = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${mm}-${dd}`;

        if (!dailySchedules[formattedDate]) {
            dailySchedules[formattedDate] = [];
        }
        if (entry.status === 'Approved' && entry.isActive) {
            dailySchedules[formattedDate].push(entry.doctorId);
        }
    });

    return {
        doctors: Array.from(doctorsMap.values()),
        dailySchedules: dailySchedules
    };
};

const processedData = processDoctorData(rawDoctorScheduleData);
const mockDoctors = processedData.doctors;
const mockDoctorDailySchedules = processedData.dailySchedules;

const mockEducationalResources = [
    {
        id: 'edu_001',
        title: 'Wastong Pagtu-toothbrush',
        description: 'Siguraduhing magsipilyo ng ngipin nang dalawang beses sa isang araw sa loob ng dalawang minuto gamit ang fluoride toothpaste.',
        link: '#',
        icon: '🦷'
    },
    {
        id: 'edu_002',
        title: 'Flossing ang Susi',
        description: 'Huwag kalimutang mag-floss araw-araw para maalis ang tinga sa pagitan ng ngipin na hindi kayang maabot ng sipilyo.',
        link: '#',
        icon: '🧵'
    },
    {
        id: 'edu_003',
        title: 'Limitahan ang Matatamis',
        description: 'Bawasan ang pagkonsumo ng asukal para maiwasan ang pagkabulok ng ngipin at mapanatili ang malusog na gilagid.',
        link: '#',
        icon: '🍭'
    },
    {
        id: 'edu_004',
        title: 'Regular na Check-up',
        description: 'Magpa-check-up sa dentista kada anim na buwan para sa propesyonal na paglilinis at maagang matukoy ang anumang problema.',
        link: '#',
        icon: '🗓️'
    }
];

function TreatmentPlan() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientData = () => {
            try {
                setPatient(mockPatientData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load patient data.');
                setLoading(false);
            }
        };

        fetchPatientData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[250px] bg-gray-100 p-4 rounded-2xl dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading patient data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[250px] bg-red-100 p-4 rounded-2xl shadow-md dark:bg-red-900/20 dark:border dark:border-red-800/50">
                <div className="text-red-700 text-lg dark:text-red-300">{error}</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex items-center justify-center min-h-[250px] bg-gray-100 p-4 rounded-2xl dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">No patient data found.</div>
            </div>
        );
    }

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'Completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-lg dark:border-teal-800/50 dark:bg-teal-900/20 dark:shadow-xl">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-teal-800 dark:text-teal-200">
                <svg
                    className="mr-3 h-7 w-7 text-teal-600 dark:text-teal-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A.997.997 0 0110 3.707V2H9v1.707a1 1 0 01-.293.707L7.586 7H4zm1 4a1 1 0 000 2h.01a1 1 0 100-2H5zm10 0a1 1 0 000 2h.01a1 1 0 100-2H15z"
                        clipRule="evenodd"
                    ></path>
                </svg>
                Your Treatment Plan
            </h2>
            {patient.treatmentPlan && patient.treatmentPlan.length > 0 ? (
                <div className="space-y-4">
                    {patient.treatmentPlan.map((plan) => (
                        <div
                            key={plan.id}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700"
                        >
                            <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{plan.description}</p>
                            <p className="text-md text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Status:</span>
                                <span
                                    className={`ml-2 rounded-full px-2 py-1 text-xs font-semibold ${getStatusClasses(plan.status)}`}
                                >
                                    {plan.status}
                                </span>
                            </p>
                            <p className="text-md text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Expected Start:</span> {plan.startDate}
                            </p>
                            <p className="text-md text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Estimated Cost:</span> {plan.cost}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-lg text-gray-600 dark:text-gray-300">You have no pending treatment plans at the moment.</p>
            )}
        </div>
    );
}

export default TreatmentPlan;