import React, { useContext, useEffect, useState } from 'react';
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
  const { linkId } = useContext(AuthContext);
  const { fetchSpecificTreatment, isSpecifyTreatment } = useContext(TreatmentDisplayContext);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (linkId) {
      fetchSpecificTreatment(linkId);
    }
  }, [linkId]);

  const chartData = (isSpecifyTreatment?.length ? isSpecifyTreatment : []).map(item => ({
    description: item.treatment_description,
    cost: item.treatment_cost,
  }));

  // Adjust chart height and X-axis based on screen size
  const chartHeight = isMobile ? 350 : 500;
  const xAxisProps = isMobile
    ? {
        angle: -45,
        textAnchor: "end",
        height: 100,
        fontSize: 10,
      }
    : {
        angle: -30,
        textAnchor: "end",
        height: 80,
        fontSize: 12,
      };

  return (
    <div className="w-full flex justify-center items-start py-4 sm:py-6">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-white mb-1 text-center sm:text-2xl sm:mb-2">
          Dental Treatment Costs
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4 text-center sm:text-base sm:mb-6">
          An overview of common dental treatment expenses.
        </p>
        <div className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}
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
                {...xAxisProps}
                interval={0}
                tick={{ fill: '#666', fontSize: xAxisProps.fontSize }}
                tickLine={false}
                axisLine={{ stroke: '#ccc' }}
              />
              <YAxis
                tickFormatter={(value) => `₱${value.toLocaleString()}`}
                tick={{ fill: '#666', fontSize: isMobile ? 10 : 12 }}
                tickLine={false}
                axisLine={{ stroke: '#ccc' }}
                width={isMobile ? 60 : 80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '10px',
                  fontSize: isMobile ? '12px' : '14px',
                }}
                labelStyle={{ color: '#333', fontWeight: 'bold' }}
                itemStyle={{ color: '#555' }}
                formatter={(value) => [`₱${value.toLocaleString()}`, 'Cost']}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="url(#lineGradient)"
                strokeWidth={isMobile ? 2 : 3}
                dot={{ r: isMobile ? 4 : 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: isMobile ? 6 : 8, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TreatmentCostLineChart;