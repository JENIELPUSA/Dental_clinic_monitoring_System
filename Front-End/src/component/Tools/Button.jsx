import React from 'react';

// Isang simpleng reusable Button component na tumatanggap ng props para sa custom styling
const CustomButton = ({ children, styleType = 'primary', className = '', ...props }) => {
  let baseClasses = 'px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75';
  let specificClasses = '';

  switch (styleType) {
    case 'primary':
      specificClasses = 'bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:ring-blue-500';
      break;
    case 'secondary':
      specificClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 shadow-sm focus:ring-gray-400';
      break;
    case 'outline':
      specificClasses = 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:ring-blue-500';
      break;
    case 'ghost':
      specificClasses = 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:ring-blue-500';
      break;
    case 'gradient':
      specificClasses = 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 shadow-lg focus:ring-blue-500';
      break;
    case 'warning':
      specificClasses = 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md focus:ring-yellow-400';
      break;
    case 'danger':
      specificClasses = 'bg-red-600 text-white hover:bg-red-700 shadow-md focus:ring-red-500';
      break;
    case 'pill':
      baseClasses = 'px-8 py-3 font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75';
      specificClasses = 'bg-purple-600 text-white hover:bg-purple-700 shadow-md focus:ring-purple-500';
      break;
    case 'icon':
        baseClasses = 'p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75';
        specificClasses = 'bg-green-500 text-white hover:bg-green-600 shadow-md focus:ring-green-400';
        break;
    default:
      specificClasses = 'bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:ring-blue-500';
  }

  // Handle disabled state
  if (props.disabled) {
    baseClasses += ' opacity-50 cursor-not-allowed';
    specificClasses = specificClasses.replace(/hover:bg-\w+-\d+/, '').replace(/hover:from-\w+-\d+/, '').replace(/hover:to-\w+-\d+/, '');
    specificClasses = specificClasses.replace(/shadow-lg/, 'shadow-none');
    specificClasses = specificClasses.replace(/shadow-md/, 'shadow-none');
    specificClasses = specificClasses.replace(/shadow-sm/, 'shadow-none');
  }


  return (
    <button
      className={`${baseClasses} ${specificClasses} ${className}`}
      {...props}
    >
      {styleType === 'icon' && props.icon && <span className="mr-2">{props.icon}</span>}
      {children}
    </button>
  );
};

// Main component na nagpapakita ng iba't ibang estilo ng button
export default function ButtonShowcase() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-blue-50 to-blue-100 p-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-blue-900 dark:text-blue-100 mb-12">
        <span className="block text-blue-700 dark:text-blue-300">Iba't Ibang Estilo ng Button</span>
        sa React at Tailwind CSS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Primary Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pangunahing Button (Primary)</h2>
          <CustomButton styleType="primary">I-save ang Data</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa pinakamahalagang aksyon.</p>
        </div>

        {/* Secondary Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pangalawang Button (Secondary)</h2>
          <CustomButton styleType="secondary">Kanselahin</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa sekundaryang aksyon o neutral na pagpipilian.</p>
        </div>

        {/* Outline Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Button na May Outline</h2>
          <CustomButton styleType="outline">Tingnan ang Detalye</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa mas kaunting diin na aksyon.</p>
        </div>

        {/* Ghost Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Ghost Button</h2>
          <CustomButton styleType="ghost">Basahin pa</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Simple, text-based na aksyon.</p>
        </div>

        {/* Gradient Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Gradient Button</h2>
          <CustomButton styleType="gradient">I-activate Ngayon</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa modern at eye-catching na disenyo.</p>
        </div>

        {/* Warning Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Warning Button</h2>
          <CustomButton styleType="warning">I-archive</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa mga aksyon na may babala.</p>
        </div>

        {/* Danger Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Danger Button</h2>
          <CustomButton styleType="danger">Burahin ang Account</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa mapanirang aksyon.</p>
        </div>

        {/* Pill Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Pill Button</h2>
          <CustomButton styleType="pill">Mag-subscribe</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa rounded, pill-like na disenyo.</p>
        </div>

        {/* Icon Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Button na may Icon</h2>
          <CustomButton styleType="icon" icon="➕">Bagong Entry</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Para sa mga aksyon na may visual cue (emoji icon ginamit).</p>
        </div>

        {/* Disabled Button */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Disabled Button</h2>
          <CustomButton styleType="primary" disabled>Hindi Magagamit</CustomButton>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Nagpapahiwatig na hindi ito maaaring i-click.</p>
        </div>
      </div>
    </div>
  );
}
