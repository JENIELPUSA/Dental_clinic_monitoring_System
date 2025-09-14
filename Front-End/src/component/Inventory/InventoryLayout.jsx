import React, { useState } from "react";
import { Package, Archive, Rocket } from "lucide-react";
import InventoryTable from "./inventoryTable";
import CategoryTable from "../Category/CategoryTable";
import InventoryRelease from "../InventoryRelease/InventoryRelease";

const InventoryLayout = () => {
    const [activePage, setActivePage] = useState("Category");

    const pages = [
        {
            name: "Category",
            icon: Package,
            color: "from-blue-500 to-cyan-400",
        },
        {
            name: "Inventory",
            icon: Archive,
            color: "from-emerald-500 to-teal-400",
        },
        {
            name: "Release",
            icon: Rocket,
            color: "from-purple-500 to-pink-400",
        },
    ];

    const currentPage = pages.find((page) => page.name === activePage);

    const pageContent = {
        Category: (
            <div className="space-y-8">
                <CategoryTable />
            </div>
        ),
        Inventory: (
            <div className="space-y-8">
                <InventoryTable />
            </div>
        ),
        Release: (
            <div className="space-y-6">
                <InventoryRelease />
            </div>
        ),
    };

    return (
        <div className="min-h-screen bg-gray-100 transition-colors duration-500 dark:bg-gray-950">
            {/* Sticky Navigation */}
            <div className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <nav className="flex justify-center">
                        <div className="flex items-center space-x-2 rounded-2xl bg-gray-100/80 p-2 backdrop-blur-sm dark:bg-gray-800/80">
                            {pages.map((page) => {
                                const Icon = page.icon;
                                const isActive = activePage === page.name;

                                return (
                                    <button
                                        key={page.name}
                                        onClick={() => setActivePage(page.name)}
                                        className={`relative flex transform items-center space-x-2 rounded-xl px-6 py-3 font-medium transition-all duration-300 ${
                                            isActive
                                                ? `bg-gradient-to-r ${page.color} scale-105 text-white shadow-lg`
                                                : "hover:scale-102 text-gray-600 hover:bg-white/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                        } `}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                                        <span>{page.name}</span>
                                        {isActive && (
                                            <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-white"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-12">
                <div
                    className={`min-h-[600px] rounded-3xl border border-gray-200/50 bg-white p-8 text-gray-900 shadow-xl dark:border-gray-800/50 dark:bg-gray-900 dark:text-gray-100`}
                >
                    {/* Gradient header per page */}
                    <div className={`mb-8 rounded-2xl bg-gradient-to-r p-6 shadow-lg ${currentPage.color}`}>
                        <h1 className="text-3xl font-bold text-white">{activePage}</h1>
                        <p className="text-white/80">
                            {activePage === "Category"
                                ? "Organize and manage your product categories"
                                : activePage === "Inventory"
                                  ? "Track and manage your stock levels"
                                  : "Deploy and manage your releases"}
                        </p>
                    </div>

                    {pageContent[activePage]}
                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8">
                <button
                    className={`h-14 w-14 rounded-2xl bg-gradient-to-r text-white shadow-2xl transition-all duration-300 hover:rotate-12 hover:scale-110 ${currentPage.color} `}
                >
                    <currentPage.icon className="mx-auto h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

export default InventoryLayout;
