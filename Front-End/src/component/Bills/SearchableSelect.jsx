import React, { useState, useEffect, useRef } from "react";

const SearchableSelect = ({ label, name, value, options, onChange, placeholder, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const selectedOption = options.find((option) => option._id === value);

const filteredOptions = options
  .filter(option => option.done === false) // handles undefined too
  .filter(
    (option) =>
      option._id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.patient_name && option.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (option.patient_address && option.patient_address.toLowerCase().includes(searchTerm.toLowerCase()))
  );


    const handleSelect = (option) => {
        // --- ADDED CONSOLE LOG HERE ---
        console.log("SearchableSelect: Full option object selected:", option);
        // -----------------------------
        onChange(option); // Pass the full treatment object to the parent's onChange
        setIsOpen(false);
        setSearchTerm("");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-blue-300">
                {label}
            </label>
            <div className="relative" ref={dropdownRef}>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full cursor-pointer items-center rounded-lg border border-gray-300 bg-white p-3 shadow-sm dark:border-blue-700 dark:bg-blue-900/30"
                >
                    {Icon && <Icon className="mr-3 text-gray-400 dark:text-blue-400" />}
                    <span className="flex-grow text-gray-800 dark:text-white">
                        {selectedOption ? selectedOption.patient_name : placeholder}
                    </span>
                    <svg
                        className={`ml-2 h-4 w-4 transform text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : "rotate-0"
                        } dark:text-blue-400`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                {isOpen && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg dark:border-blue-800 dark:bg-gray-800">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full border-b p-2 text-sm dark:bg-gray-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option._id}
                                    onClick={() => handleSelect(option)}
                                    className="cursor-pointer p-3 hover:bg-blue-50 dark:hover:bg-blue-800/50"
                                >
                                    <div className="font-semibold text-gray-800 dark:text-blue-200">
                                        {option.patient_name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-blue-400">
                                        Address: {option.patient_address}
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-300">
                                        ₱{option.treatment_cost} - Treatment Cost
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-gray-500 dark:text-blue-400">No results found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchableSelect;