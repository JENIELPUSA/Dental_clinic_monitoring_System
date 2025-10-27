import { Bell, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { useNotificationDisplay } from "../../contexts/NotificationContext/NotificationContext";
import { AuthContext } from "../../contexts/AuthContext";

const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const NotificationDropdown = () => {
    const { notify: notifications, setNotify: setNotifications, markNotificationAsRead } = useNotificationDisplay();
    const [open, setOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const ref = useRef(null);
    const { linkId } = useContext(AuthContext);

    const toggleDropdown = () => {
        setOpen((prev) => !prev);
        if (open) setShowAll(false);
    };

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) => {
                const updatedViewers = n.viewers.map((v) => (v.user?.toString() === linkId?.toString() ? { ...v, isRead: true } : v));
                return { ...n, viewers: updatedViewers };
            }),
        );
        notifications.forEach((n) => {
            markNotificationAsRead(n._id);
        });
    }, [notifications, markNotificationAsRead, linkId, setNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
                setShowAll(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.reduce((count, notif) => {
        if (Array.isArray(notif.viewers)) {
            notif.viewers.forEach((viewer) => {
                if (viewer.user?.toString() === linkId?.toString() && viewer.isRead === false) {
                    count += 1;
                }
            });
        }
        return count;
    }, 0);

    const displayed = showAll ? notifications : notifications.slice(0, 5);
    const hasUnread = unreadCount > 0;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggleDropdown}
                className={`relative rounded-full p-2 transition-all duration-200 ${
                    open
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                        : "text-blue-800 hover:bg-gray-200 dark:text-blue-200 dark:hover:bg-gray-700"
                }`}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {hasUnread && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 -translate-y-1/4 translate-x-1/4 transform items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 z-[999] mt-2 flex max-h-[80vh] w-80 flex-col rounded-xl bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 bg-blue-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-gray-800 dark:text-white">Notifications</h2>
                                {hasUnread && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                        </div>

                        {hasUnread && (
                            <div className="flex justify-end border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-xs text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    aria-label="Mark all as read"
                                >
                                    <CheckCircle size={14} /> Mark All as Read
                                </button>
                            </div>
                        )}

                        <div className="custom-scrollbar max-h-[50vh] flex-1 overflow-y-auto">
                            {displayed.length > 0 ? (
                                displayed.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`relative border-b border-gray-100 px-4 py-3 dark:border-gray-700 ${
                                            notif.viewers?.some((v) => v.user?.toString() === linkId?.toString() && !v.isRead)
                                                ? "bg-blue-50/50 dark:bg-blue-900/20"
                                                : "bg-white dark:bg-gray-800"
                                        } group transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30`}
                                    >
                                        <button
                                            onClick={() => {
                                                const viewerIndex = notif.viewers.findIndex(
                                                    (viewer) => viewer.user?.toString() === linkId?.toString(),
                                                );

                                                if (viewerIndex !== -1 && notif.viewers[viewerIndex].isRead === false) {
                                                    markNotificationAsRead(notif._id);
                                                    setNotifications((prev) =>
                                                        prev.map((n) => {
                                                            if (n._id === notif._id) {
                                                                const updatedViewers = n.viewers.map((v) =>
                                                                    v.user?.toString() === linkId?.toString() ? { ...v, isRead: true } : v,
                                                                );
                                                                return { ...n, viewers: updatedViewers };
                                                            }
                                                            return n;
                                                        }),
                                                    );
                                                }
                                            }}
                                            className="block w-full text-left"
                                        >
                                            <p
                                                className={`mb-1 select-text ${
                                                    notif.viewers?.some((v) => v.user?.toString() === linkId?.toString() && !v.isRead)
                                                        ? "font-medium text-gray-900 dark:text-white"
                                                        : "text-gray-600 dark:text-gray-300"
                                                }`}
                                            >
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(notif.createdAt)}</p>
                                        </button>
                                        {notif.viewers?.some((v) => v.user?.toString() === linkId?.toString() && !v.isRead) && (
                                            <div className="absolute right-3 top-4 h-2 w-2 rounded-full bg-blue-500"></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center px-4 py-8 text-center">
                                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Bell size={24} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">No notifications</p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 5 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="flex items-center justify-center gap-1 border-t border-blue-800 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                                {showAll ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                        </svg>
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                        View all ({notifications.length})
                                    </>
                                )}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
