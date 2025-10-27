import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import { AuthContext } from "../../contexts/AuthContext";

const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const TreatmentPieChart = () => {
  const { linkId } = useContext(AuthContext);
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
    <div className="w-full rounded-xl border bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-white sm:text-xl">
        Treatment Distribution
      </h2>
      {chartData.length > 0 ? (
        <div className="h-[300px] sm:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, "Treatments"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500 dark:text-gray-300 py-8">
          No treatment data available.
        </p>
      )}
    </div>
  );
};

export default TreatmentPieChart;