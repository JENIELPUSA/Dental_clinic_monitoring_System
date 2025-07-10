import React, { useState, useEffect } from "react";

const mockPatientData = {
    id: "patient_123",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@example.com",
    phone: "+639171234567",
    nextAppointment: {
        date: "Hunyo 20, 2025",
        time: "10:00 AM",
        // Ito ay ia-update batay sa doctorName mula sa bagong data
        dentist: "Mark Mista", // Updated based on data for June 20, 2025
        service: "Dental Check-up at Cleaning",
        status: "Nakumpirma",
        location: "Suite 301, ABC Dental Clinic",
    },
    recentAppointments: [
        {
            id: "app_001",
            date: "Mayo 15, 2025",
            time: "02:00 PM",
            dentist: "Dr. Maria Santos", // Mananatili ito bilang mock, adjust kung kailangan
            service: "Tooth Extraction",
            status: "Nakumpleto",
        },
        {
            id: "app_002",
            date: "Abril 10, 2025",
            time: "09:00 AM",
            dentist: "Dr. Jose Rizal", // Mananatili ito bilang mock, adjust kung kailangan
            service: "Dental X-ray",
            status: "Nakumpleto",
        },
        {
            id: "app_003",
            date: "Marso 5, 2025",
            time: "01:00 PM",
            dentist: "Dr. Maria Santos",
            service: "Dental Check-up at Cleaning",
            status: "Nakumpleto",
        },
        {
            id: "app_004",
            date: "Pebrero 1, 2025",
            time: "03:00 PM",
            dentist: "Dr. Jose Rizal",
            service: "Tooth Filling",
            status: "Nakumpleto",
        },
        {
            id: "app_005",
            date: "Enero 20, 2025",
            time: "11:00 AM",
            dentist: "Dr. Maria Santos",
            service: "Dental Check-up at Cleaning",
            status: "Nakumpleto",
        },
    ],
    treatmentPlan: [
        {
            id: "tp_001",
            description: "Paggamot ng ugat (Root Canal Treatment) sa #7",
            status: "Pending",
            startDate: "Hunyo 25, 2025",
            cost: "₱15,000.00",
        },
        {
            id: "tp_002",
            description: "Pagpapaputi ng ngipin (Teeth Whitening)",
            status: "Nakumpleto",
            startDate: "Mayo 10, 2025",
            cost: "₱8,000.00",
        },
    ],
    notifications: [
        { id: "notif_001", message: "Tandaan: Ang iyong appointment sa Hunyo 20 ay malapit na!", type: "info" },
        { id: "notif_002", message: "Bagong treatment plan na idinagdag: Root Canal Treatment.", type: "alert" },
    ],
    billingHistory: [
        {
            id: "bill_001",
            date: "Mayo 15, 2025",
            service: "Tooth Extraction",
            amount: "₱3,500.00",
            status: "Nababayaran",
        },
        {
            id: "bill_002",
            date: "Abril 10, 2025",
            service: "Dental X-ray",
            amount: "₱1,000.00",
            status: "Nababayaran",
        },
        {
            id: "bill_003",
            date: "Hunyo 20, 2025",
            service: "Dental Check-up at Cleaning",
            amount: "₱2,000.00",
            status: "Nakabinbin",
        },
    ],
};

