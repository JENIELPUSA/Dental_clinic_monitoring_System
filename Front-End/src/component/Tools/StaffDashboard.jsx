import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    ClipboardList,
    Users,
    MessageSquare,
    Clock,
    Calendar,
    Sun,
    Moon
} from 'lucide-react'; // Icons from lucide-react

// Main Staff Dashboard Layout Component
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

    // Dummy Data for demonstration
    const todayAppointments = [
        { id: 1, patientName: "Maria Clara", time: "09:00 AM", doctor: "Dr. Santos", status: "Confirmed" },
        { id: 2, patientName: "Crisostomo Ibarra", time: "10:30 AM", doctor: "Dr. Dela Cruz", status: "Pending" },
        { id: 3, patientName: "Sisa", time: "01:00 PM", doctor: "Dr. Reyes", status: "Confirmed" },
    ];

    const upcomingTasks = [
        { id: 1, description: "Prepare patient files for tomorrow", dueDate: "Hunyo 21, 2025", status: "Pending" },
        { id: 2, description: "Order dental supplies", dueDate: "Hunyo 22, 2025", status: "High Priority" },
        { id: 3, description: "Follow up on invoice #005", dueDate: "Hunyo 20, 2025", status: "Completed" },
    ];

    const totalAppointments = todayAppointments.length + 50; // Example total
    const totalPendingTasks = upcomingTasks.filter(task => task.status === "Pending" || task.status === "High Priority").length;
    const totalPatientInquiries = 15; // Example
    const newBookingsToday = 3; // Example

    // Function to show a custom message box
    const showMessageBox = (message, type = 'success') => {
        const messageBox = document.createElement('div');
        messageBox.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg z-[1000] message-box
                                ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`;
        messageBox.innerText = message;
        document.body.appendChild(messageBox);

        setTimeout(() => {
            document.body.removeChild(messageBox);
        }, 3000); // Remove message after 3 seconds
    };

    // Card Component (simplified and integrated for this dashboard)
    const StatCard = ({ icon, title, value, trend, description }) => {
        const trendDirection = trend?.direction || "up";
        const trendValue = trend?.value || "0%";
        const trendTextColorClass = trendDirection === "down"
            ? "text-red-600 dark:text-red-300"
            : "text-green-600 dark:text-green-300";
        const trendBgClass = trendDirection === "down"
            ? "bg-red-100 dark:bg-red-900"
            : "bg-green-100 dark:bg-green-900";
        
        const styledIcon = React.cloneElement(icon, {
            className: 'text-blue-600 dark:text-blue-300'
        });

        return (
            <div className="bg-white p-4 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300
                            dark:bg-gray-800 dark:shadow-lg dark:border dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                        {styledIcon}
                    </div>
                    <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendBgClass} ${trendTextColorClass}`}
                    >
                        {/* TrendingUp icon from lucide-react */}
                        <svg className={`h-3.5 w-3.5 ${trendDirection === "down" ? "rotate-180 transform" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a.75.75 0 01-.75-.75V5.56l-3.22 3.22a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06L10.75 5.56v11.69a.75.75 0 01-.75.75z" clipRule="evenodd" />
                        </svg>
                        {trendValue}
                    </span>
                </div>
                <div>
                    <h3 className="text-sm text-blue-700 dark:text-blue-300">{title}</h3>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300">
            {/* Header / Nav (simple placeholder) */}
            <header className="bg-white shadow p-4 flex justify-between items-center dark:bg-gray-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Staff Dashboard</h1>
                <button
                    onClick={() => showMessageBox("User profile/settings would open here.", 'info')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                    <Users size={20} />
                    <span>Staff Member</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                {/* Dark Mode Toggle */}
                <div className="flex justify-end mb-6 no-print">
                    <button
                        onClick={() => setIsDarkMode(prevMode => !prevMode)}
                        className="dark-mode-toggle p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white flex items-center justify-center shadow-sm hover:scale-105"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <Moon className="h-6 w-6" />
                        ) : (
                            <Sun className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        icon={<CalendarCheck size={32} />}
                        title="Total Appointments"
                        value={totalAppointments}
                        trend={{ value: "8%", direction: "up" }}
                        description="Overall appointments managed"
                    />
                    <StatCard
                        icon={<ClipboardList size={32} />}
                        title="Pending Tasks"
                        value={totalPendingTasks}
                        trend={{ value: "3%", direction: "down" }}
                        description="Tasks needing attention"
                    />
                    <StatCard
                        icon={<MessageSquare size={32} />}
                        title="Patient Inquiries"
                        value={totalPatientInquiries}
                        trend={{ value: "10%", direction: "up" }}
                        description="New messages this week"
                    />
                    <StatCard
                        icon={<Calendar size={32} />}
                        title="New Bookings Today"
                        value={newBookingsToday}
                        trend={{ value: "5%", direction: "up" }}
                        description="Appointments booked today"
                    />
                </div>

                {/* Today's Appointments Section */}
                <div className="rounded-xl bg-white p-8 shadow-xl mb-8 dark:bg-gray-800">
                    <h3 className="mb-6 flex items-center text-2xl font-bold text-gray-800 dark:text-white">
                        <Clock size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
                        Appointments Ngayon ({new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })})
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Pangalan ng Pasyente</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Oras</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Doktor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Aksyon</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {todayAppointments.length > 0 ? (
                                    todayAppointments.map((appt, index) => (
                                        <tr key={appt.id} className={index % 2 === 0 ? "table-row" : "table-row bg-gray-50 dark:bg-gray-700"}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{appt.patientName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{appt.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{appt.doctor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    appt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                                    appt.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                                    'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                <button
                                                    onClick={() => showMessageBox(`View details for ${appt.patientName}`)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 dark:text-blue-400 dark:hover:text-blue-200"
                                                >
                                                    Tingnan
                                                </button>
                                                <button
                                                    onClick={() => showMessageBox(`Manage ${appt.patientName}'s appointment`)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                                                >
                                                    Pamahalaan
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Walang appointments ngayon.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Tasks Section */}
                <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800">
                    <h3 className="mb-6 flex items-center text-2xl font-bold text-gray-800 dark:text-white">
                        <ClipboardList size={24} className="mr-3 text-blue-600 dark:text-blue-400" />
                        Mga Nakabinbing Gawain
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Deskripsyon</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Due Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Aksyon</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {upcomingTasks.length > 0 ? (
                                    upcomingTasks.map((task, index) => (
                                        <tr key={task.id} className={index % 2 === 0 ? "table-row" : "table-row bg-gray-50 dark:bg-gray-700"}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{task.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.dueDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                                    task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                                    'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' // High Priority
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                <button
                                                    onClick={() => showMessageBox(`Mark task "${task.description}" as complete`)}
                                                    className="text-green-600 hover:text-green-900 mr-4 dark:text-green-400 dark:hover:text-green-200"
                                                >
                                                    Markahan
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Walang nakabinbing gawain.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white shadow mt-8 p-4 text-center text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-400">
                &copy; 2025 Dental Clinic Monitoring System. All rights reserved.
            </footer>

            {/* Styles for the dashboard */}
            <style jsx>{`
                /* General body styles for consistent font and background */
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                /* Print styles */
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    .dark {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    .dark .invoice-container, .dark .bg-gray-800 {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    .dark .table-header, .dark .table-row:nth-child(even), .dark .table-row:nth-child(odd) {
                        background-color: #f9fafb !important;
                        color: #374151 !important;
                    }
                    .dark .table-header th, .dark .table-row td, .dark .text-gray-800 {
                        color: #374151 !important;
                    }
                }
                /* Animation for message box */
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
