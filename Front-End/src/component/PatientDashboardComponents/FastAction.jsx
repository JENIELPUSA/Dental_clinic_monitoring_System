import React from "react";

function FastAction() {
    return (
        <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-lg dark:border-green-800/50 dark:bg-green-900/20 dark:shadow-xl">
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-green-800 dark:text-green-200">
                <svg
                    className="mr-3 h-7 w-7 text-green-600 dark:text-green-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                    ></path>
                </svg>
                Quick Actions
            </h2>
            <div className="flex flex-col space-y-3">
                <button className="transform rounded-xl bg-green-500 px-5 py-2 font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800">
                    Book a New Appointment
                </button>
                <button className="transform rounded-xl bg-indigo-500 px-5 py-2 font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-800">
                    View Our Services
                </button>
                <button className="transform rounded-xl bg-purple-500 px-5 py-2 font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800">
                    Contact the Clinic
                </button>
            </div>
        </div>
    );
}

export default FastAction;