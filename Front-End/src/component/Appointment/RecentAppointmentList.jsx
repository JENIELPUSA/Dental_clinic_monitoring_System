import React, { useState, useEffect } from "react";

const mockPatientData = {
    id: "patient_123",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@example.com",
    phone: "+639171234567",
    nextAppointment: {
        date: "June 20, 2025",
        time: "10:00 AM",
        dentist: "Mark Mista",
        service: "Dental Check-up and Cleaning",
        status: "Confirmed",
        location: "Suite 301, ABC Dental Clinic",
    },
    recentAppointments: [
        {
            id: "app_001",
            date: "May 15, 2025",
            time: "02:00 PM",
            dentist: "Dr. Maria Santos",
            service: "Tooth Extraction",
            status: "Completed",
        },
        {
            id: "app_002",
            date: "April 10, 2025",
            time: "09:00 AM",
            dentist: "Dr. Jose Rizal",
            service: "Dental X-ray",
            status: "Completed",
        },
        {
            id: "app_003",
            date: "March 5, 2025",
            time: "01:00 PM",
            dentist: "Dr. Maria Santos",
            service: "Dental Check-up and Cleaning",
            status: "Completed",
        },
        {
            id: "app_004",
            date: "February 1, 2025",
            time: "03:00 PM",
            dentist: "Dr. Jose Rizal",
            service: "Tooth Filling",
            status: "Completed",
        },
        {
            id: "app_005",
            date: "January 20, 2025",
            time: "11:00 AM",
            dentist: "Dr. Maria Santos",
            service: "Dental Check-up and Cleaning",
            status: "Completed",
        },
    ],
    treatmentPlan: [
        {
            id: "tp_001",
            description: "Root Canal Treatment on #7",
            status: "Pending",
            startDate: "June 25, 2025",
            cost: "₱15,000.00",
        },
        {
            id: "tp_002",
            description: "Teeth Whitening",
            status: "Completed",
            startDate: "May 10, 2025",
            cost: "₱8,000.00",
        },
    ],
    notifications: [
        { id: "notif_001", message: "Reminder: Your appointment on June 20 is approaching!", type: "info" },
        { id: "notif_002", message: "New treatment plan added: Root Canal Treatment.", type: "alert" },
    ],
    billingHistory: [
        {
            id: "bill_001",
            date: "May 15, 2025",
            service: "Tooth Extraction",
            amount: "₱3,500.00",
            status: "Paid",
        },
        {
            id: "bill_002",
            date: "April 10, 2025",
            service: "Dental X-ray",
            amount: "₱1,000.00",
            status: "Paid",
        },
        {
            id: "bill_003",
            date: "June 20, 2025",
            service: "Dental Check-up and Cleaning",
            amount: "₱2,000.00",
            status: "Pending",
        },
    ],
};

function RecentAppointmentList() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientData = () => {
            try {
                setPatient(mockPatientData);
                setLoading(false);
            } catch (err) {
                setError("Failed to load patient data.");
                setLoading(false);
            }
        };

        fetchPatientData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[250px] items-center justify-center bg-gray-100 p-4 rounded-2xl dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading patient data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[250px] items-center justify-center rounded-lg bg-red-100 p-4 shadow-md dark:bg-red-900/20 dark:border dark:border-red-800/50">
                <div className="text-lg text-red-700 dark:text-red-300">{error}</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex min-h-[250px] items-center justify-center bg-gray-100 p-4 rounded-2xl dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">No patient data found.</div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-lg dark:border-purple-800/50 dark:bg-purple-900/20 dark:shadow-xl">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-purple-800 dark:text-purple-200">
                <svg
                    className="mr-3 h-7 w-7 text-purple-600 dark:text-purple-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                    ></path>
                </svg>
                Recent Appointments
            </h2>
            {patient.recentAppointments && patient.recentAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    scope="col"
                                    className="rounded-tl-lg px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Time
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Service
                                </th>
                                <th
                                    scope="col"
                                    className="rounded-tr-lg px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Dentist
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {patient.recentAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{appointment.date}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{appointment.time}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{appointment.service}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{appointment.dentist}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-lg text-gray-600 dark:text-gray-300">You have no past appointments.</p>
            )}
        </div>
    );
}

export default RecentAppointmentList;