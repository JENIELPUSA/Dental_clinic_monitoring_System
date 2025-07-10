import React, { useState } from "react";
import { Wallet } from "lucide-react";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";

const RecordPaymentModal = ({
  isOpen,
  closePaymentModal,
  billToPay,
  paymentAmount,
  handlePaymentAmountChange,
  handleRecordPayment,
  theme,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleRecordPayment(e);
    } catch (err) {
      console.error("Failed to record payment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-600 bg-opacity-75 p-4 dark:bg-gray-900 dark:bg-opacity-85">
      <div className="w-full max-w-md scale-100 transform rounded-xl bg-white p-6 opacity-100 shadow-2xl transition-all duration-300 md:p-8 dark:bg-gray-800 dark:border dark:border-blue-800/50">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-blue-200">
          Record Payment
        </h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-blue-300">Patient Name:</label>
            <p className="rounded-lg bg-gray-100 p-3 text-gray-800 dark:bg-blue-900/50 dark:text-blue-300">
              {billToPay.patient_name}
            </p>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-blue-300">Bill ID:</label>
            <p className="rounded-lg bg-gray-100 p-3 text-gray-800 dark:bg-blue-900/50 dark:text-blue-300">
              {billToPay._id}
            </p>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-blue-300">Remaining Balance:</label>
            <p className="rounded-lg bg-gray-100 p-3 font-bold text-gray-800 dark:bg-blue-900/50 dark:text-blue-300">
              ₱
              {(typeof billToPay.balance === "number"
                ? billToPay.balance
                : parseFloat(billToPay.balance) || 0
              ).toFixed(2)}
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="payment_amount"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-blue-300"
            >
              Amount to Pay
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-blue-400">
                ₱
              </span>
              <input
                type="number"
                id="payment_amount"
                name="payment_amount"
                value={paymentAmount}
                onChange={handlePaymentAmountChange}
                min="0.01"
                step="0.01"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-blue-700 dark:bg-blue-900/30 dark:text-white dark:focus:ring-green-400 disabled:opacity-50"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closePaymentModal}
              disabled={isLoading}
              className="transform rounded-lg bg-gray-300 px-6 py-3 text-gray-800 shadow-md transition duration-300 hover:scale-105 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 dark:focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="transform rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition duration-300 hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
        {isLoading && <LoadingOverlay message="Recording payment..." />}
      </div>
    </div>
  );
};

export default RecordPaymentModal;
