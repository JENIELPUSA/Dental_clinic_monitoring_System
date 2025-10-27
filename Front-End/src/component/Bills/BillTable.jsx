import React, { useState, useEffect, useContext, useMemo } from "react";
import { PlusCircle, Edit, Trash2, User, Wallet } from "lucide-react";
import { PatientDisplayContext } from "../../contexts/PatientContext/PatientContext";
import { TreatmentDisplayContext } from "../../contexts/TreatmentContext/TreatmentContext";
import { BillDisplayContext } from "../../contexts/BillContext/BillContext";
import BillFormModal from "./BillFormModal";
import RecordPaymentModal from "./RecordPaymentModal";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { AuthContext } from "../../contexts/AuthContext";

// Hook to detect mobile (< 640px)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20">
    <div className="h-3.5 w-1/2 rounded bg-blue-100 dark:bg-blue-800/40"></div>
    <div className="mt-2 space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 w-full rounded bg-blue-100 dark:bg-blue-800/40"></div>
      ))}
    </div>
  </div>
);

function BillTable() {
    const { role } = useContext(AuthContext);
    const { isBIll, AddBill, UpdateBill, deleteBill: deleteBillFromContext } = useContext(BillDisplayContext);
    const { patients } = useContext(PatientDisplayContext);
    const { Treatment } = useContext(TreatmentDisplayContext);

    const [bills, setBills] = useState(isBIll || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentBill, setCurrentBill] = useState(null);
    const [billToPay, setBillToPay] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [fromBillDate, setFromBillDate] = useState("");
    const [toBillDate, setToBillDate] = useState("");
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [loading, setLoading] = useState(false);

    const [theme, setTheme] = useState("light");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const isMobile = useIsMobile();

    useEffect(() => {
        setBills(isBIll || []);
    }, [isBIll]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const [formData, setFormData] = useState({
        patient_id: "",
        patient_name: "",
        total_amount: "",
        amount_paid: "",
        balance: "",
        bill_date: "",
        payment_status: "Unpaid",
        treatment_id: "",
    });

    useEffect(() => {
        const total = parseFloat(formData.total_amount) || 0;
        const paid = parseFloat(formData.amount_paid) || 0;
        const newBalance = total - paid;
        let newPaymentStatus = "Unpaid";

        if (paid >= total && total > 0) {
            newPaymentStatus = "Paid";
        } else if (paid > 0 && paid < total) {
            newPaymentStatus = "Partial";
        }

        setFormData((prev) => ({
            ...prev,
            balance: newBalance.toFixed(2),
            payment_status: newPaymentStatus,
        }));
    }, [formData.total_amount, formData.amount_paid]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
        document.documentElement.classList.toggle("dark");
    };

    const openAddModal = () => {
        setCurrentBill(null);
        setFormData({
            patient_id: "",
            patient_name: "",
            total_amount: "",
            amount_paid: "",
            balance: "",
            bill_date: new Date().toISOString().split("T")[0],
            payment_status: "Unpaid",
            treatment_id: "",
        });
        setIsModalOpen(true);
    };

    const openEditModal = (bill) => {
        setCurrentBill(bill);
        setFormData({
            patient_id: bill.patient_id,
            patient_name: bill.patient_name,
            total_amount: parseFloat(bill.total_amount) || 0,
            amount_paid: parseFloat(bill.amount_paid) || 0,
            balance: parseFloat(bill.balance) || 0,
            bill_date: bill.bill_date ? new Date(bill.bill_date).toISOString().split("T")[0] : "",
            payment_status: bill.payment_status,
            treatment_id: bill.treatment_id || "",
        });
        setIsModalOpen(true);
    };

    const openPaymentModal = (bill) => {
        setBillToPay(bill);
        setPaymentAmount("");
        setIsPaymentModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentBill(null);
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setBillToPay(null);
        setPaymentAmount("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "patient_id") {
            const selectedTreatment = (Treatment || []).find((t) => String(t.patient_id) === String(value));
            const cost = selectedTreatment ? parseFloat(selectedTreatment.cost || 0) : 0;
            const selectedPatient = (patients || []).find((p) => String(p._id) === String(value));

            setFormData((prev) => {
                const paid = parseFloat(prev.amount_paid || 0);
                return {
                    ...prev,
                    patient_id: value,
                    patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "",
                    total_amount: cost,
                    balance: (cost - paid).toFixed(2),
                };
            });
        } else if (name === "amount_paid") {
            const paid = parseFloat(value || 0);
            const total = parseFloat(formData.total_amount || 0);
            setFormData((prev) => ({
                ...prev,
                amount_paid: paid,
                balance: (total - paid).toFixed(2),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePaymentAmountChange = (e) => {
        setPaymentAmount(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submittedFormData = {
            ...formData,
            total_amount: parseFloat(formData.total_amount) || 0,
            amount_paid: parseFloat(formData.amount_paid) || 0,
            balance: parseFloat(formData.balance) || 0,
            bill_date: formData.bill_date ? new Date(formData.bill_date).toISOString().split("T")[0] : "",
        };

        if (currentBill) {
            const updatedBill = {
                ...submittedFormData,
                _id: currentBill._id,
            };
            setBills(bills.map((bill) => (bill._id === currentBill._id ? updatedBill : bill)));
            await UpdateBill(currentBill._id, updatedBill);
        } else {
            const newBill = {
                ...submittedFormData,
                _id: `bill${bills.length + 1}-${Date.now()}`,
            };
            setBills([...bills, newBill]);
            await AddBill(newBill);
        }
        closeModal();
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        const parsedPaymentAmount = parseFloat(paymentAmount);

        if (isNaN(parsedPaymentAmount) || parsedPaymentAmount <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }

        if (parsedPaymentAmount > (parseFloat(billToPay.balance) || 0)) {
            alert("Payment amount cannot exceed the remaining balance.");
            return;
        }

        setBills((prevBills) => {
            const updatedBills = prevBills.map((bill) => {
                if (bill._id === billToPay._id) {
                    const currentAmountPaid = parseFloat(bill.amount_paid) || 0;
                    const totalAmount = parseFloat(bill.total_amount) || 0;

                    const updatedAmountPaid = currentAmountPaid + parsedPaymentAmount;
                    const updatedBalance = totalAmount - updatedAmountPaid;

                    let updatedPaymentStatus = bill.payment_status;
                    if (updatedBalance <= 0.01) {
                        updatedPaymentStatus = "Paid";
                    } else if (updatedAmountPaid > 0 && updatedAmountPaid < totalAmount) {
                        updatedPaymentStatus = "Partial";
                    } else {
                        updatedPaymentStatus = "Unpaid";
                    }

                    const updatedBill = {
                        ...bill,
                        amount_paid: updatedAmountPaid,
                        balance: updatedBalance.toFixed(2),
                        payment_status: updatedPaymentStatus,
                    };

                    UpdateBill(bill._id, updatedBill);
                    return updatedBill;
                }
                return bill;
            });
            return updatedBills;
        });

        closePaymentModal();
    };

    const deleteBill = (id) => {
        setLoading(true);
        setIsDeleteId(id);
        setVerification(true);
        setLoading(false);
    };

    const handleConfirmDelete = async () => {
        setBills(bills.filter((bill) => bill._id !== isDeleteID));
        await deleteBillFromContext(isDeleteID);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const getStatusBadge = (status) => {
        let badgeClasses = "px-2 py-0.5 rounded-full text-xs font-semibold text-white ";
        switch (status?.toLowerCase()) {
            case "paid": badgeClasses += "bg-green-500"; break;
            case "partial": badgeClasses += "bg-yellow-500"; break;
            case "unpaid": badgeClasses += "bg-red-500"; break;
            default: badgeClasses += "bg-gray-500"; break;
        }
        return <span className={badgeClasses}>{status || "N/A"}</span>;
    };

    const filteredBills = useMemo(() => {
        return bills?.filter((bill) => {
            const searchLower = searchTerm.toLowerCase();
            const textMatches =
                (bill?.patient_name && bill.patient_name.toLowerCase().includes(searchLower)) ||
                (bill.patient_id && bill.patient_id.toLowerCase().includes(searchLower)) ||
                (bill.payment_status && bill.payment_status.toLowerCase().includes(searchLower));

            let dateMatches = true;
            if (bill.bill_date) {
                const billDate = new Date(bill.bill_date);
                if (fromBillDate) {
                    const from = new Date(fromBillDate);
                    from.setHours(0, 0, 0, 0);
                    dateMatches = dateMatches && billDate >= from;
                }
                if (toBillDate) {
                    const to = new Date(toBillDate);
                    to.setHours(23, 59, 59, 999);
                    dateMatches = dateMatches && billDate <= to;
                }
            } else if (fromBillDate || toBillDate) {
                dateMatches = false;
            }

            return textMatches && dateMatches;
        }) || [];
    }, [bills, searchTerm, fromBillDate, toBillDate]);

    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromBillDate, toBillDate]);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        const num = typeof value === "number" ? value : parseFloat(value) || 0;
        return `₱${num.toFixed(2)}`;
    };

    return (
        <div className="w-full rounded-2xl bg-white p-3 shadow-md dark:border dark:border-blue-800/50 dark:bg-blue-900/20 sm:p-6">
            {/* Header & Filters */}
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:mb-4 md:flex-row md:items-center">
                <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 sm:text-lg">Bill List</h2>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Bills..."
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white dark:placeholder-blue-300 sm:px-4 sm:py-2 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-700 dark:text-blue-300 dark:hover:text-blue-100 sm:right-3 sm:top-2"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Date Filters */}
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-2">
                        <input
                            type="date"
                            value={fromBillDate}
                            onChange={(e) => setFromBillDate(e.target.value)}
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
                            title="From bill date"
                        />
                        <input
                            type="date"
                            value={toBillDate}
                            onChange={(e) => setToBillDate(e.target.value)}
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-white sm:px-4 sm:py-2 sm:text-sm"
                            title="To bill date"
                        />
                    </div>
                </div>

                <button
                    onClick={openAddModal}
                    className="mt-2 w-full self-end rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white shadow transition hover:bg-blue-700 sm:mt-0 sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
                >
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Add New Bill
                </button>
            </div>

            {/* Conditional Rendering */}
            {isMobile ? (
                /* Mobile: Card ListView */
                <div className="space-y-3">
                    {currentBills.length > 0 ? (
                        currentBills.map((bill) => (
                            <div
                                key={bill._id}
                                className="rounded-lg border border-blue-200 bg-white p-3 shadow dark:border-blue-800/50 dark:bg-blue-900/20"
                            >
                                <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                    {bill.patient_name} ({bill.patient_id?.slice(-4)})
                                </div>
                                <div className="mt-1 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                    <div>
                                        <span className="font-medium">Treatment:</span> {bill.treatment_description}
                                    </div>
                                    <div>
                                        <span className="font-medium">Date:</span> {formatDate(bill.bill_date)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Total:</span> {formatCurrency(bill.total_amount)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Paid:</span> {formatCurrency(bill.amount_paid)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Balance:</span> {formatCurrency(bill.balance)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span> {getStatusBadge(bill.payment_status)}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    <button
                                        onClick={() => openEditModal(bill)}
                                        className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-600 hover:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30"
                                    >
                                        Edit
                                    </button>
                                    {(bill.payment_status === "Partial" || bill.payment_status === "Unpaid") && (
                                        <button
                                            onClick={() => openPaymentModal(bill)}
                                            className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-600 hover:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
                                        >
                                            Pay
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center text-sm text-blue-800 dark:text-blue-200">
                            No bills found.
                        </div>
                    )}
                </div>
            ) : (
                /* Desktop: Table View */
                <div className="overflow-x-auto rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-blue-50 text-left dark:bg-blue-900/30">
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Patient Name (ID)</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Treatment Description</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Bill Date</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Total Amount</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Amount Paid</th>
                                <th className="border px-3 py-2 text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Balance</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Status</th>
                                <th className="border px-3 py-2 text-center text-blue-800 dark:border-blue-800/50 dark:text-blue-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBills.length > 0 ? (
                                currentBills.map((bill) => (
                                    <tr
                                        key={bill._id}
                                        className="border-b hover:bg-blue-50/50 dark:border-blue-800/50 dark:hover:bg-blue-900/20"
                                    >
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            <User className="mr-2 inline h-3.5 w-3.5 text-gray-500 dark:text-gray-400 sm:h-4 sm:w-4" />
                                            {bill.patient_name} (<span className="text-xs text-gray-500 dark:text-gray-400">{bill.patient_id}</span>)
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {bill.treatment_description}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatDate(bill.bill_date)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatCurrency(bill.total_amount)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatCurrency(bill.amount_paid)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-blue-800 dark:border-blue-800/50 dark:text-blue-300">
                                            {formatCurrency(bill.balance)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-center align-middle dark:border-blue-800/50">
                                            {getStatusBadge(bill.payment_status)}
                                        </td>
                                        <td className="border px-3 py-2.5 text-center dark:border-blue-800/50">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(bill)}
                                                    className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-300/10"
                                                    title="Edit Bill"
                                                >
                                                    <Edit className="h-4 w-4 stroke-blue-500 dark:stroke-blue-300" />
                                                </button>
                                                {(bill.payment_status === "Partial" || bill.payment_status === "Unpaid") && (
                                                    <button
                                                        onClick={() => openPaymentModal(bill)}
                                                        className="rounded p-1.5 text-green-500 hover:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-300/10"
                                                        title="Record Payment"
                                                    >
                                                        <Wallet className="h-4 w-4 stroke-green-500 dark:stroke-green-300" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-3 py-4 text-center text-blue-800 dark:text-blue-200"
                                    >
                                        No bills found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {filteredBills?.length > 0 && (
                <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs text-blue-800 dark:text-blue-200 sm:mt-4 sm:flex-row sm:text-sm">
                    <div>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBills.length)} of {filteredBills.length} entries
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            onClick={() => paginate(1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            «
                        </button>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            ‹
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    className={`rounded border px-2 py-1 ${
                                        currentPage === pageNum ? "bg-blue-100 font-bold dark:bg-blue-800/50" : "hover:bg-blue-100 dark:hover:bg-blue-800/20"
                                    } sm:px-3 sm:py-1`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => paginate(totalPages)}
                            disabled={currentPage === totalPages}
                            className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-100 dark:border-blue-800/50 dark:hover:bg-blue-800/20 sm:px-3 sm:py-1"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <BillFormModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                patients={patients}
                treatment={Treatment}
                currentBill={currentBill}
                theme={theme}
            />
            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                closePaymentModal={closePaymentModal}
                billToPay={billToPay}
                paymentAmount={paymentAmount}
                handlePaymentAmountChange={handlePaymentAmountChange}
                handleRecordPayment={handleRecordPayment}
                theme={theme}
            />
            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default BillTable;