import React from 'react';
import { Loader2, FileText } from 'lucide-react';
import SidebarModal from './SidebarModel'; 

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, isLoading, selectedPrescription }) => {
    
    const title = isLoading 
        ? "Loading Prescription PDF..." 
        : (pdfUrl ? `Prescription PDF: ${selectedPrescription?._id || 'View Document'}` : "PDF Not Available");

    return (
        <SidebarModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
        >
            <div className="flex h-full flex-col bg-white dark:bg-blue-900/50">
                
                {/* Main Content Area - Takes available space */}
                <div className="flex-grow overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex h-full flex-col items-center justify-center text-blue-800 dark:text-blue-200">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            <p>Loading PDF...</p>
                        </div>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title={`Prescription: ${selectedPrescription?._id}`}
                            className="w-full h-full min-h-[400px] border-none"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center text-red-500 dark:text-red-300">
                            <FileText className="h-10 w-10 mb-3" />
                            <p className="font-semibold">Error: PDF could not be loaded or is not available.</p>
                            
                            {pdfUrl === null && selectedPrescription?._id && (
                                <p className='mt-4 text-sm'>
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline text-blue-500 dark:text-blue-300 hover:text-blue-600"
                                        download={`Prescription_${selectedPrescription._id}.pdf`}
                                    >
                                        Click here to attempt download
                                    </a>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Stays at bottom but doesn't push content */}
                <div className="shrink-0 border-t border-gray-200 dark:border-blue-700 bg-white dark:bg-blue-900 p-4 mt-auto">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedPrescription?._id && `Prescription ID: ${selectedPrescription._id}`}
                        </div>
                        <div className="flex space-x-2">
                            {pdfUrl && (
                                <>
                                    <button
                                        onClick={() => window.open(pdfUrl, '_blank')}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Open in New Tab
                                    </button>
                                    <a
                                        href={pdfUrl}
                                        download={`Prescription_${selectedPrescription?._id || 'document'}.pdf`}
                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                        Download
                                    </a>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarModal>
    );
};

export default PdfViewerModal;