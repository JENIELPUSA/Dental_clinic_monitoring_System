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
        if (initialData) {
            const result = await UpdatePatient(initialData._id, formData);
            if (result?.success) {
            onClose();
            resetForm();
        }
        } else {
            await AddNewBorn(formData, userId);
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // Background overlay with blur and responsive padding
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md px-4 py-6 sm:px-6 md:px-8"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-lg dark:border dark:border-blue-800/50 dark:bg-blue-900/20"
                    >
                        <h2 className="mb-5 text-center text-xl font-bold text-blue-800 dark:text-blue-200">
                            {initialData?._id ? "Edit Patient" : "Add New Patient"}
                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-full border-2 border-blue-300 dark:border-blue-800/50">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                            <svg
                                                className="h-10 w-10 text-blue-400 dark:text-blue-500"
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
                                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
                                    >
                                        {previewImage ? "Change" : "Upload"}
                                    </button>
                                    {previewImage && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewImage(null);
                                                setFormData((prev) => ({ ...prev, avatar: null }));
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Form Fields in 2 Columns */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* First Name */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Gender */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Emergency Contact Name */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        name="emergency_contact_name"
                                        value={formData.emergency_contact_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                {/* Emergency Contact Number */}
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Emergency Contact Number</label>
                                    <input
                                        type="tel"
                                        name="emergency_contact_number"
                                        value={formData.emergency_contact_number}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-blue-800 hover:bg-gray-50 dark:border-blue-800/50 dark:text-blue-200 dark:hover:bg-blue-900/30"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
                                >
                                    {initialData._id ? "Update" : "Submit"}
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
