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

  // hide Staff tab kung role === staff
  const pages = role === "staff" 
    ? basePages.filter(p => p.name !== "Staff") 
    : basePages;

  // default active page depende sa role
  const [activePage, setActivePage] = useState(
    role === "staff" ? "Patient" : "Staff"
  );

  const currentPage = pages.find(page => page.name === activePage);

  const pageContent = {
    Staff: (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage hospital staff members</p>
          </div>
        </div>
        <StaffTable/>
      </div>
    ),

    Patient: (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-500 bg-clip-text text-transparent">
              Patient Records
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage patient information and medical records</p>
          </div>
        </div>
        <AllPatientsLayout/>
      </div>
    ),

    Doctors: (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-2xl flex items-center justify-center shadow-xl">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Doctor Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Medical staff schedules and specializations</p>
          </div>
        </div>
        <DoctorLayout/>
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

export default ManageLayout;
