import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import { AuthContext } from "../../contexts/AuthContext";

const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const TreatmentPieChart = () => {
    const { authToken, linkId } = useContext(AuthContext);
    const { fetchSpecificTreatment, isSpecifyTreatment } = useContext(TreatmentDisplayContext);

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (linkId) {
            fetchSpecificTreatment(linkId);
        }
    }, [linkId]);

    useEffect(() => {
        if (!isSpecifyTreatment || isSpecifyTreatment.length === 0) return;

        const serviceCounts = isSpecifyTreatment.reduce((acc, item) => {
            const desc = item.treatment_description || "Unknown";
            acc[desc] = (acc[desc] || 0) + 1;
            return acc;
        }, {});

        const formatted = Object.entries(serviceCounts).map(([name, value]) => ({
            name,
            value,
        }));

        setChartData(formatted);
    }, [isSpecifyTreatment]);

    return (
        <div className="rounded-xl border bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-white">Treatment Distribution</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer
                    width="100%"
                    height={400}
                >
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-500 dark:text-gray-300">No treatment data available.</p>
            )}
        </div>
    );
};

export default TreatmentPieChart;
