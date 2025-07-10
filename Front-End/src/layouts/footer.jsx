export const Footer = () => {
  return (
    <footer className="relative z-10 flex h-[60px] items-center justify-between bg-blue-50 px-4 shadow-md transition-colors dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2025 <span className="font-semibold text-black dark:text-white">begginerCode.ph</span>. All rights reserved.
        </p>
        <div className="flex gap-x-4 text-sm">
          <a
            href="#"
            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};
