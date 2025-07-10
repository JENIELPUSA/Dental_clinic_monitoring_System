import React, { useState, useEffect, useMemo } from 'react';
import { User, Stethoscope, Sun, Moon, Search, Calendar, MapPin, Phone, Mail, HeartPulse, X, Info } from 'lucide-react';

const getPatientAvatar = (patientInfo) => {
    if (patientInfo && patientInfo.avatar) {
        return patientInfo.avatar;
    }
    const initials = patientInfo && patientInfo.first_name && patientInfo.last_name
        ? `${patientInfo.first_name[0]}${patientInfo.last_name[0]}`.toUpperCase()
        : '??';
    
    const hashCode = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = "#";
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ("00" + value.toString(16)).substr(-2);
        }
        return color;
    };
    const bgColor = hashCode(initials).substring(1);
    const textColor = 'FFFFFF';

    return `https://placehold.co/40x40/${bgColor}/${textColor}?text=${initials}`;
};

const PatientProfileCard = ({ patient, onClose }) => {
    if (!patient) return null;

    return (
        <div className="relative p-6 rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-blue-300 dark:border-gray-600 flex-shrink-0 w-full md:w-80 lg:w-96 overflow-y-auto">
            <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={onClose}
                aria-label="Close profile card"
            >
                <X size={24} />
            </button>
            <div className="flex flex-col items-center mb-6">
                <img
                    src={getPatientAvatar(patient)}
                    alt={`${patient.first_name} ${patient.last_name}`}
                    className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 dark:border-blue-400 mb-3"
                />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.first_name} {patient.last_name}</h3>
                <p className="text-md text-gray-600 dark:text-gray-300">{patient.email}</p>
            </div>
            <div className="text-base text-gray-700 dark:text-gray-200 space-y-3">
                <p className="flex items-center"><User size={18} className="mr-2 text-blue-500" /> Kasarian: <span className="font-semibold ml-2">{patient.gender}</span></p>
                <p className="flex items-center"><Calendar size={18} className="mr-2 text-blue-500" /> Petsa ng Kapanganakan: <span className="font-semibold ml-2">{patient.dob}</span></p>
                <p className="flex items-center"><MapPin size={18} className="mr-2 text-blue-500" /> Address: <span className="font-semibold ml-2">{patient.address}</span></p>
                <p className="flex items-center text-lg font-semibold text-red-600 dark:text-red-400"><HeartPulse size={20} className="mr-2" /> Emergency Contact</p>
                <p className="flex items-center"><User size={18} className="mr-2 text-red-500" /> Pangalan: <span className="font-semibold ml-2">{patient.emergency_contact_name}</span></p>
                <p className="flex items-center"><Phone size={18} className="mr-2 text-red-500" /> Numero: <span className="font-semibold ml-2">{patient.emergency_contact_number}</span></p>
            </div>
        </div>
    );
};

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('theme');
            return savedMode === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }, [isDarkMode]);

    const allPatients = useMemo(() => [
        {
            _id: "pat1", first_name: "Juan", last_name: "Dela Cruz", avatar: null, gender: "Male", email: "juan.dc@example.com",
            dob: "1990-05-15", address: "123 Mabini St., Cityville, PH", emergency_contact_name: "Maria Dela Cruz", emergency_contact_number: "0917-123-4567", doctor_id: "doc1"
        },
        {
            _id: "pat2", first_name: "Maria", last_name: "Santos", avatar: null, gender: "Female", email: "maria.s@example.com",
            dob: "1988-11-22", address: "456 Rizal Ave., Townsville, PH", emergency_contact_name: "Jose Santos", emergency_contact_number: "0918-987-6543", doctor_id: "doc1"
        },
        {
            _id: "pat3", first_name: "Pedro", last_name: "Penduko", avatar: "https://placehold.co/40x40/007bff/ffffff?text=PP", gender: "Male", email: "pedro.p@example.com",
            dob: "1975-01-01", address: "789 Bonifacio St., Villageton, PH", emergency_contact_name: "Clara Penduko", emergency_contact_number: "0920-111-2222", doctor_id: "doc2"
        },
        {
            _id: "pat4", first_name: "Gabriela", last_name: "Silang", avatar: null, gender: "Female", email: "gab.s@example.com",
            dob: "1995-03-10", address: "101 Katipunan Rd., Metro City, PH", emergency_contact_name: "Diego Silang", emergency_contact_number: "0921-333-4444", doctor_id: "doc2"
        },
        {
            _id: "pat5", first_name: "Crisostomo", last_name: "Ibarra", avatar: null, gender: "Male", email: "cris.i@example.com",
            dob: "1980-07-20", address: "202 Noli Me Tangere St., Litera City, PH", emergency_contact_name: "Elias Ibarra", emergency_contact_number: "0922-555-6666", doctor_id: "doc3"
        },
        {
            _id: "pat6", first_name: "Sisa", last_name: "Rivera", avatar: null, gender: "Female", email: "sisa.r@example.com",
            dob: "1985-02-28", address: "303 Forest Ln., Quiet Town, PH", emergency_contact_name: "Basilio Rivera", emergency_contact_number: "0930-123-4567", doctor_id: "doc1"
        },
        {
            _id: "pat7", first_name: "Basilio", last_name: "Rivera", avatar: null, gender: "Male", email: "basilio.r@example.com",
            dob: "1987-09-01", address: "303 Forest Ln., Quiet Town, PH", emergency_contact_name: "Sisa Rivera", emergency_contact_number: "0930-123-4567", doctor_id: "doc1"
        },
        {
            _id: "pat8", first_name: "Don", last_name: "Rafael", avatar: null, gender: "Male", email: "don.r@example.com",
            dob: "1960-12-05", address: "505 Grand Blvd., Old City, PH", emergency_contact_name: "Doña Consolacion", emergency_contact_number: "0940-987-6543", doctor_id: "doc2"
        },
        {
            _id: "pat9", first_name: "Maria", last_name: "Clara", avatar: null, gender: "Female", email: "mc.c@example.com",
            dob: "1992-04-03", address: "606 Convent Rd., Peaceful Village, PH", emergency_contact_name: "Capitan Tiago", emergency_contact_number: "0950-111-2233", doctor_id: "doc3"
        },
        {
            _id: "pat10", first_name: "Elias", last_name: "Reyes", avatar: null, gender: "Male", email: "elias.r@example.com",
            dob: "1983-08-18", address: "707 Hidden Path, Secret Lake, PH", emergency_contact_name: "Isagani", emergency_contact_number: "0960-444-5566", doctor_id: "doc1"
        },
        {
            _id: "pat11", first_name: "Juliana", last_name: "De La Cruz", avatar: null, gender: "Female", email: "julie.dc@example.com",
            dob: "1991-01-25", address: "808 Sunshine St., Bright City, PH", emergency_contact_name: "Mang Tonyo", emergency_contact_number: "0970-777-8899", doctor_id: "doc2"
        },
        {
            _id: "pat12", first_name: "Fidel", last_name: "Fernandez", avatar: null, gender: "Male", email: "fidel.f@example.com",
            dob: "1978-06-30", address: "909 Mountain View, Highlands, PH", emergency_contact_name: "Aling Nena", emergency_contact_number: "0980-101-2020", doctor_id: "doc3"
        },
    ], []);

    const doctors = useMemo(() => [
        { _id: "all", first_name: "Lahat", last_name: "ng Doktor" },
        { _id: "doc1", first_name: "Nellisa", last_name: "Amistoso" },
        { _id: "doc2", first_name: "Jose", last_name: "Rizal" },
        { _id: "doc3", first_name: "Andres", last_name: "Bonifacio" },
    ], []);

    const [selectedDoctorId, setSelectedDoctorId] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null); // Changed from hoveredPatient to selectedPatient

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage] = useState(5); // 5 patients per page

    const filteredPatients = useMemo(() => {
        let filtered = allPatients;
        if (selectedDoctorId !== "all") {
            filtered = filtered.filter(patient => patient.doctor_id === selectedDoctorId);
        }
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(patient => 
                patient.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                patient.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                patient.email.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        return filtered;
    }, [allPatients, selectedDoctorId, searchTerm]);

    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setSelectedPatient(null); // Clear selected patient when changing page
        }
    };


    useEffect(() => {
        setCurrentPage(1);
        setSelectedPatient(null); 
    }, [selectedDoctorId, searchTerm]);

    const handleViewDetailsClick = (patient) => {
        setSelectedPatient(patient);
    };

    const handleCloseProfileCard = () => {
        setSelectedPatient(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300 p-4">
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setIsDarkMode(prevMode => !prevMode)}
                    className="p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? (
                        <Moon className="h-6 w-6" />
                    ) : (
                        <Sun className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Main Content Area: Patient List and Profile Card */}
            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 transform transition-transform hover:scale-[1.01] duration-300 mt-12 flex flex-col md:flex-row gap-8"> {/* Added flex-col md:flex-row and gap */}
                {/* Patient List Section */}
                <div className={`flex-grow ${selectedPatient ? 'md:w-2/3' : 'w-full'} transition-all duration-300`}> {/* Adjusted width based on profile card visibility */}
                    <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8 flex items-center justify-center">
                        <User size={32} className="mr-3" /> Mga Pasyente Ayon sa Doktor
                    </h2>

                    {/* Filter and Search Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                        {/* Doctor Filter Dropdown */}
                        <div className="w-full sm:w-1/2">
                            <label htmlFor="doctor-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pumili ng Doktor:
                            </label>
                            <select
                                id="doctor-filter"
                                value={selectedDoctorId}
                                onChange={(e) => setSelectedDoctorId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                            >
                                {doctors.map(doctor => (
                                    <option key={doctor._id} value={doctor._id}>
                                        {doctor.first_name} {doctor.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full sm:w-1/2">
                            <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maghanap ng Pasyente:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="patient-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                                    placeholder="Pangalan o Email"
                                />
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                            </div>
                        </div>
                    </div>

                    {/* Patient List/Cards */}
                    <div className="space-y-6">
                        {currentPatients.length > 0 ? (
                            currentPatients.map(patient => (
                                <div 
                                    key={patient._id} 
                                    className="relative p-5 border border-gray-200 rounded-lg shadow-md flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
                                >
                                    <img
                                        src={getPatientAvatar(patient)}
                                        alt={`${patient.first_name} ${patient.last_name}`}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400 flex-shrink-0"
                                        onError={(e) => { e.target.onerror = null; e.target.src = getPatientAvatar(patient); }}
                                    />
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                            <User size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                                            {patient.first_name} {patient.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                                            <Stethoscope size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                                            Doktor: {doctors.find(doc => doc._id === patient.doctor_id)?.first_name} {doctors.find(doc => doc._id === patient.doctor_id)?.last_name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                                            Email: {patient.email}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleViewDetailsClick(patient)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                                    >
                                        Tingnan Detalye
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600 dark:text-gray-400 p-4">Walang pasyente na makikita para sa napiling doktor o search term.</p>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredPatients.length > patientsPerPage && (
                        <nav className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => paginate(index + 1)}
                                    className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white dark:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Next
                            </button>
                        </nav>
                    )}
                </div>
                <div className={`transition-all duration-300 ${selectedPatient ? 'block' : 'hidden'} md:block`}>
                    {selectedPatient ? (
                        <PatientProfileCard
                            patient={selectedPatient}
                            onClose={handleCloseProfileCard}
                        />
                    ) : (
                         <div className="hidden md:flex flex-col items-center justify-center h-full w-full md:w-80 lg:w-96 p-6 rounded-xl shadow-inner bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-center">
                            <Info size={48} className="mb-4" />
                            <p className="text-lg">Pumili ng pasyente upang makita ang kanyang profile dito.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
