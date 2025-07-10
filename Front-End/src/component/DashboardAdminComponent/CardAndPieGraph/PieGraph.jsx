import React, { useContext, createContext, useState, useEffect } from "react";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { AppointmentDisplayContext } from "../../../contexts/AppointmentContext/appointmentContext";
const ThemeContext = createContext({
    theme: 'light',
    setTheme: () => {},
});
const useTheme = () => useContext(ThemeContext);

const Card = ({ children, className }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
        {children}
    </div>
);
const CardHeader = ({ children, className }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
        {children}
    </div>
);
const CardTitle = ({ children, className }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h3>
);
const CardDescription = ({ children, className }) => (
    <p className={`text-sm text-muted-foreground ${className}`}>
        {children}
    </p>
);
const CardContent = ({ children, className }) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
);

const PieGraph = ({ initialPieData }) => {
    const { appointment } = useContext(AppointmentDisplayContext);
    const { theme } = useTheme();
    const [pieData, setPieData] = useState([]);

    useEffect(() => {
        if (Array.isArray(appointment) && appointment.length > 0) {
            const statusCounts = appointment.reduce((acc, appointment) => {
                const status = appointment.appointment_status;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const newPieData = Object.keys(statusCounts).map(status => ({
                name: status,
                value: statusCounts[status],
            }));

            setPieData(initialPieData || newPieData);
        }
    }, [initialPieData, appointment]);

    const COLORS = [
        "#3b82f6", // Blue - Completed
        "#22c55e", // Green - Confirmed
        "#f97316", // Orange - Pending
        "#ef4444", // Red - Cancelled
        "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"
    ];

    return (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                    Appointment Status Distribution
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400">
                    Overview of appointment statuses from provided data.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke={theme === 'dark' ? '#1f2937' : '#f9fafb'}
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => [`${value}`, "Count"]}
                            labelFormatter={(label) => `Status: ${label}`}
                            contentStyle={{
                                background: theme === "dark" ? "#1e3a8a" : "#eff6ff",
                                borderColor: theme === "dark" ? "#1e40af" : "#bfdbfe",
                                borderRadius: "0.5rem",
                                color: theme === "dark" ? "#f8fafc" : "#1e3a8a",
                                fontSize: "0.875rem",
                                padding: "0.75rem",
                            }}
                            labelStyle={{
                                color: theme === "dark" ? "#93c5fd" : "#3b82f6",
                                fontWeight: "bold",
                                marginBottom: "0.25rem",
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '10px',
                                fontSize: '0.875rem',
                                color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default PieGraph;