const rawDoctorScheduleData = [
    {
        _id: "68498076591c4d0e2edb9b68",
        date: "2025-06-04T00:00:00.000Z",
        day: "Wednesday",
        status: "Approved",
        isActive: true,
        createdAt: "2025-06-11T13:11:18.806Z",
        updatedAt: "2025-06-15T16:54:48.723Z",
        avatar: "uploads\\1748781389426-logo-removebg-preview.png",
        doctorId: "683928e28d81ce708237f53c",
        doctorName: "Juan Dela Cruz",
        specialty: "Pediatrics",
        timeSlots: [
            {
                start: "09:10",
                end: "23:10",
                maxPatientsPerSlot: 13,
                reason: "Ok na po ang unit ko",
                _id: "68498076591c4d0e2edb9b69",
            },
        ],
    },
    {
        _id: "68498076591c4d0e2edb9b6b",
        date: "2025-06-16T00:00:00.000Z",
        day: "Monday",
        status: "Re-Assigned",
        isActive: true,
        createdAt: "2025-06-11T13:11:18.816Z",
        updatedAt: "2025-06-16T04:06:21.245Z",
        avatar: "uploads\\1748781389426-logo-removebg-preview.png",
        doctorId: "683928e28d81ce708237f53c",
        doctorName: "Juan Dela Cruz",
        specialty: "Pediatrics",
        timeSlots: [
            {
                start: "10:10",
                end: "23:10",
                maxPatientsPerSlot: 5,
                reason: "Ihave a meating",
                _id: "68498076591c4d0e2edb9b6c",
            },
        ],
    },
    {
        _id: "68498076591c4d0e2edb9b6e",
        date: "2025-06-02T00:00:00.000Z",
        day: "Monday",
        status: "Approved",
        isActive: true,
        createdAt: "2025-06-11T13:11:18.823Z",
        updatedAt: "2025-06-16T04:05:43.852Z",
        avatar: "uploads\\1748781389426-logo-removebg-preview.png",
        doctorId: "683928e28d81ce708237f53c",
        doctorName: "Juan Dela Cruz",
        specialty: "Pediatrics",
        timeSlots: [
            {
                start: "09:10",
                end: "23:10",
                maxPatientsPerSlot: 6,
                reason: "I have a meating that date",
                _id: "68498076591c4d0e2edb9b6f",
            },
        ],
    },
    {
        _id: "68498d72038b8a673185c064",
        date: "2025-06-20T00:00:00.000Z",
        day: "Friday",
        status: "Approved",
        isActive: true,
        createdAt: "2025-06-11T14:06:42.439Z",
        updatedAt: "2025-06-16T03:48:19.718Z",
        avatar: "uploads\\1749475223225-bipsu_new.png",
        doctorId: "6846dba5512d57616f971150",
        doctorName: "Mark Mista",
        specialty: "Pediatrics",
        timeSlots: [
            {
                start: "10:06",
                end: "18:06",
                maxPatientsPerSlot: 8,
                reason: "I have a meating in 9:20jytjtj",
                _id: "68498d72038b8a673185c065",
            },
        ],
    },
    {
        _id: "6849ab89fa2377995bf02e23",
        date: "2025-06-01T00:00:00.000Z",
        day: "Sunday",
        status: "Approved",
        isActive: true,
        createdAt: "2025-06-11T16:15:05.475Z",
        updatedAt: "2025-06-16T04:05:38.211Z",
        avatar: "uploads\\1748782266645-CamScanner 11-19-2024 14.53 (2).jpg",
        doctorId: "683b46804a034939100ffcb4",
        doctorName: "ELIZABETH AMIS",
        specialty: "fwefewf",
        timeSlots: [
            {
                start: "01:14",
                end: "17:14",
                maxPatientsPerSlot: 7,
                reason: "geghjehgetyjytj",
                _id: "6849ab89fa2377995bf02e24",
            },
        ],
    },
    {
        _id: "684f922e67f30e4ba65cc5eb",
        date: "2025-06-19T00:00:00.000Z",
        day: "Thursday",
        status: "Approved",
        isActive: true,
        createdAt: "2025-06-16T03:40:30.175Z",
        updatedAt: "2025-06-16T03:40:48.021Z",
        avatar: "uploads\\1748781389426-logo-removebg-preview.png",
        doctorId: "684a9eefa108918ffe5e0dff",
        doctorName: "ELIZABETH Dela Pusa",
        specialty: "vgergerge",
        timeSlots: [
            {
                start: "01:40",
                end: "15:40",
                maxPatientsPerSlot: 6,
                _id: "684f922e67f30e4ba65cc5ec",
            },
        ],
    },
    {
        _id: "684f98d167f30e4ba65cc652",
        date: "2025-06-18T00:00:00.000Z",
        day: "Wednesday",
        status: "Pending",
        isActive: true,
        createdAt: "2025-06-16T04:08:49.758Z",
        updatedAt: "2025-06-16T04:08:49.758Z",
        doctorId: "684a9f2fa108918ffe5e0e08",
        doctorName: "ELIZABETH Martinez",
        specialty: "gegreg",
        timeSlots: [
            {
                start: "01:08",
                end: "14:08",
                maxPatientsPerSlot: 5,
                _id: "684f98d167f30e4ba65cc653",
            },
        ],
    },
    {
        _id: "684f98d167f30e4ba65cc655",
        date: "2025-06-17T00:00:00.000Z",
        day: "Tuesday",
        status: "Pending",
        isActive: true,
        createdAt: "2025-06-16T04:08:49.769Z",
        updatedAt: "2025-06-16T04:08:49.769Z",
        avatar: "uploads\\1748781389426-logo-removebg-preview.png",
        doctorId: "684a9f2fa108918ffe5e0dff",
        doctorName: "ELIZABETH Martinez",
        specialty: "gegreg",
        timeSlots: [
            {
                start: "01:08",
                end: "14:08",
                maxPatientsPerSlot: 5,
                _id: "684f98d167f30e4ba65cc656",
            },
        ],
    },
];

