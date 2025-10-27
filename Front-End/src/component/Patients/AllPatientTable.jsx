// components/AllPatientTable.jsx
import { useContext, useState, useEffect } from "react";
import { PatientDisplayContext } from "../../contexts/PatientContext/PatientContext";
import { PencilIcon, TrashIcon, UserRoundPlus, User } from "lucide-react";
import PatientFormModal from "./AddFormPatients";
import Register from "../Login/Register";
import StatusVerification from "../../ReusableFolder/StatusModal";
import TreatmentResultModal from "./TreatmentResultModal";
import { AuthContext } from "../../contexts/AuthContext";

// Mobile Skeleton Card
const MobileSkeletonCard = () => (
  <div className="animate-pulse rounded-lg border border-blue-100 p-4 dark:border-blue-800/30">
    <div className="h-4 w-3/4 rounded bg-blue-100 dark:bg-blue-800/40 mb-2"></div>
    <div className="h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40 mb-1"></div>
    <div className="h-3 w-5/6 rounded bg-blue-100 dark:bg-blue-800/40 mb-3"></div>
    <div className="flex justify-between">
      <div className="h-6 w-16 rounded bg-blue-100 dark:bg-blue-800/40"></div>
      <div className="h-6 w-12 rounded bg-blue-100 dark:bg-blue-800/40"></div>
    </div>
  </div>
);

