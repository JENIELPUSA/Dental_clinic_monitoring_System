import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { useContext, useMemo } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import DashboardLayoutPatient from "../../PatientDashboardComponents/DashboardLayout";
import { BillDisplayContext } from "../../../contexts/BillContext/BillContext";

const StatisticsGraph = () => {
    const { theme } = useTheme();
    const { role } = useContext(AuthContext);
    const { isBIll } = useContext(BillDisplayContext);

    const axisTickColor = theme === "light" ? "#1e40af" : "#93c5fd";
    const tooltipBg = theme === "dark" ? "#1e3a8a" : "#eff6ff";
    const tooltipBorder = theme === "dark" ? "#1e40af" : "#bfdbfe";
    const tooltipTextColor = theme === "dark" ? "#f8fafc" : "#1e3a8a";
    const lineColor = "#3b82f6";

    const currentYear = new Date().getFullYear();

    const overviewData = useMemo(() => {
        const monthlyRevenueMap = new Map();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let i = 0; i < 12; i++) {
            monthlyRevenueMap.set(monthNames[i], 0);
        }

        if (Array.isArray(isBIll)) {
            isBIll.forEach(item => {
                const billDate = new Date(item.bill_date);
                if (!isNaN(billDate.getTime()) && billDate.getFullYear() === currentYear) {
                    const monthIndex = billDate.getMonth();
                    const monthName = monthNames[monthIndex];
                    const totalAmount = typeof item.total_amount === 'number' ? item.total_amount : 0;

                    monthlyRevenueMap.set(monthName, (monthlyRevenueMap.get(monthName) || 0) + totalAmount);
                }
            });
        }

        return Array.from(monthlyRevenueMap.entries()).map(([name, total]) => ({ name, total }));
    }, [isBIll, currentYear]);

    if (role === "patient") {
        return <DashboardLayoutPatient />;
    }

    return (
        <div className="card bg-blue-50 dark:bg-blue-900/20">
            <div className="card-header">
                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Monthly Revenue
                </h2>
            </div>
            <div className="h-[250px] p-4 sm:h-[300px]">
                {overviewData.length === 0 ? (
                    <p className="text-center text-blue-600 dark:text-blue-300">
                        No billing data for {currentYear}.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={overviewData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                formatter={(value) => [`₱${value.toLocaleString()}`, "Revenue"]}
                                labelFormatter={(label) => `Month: ${label}`}
                                contentStyle={{
                                    background: tooltipBg,
                                    borderColor: tooltipBorder,
                                    borderRadius: "0.5rem",
                                    color: tooltipTextColor,
                                }}
                                itemStyle={{ color: tooltipTextColor }}
                                labelStyle={{ color: tooltipTextColor }}
                            />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: axisTickColor }}
                                tickLine={false}
                                axisLine={{ stroke: axisTickColor, strokeWidth: 0.5 }}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis
                                tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                tick={{ fill: axisTickColor }}
                                tickLine={false}
                                axisLine={{ stroke: axisTickColor, strokeWidth: 0.5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke={lineColor}
                                strokeWidth={2}
                                dot={{ r: 4, fill: lineColor, stroke: lineColor, strokeWidth: 1 }}
                                activeDot={{ r: 7, fill: lineColor, stroke: lineColor, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default StatisticsGraph;