const processDoctorData = (rawData) => {
    const doctorsMap = new Map();
    const dailySchedules = {};

    rawData.forEach((entry) => {
        // Collect unique doctor info
        if (!doctorsMap.has(entry.doctorId)) {
            // Generate a distinct color for each doctor's placeholder image
            const hashCode = (str) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                let color = "#";
                for (let i = 0; i < 3; i++) {
                    const value = (hash >> (i * 8)) & 0xff;
                    color += ("00" + value.toString(16)).substr(-2);
                }
                return color;
            };
            const avatarBgColor = hashCode(entry.doctorName).substring(1); // Remove #
            const avatarTextColor = "000000"; // Black text for contrast

            doctorsMap.set(entry.doctorId, {
                id: entry.doctorId,
                name: entry.doctorName,
                specialty: entry.specialty,
                // Using placehold.co for avatars as local uploads paths won't work in sandbox
                image: `https://placehold.co/100x100/${avatarBgColor}/${avatarTextColor}?text=${entry.doctorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}`,
            });
        }

        // Populate daily schedules
        const date = new Date(entry.date);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const dd = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        if (!dailySchedules[formattedDate]) {
            dailySchedules[formattedDate] = [];
        }
        // Add doctorId if status is Approved and isActive is true
        if (entry.status === "Approved" && entry.isActive) {
            dailySchedules[formattedDate].push(entry.doctorId);
        }
    });

    return {
        doctors: Array.from(doctorsMap.values()),
        dailySchedules: dailySchedules,
    };
};

const processedData = processDoctorData(rawDoctorScheduleData);
const mockDoctors = processedData.doctors;
const mockDoctorDailySchedules = processedData.dailySchedules;

const mockEducationalResources = [
    {
        id: "edu_001",
        title: "Wastong Pagtu-toothbrush",
        description: "Siguraduhing magsipilyo ng ngipin nang dalawang beses sa isang araw sa loob ng dalawang minuto gamit ang fluoride toothpaste.",
        link: "#",
        icon: "🦷",
    },
    {
        id: "edu_002",
        title: "Flossing ang Susi",
        description: "Huwag kalimutang mag-floss araw-araw para maalis ang tinga sa pagitan ng ngipin na hindi kayang maabot ng sipilyo.",
        link: "#",
        icon: "🧵",
    },
    {
        id: "edu_003",
        title: "Limitahan ang Matatamis",
        description: "Bawasan ang pagkonsumo ng asukal para maiwasan ang pagkabulok ng ngipin at mapanatili ang malusog na gilagid.",
        link: "#",
        icon: "🍭",
    },
    {
        id: "edu_004",
        title: "Regular na Check-up",
        description: "Magpa-check-up sa dentista kada anim na buwan para sa propesyonal na paglilinis at maagang matukoy ang anumang problema.",
        link: "#",
        icon: "🗓️",
    },
];

