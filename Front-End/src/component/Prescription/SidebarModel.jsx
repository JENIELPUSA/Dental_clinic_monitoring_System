// SidebarModal.jsx (DAPAT MONG GAWIN)
import React from 'react';
import { X } from 'lucide-react';

const SidebarModal = ({ isOpen, onClose, title, children, customWidth = "max-w-md" }) => {
    // Base classes for the sidebar
    const sidebarClasses = `fixed top-0 right-0 h-full bg-white dark:bg-blue-950 shadow-2xl transition-transform duration-300 ease-in-out z-[1000] ${customWidth}`;
    
    // Transform class for slide-in/out
    const transformClass = isOpen ? 'translate-x-0' : 'translate-x-full';
    
    // Backdrop class
    const backdropClasses = `fixed inset-0 bg-black/50 transition-opacity duration-300 z-[999] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;

    if (!isOpen && transformClass === 'translate-x-full') return null;

    return (
        <>
            <div className={backdropClasses} onClick={onClose} />
            
            <div className={`${sidebarClasses} ${transformClass}`}>
                <div className="flex items-center justify-between border-b p-4 dark:border-blue-800/50">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-500 dark:text-blue-300 dark:hover:bg-red-300/10"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                {/* Body Content (The PDF Viewer) */}
                <div className="h-[calc(100vh-65px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
};

export default SidebarModal;