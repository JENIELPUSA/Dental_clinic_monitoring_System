import React from 'react';

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
        <div className="bg-white p-4 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300 dark:bg-gray-800 dark:shadow-lg dark:border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                    {styledIcon}
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendBgClass} ${trendTextColorClass}`}>
                    <svg className={`h-3.5 w-3.5 ${trendDirection === "down" ? "rotate-180 transform" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a.75.75 0 01-.75-.75V5.56l-3.22 3.22a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06L10.75 5.56v11.69a.75.75 0 01-.75.75z" clipRule="evenodd" />
                    </svg>
                    {trendValue}
                </span>
            </div>
            <div>
                <h3 className="text-sm text-blue-700 dark:text-blue-300">{title}</h3>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{value}</p>
                {description && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{description}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
