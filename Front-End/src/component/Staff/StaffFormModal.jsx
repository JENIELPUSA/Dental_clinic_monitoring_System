import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaffDisplayContext } from "../../contexts/StaffContext/StaffContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay";

const StaffFormModal = ({ isOpen, onClose, initialData = {} }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    avatar: null,
  });

  const { UpdateStaff } = useContext(StaffDisplayContext);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const ClearForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      contact_number: "",
      avatar: null,
    });
    setPreviewImage(null);
  };

  useEffect(() => {
    if (isOpen) {
      const { first_name = "", last_name = "", email = "", contact_number = "", avatar = null } = initialData || {};

      setFormData({
        first_name,
        last_name,
        email,
        contact_number,
        avatar: null,
      });

      if (typeof avatar === "string") {
        setPreviewImage(avatar);
      } else {
        setPreviewImage(null);
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setIsLoading(true);

    try {
      if (initialData && initialData._id) {
        const result = await UpdateStaff(initialData._id, formData);
        if (result?.success) {
          onClose();
          ClearForm();
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
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
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-md p-4 pt-8 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl dark:border dark:border-blue-800/50 dark:bg-blue-900/20"
          >
            <h2 className="mb-4 text-center text-lg font-bold text-blue-800 dark:text-blue-200 sm:text-xl">
              {initialData?._id ? "Edit Doctor" : "Add New Doctor"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-3 border-blue-400 dark:border-blue-700 sm:h-24 sm:w-24">
                  {previewImage ? (
                    <img
                      src={previewImage}
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
                <div className="flex flex-col items-center space-y-1">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full max-w-[180px] rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 h-10"
                  >
                    {previewImage ? "Change Photo" : "Upload Photo"}
                  </button>
                  {previewImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, avatar: null }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white h-11"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white h-11"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white h-11"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-gray-100 dark:border-blue-700 dark:text-blue-200 h-11 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-800 dark:hover:bg-blue-700 h-11 sm:w-auto"
                >
                  {isLoading ? "Processing..." : initialData?._id ? "Update Doctor" : "Add Doctor"}
                </button>
              </div>
            </form>

            {isLoading && <LoadingOverlay message="Saving doctor information..." />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StaffFormModal;