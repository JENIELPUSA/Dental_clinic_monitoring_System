import React, { useState, useMemo, useCallback, useEffect } from 'react';
// Inalis ang 'react-calendar' imports dahil sa isyu sa pag-resolve.
// Gagamitin na lang ang standard HTML input type="date" para sa pagpili ng petsa.

// Mock Data (Palitan ito ng aktwal na data mula sa iyong backend)
const mockPatients = [
  { id: 'P001', name: 'Maria Dela Cruz', age: 30, gender: 'Female', contact: '09171234567' },
  { id: 'P002', name: 'Juan Reyes', age: 45, gender: 'Male', contact: '09187654321' },
  { id: 'P003', name: 'Sofia Garcia', age: 25, gender: 'Female', contact: '09191112233' },
  { id: 'P004', name: 'Jose Santos', age: 50, gender: 'Male', contact: '09204445566' },
  { id: 'P005', name: 'Ana Lim', age: 35, gender: 'Female', contact: '09217778899' },
  { id: 'P006', name: 'Pedro Mendoza', age: 40, gender: 'Male', contact: '09223334455' },
  { id: 'P007', name: 'Elena Torres', age: 28, gender: 'Female', contact: '09235556677' },
  { id: 'P008', name: 'Mark Co', age: 33, gender: 'Male', contact: '09179876543' },
  { id: 'P009', name: 'Grace Lee', age: 29, gender: 'Female', contact: '09181234567' },
  { id: 'P010', name: 'Robert Tan', age: 55, gender: 'Male', contact: '09192345678' },
];

const mockAppointments = [
  { id: 'A001', patientId: 'P001', patientName: 'Maria Dela Cruz', service: 'Dental Cleaning', date: '2025-06-16', time: '10:00 AM', status: 'Scheduled' },
  { id: 'A002', patientId: 'P002', patientName: 'Juan Reyes', service: 'Tooth Extraction', date: '2025-06-16', time: '02:00 PM', status: 'Completed' },
  { id: 'A003', patientId: 'P003', patientName: 'Sofia Garcia', service: 'Dental Filling', date: '2025-06-17', time: '09:30 AM', status: 'Scheduled' },
  { id: 'A004', patientId: 'P004', patientName: 'Jose Santos', service: 'Orthodontic Check-up', date: '2025-06-17', time: '01:00 PM', status: 'Canceled' },
  { id: 'A005', patientId: 'P001', patientName: 'Maria Dela Cruz', service: 'Teeth Whitening', date: '2025-06-18', time: '11:00 AM', status: 'Scheduled' },
  { id: 'A006', patientId: 'P005', patientName: 'Ana Lim', service: 'Dental Cleaning', date: '2025-06-18', time: '03:00 PM', status: 'Scheduled' },
  { id: 'A007', patientId: 'P008', patientName: 'Mark Co', service: 'Braces Adjustment', date: '2025-06-19', time: '09:00 AM', status: 'Scheduled' },
  { id: 'A008', patientId: 'P009', patientName: 'Grace Lee', service: 'Dental X-Ray', date: '2025-06-19', time: '11:30 AM', status: 'Scheduled' },
];

const mockServices = [
  { id: 'S001', name: 'Dental Cleaning', price: 1500, description: 'Basic cleaning and polishing.' },
  { id: 'S002', name: 'Tooth Extraction', price: 2500, description: 'Removal of a single tooth.' },
  { id: 'S003', name: 'Dental Filling', price: 1000, description: 'Filling for cavities.' },
  { id: 'S004', name: 'Orthodontic Check-up', price: 800, description: 'Consultation for braces/aligners.' },
  { id: 'S005', name: 'Teeth Whitening', price: 7000, description: 'Cosmetic teeth whitening procedure.' },
  { id: 'S006', name: 'Root Canal Treatment', price: 10000, description: 'Treatment for infected tooth pulp.' },
  { id: 'S007', name: 'Braces Adjustment', price: 500, description: 'Adjustment for orthodontic braces.' },
  { id: 'S008', name: 'Dental X-Ray', price: 300, description: 'Diagnostic dental imaging.' },
];

// Mock data for doctors and their availability
const mockDoctors = [
  { id: 'D001', name: 'Dr. John Doe', specialty: 'General Dentistry' },
  { id: 'D002', name: 'Dr. Jane Smith', specialty: 'Orthodontics' },
  { id: 'D003', name: 'Dr. Peter Jones', specialty: 'Oral Surgery' },
];

