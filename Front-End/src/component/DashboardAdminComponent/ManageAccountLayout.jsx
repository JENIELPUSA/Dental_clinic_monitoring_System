import React, { useState, useContext } from 'react';
import { Users, Heart, Stethoscope } from 'lucide-react';
import DoctorLayout from "../Doctors/DotorLayout";
import StaffTable from "../Staff/StaffTable";
import AllPatientsLayout from "../Patients/AllPatientsLayout";
import { AuthContext } from '../../contexts/AuthContext';

const ManageLayout = () => {
  const { role } = useContext(AuthContext);

  const basePages = [
    { 
      name: 'Staff', 
      icon: Users, 
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900',
      textColor: 'text-blue-900 dark:text-blue-100',
      accentColor: 'bg-blue-500'
    },
    { 
      name: 'Patient', 
      icon: Heart, 
      color: 'from-red-500 to-pink-400',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-900',
      textColor: 'text-red-900 dark:text-red-100',
      accentColor: 'bg-red-500'
    },
    { 
      name: 'Doctors', 
      icon: Stethoscope, 
      color: 'from-purple-500 to-indigo-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900',
      textColor: 'text-purple-900 dark:text-purple-100',
      accentColor: 'bg-purple-500'
    },
  ];

  const pages = role === "staff" 
    ? basePages.filter(p => p.name !== "Staff") 
    : basePages;

  const [activePage, setActivePage] = useState(
    role === "staff" ? "Patient" : "Staff"
  );

  const currentPage = pages.find(page => page.name === activePage);
  const CurrentIcon = currentPage?.icon || Users;

  const pageContent = {
    Staff: (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start md:space-x-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl mb-3 md:mb-0">
            <Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-base">
              Manage hospital staff members
            </p>
          </div>
        </div>
        <div className="-mx-4 sm:-mx-6 md:-mx-8">
          <StaffTable />
        </div>
      </div>
    ),

    Patient: (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start md:space-x-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl mb-3 md:mb-0">
            <Heart className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-500 bg-clip-text text-transparent">
              Patient Records
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-base">
              Manage patient information and medical records
            </p>
          </div>
        </div>
        {/*Sagad hanggang gilid */}
        <div className="-mx-4 sm:-mx-6 md:-mx-8">
          <AllPatientsLayout />
        </div>
      </div>
    ),

    Doctors: (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start md:space-x-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-2xl flex items-center justify-center shadow-xl mb-3 md:mb-0">
            <Stethoscope className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Doctor Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 md:mt-2 text-sm md:text-base">
              Medical staff schedules and specializations
            </p>
          </div>
        </div>
        {/* ✅ Sagad hanggang gilid */}
        <div className="-mx-4 sm:-mx-6 md:-mx-8">
          <DoctorLayout />
        </div>
      </div>
    ),
  };

  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">No access allowed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <nav className="flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 sm:rounded-2xl sm:p-2">
              {pages.map((page) => {
                const Icon = page.icon;
                const isActive = activePage === page.name;
                
                return (
                  <button
                    key={page.name}
                    onClick={() => setActivePage(page.name)}
                    className={`
                      relative flex items-center justify-center sm:space-x-2
                      w-full sm:w-auto px-3 py-2 sm:px-5 sm:py-3
                      rounded-lg sm:rounded-xl font-medium text-sm sm:text-base
                      transition-all duration-300
                      ${isActive
                        ? `bg-gradient-to-r ${page.color} text-white shadow-md sm:shadow-lg scale-[1.02]`
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/80'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span>{page.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`
          min-h-[500px] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 
          shadow-xl border transition-all duration-300
          ${currentPage?.bgColor || 'bg-white'} 
          ${currentPage?.textColor || 'text-gray-900'}
          border-gray-200/50 dark:border-gray-700
        `}>
          {currentPage ? pageContent[activePage] : <div className="text-center py-10">Select a tab</div>}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-10">
        <button 
          aria-label={`Go to ${activePage}`}
          className={`
            w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl 
            shadow-lg sm:shadow-xl text-white 
            transition-all duration-300 hover:scale-110 active:scale-95
            bg-gradient-to-r ${currentPage?.color || 'from-gray-500 to-gray-600'}
          `}
        >
          <CurrentIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
        </button>
      </div>
    </div>
  );
};

export default ManageLayout;