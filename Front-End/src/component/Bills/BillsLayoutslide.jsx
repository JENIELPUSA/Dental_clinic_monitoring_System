import React, { useState } from 'react';
import { FileText, History } from 'lucide-react'; 
import BillsTable from "../Bills/BillTable"; 
import HistoryBillsLayout from "../Bills/HistoryTable";

const BillsLayoutSlide = () => {
  const [activePage, setActivePage] = useState('Bills');

  const pages = [
    { 
      name: 'Bills', 
      icon: FileText, 
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900',
      textColor: 'text-green-900 dark:text-green-100',
      accentColor: 'bg-green-500'
    },
    { 
      name: 'History Bills', 
      icon: History, 
      color: 'from-yellow-500 to-orange-400',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      accentColor: 'bg-yellow-500'
    }
  ];

  const currentPage = pages.find(page => page.name === activePage);

  const pageContent = {
    Bills: (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Bills Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Manage and generate dental clinic bills
            </p>
          </div>
        </div>
        <BillsTable />
      </div>
    ),

    'History Bills': (
      <div className="space-y-4">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
              Billing History
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              View all past bills and payment history
            </p>
          </div>
        </div>
        <HistoryBillsLayout />
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          {/* Removed max-w-7xl and mx-auto for full width on mobile */}
          <nav className="flex justify-center">
            <div className="flex overflow-x-auto rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 scrollbar-hide">
              {pages.map((page) => {
                const Icon = page.icon;
                const isActive = activePage === page.name;
                
                return (
                  <button
                    key={page.name}
                    onClick={() => setActivePage(page.name)}
                    className={`
                      relative flex-shrink-0 flex items-center justify-center gap-1.5
                      px-3 py-2 rounded-lg font-medium text-xs
                      transition-all duration-300
                      sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm
                      ${isActive
                        ? `bg-gradient-to-r ${page.color} text-white shadow-md`
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-700/70'
                      }
                    `}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'} sm:w-4 sm:h-4`} />
                    <span className="whitespace-nowrap">{page.name}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content — Full width on mobile */}
      <main className="px-2 py-6 sm:px-4 sm:py-8 md:px-6 md:py-12">
        {/* Removed max-w-7xl and mx-auto */}
        <div className={`
          w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border transition-all duration-500
          ${currentPage.bgColor} ${currentPage.textColor} border-gray-200/50 dark:border-gray-700
        `}>
          {pageContent[activePage]}
        </div>
      </main>

      {/* Floating Action Button (FAB) — closer to edge on mobile */}
      <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6">
        <button className={`
          w-12 h-12 rounded-xl sm:w-14 sm:h-14 rounded-2xl shadow-xl text-white 
          transition-all duration-300 hover:scale-110 hover:rotate-12
          bg-gradient-to-r ${currentPage.color}
        `}>
          <currentPage.icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
        </button>
      </div>
    </div>
  );
};

export default BillsLayoutSlide;