// Mock doctor availability (date in YYYY-MM-DD format)
const mockDoctorAvailability = {
  'D001': {
    '2025-06-16': ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
    '2025-06-17': ['09:00 AM', '10:00 AM', '11:00 AM'],
    '2025-06-18': ['01:00 PM', '02:00 PM', '03:00 PM'],
  },
  'D002': {
    '2025-06-16': ['09:30 AM', '11:30 AM', '01:30 PM'],
    '2025-06-17': ['08:00 AM', '10:00 AM', '02:00 PM'],
    '2025-06-19': ['10:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'],
  },
  'D003': {
    '2025-06-17': ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'],
    '2025-06-20': ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
  },
};

// Reusable Table Component
function DataTable({ data, columns, title, filterableKeys, hasDatePicker = false, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page

  // Handles search term changes
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  // Handles date changes for date picker
  const handleDateChange = useCallback((event) => {
    setSelectedDate(event.target.value);
    setCurrentPage(1); // Reset to first page on new date filter
  }, []);

  // Filters data based on search term and selected date (if applicable)
  const filteredData = useMemo(() => {
    let currentData = data;

    // Apply date filter first if date picker is enabled
    if (hasDatePicker && selectedDate) {
      currentData = currentData.filter(item => item.date === selectedDate);
    }

    // Apply search term filter
    if (searchTerm) {
      currentData = currentData.filter(item =>
        filterableKeys.some(key =>
          String(item[key]).toLowerCase().includes(searchTerm)
        )
      );
    }
    return currentData;
  }, [data, searchTerm, selectedDate, filterableKeys, hasDatePicker]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handles page change
  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  // Handles items per page change
  const handleItemsPerPageChange = useCallback((event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  }, []);

  // Handles individual row selection
  const handleRowSelect = useCallback((id) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  }, []);

  // Handles select all/deselect all for CURRENTLY DISPLAYED items
  const handleSelectAll = useCallback((event) => {
    if (event.target.checked) {
      const allIdsInCurrentPage = new Set(currentItems.map(item => item.id));
      setSelectedRows(prev => new Set([...prev, ...allIdsInCurrentPage]));
    } else {
      // Remove only items from the current page from selection
      setSelectedRows(prev => {
        const newSelection = new Set(prev);
        currentItems.forEach(item => newSelection.delete(item.id));
        return newSelection;
      });
    }
  }, [currentItems]);

  // Check if all displayed rows are selected
  const allRowsSelected = currentItems.length > 0 && currentItems.every(item => selectedRows.has(item.id));

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 mb-8 border border-blue-100 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">{title}</h2>

      {/* Filter, Search, and Items per page Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Maghanap..."
            className="flex-grow rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {hasDatePicker && (
            <input
              type="date"
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              value={selectedDate}
              onChange={handleDateChange}
            />
          )}
        </div>
        
        {/* Items per page dropdown - Moved to the top */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <label htmlFor={`items-per-page-${title}`} className="text-sm text-blue-700 dark:text-blue-300 whitespace-nowrap">Items kada pahina:</label>
          <select
            id={`items-per-page-${title}`}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value={filteredData.length}>Lahat</option> {/* Option to show all */}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-blue-200 dark:divide-slate-700">
          <thead className="bg-blue-50 dark:bg-slate-700">
            <tr>
              {/* Select All Checkbox */}
              <th scope="col" className="p-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider dark:text-blue-300">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-600 dark:border-slate-500"
                  onChange={handleSelectAll}
                  checked={allRowsSelected}
                  // Indeterminate state for partially selected (only from current page)
                  ref={el => {
                    if (el) {
                      const selectedCountOnPage = currentItems.filter(item => selectedRows.has(item.id)).length;
                      el.indeterminate = selectedCountOnPage > 0 && !allRowsSelected;
                    }
                  }}
                />
              </th>
              {/* Table Headers */}
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider dark:text-blue-300"
                >
                  {col.header}
                </th>
              ))}
              {/* Actions Header */}
              {(onEdit || onDelete) && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider dark:text-blue-300">
                  Aksyon
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-blue-200 dark:divide-slate-700">
            {currentItems.length > 0 ? (
              currentItems.map(row => (
                <tr key={row.id} className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-600 dark:border-slate-500"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {row[col.key]}
                    </td>
                  ))}
                  {/* Actions Cell */}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onEdit && (
                        <span
                          onClick={() => onEdit(row.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer mr-3"
                        >
                          I-edit
                        </span>
                      )}
                      {onDelete && (
                        <span
                          onClick={() => onDelete(row.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                        >
                          Burahin
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 2 : 1)} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Walang nakitang data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Changed from buttons to spans */}
      <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4">
        <span
          onClick={() => paginate(currentPage - 1)}
          className={`px-3 py-1 text-sm rounded-lg border border-blue-300 dark:border-slate-600 cursor-pointer transition-colors
                      ${currentPage === 1 
                        ? 'opacity-50 pointer-events-none bg-blue-50 text-blue-400 dark:bg-slate-700 dark:text-slate-500' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-slate-600'
                      }`}
        >
          Nakaraan
        </span>
        <span className="text-md font-semibold text-blue-800 dark:text-blue-200 mx-2">
          Pahina {currentPage} ng {totalPages === 0 ? 1 : totalPages}
        </span>
        <span
          onClick={() => paginate(currentPage + 1)}
          className={`px-3 py-1 text-sm rounded-lg border border-blue-300 dark:border-slate-600 cursor-pointer transition-colors
                      ${currentPage === totalPages || totalPages === 0
                        ? 'opacity-50 pointer-events-none bg-blue-50 text-blue-400 dark:bg-slate-700 dark:text-slate-500'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-slate-600'
                      }`}
        >
          Susunod
        </span>
      </div>

      {/* Selected Rows Display */}
      {selectedRows.size > 0 && (
        <div className="mt-4 text-sm text-blue-700 dark:text-blue-300 text-center">
          Napiling Rows: {selectedRows.size} item/s.
        </div>
      )}
    </div>
  );
}

// Calendar Booking Component
function CalendarBooking({ doctors, doctorAvailability, onBookAppointment }) {
  // Gamitin ang standard Date object para sa selectedDate
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState(doctors.length > 0 ? doctors[0].id : '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Helper to format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch available slots when selectedDate or selectedDoctor changes
  useEffect(() => {
    const formattedDate = formatDate(selectedDate);
    if (selectedDoctor && doctorAvailability[selectedDoctor]) {
      setAvailableSlots(doctorAvailability[selectedDoctor][formattedDate] || []);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedDoctor, doctorAvailability]);

  // Handle date change from the HTML date input
  const handleDateInputChange = useCallback((event) => {
    setSelectedDate(new Date(event.target.value));
  }, []);

  // Handle doctor selection change
  const handleDoctorChange = useCallback((event) => {
    setSelectedDoctor(event.target.value);
  }, []);

  // Prepare for booking (show modal)
  const handleBookSlot = useCallback((slot) => {
    setCurrentBooking({
      doctor: doctors.find(doc => doc.id === selectedDoctor).name,
      date: formatDate(selectedDate),
      time: slot,
    });
    setShowBookingModal(true);
  }, [selectedDate, selectedDoctor, doctors]);

  // Confirm and book the appointment
  const confirmBooking = useCallback(() => {
    if (currentBooking) {
      onBookAppointment(currentBooking);
      setShowBookingModal(false);
      setCurrentBooking(null);
      // Optional: remove booked slot from available slots visually
      setAvailableSlots(prevSlots => prevSlots.filter(s => s !== currentBooking.time));
    }
  }, [currentBooking, onBookAppointment]);

  // Modal component for booking confirmation
  const BookingConfirmationModal = ({ bookingDetails, onConfirm, onCancel, show }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-2xl max-w-sm w-full border border-blue-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">Kumpirmahin ang Appointment</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Doktor: <span className="font-semibold">{bookingDetails.doctor}</span>
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Petsa: <span className="font-semibold">{bookingDetails.date}</span>
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Oras: <span className="font-semibold">{bookingDetails.time}</span>
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Kanselahin
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Kumpirmahin
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 mb-8 border border-blue-100 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">Mag-book ng Appointment</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Date Selection Section (formerly Calendar) */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
            <label htmlFor="booking-date" className="block text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                Pumili ng Petsa:
            </label>
            <input
                type="date"
                id="booking-date"
                value={formatDate(selectedDate)} // Display current selected date
                onChange={handleDateInputChange}
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white w-full max-w-[280px]"
            />
            {/* Optional: Add a visual representation of a calendar, or just rely on the input's native date picker */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Gamitin ang date picker sa itaas upang pumili ng petsa.</p>
        </div>

        {/* Booking Details Section */}
        <div className="w-full md:w-1/2">
          <div className="mb-4">
            <label htmlFor="doctor-select" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Pumili ng Doktor:
            </label>
            <select
              id="doctor-select"
              value={selectedDoctor}
              onChange={handleDoctorChange}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
            >
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
              ))}
            </select>
          </div>

          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Mga Available na Slot sa {formatDate(selectedDate)}
          </h3>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => handleBookSlot(slot)}
                  className="px-4 py-2 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900 transition-colors shadow-sm"
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Walang available na slot para sa petsang ito o doktor.</p>
          )}
        </div>
      </div>

      <BookingConfirmationModal
        bookingDetails={currentBooking}
        onConfirm={confirmBooking}
        onCancel={() => setShowBookingModal(false)}
        show={showBookingModal}
      />
    </div>
  );
}


