import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Edit, Trash2, Calendar, User, Wallet } from 'lucide-react'; // Importing icons

// Mock data for demonstration purposes
const mockPatients = [
  { _id: '60c72b2f9b1d8e001f8e1a1a', name: 'Juan Dela Cruz', address: '123 Main St, Manila' },
  { _id: '60c72b2f9b1d8e001f8e1a1b', name: 'Maria Santos', address: '456 Elm St, Quezon City' },
  { _id: '60c72b2f9b1d8e001f8e1a1c', name: 'Pedro Reyes', address: '789 Oak Ave, Cebu' },
  { _id: '60c72b2f9b1d8e001f8e1a1d', name: 'Liza Manalo', address: '101 Pine Ln, Davao' },
  { _id: '60c72b2f9b1d8e001f8e1a1e', name: 'David Lee', address: '202 Maple Dr, Makati' },
  { _id: '60c72b2f9b1d8e001f8e1a1f', name: 'Sofia Rodriguez', address: '303 Birch Rd, Pasig' },
];

const initialBills = [
  {
    _id: 'bill1',
    patient_id: '60c72b2f9b1d8e001f8e1a1a',
    total_amount: 1500.00,
    amount_paid: 1500.00,
    balance: 0.00,
    bill_date: '2024-05-20',
    payment_status: 'Paid',
    patient_name: 'Juan Dela Cruz' // Added for easier display in table
  },
  {
    _id: 'bill2',
    patient_id: '60c72b2f9b1d8e001f8e1a1b',
    total_amount: 2500.00,
    amount_paid: 1000.00,
    balance: 1500.00,
    bill_date: '2024-05-25',
    payment_status: 'Partial',
    patient_name: 'Maria Santos'
  },
  {
    _id: 'bill3',
    patient_id: '60c72b2f9b1d8e001f8e1a1c',
    total_amount: 800.00,
    amount_paid: 0.00,
    balance: 800.00,
    bill_date: '2024-06-01',
    payment_status: 'Unpaid',
    patient_name: 'Pedro Reyes'
  },
];

