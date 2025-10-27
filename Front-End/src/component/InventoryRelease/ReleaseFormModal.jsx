import React, { useState, useEffect } from "react";

const ReleaseFormModal = ({ isOpen, onClose, releaseHistory, onSubmit }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem("");
      setSerialNumber("");
      setMessage("");
      setMessageType("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      setMessage("❌ Please select an item first.");
      setMessageType("error");
      return;
    }

    setMessage("⏳ Processing...");
    setMessageType("info");

    try {
      await onSubmit(selectedItem, serialNumber);
      setMessage("✅ Successfully recorded! Stock has been deducted.");
      setMessageType("success");

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong.";
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 pt-10 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 focus:outline-none sm:right-4 sm:top-4"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-center text-xl font-bold text-gray-800 sm:text-2xl">
          Deduct Stock
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="itemSelect"
              className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm"
            >
              Select Item:
            </label>
            <select
              id="itemSelect"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-2.5"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">--Select an Item--</option>
              {releaseHistory.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.itemName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="serialNumber"
              className="mb-1 block text-xs font-semibold text-gray-700 sm:text-sm"
            >
              Serial Number:
            </label>
            <input
              type="text"
              id="serialNumber"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-2.5"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Enter serial number (optional)"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:py-3 sm:text-base"
          >
            Submit
          </button>
        </form>

        {message && (
          <div
            className={`mt-3 rounded-lg p-2.5 text-center text-sm font-semibold sm:mt-4 sm:p-3 sm:text-base ${
              messageType === "success"
                ? "bg-green-100 text-green-800"
                : messageType === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseFormModal;