import React, { useContext, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { TreatmentDisplayContext } from '../../contexts/TreatmentContext/TreatmentContext';
import { AuthContext } from "../../contexts/AuthContext";

const TreatmentCostLineChart = () => {
  const { authToken, linkId } = useContext(AuthContext);
  const { fetchSpecificTreatment, isSpecifyTreatment } = useContext(TreatmentDisplayContext);

  useEffect(() => {
    if (linkId) {
      fetchSpecificTreatment(linkId);
    }
  }, [linkId]);

  const chartData = (isSpecifyTreatment?.length ? isSpecifyTreatment : []).map(item => ({
    description: item.treatment_description,
    cost: item.treatment_cost,
  }));

return (
  <div className="flex justify-center items-center font-inter min-h-[600px]">
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2 text-center">
        Dental Treatment Costs
      </h2>
      <p className="text-md text-gray-600 dark:text-gray-200 mb-6 text-center">
        An overview of common dental treatment expenses.
      </p>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="description"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fill: '#cccccc', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#cccccc' }}
          />
          <YAxis
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
            tick={{ fill: '#cccccc', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#cccccc' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '10px',
            }}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            itemStyle={{ color: '#555' }}
            formatter={(value) => [`₱${value.toLocaleString()}`, 'Cost']}
          />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

};

export default TreatmentCostLineChart;