// Main App Component
export default function App() {
  // Define columns for each table
  const patientColumns = [
    { key: 'id', header: 'Patient ID' },
    { key: 'name', header: 'Pangalan' },
    { key: 'age', header: 'Edad' },
    { key: 'gender', header: 'Kasarian' },
    { key: 'contact', header: 'Kontak' },
  ];

  const appointmentColumns = [
    { key: 'id', header: 'Appointment ID' },
    { key: 'patientName', header: 'Pangalan ng Pasyente' },
    { key: 'service', header: 'Serbisyo' },
    { key: 'date', header: 'Petsa' },
    { key: 'time', header: 'Oras' },
    { key: 'status', header: 'Status' },
  ];

  const serviceColumns = [
    { key: 'id', header: 'Service ID' },
    { key: 'name', header: 'Pangalan ng Serbisyo' },
    { key: 'price', header: 'Presyo (PHP)' },
    { key: 'description', header: 'Deskripsyon' },
  ];

  // Define filterable keys for search
  const patientFilterableKeys = ['id', 'name', 'age', 'gender', 'contact'];
  const appointmentFilterableKeys = ['id', 'patientName', 'service', 'date', 'time', 'status'];
  const serviceFilterableKeys = ['id', 'name', 'price', 'description'];

  // Mock action handlers for demonstration
  const handleEdit = useCallback((id, tableName) => {
    console.log(`I-edit ang item ${id} mula sa ${tableName} table.`);
    console.log(`Opening edit form for ${tableName} ID ${id}`);
  }, []);

  const handleDelete = useCallback((id, tableName) => {
    // Gumamit ng window.confirm bilang fallback, ngunit sa real app, gumamit ng custom modal
    const confirmDelete = window.confirm(`Sigurado ka bang buburahin ang item ${id} mula sa ${tableName} table?`);
    if (confirmDelete) {
      console.log(`Burahin ang item ${id} mula sa ${tableName} table.`);
      console.log(`Item ${tableName} ID ${id} deleted.`);
      // Dito mo i-update ang iyong state o tatawag ng API para burahin ang item.
    }
  }, []);

  // Handle booking appointment (mock implementation)
  const handleBookNewAppointment = useCallback((bookingDetails) => {
    console.log('Bagong Appointment Na-book:', bookingDetails);
    // Sa totoong app, idadagdag mo ito sa database at posibleng i-refresh ang appointments table
    alert(`Matagumpay na Na-book ang Appointment:\nDoktor: ${bookingDetails.doctor}\nPetsa: ${bookingDetails.date}\nOras: ${bookingDetails.time}`);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-blue-50 to-blue-100 p-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-blue-900 dark:text-blue-100 mb-12">
        <span className="block text-blue-700 dark:text-blue-300">Dental Clinic</span>
        Monitoring System
      </h1>

      {/* Calendar Booking Section */}
      <CalendarBooking
        doctors={mockDoctors}
        doctorAvailability={mockDoctorAvailability}
        onBookAppointment={handleBookNewAppointment}
      />

      <hr className="my-12 border-blue-200 dark:border-slate-700" /> {/* Separator */}

      {/* Patients Table */}
      <DataTable
        data={mockPatients}
        columns={patientColumns}
        title="Listahan ng Pasyente"
        filterableKeys={patientFilterableKeys}
        onEdit={(id) => handleEdit(id, 'Patients')}
        onDelete={(id) => handleDelete(id, 'Patients')}
      />

      {/* Appointments Table */}
      <DataTable
        data={mockAppointments}
        columns={appointmentColumns}
        title="Mga Iskedyul ng Appointment"
        filterableKeys={appointmentFilterableKeys}
        hasDatePicker={true}
        onEdit={(id) => handleEdit(id, 'Appointments')}
        onDelete={(id) => handleDelete(id, 'Appointments')}
      />

      {/* Services Table */}
      <DataTable
        data={mockServices}
        columns={serviceColumns}
        title="Mga Serbisyo"
        filterableKeys={serviceFilterableKeys}
        onEdit={(id) => handleEdit(id, 'Services')}
        onDelete={(id) => handleDelete(id, 'Services')}
      />
    </div>
  );
}
