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
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Bills Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and generate dental clinic bills
            </p>
          </div>
        </div>
        <BillsTable />
      </div>
    ),

    'History Bills': (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-xl">
            <History className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
              Billing History
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex justify-center">
            <div className="flex items-center space-x-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2">
              {pages.map((page) => {
                const Icon = page.icon;
                const isActive = activePage === page.name;
                
                return (
                  <button
                    key={page.name}
                    onClick={() => setActivePage(page.name)}
                    className={`
                      relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium
                      transition-all duration-300 transform
                      ${isActive
                        ? `bg-gradient-to-r ${page.color} text-white shadow-lg scale-105`
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-102'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{page.name}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className={`
          min-h-[600px] rounded-3xl p-8 shadow-xl border transition-all duration-500
          ${currentPage.bgColor} ${currentPage.textColor} border-gray-200/50 dark:border-gray-700
        `}>
          {pageContent[activePage]}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <button className={`
          w-14 h-14 rounded-2xl shadow-2xl text-white transition-all duration-300 
          hover:scale-110 hover:rotate-12 bg-gradient-to-r ${currentPage.color}
        `}>
          <currentPage.icon className="w-6 h-6 mx-auto" />
        </button>
      </div>
    </div>
  );
};

export default BillsLayoutSlide;