const AllPatientTable = () => {
  const { role } = useContext(AuthContext);
  const {
    patients = [],
    DeleteNewBorn,
    TotalPatients,
    TotalPages,
    currentPage,
    loading,
    fetchPatientData,
  } = useContext(PatientDisplayContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [PatientSelect, setPatientSelect] = useState(null);
  const [isRegisterModal, setRegisterModal] = useState(false);
  const [treatmentResultModalOpen, setTreatmentResultModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isVerification, setVerification] = useState(false);
  const [isDeleteID, setIsDeleteId] = useState("");
  const itemsPerPage = 5;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPatientData({
        page: 1,
        search: searchTerm || undefined,
      });
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  useEffect(() => {
    if (!loading && patients.length === 0 && TotalPatients === undefined) {
      fetchPatientData({ page: 1 });
    }
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= TotalPages) {
      fetchPatientData({
        page,
        search: searchTerm || undefined,
      });
    }
  };

  const handleRowClick = (patient) => {
    setSelectedPatientId(patient._id);
    setTreatmentResultModalOpen(true);
  };

  const onPatientSelect = (patient) => {
    setModalOpen(true);
    setPatientSelect(patient);
  };

  const handleDeleteUser = (patientId) => {
    setIsDeleteId(patientId);
    setVerification(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteNewBorn(isDeleteID);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setVerification(false);
  };

  const onAddPatient = () => {
    setRegisterModal(true);
  };

  const closeTreatmentResultModal = () => {
    setTreatmentResultModalOpen(false);
    setSelectedPatientId(null);
  };

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, TotalPatients || 0);

  return (
    //  FIXED: Removed xs:p-0 2xs:p-0 → keep consistent padding
    <div className="w-full rounded-2xl bg-white p-4 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200 sm:text-xl">New Patients</h2>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* DESKTOP: Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
        {/* ... (walang binago sa desktop table) ... */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">No.</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Avatar</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">PatientID</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Name</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Gender</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">DOB</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Email</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Emergency Contact</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Contact #</th>
              <th className="border px-3 py-2.5 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Date Created</th>
              <th className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPatient();
                    }}
                    className="rounded p-1.5 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-300/10"
                    aria-label="Add patient"
                  >
                    <UserRoundPlus className="h-4 w-4 stroke-blue-500 dark:stroke-blue-500" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <tr
                  key={patient._id}
                  className="cursor-pointer border-b border-blue-100 hover:bg-blue-50/50 dark:border-blue-800/30 dark:hover:bg-blue-900/20"
                  onClick={() => handleRowClick(patient)}
                >
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {patient.avatar ? (
                      <img
                        src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${patient.avatar.replace(/\\/g, "/")}`}
                        alt={`${patient.first_name} ${patient.last_name} Avatar`}
                        className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 sm:h-10 sm:w-10">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-200" />
                      </div>
                    )}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {patient._id?.substring(0, 8) || "N/A"}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {`${patient.first_name || "N/A"} ${patient.last_name || "N/A"}`}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {patient.gender || "N/A"}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {formatDate(patient.dob)}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {patient.email || "N/A"}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {patient.emergency_contact_name || "N/A"}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {patient.emergency_contact_number || "N/A"}
                  </td>
                  <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                    {formatDate(patient.created_at)}
                  </td>
                  <td className="border px-3 py-2.5 text-center dark:border-blue-800/50">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatientSelect(patient);
                        }}
                        className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4 stroke-blue-500 dark:stroke-blue-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-3 py-6 text-center text-blue-800 dark:text-blue-200">
                  {loading ? "Loading..." : "No patients found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE: Card View —  AYOS NA PADDING */}
      <div className="md:hidden space-y-3"> {/* space-y-3 for tighter but clean spacing */}
        {loading ? (
          [...Array(5)].map((_, i) => <MobileSkeletonCard key={i} />)
        ) : patients.length > 0 ? (
          patients.map((patient) => (
            //  Added relative so absolute edit button works
            <div
              key={patient._id}
              className="relative rounded-lg border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-800/30 dark:bg-blue-900/20"
              onClick={() => handleRowClick(patient)}
            >
              {/* Edit Button - now properly positioned */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPatientSelect(patient);
                }}
                className="absolute right-3 top-3 p-1.5 text-blue-500 hover:bg-blue-100 rounded-full dark:text-blue-300 dark:hover:bg-blue-800/30"
                title="Edit"
                aria-label="Edit patient"
              >
                <PencilIcon className="h-4 w-4" />
              </button>

              {/* Avatar & Name */}
              <div className="flex items-start gap-3 mb-3">
                {patient.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${patient.avatar.replace(/\\/g, "/")}`}
                    alt={`${patient.first_name} ${patient.last_name} Avatar`}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-blue-800 dark:text-blue-200 truncate">
                    {`${patient.first_name || "N/A"} ${patient.last_name || "N/A"}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    ID: {patient._id?.substring(0, 6) || "N/A"}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 space-y-1">
                <div className="truncate">
                  <span className="font-medium">DOB:</span> {formatDate(patient.dob)}
                </div>
                <div className="truncate">
                  <span className="font-medium">Gender:</span> {patient.gender || "N/A"}
                </div>
                <div className="truncate">
                  <span className="font-medium">Email:</span> {patient.email || "N/A"}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-0.5">
                <p className="truncate">
                  <span className="font-medium">Emergency:</span> {patient.emergency_contact_name || "N/A"}
                </p>
                <p className="truncate">
                  <span className="font-medium">Contact #:</span> {patient.emergency_contact_number || "N/A"}
                </p>
              </div>

              {/* Created Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Joined: {formatDate(patient.created_at)}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-blue-800 dark:text-blue-200">
            {loading ? "Loading..." : "No patients found"}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && TotalPages > 1 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Showing <span className="font-medium">{startEntry}</span> to{" "}
            <span className="font-medium">{endEntry}</span> of{" "}
            <span className="font-medium">{TotalPatients || 0}</span> entries
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className={`rounded border px-2 py-1 text-sm ${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                  : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
              }`}
            >
              «
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`rounded border px-2 py-1 text-sm ${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                  : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
              }`}
            >
              ‹
            </button>

            <button className="rounded border bg-blue-100 px-2 py-1 font-bold text-sm text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
              {currentPage}
            </button>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === TotalPages}
              className={`rounded border px-2 py-1 text-sm ${
                currentPage === TotalPages
                  ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                  : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
              }`}
            >
              ›
            </button>
            <button
              onClick={() => goToPage(TotalPages)}
              disabled={currentPage === TotalPages}
              className={`rounded border px-2 py-1 text-sm ${
                currentPage === TotalPages
                  ? "cursor-not-allowed opacity-50 dark:text-blue-200"
                  : "text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/20"
              }`}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PatientFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={PatientSelect}
      />
      <Register
        isOpen={isRegisterModal}
        role="patient"
        onClose={() => setRegisterModal(false)}
      />
      <StatusVerification
        isOpen={isVerification}
        onConfirmDelete={handleConfirmDelete}
        onClose={handleCloseModal}
      />
      <TreatmentResultModal
        isOpen={treatmentResultModalOpen}
        onClose={closeTreatmentResultModal}
        patientId={selectedPatientId}
      />
    </div>
  );
};

export default AllPatientTable;