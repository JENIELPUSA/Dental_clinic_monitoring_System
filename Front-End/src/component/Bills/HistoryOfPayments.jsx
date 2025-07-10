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

function HistoryOfPayments() {
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
            <div className="flex min-h-[250px] items-center justify-center bg-gray-100 p-4 rounded-2xl dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading patient data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[250px] items-center justify-center rounded-lg bg-red-100 p-4 shadow-md dark:bg-red-900/20 dark:border dark:border-red-800/50">
                <div className="text-red-700 text-lg dark:text-red-300">{error}</div>
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

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-lg dark:border-orange-800/50 dark:bg-orange-900/20 dark:shadow-xl">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-orange-800 dark:text-orange-200">
                <svg
                    className="mr-3 h-7 w-7 text-orange-600 dark:text-orange-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 002 2v4a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v.01H4V6z"
                        clipRule="evenodd"
                    ></path>
                </svg>
                Billing and Payment History
            </h2>
            {patient.billingHistory && patient.billingHistory.length > 0 ? (
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
                                    Service
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Amount
                                </th>
                                <th
                                    scope="col"
                                    className="rounded-tr-lg px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {patient.billingHistory.map((bill) => (
                                <tr key={bill.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{bill.date}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{bill.service}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">{bill.amount}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusClasses(bill.status)}`}
                                        >
                                            {bill.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-lg text-gray-600 dark:text-gray-300">You have no billing history at the moment.</p>
            )}
            <button className="mt-5 w-full transform rounded-xl bg-blue-500 px-5 py-2 font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800">
                Pay Online
            </button>
        </div>
    );
}

export default HistoryOfPayments;