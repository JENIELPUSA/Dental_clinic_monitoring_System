import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorDisplayContext } from "../../contexts/DoctorContext/doctorContext";
import LoadingOverlay from "../../component/ReusableComponents/LoadingOverlay"; // ✅ Adjust path if different

const DoctorFormModal = ({ isOpen, onClose, initialData = {} }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        specialty: "",
        avatar: null,
    });

    const { UpdateDoctor, AddDoctor } = useContext(DoctorDisplayContext);
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // ✅ Loading state
    const fileInputRef = useRef(null);

    const ClearForm = () => {
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            contact_number: "",
            specialty: "",
            avatar: null,
        });
        setPreviewImage(null);
    };

    useEffect(() => {
        if (isOpen) {
            const {
                first_name = "",
                last_name = "",
                specialty = "",
                email = "",
                contact_number = "",
                avatar = null,
            } = initialData || {};

            setFormData({
                first_name,
                last_name,
                specialty,
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
        setIsLoading(true); // ✅ Start loading

        try {
            if (initialData && initialData._id) {
                await UpdateDoctor(initialData._id, formData);
            } else {
                await AddDoctor(formData);
            }
            setTimeout(() => {
                onClose();
                ClearForm();
            }, 1000);
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsLoading(false); // ✅ End loading
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999]  flex items-center justify-center bg-black/40 backdrop-blur-md px-4 py-6 sm:px-6 md:px-8"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative mx-auto w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:max-h-[90vh] sm:p-8"
                    >
                        <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-800 dark:text-blue-200">
                            {initialData?._id ? "Edit Doctor" : "Add New Doctor"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-blue-400 dark:border-blue-700">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                            <svg className="h-12 w-12 text-blue-400 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
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

                            {/* Input Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-200">Specialty</label>
                                    <input
                                        type="text"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border px-3 py-2 text-sm dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-blue-800 hover:bg-gray-100 dark:border-blue-700 dark:text-blue-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-800"
                                >
                                    {isLoading ? "Processing..." : initialData?._id ? "Update Doctor" : "Add Doctor"}
                                </button>
                            </div>
                        </form>

                        {/* ✅ Loading Spinner Overlay */}
                        {isLoading && <LoadingOverlay message="Saving doctor information..." />}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DoctorFormModal;
