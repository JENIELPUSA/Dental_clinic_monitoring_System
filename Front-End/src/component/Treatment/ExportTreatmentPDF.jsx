import React from "react";

const ExportPdfModal = ({
  isOpen,
  onClose,
  onGenerate,
  exportDates,
  setExportDates,
  exportPatientName,
  setExportPatientName,
  exportDescription,
  setExportDescription,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-blue-900 dark:text-white">
        <h3 className="mb-4 text-lg font-bold text-blue-700 dark:text-blue-200">
          Export Treatment Report
        </h3>

        {/* Filter Inputs */}
        <div className="flex flex-col gap-3">
          {/* Date Range */}
          <div>
            <label className="text-sm font-medium">From</label>
            <input
              type="date"
              value={exportDates.from}
              onChange={(e) => setExportDates((p) => ({ ...p, from: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:bg-blue-800/40"
            />
          </div>

          <div>
            <label className="text-sm font-medium">To</label>
            <input
              type="date"
              value={exportDates.to}
              onChange={(e) => setExportDates((p) => ({ ...p, to: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:bg-blue-800/40"
            />
          </div>

          {/* Patient Name */}
          <div>
            <label className="text-sm font-medium">Patient Name</label>
            <input
              type="text"
              value={exportPatientName}
              onChange={(e) => setExportPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:bg-blue-800/40 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={exportDescription}
              onChange={(e) => setExportDescription(e.target.value)}
              placeholder="Enter treatment description"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:bg-blue-800/40 dark:text-white"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-blue-200 dark:hover:bg-blue-800/50"
          >
            Cancel
          </button>

          <button
            onClick={onGenerate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-95 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPdfModal;