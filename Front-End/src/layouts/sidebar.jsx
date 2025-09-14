import { forwardRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navbarLinks } from "@/constants";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";
import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { user, logout, role, email, fullName } = useAuth();
    const navigate = useNavigate();

    if (!role) return null;

    const rolePermissions = {
        doctor: [
            "/dashboard",
            "/dashboard/Schedule",
            "/dashboard/appointment",
            "/dashboard/new-product",
            "/dashboard/Treatment",
            "/dashboard/prescription",
            "/dashboard/booking","/dashboard/Change-Password"
        ],
        staff: [
            "/dashboard",
            "/dashboard/booking",
            "/dashboard/Schedule",
            "/dashboard/appointment",
            "/dashboard/new-product",
            "/dashboard/all-patients",
            "/dashboard/Treatment",
            "/dashboard/prescription",
            "/dashboard/Accounts",
            "/dashboard/new-patients",
            "/dashboard/bill","/dashboard/Change-Password"
        ],
        patient: ["/dashboard","/dashboard/Treatment", "/dashboard/appointment","/dashboard/Change-Password"],
        Admin: [
              
        ],
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    const filteredNavbarLinks = navbarLinks
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => {
                if (rolePermissions[role]) {
                    if (rolePermissions[role].length === 0) return true;
                    return rolePermissions[role].includes(link.path);
                }
                return true;
            }),
        }))
        .filter((group) => group.links.length > 0);

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed left-0 top-0 z-[100] flex h-full flex-col overflow-x-hidden border-r transition-all duration-300 ease-in-out",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-translate-x-full" : "max-md:translate-x-0",
                "w-[240px] translate-x-0",
                "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-gray-900",
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-center border-b border-blue-200 p-4 transition-all duration-300 dark:border-blue-800">
                {!collapsed ? (
                    <div className="flex items-center gap-x-3">
                        <img
                            src={user?.avatar || "https://i.pravatar.cc/300"}
                            alt="User Avatar"
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium text-blue-800 dark:text-blue-200">{fullName || "User Name"}</p>
                            <p className="truncate text-xs text-blue-600 dark:text-blue-400">{email || "Designation"}</p>
                        </div>
                    </div>
                ) : (
                    <img
                        src={user?.avatar || "https://i.pravatar.cc/300"}
                        alt="User Avatar"
                        className="mx-auto h-10 w-10 rounded-full object-cover"
                    />
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex w-full flex-1 flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {filteredNavbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        {navbarLink.links.length > 0 && (
                            <p
                                className={cn(
                                    "sidebar-group-title text-blue-700 dark:text-blue-300",
                                    collapsed ? "md:h-0 md:w-[45px] md:text-center md:opacity-0" : "md:h-auto md:opacity-100",
                                    "transition-all duration-300 ease-in-out",
                                )}
                            >
                                {!collapsed && navbarLink.title}
                            </p>
                        )}

                        {navbarLink.links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                end
                                className={({ isActive }) =>
                                    cn(
                                        "sidebar-item relative mx-1 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200",
                                        "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/30",
                                        collapsed && "md:w-[45px] md:justify-center md:px-0 md:py-3",
                                        isActive &&
                                            "border-l-4 border-blue-500 bg-blue-100 font-medium text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-100",
                                    )
                                }
                            >
                                <link.icon size={22} />
                                {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                            </NavLink>
                        ))}
                    </nav>
                ))}
            </div>

            {/* Logout Button */}
            <div className="border-t border-blue-200 p-4 dark:border-blue-800">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-lg py-2",
                        "text-sm font-medium transition-all duration-200",
                        "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/30",
                        collapsed ? "md:w-[45px] md:justify-center md:px-0 md:py-3" : "px-3",
                        "mx-1",
                    )}
                >
                    <LogOut
                        size={22}
                        className={cn("flex-shrink-0", collapsed ? "mx-auto" : "")}
                    />
                    {!collapsed && <p className="whitespace-nowrap">Logout</p>}
                </button>
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