function NotificatioLayout() {
        const [patient, setPatient] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
        const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
        const [currentMonth, setCurrentMonth] = useState(new Date());
        const [isFlipping, setIsFlipping] = useState(false);
        const appointmentServiceData = patient
            ? Object.entries(
                  patient.recentAppointments.reduce((acc, app) => {
                      acc[app.service] = (acc[app.service] || 0) + 1;
                      return acc;
                  }, {}),
              ).map(([name, value]) => ({ name, value }))
            : [];
    
        const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];
    
        // Simulate fetching patient data
        useEffect(() => {
            const fetchPatientData = () => {
                try {
                    // Sa totoong app, kukunin mo ito mula sa isang API o Firestore
                    setPatient(mockPatientData);
                    setLoading(false);
                } catch (err) {
                    setError("Hindi ma-load ang data ng pasyente.");
                    setLoading(false);
                }
            };
    
            fetchPatientData();
    
            // Setup for automatic doctor sliding
            const doctorSliderInterval = setInterval(() => {
                setCurrentDoctorIndex((prevIndex) => (prevIndex + 1) % mockDoctors.length);
            }, 5000); // Magpapalit ng doktor tuwing 5 segundo
    
            // Setup for automatic educational resource flipping
            const resourceFlipInterval = setInterval(() => {
                setIsFlipping(true); // Start flip animation
                setTimeout(() => {
                    setCurrentResourceIndex((prevIndex) => (prevIndex + 1) % mockEducationalResources.length);
                    setIsFlipping(false); // End flip animation
                }, 500); // Half of the duration of the flip (e.g., 500ms for a 1s flip)
            }, 7000); // Magpapalit ng resource tuwing 7 segundo (mas mahaba para mabasa)
    
            // Clear intervals kapag umalis ang component
            return () => {
                clearInterval(doctorSliderInterval);
                clearInterval(resourceFlipInterval);
            };
        }, []); // Empty dependency array means this effect runs once on mount
    
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
    
        const dayNames = ["Linggo", "Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado"];
    
        const formatDateForSchedule = (year, month, day) => {
            const monthStr = (month + 1).toString().padStart(2, "0");
            const dayStr = day.toString().padStart(2, "0");
            return `${year}-${monthStr}-${dayStr}`;
        };
    
        const handleMonthChange = (offset) => {
            setCurrentMonth((prevMonth) => {
                const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + offset, 1);
                return newMonth;
            });
        };
        // --- End Calendar Logic ---
    
        if (loading) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                    <div className="text-xl font-semibold text-gray-700">Loading data ng pasyente...</div>
                </div>
            );
        }
    
        if (error) {
            return (
                <div className="flex min-h-screen items-center justify-center rounded-lg bg-red-100 p-4 shadow-md">
                    <div className="text-lg text-red-700">{error}</div>
                </div>
            );
        }
    
        if (!patient) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                    <div className="text-xl font-semibold text-gray-700">Walang nakitang data ng pasyente.</div>
                </div>
            );
        }
    
        const currentDoctor = mockDoctors[currentDoctorIndex];
        const currentResource = mockEducationalResources[currentResourceIndex];
    
    return (
        <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-lg">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-orange-800">
                <svg
                    className="mr-3 h-7 w-7 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                </svg>
                Mga Abiso
            </h2>
            {patient.notifications && patient.notifications.length > 0 ? (
                <div className="space-y-3">
                    {patient.notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`rounded-lg p-3 ${
                                notif.type === "info"
                                    ? "border border-blue-200 bg-blue-50"
                                    : notif.type === "alert"
                                      ? "border border-orange-200 bg-orange-50"
                                      : "border border-gray-200 bg-gray-50"
                            }`}
                        >
                            <p className="text-md text-gray-800">{notif.message}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-lg text-gray-600">Wala kang bagong abiso.</p>
            )}
        </div>
    );
}

export default NotificatioLayout;