// Reusable custom dropdown with search, displaying ID, Name, and Address
const SearchableSelect = ({ label, name, value, options, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Find the selected option to display its full details
  const selectedOption = options.find(option => option._id === value);

  const filteredOptions = options.filter(option =>
    option._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue, optionName) => {
    onChange({ target: { name, value: optionValue, patientName: optionName } });
    setIsOpen(false);
    setSearchTerm(''); // Clear search term after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-center p-3 w-full border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          {Icon && <Icon className="mr-3 text-gray-400" />}
          <span className="flex-grow text-gray-800">
            {selectedOption ? `${selectedOption._id} - ${selectedOption.name}` : placeholder}
          </span>
          <svg className={`ml-2 h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-10">
            <input
              type="text"
              placeholder="Search by ID, Name, or Address..."
              className="p-3 w-full border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-t-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking search input
            />
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option._id}
                  className="p-3 cursor-pointer hover:bg-indigo-50 flex flex-col items-start transition duration-150"
                  onClick={() => handleSelect(option._id, option.name)}
                >
                  <span className="font-semibold text-gray-800">{option.name}</span>
                  <span className="text-sm text-gray-600">ID: {option._id}</span>
                  <span className="text-xs text-gray-500">{option.address}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500">No results found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [bills, setBills] = useState(initialBills);
  const [isModalOpen, setIsModalOpen] = useState(false); // For Add/Edit Bill Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // For Record Payment Modal
  const [currentBill, setCurrentBill] = useState(null); // For editing
  const [billToPay, setBillToPay] = useState(null); // For recording payment
  const [paymentAmount, setPaymentAmount] = useState(''); // For payment input
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for Add/Edit Bill
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    total_amount: '',
    amount_paid: '',
    balance: '',
    bill_date: '',
    payment_status: 'Unpaid'
  });

  // Calculate balance and payment status whenever total_amount or amount_paid changes
  useEffect(() => {
    const total = parseFloat(formData.total_amount) || 0;
    const paid = parseFloat(formData.amount_paid) || 0;
    const newBalance = total - paid;
    let newPaymentStatus = 'Unpaid';

    if (paid >= total && total > 0) {
      newPaymentStatus = 'Paid';
    } else if (paid > 0 && paid < total) {
      newPaymentStatus = 'Partial';
    } else if (paid === 0 && total > 0) {
      newPaymentStatus = 'Unpaid';
    } else if (total === 0 && paid === 0) {
        newPaymentStatus = 'Unpaid'; // Or 'N/A' depending on interpretation
    }

    setFormData(prev => ({
      ...prev,
      balance: newBalance.toFixed(2),
      payment_status: newPaymentStatus
    }));
  }, [formData.total_amount, formData.amount_paid]);


  const openAddModal = () => {
    setCurrentBill(null);
    setFormData({
      patient_id: '',
      patient_name: '', // Reset patient_name
      total_amount: '',
      amount_paid: '',
      balance: '',
      bill_date: new Date().toISOString().split('T')[0], // Default to today
      payment_status: 'Unpaid'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bill) => {
    setCurrentBill(bill);
    setFormData({
      patient_id: bill.patient_id,
      patient_name: bill.patient_name, // Populate patient_name for editing
      total_amount: bill.total_amount,
      amount_paid: bill.amount_paid,
      balance: bill.balance,
      bill_date: bill.bill_date,
      payment_status: bill.payment_status
    });
    setIsModalOpen(true);
  };

  const openPaymentModal = (bill) => {
    setBillToPay(bill);
    setPaymentAmount(''); // Clear previous payment amount
    setIsPaymentModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBill(null);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setBillToPay(null);
    setPaymentAmount('');
  };

  const handleChange = (e) => {
    const { name, value, patientName } = e.target; // Destructure patientName if available from SearchableSelect
    if (name === 'patient_id' && patientName) {
      setFormData(prev => ({ ...prev, [name]: value, patient_name: patientName }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentAmountChange = (e) => {
    setPaymentAmount(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentBill) {
      // Update existing bill
      setBills(bills.map(bill =>
        bill._id === currentBill._id ? { ...formData, _id: currentBill._id } : bill
      ));
    } else {
      // Add new bill
      const newBill = {
        ...formData,
        _id: `bill${bills.length + 1}`, // Simple ID generation
      };
      setBills([...bills, newBill]);
    }
    closeModal();
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const parsedPaymentAmount = parseFloat(paymentAmount);

    if (isNaN(parsedPaymentAmount) || parsedPaymentAmount <= 0) {
      // Use a custom message box instead of alert
      alert('Please enter a valid positive amount.'); // Placeholder for custom message box
      return;
    }

    if (parsedPaymentAmount > billToPay.balance) {
      // Use a custom message box instead of alert
      alert('Payment amount cannot exceed the remaining balance.'); // Placeholder for custom message box
      return;
    }

    setBills(prevBills => prevBills.map(bill => {
      if (bill._id === billToPay._id) {
        const updatedAmountPaid = bill.amount_paid + parsedPaymentAmount;
        const updatedBalance = bill.balance - parsedPaymentAmount;
        let updatedPaymentStatus = bill.payment_status;

        if (updatedBalance <= 0.01) { // Check with a small epsilon for floating point issues
          updatedPaymentStatus = 'Paid';
        } else if (updatedAmountPaid > 0) {
          updatedPaymentStatus = 'Partial';
        } else {
          updatedPaymentStatus = 'Unpaid';
        }

        return {
          ...bill,
          amount_paid: updatedAmountPaid,
          balance: updatedBalance,
          payment_status: updatedPaymentStatus
        };
      }
      return bill;
    }));
    closePaymentModal();
  };

  const deleteBill = (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) { // Placeholder for custom confirm box
      setBills(bills.filter(bill => bill._id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter bills by patient_name, patient_id or payment_status
  const filteredBills = bills.filter(bill =>
    (bill.patient_name && bill.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    bill.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans antialiased">
      <div className="container mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 my-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
          Bill Management
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Effortlessly manage patient bills, track payments, and monitor balances.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <input
            type="text"
            placeholder="Search by patient ID, name, or status..."
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 w-full md:w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={openAddModal}
            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full md:w-auto justify-center"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Bill
          </button>
        </div>

        {/* Bill List Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full border border-blue-200 text-sm dark:border-blue-800/50">
            <thead className="bg-blue-50 text-left dark:bg-blue-900/30">
              <tr>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name (ID)</th>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Bill Date</th>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Total Amount</th>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Amount Paid</th>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Balance</th>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200 text-center">Status</th>
                <th scope="col" className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      {bill.patient_name} (<span className="text-gray-500 text-xs">{bill.patient_id}</span>)
                    </td>
                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">{bill.bill_date}</td>
                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">₱{bill.total_amount.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">₱{bill.amount_paid.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">₱{bill.balance.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-center align-middle dark:border-blue-800/50">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.payment_status)}`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="bg-transparent p-3 align-top text-center"> {/* Centered content */}
                      <div className="flex gap-2 justify-center"> {/* Centered buttons */}
                        <button
                          onClick={() => openEditModal(bill)}
                          className="rounded bg-transparent p-1.5 text-indigo-600 transition-colors duration-200 hover:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-300/10"
                          title="Edit Bill"
                        >
                          <Edit className="h-4 w-4 stroke-indigo-600 dark:stroke-indigo-300" />
                        </button>
                        {(bill.payment_status === 'Partial' || bill.payment_status === 'Unpaid') && (
                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="rounded bg-transparent p-1.5 text-green-600 transition-colors duration-200 hover:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-300/10"
                            title="Record Payment"
                          >
                            <Wallet className="h-4 w-4 stroke-green-600 dark:stroke-green-300" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteBill(bill._id)}
                          className="rounded bg-transparent p-1.5 text-red-600 transition-colors duration-200 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-300/10"
                          title="Delete Bill"
                        >
                          <Trash2 className="h-4 w-4 stroke-red-600 dark:stroke-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border px-3 py-4 text-center text-blue-800 dark:text-blue-200">
                    No bills found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Add/Edit Bill */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                {currentBill ? 'Edit Bill' : 'Add New Bill'}
              </h2>
              <form onSubmit={handleSubmit}>
                {/* SearchableSelect for Patient ID, Name, and Address */}
                <SearchableSelect
                  label="Patient"
                  name="patient_id"
                  value={formData.patient_id}
                  options={mockPatients} // Pass the full patient objects
                  onChange={handleChange}
                  placeholder="Select a Patient by ID, Name, or Address"
                  icon={User}
                />

                <div className="mb-4">
                  <label htmlFor="bill_date" className="block text-gray-700 text-sm font-semibold mb-2">
                    Bill Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      id="bill_date"
                      name="bill_date"
                      value={formData.bill_date}
                      onChange={handleChange}
                      required
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="total_amount" className="block text-gray-700 text-sm font-semibold mb-2">
                    Total Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₱</span>
                    <input
                      type="number"
                      id="total_amount"
                      name="total_amount"
                      value={formData.total_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="amount_paid" className="block text-gray-700 text-sm font-semibold mb-2">
                    Amount Paid
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₱</span>
                    <input
                      type="number"
                      id="amount_paid"
                      name="amount_paid"
                      value={formData.amount_paid}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="balance" className="block text-gray-700 text-sm font-semibold mb-2">
                    Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₱</span>
                    <input
                      type="text"
                      id="balance"
                      name="balance"
                      value={formData.balance}
                      readOnly
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Balance is automatically calculated.</p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {currentBill ? 'Save Changes' : 'Add Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {isPaymentModalOpen && billToPay && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Record Payment</h2>
              <form onSubmit={handleRecordPayment}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Patient Name:</label>
                  <p className="p-3 bg-gray-100 rounded-lg text-gray-800">{billToPay.patient_name}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Bill ID:</label>
                  <p className="p-3 bg-gray-100 rounded-lg text-gray-800">{billToPay._id}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Remaining Balance:</label>
                  <p className="p-3 bg-gray-100 rounded-lg text-gray-800 font-bold">₱{billToPay.balance.toFixed(2)}</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="payment_amount" className="block text-gray-700 text-sm font-semibold mb-2">
                    Amount to Pay
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₱</span>
                    <input
                      type="number"
                      id="payment_amount"
                      name="payment_amount"
                      value={paymentAmount}
                      onChange={handlePaymentAmountChange}
                      min="0.01"
                      step="0.01"
                      required
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closePaymentModal}
                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
