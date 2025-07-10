import React, { useState, useEffect, useContext } from "react";
import { Calendar, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchableSelect from "./SearchableSelect";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";
import { BillDisplayContext } from "../../contexts/BillContext/BillContext";

const ToggleSwitch = ({ label, isOn, handleToggle, disabled }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-blue-300">
          {label}
        </span>
        <label
          className={`flex items-center cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="relative">
            <input
              type="checkbox"
              className="hidden"
              checked={isOn}
              onChange={handleToggle}
              disabled={disabled}
            />
            <div
              className={`toggle-path w-12 h-6 rounded-full shadow-inner ${
                isOn ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            ></div>
            <div
              className={`toggle-circle absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                isOn ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
};

const BillFormModal = ({
  isOpen,
  closeModal,
  formData,
  handleChange,
  handleSubmit,
  currentBill,
  treatment,
  setFormData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerationAllowed, setIsPdfGenerationAllowed] = useState(false);
  const { GeneratePdf } = useContext(BillDisplayContext);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit(e);

      if (isPdfGenerationAllowed) {
        await GeneratePdf(formData.patient_id);
        console.log("Generated PDF for:", formData.patient_id);
      }

      setIsPdfGenerationAllowed(false); // reset toggle
      closeModal();
    } catch (err) {
      console.error("Error submitting bill:", err);
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-600 bg-opacity-75 p-4 dark:bg-gray-900 dark:bg-opacity-85"
        >
          <motion.div
            initial={{ scale: 0.9, y: -50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:border dark:border-blue-800/50 dark:bg-gray-800 md:p-8"
          >
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-blue-200">
              {currentBill ? "Edit Bill" : "Add New Bill"}
            </h2>

            <form onSubmit={onSubmit}>
              <SearchableSelect
                label="Treatment"
                name="treatment_id"
                value={formData.treatment_id}
                options={treatment}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    treatment_id: selected._id,
                    patient_id: selected.patient_id,
                    patient_name: selected.patient_name,
                    total_amount: parseFloat(
                      selected.cost || selected.treatment_cost || 0
                    ),
                  }));
                }}
                placeholder="Select a treatment"
                icon={User}
              />

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-300">
                  Bill Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-blue-400" />
                  <input
                    type="date"
                    name="bill_date"
                    value={formData.bill_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 dark:border-blue-700 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-300">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-blue-400">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    readOnly
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 dark:border-blue-700 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-300">
                  Amount Paid
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-blue-400">
                    ₱
                  </span>
                  <input
                    type="number"
                    name="amount_paid"
                    value={formData.amount_paid}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 dark:border-blue-700 dark:bg-blue-900/30 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-300">
                  Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-blue-400">
                    ₱
                  </span>
                  <input
                    type="text"
                    name="balance"
                    value={formData.balance}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 p-3 pl-10 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  />
                </div>
              </div>

              <ToggleSwitch
                label="Enable PDF Generation"
                isOn={isPdfGenerationAllowed}
                handleToggle={() =>
                  setIsPdfGenerationAllowed((prev) => !prev)
                }
                disabled={isLoading}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfGenerationAllowed(false);
                    closeModal();
                  }}
                  disabled={isLoading}
                  className="rounded-lg bg-gray-300 px-6 py-3 text-gray-800 hover:bg-gray-400 dark:bg-gray-600 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {currentBill ? "Save Changes" : "Add Bill"}
                </button>
              </div>
            </form>

            {isLoading && (
              <LoadingOverlay message="Processing bill, please wait..." />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BillFormModal;
