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

      console.log("Selected Item ID:", selectedItem);

      setMessage("✅ Successfully recorded! Stock has been deducted.");
      setMessageType("success");

      setSelectedItem("");
      setSerialNumber("");

      setTimeout(() => {
        onClose(); // auto-close after success
      }, 1000);
    } catch (err) {
      let errorMessage =
        err.response?.data?.message || err.message || "Something went wrong.";
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-600 bg-opacity-50 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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

        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Deduct Stock
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="itemSelect"
              className="mb-1 block text-sm font-semibold text-gray-700"
            >
              Select Item:
            </label>
            <select
              id="itemSelect"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="mb-1 block text-sm font-semibold text-gray-700"
            >
              Serial Number:
            </label>
            <input
              type="text"
              id="serialNumber"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700"
          >
            Submit
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-lg p-3 text-center font-semibold ${
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
