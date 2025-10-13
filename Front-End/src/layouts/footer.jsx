export const Footer = () => {
  return (
    <footer className="relative z-10 flex h-[60px] items-center justify-between bg-blue-50 px-4 shadow-md transition-colors dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2025 <span className="font-semibold text-black dark:text-white">Doc. Saclolo Dental Care System</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
