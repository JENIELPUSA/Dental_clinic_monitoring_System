import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

const PostCareModal = ({ isOpen, onClose, onSubmit, selectedTreatment, existingPostCare }) => {
    
    const [formData, setFormData] = useState({
        instructions: "",
        medications: "",
        restrictions: "",
        follow_up_date: "",
    });

    // Load existing post-care (for Edit)
    useEffect(() => {
        if (existingPostCare) {
            setFormData({
                instructions: existingPostCare.instructions || "",
                medications: existingPostCare.medications || "",
                restrictions: existingPostCare.restrictions || "",
                follow_up_date: existingPostCare.follow_up_date?.split("T")[0] || "",
            });
        }
    }, [existingPostCare]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSubmit({ ...formData, treatmentId: selectedTreatment?._id });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-xl w-[95%] max-w-lg p-6 shadow-xl border dark:border-slate-700"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {existingPostCare ? "Update Post-Care" : "Add Post-Care"}
                    </h2>
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-red-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Treatment */}
                <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                    Treatment: <span className="font-medium">{selectedTreatment?.treatment_type}</span>
                </p>

                {/* Form */}
                <div className="space-y-3">

                    <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        placeholder="Post-Care Instructions"
                        className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        rows="3"
                    />

                    <textarea
                        name="medications"
                        value={formData.medications}
                        onChange={handleChange}
                        placeholder="Medications (if any)"
                        className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        rows="2"
                    />

                    <textarea
                        name="restrictions"
                        value={formData.restrictions}
                        onChange={handleChange}
                        placeholder="Restrictions (if any)"
                        className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        rows="2"
                    />

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Follow-up Date</label>
                        <input
                            type="date"
                            name="follow_up_date"
                            value={formData.follow_up_date}
                            onChange={handleChange}
                            className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end mt-5 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 dark:bg-slate-700 dark:text-white hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {existingPostCare ? "Update" : "Save"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PostCareModal;
