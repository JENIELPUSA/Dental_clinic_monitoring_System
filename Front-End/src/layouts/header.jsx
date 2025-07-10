import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotificationDropdown from "../component/Notification/NotificationDropdown";
import { NotificationDisplayContext } from "../contexts/NotificationContext/NotificationContext";

export const Header = ({ collapsed, setCollapsed }) => {
  const { notify, markNotificationAsRead } = useContext(NotificationDisplayContext);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const [userNotifications, setUserNotifications] = useState([]);

  useEffect(() => {
    if (notify) {
      setUserNotifications(notify);
    }
  }, [notify]);

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-blue-50 px-4 shadow-md transition-colors dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-x-3">
        <button
          className="relative flex size-10 items-center justify-center rounded-md text-blue-800 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-300"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle Sidebar"
        >
          <motion.div
            className="relative w-6 h-5"
            initial={false}
            animate={collapsed ? "open" : "closed"}
          >
            <motion.span
              className="absolute left-0 top-0 h-0.5 w-full bg-current"
              variants={{ open: { rotate: 45, y: 8 }, closed: { rotate: 0, y: 0 } }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="absolute left-0 top-2 h-0.5 w-full bg-current"
              variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="absolute left-0 bottom-0 h-0.5 w-full bg-current"
              variants={{ open: { rotate: -45, y: -8 }, closed: { rotate: 0, y: 0 } }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </button>
      </div>

      <div className="flex items-center gap-x-3">
        <button
          aria-label="Toggle Theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="relative inline-flex h-7 w-14 items-center rounded-full border border-blue-200 dark:border-blue-700 bg-blue-100 dark:bg-blue-800/30 transition-colors duration-300"
        >
          <span
            className={`absolute left-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-all duration-300 ${
              isDark ? "translate-x-[28px]" : "translate-x-0"
            }`}
          >
            {isDark ? <Moon size={14} /> : <Sun size={14} />}
          </span>
        </button>
        <NotificationDropdown
          notifications={userNotifications}
          setNotifications={setUserNotifications}
          markNotificationAsRead={markNotificationAsRead}
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};
