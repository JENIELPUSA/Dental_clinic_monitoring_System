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
            <div className="flex h-full flex-col overflow-y-auto bg-white p-4 dark:bg-blue-900/50">
                
                <div className="flex-grow">
                    {isLoading ? (
                        <div className="flex h-full flex-col items-center justify-center text-blue-800 dark:text-blue-200">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            <p>Loading PDF...</p>
                        </div>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title={`Prescription: ${selectedPrescription?._id}`}
                            className="w-full h-[calc(100vh-150px)] border-none"
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
            </div>
        </SidebarModal>
    );
};

export default PdfViewerModal;