import React, { useContext } from 'react';
import { InsuranceDisplayContext } from "../../contexts/InsuranceContext/InsuranceContext";

const InsuranceFormModal = ({
  isOpen,
  onClose,
  formData,
  handleChange,
  handleSubmitAdd,
  handleSubmitEdit,
  editingRecordId,
}) => {
  const { AddInsurance, UpdateInsurance } = useContext(InsuranceDisplayContext);
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingRecordId) {
      await UpdateInsurance(editingRecordId, formData);
    } else {
      await AddInsurance(formData);
    }
  };

  return (
<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 dark:bg-transparent p-2 sm:p-4">

      <div className="relative w-full max-w-3xl rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl sm:p-6 dark:border-gray-600 dark:bg-gray-900 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl font-bold leading-none text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="mt-2 mb-4 text-center text-xl font-bold text-gray-700 sm:text-2xl dark:text-white">
          {editingRecordId ? "Edit Insurance Information" : "Add New Insurance Information"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {/* Patient ID */}
          <div>
            <label htmlFor="patient_id" className="mb-1 block text-sm font-medium text-gray-700 dark:text-blue-100">
              Patient ID (Card ID)
            </label>
            <input
              type="text"
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              placeholder="e.g., P-001"
              className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Insurance Provider */}
          <div>
            <label htmlFor="insurance_provider" className="mb-1 block text-sm font-medium text-gray-700 dark:text-blue-100">
              Insurance Provider
            </label>
            <input
              type="text"
              id="insurance_provider"
              name="insurance_provider"
              value={formData.insurance_provider}
              onChange={handleChange}
              placeholder="e.g., PhilHealth, Sun Life"
                           className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Policy Number */}
          <div>
            <label htmlFor="policy_number" className="mb-1 block text-sm font-medium text-gray-700 dark:text-blue-100">
              Policy Number
            </label>
            <input
              type="text"
              id="policy_number"
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
              placeholder="e.g., ABC-123456789"
                           className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Valid From */}
          <div>
            <label htmlFor="valid_from" className="mb-1 block text-sm font-medium text-gray-700 dark:text-blue-100">
              Valid From
            </label>
            <input
              type="date"
              id="valid_from"
              name="valid_from"
              value={formData.valid_from}
              onChange={handleChange}
                           className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Valid Until */}
          <div>
            <label htmlFor="valid_until" className="mb-1 block text-sm font-medium text-gray-700 dark:text-blue-100">
              Valid Until
            </label>
            <input
              type="date"
              id="valid_until"
              name="valid_until"
              value={formData.valid_until}
              onChange={handleChange}
                           className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Coverage Details */}
          <div className="sm:col-span-2">
            <label htmlFor="coverage_details" className="mb-1 block text-sm font-medium text-gray-700 dark:text-blue-100">
              Coverage Details
            </label>
            <textarea
              id="coverage_details"
              name="coverage_details"
              value={formData.coverage_details}
              onChange={handleChange}
              rows="3"
              placeholder="e.g., Inpatient and Outpatient services, Dental coverage"
                            className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-white"
            ></textarea>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {editingRecordId ? "Update Insurance Details" : "Save Insurance Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceFormModal;
