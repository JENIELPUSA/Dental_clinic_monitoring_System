import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PatientDisplayContext } from "../../contexts/PatientContext/PatientContext";

const PatientFormModal = ({ isOpen, onClose, initialData = {} }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "Male",
    dob: "",
    email: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    avatar: null,
  });

  const { UpdatePatient } = useContext(PatientDisplayContext);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        gender: initialData.gender || "Male",
        dob: initialData.dob || "",
        email: initialData.email || "",
        emergency_contact_name: initialData.emergency_contact_name || "",
        emergency_contact_number: initialData.emergency_contact_number || "",
        avatar: initialData.avatar || null,
      });
      setPreviewImage(initialData.avatar || null);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, avatar: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initialData?._id) {
      const result = await UpdatePatient(initialData._id, formData);
      if (result?.success) {
        onClose();
      }
    } else {
      console.warn("AddNewBorn and userId not implemented in this modal.");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-md p-3 pt-12 sm:p-4 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl bg-white p-4 sm:p-5 shadow-lg dark:border dark:border-blue-800/50 dark:bg-blue-900/20"
          >
            <h2 className="mb-4 text-center text-lg font-bold text-blue-800 dark:text-blue-200 sm:text-xl">
              {initialData?._id ? "Edit Patient" : "Add New Patient"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload — Smaller on mobile */}
              <div className="flex flex-col items-center">
                <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-blue-300 dark:border-blue-800/50 sm:h-24 sm:w-24">
                  {previewImage ? (
                    <img
                      src={typeof previewImage === "string" ? previewImage : URL.createObjectURL(previewImage)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                      <svg
                        className="h-8 w-8 text-blue-400 dark:text-blue-500 sm:h-10 sm:w-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-1.5 sm:space-y-2">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 sm:px-4 sm:py-2"
                  >
                    {previewImage ? "Change Photo" : "Upload Photo"}
                  </button>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, avatar: null }));
                      }}
                      className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 sm:space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                    />
                  </div>
                </div>

                {/* Gender & DOB */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                  />
                </div>

                {/* Emergency Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                  />
                </div>

                {/* Emergency Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_number"
                    value={formData.emergency_contact_number}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:py-2.5"
                  />
                </div>
              </div>

              {/* Action Buttons — Stacked on mobile */}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-gray-50 dark:border-blue-800/50 dark:text-blue-200 dark:hover:bg-blue-900/30 sm:w-auto sm:px-4 sm:py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 sm:w-auto sm:px-4 sm:py-2.5"
                >
                  {initialData?._id ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PatientFormModal;