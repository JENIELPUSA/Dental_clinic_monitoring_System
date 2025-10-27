import React, { useState } from "react";
import { Package, Archive, Rocket } from "lucide-react";
import InventoryTable from "./inventoryTable";
import CategoryTable from "../Category/CategoryTable";
import InventoryRelease from "../InventoryRelease/InventoryRelease";

const InventoryLayout = () => {
    const [activePage, setActivePage] = useState("Category");

    const pages = [
        { name: "Category", icon: Package, color: "from-blue-500 to-cyan-400" },
        { name: "Inventory", icon: Archive, color: "from-emerald-500 to-teal-400" },
        { name: "Release", icon: Rocket, color: "from-purple-500 to-pink-400" },
    ];

    const currentPage = pages.find((page) => page.name === activePage);

    const pageContent = {
        Category: <CategoryTable />,
        Inventory: <InventoryTable />,
        Release: <InventoryRelease />,
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors duration-500 dark:bg-gray-950 dark:text-gray-100">
            {/* Sticky Navigation */}
            <div className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80">
                <div className="px-2 py-2 sm:px-3 sm:py-3">
                    <nav className="flex justify-center">
                        <div className="flex overflow-x-auto rounded-xl bg-gray-100/80 p-1 dark:bg-gray-800/80 scrollbar-hide">
                            {pages.map((page) => {
                                const Icon = page.icon;
                                const isActive = activePage === page.name;
                                return (
                                    <button
                                        key={page.name}
                                        onClick={() => setActivePage(page.name)}
                                        className={`relative flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                                            isActive
                                                ? `bg-gradient-to-r ${page.color} text-white shadow-sm`
                                                : "text-gray-700 hover:bg-white/70 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/70 dark:hover:text-white"
                                        }`}
                                    >
                                        <Icon
                                            className={`h-3.5 w-3.5 ${
                                                isActive
                                                    ? "text-white"
                                                    : "text-gray-500 dark:text-gray-400"
                                            } sm:h-4 sm:w-4`}
                                        />
                                        <span className="whitespace-nowrap">{page.name}</span>
                                        {isActive && (
                                            <div className="absolute -bottom-1 left-1/2 h-0.5 w-1 -translate-x-1/2 rounded-full bg-white"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-0 py-3 sm:px-2 sm:py-4 md:px-6 md:py-8">
                <div className="w-full rounded-t-2xl rounded-b-xl border-x-0 border-t border-b border-gray-200/50 bg-white text-gray-900 shadow-xl dark:border-gray-800/50 dark:bg-gray-900 dark:text-gray-100 sm:rounded-2xl sm:border-x">
                    {/* Gradient Header */}
                    <div className={`p-3 sm:p-4 md:p-6 bg-gradient-to-r ${currentPage.color}`}>
                        <h1 className="text-lg font-bold text-white sm:text-xl md:text-3xl">
                            {activePage}
                        </h1>
                        <p className="mt-1 text-xs text-white/90 sm:text-sm md:text-white/80">
                            {activePage === "Category"
                                ? "Organize and manage your product categories"
                                : activePage === "Inventory"
                                ? "Track and manage your stock levels"
                                : "Deploy and manage your releases"}
                        </p>
                    </div>

                    {/* Content Area */}
                    <div className="p-2 sm:p-3 md:p-6">
                        <div className="space-y-4 sm:space-y-5">
                            {pageContent[activePage]}
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-3 right-2 sm:bottom-4 sm:right-3">
                <button
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r text-white shadow-lg transition-all duration-300 hover:rotate-12 hover:scale-110 sm:h-11 sm:w-11 ${currentPage.color}`}
                    aria-label={`Quick action for ${activePage}`}
                >
                    <currentPage.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
            </div>
        </div>
    );
};

export default InventoryLayout;
