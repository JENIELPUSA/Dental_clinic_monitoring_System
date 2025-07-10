import React from 'react';

// Mock Data for PDF designs
const mockClinicInfo = {
  name: "Dental Care Clinic",
  address: "123 Smile St, Brgy. Gumamela, Manila",
  contact: "(02) 8123-4567",
  email: "info@dentalcare.ph"
};

const mockInvoiceData = {
  invoiceNumber: "INV-2025-06-001",
  invoiceDate: "Hunyo 16, 2025",
  dueDate: "Hunyo 30, 2025",
  patientName: "Maria Dela Cruz",
  patientAddress: "Blk 1 Lot 2, Brgy. Maligaya, Quezon City",
  items: [
    { description: "Dental Cleaning", quantity: 1, unitPrice: 1500.00, amount: 1500.00 },
    { description: "Dental Filling (1 tooth)", quantity: 1, unitPrice: 1000.00, amount: 1000.00 },
    { description: "X-Ray (Periapical)", quantity: 1, unitPrice: 300.00, amount: 300.00 },
  ],
  subtotal: 2800.00,
  discount: 0.00,
  tax: 140.00, // 5% of subtotal
  total: 2940.00,
  notes: "Salamat sa pagtitiwala sa aming serbisyo!"
};

const mockPatientSummaryData = {
  patientId: "P001",
  name: "Maria Dela Cruz",
  dob: "Abril 15, 1995",
  gender: "Babae",
  contact: "0917-1234567",
  email: "maria.dcruz@example.com",
  lastVisit: "Hunyo 16, 2025",
  allergies: "Wala",
  medicalHistory: "Asthma (mild)",
  recentTreatments: [
    { date: "2025-06-16", procedure: "Dental Cleaning", doctor: "Dr. John Doe" },
    { date: "2025-06-16", procedure: "Dental Filling", doctor: "Dr. John Doe" },
  ],
  nextAppointment: { date: "Hunyo 30, 2025", time: "10:00 AM", doctor: "Dr. John Doe", service: "Teeth Whitening" }
};

const mockAppointmentConfirmationData = {
  patientName: "Juan Reyes",
  appointmentDate: "Hunyo 20, 2025",
  appointmentTime: "02:00 PM",
  doctorName: "Dr. Jane Smith",
  service: "Orthodontic Check-up",
  clinicName: "Dental Care Clinic",
  clinicAddress: "123 Smile St, Brgy. Gumamela, Manila",
  contactInfo: "(02) 8123-4567"
};

// --- PDF Design Components ---

// Invoice PDF Design
const InvoicePDF = ({ data, clinicInfo }) => (
  <div className="p-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-w-2xl mx-auto my-8 font-sans text-gray-800 dark:text-gray-200">
    <div className="flex justify-between items-start mb-8 border-b pb-4 border-blue-200 dark:border-blue-700">
      <div>
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">{clinicInfo.name}</h1>
        <p className="text-sm">{clinicInfo.address}</p>
        <p className="text-sm">Tel: {clinicInfo.contact}</p>
        <p className="text-sm">Email: {clinicInfo.email}</p>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">INVOICE</h2>
        <p className="text-sm">Invoice #: <span className="font-semibold">{data.invoiceNumber}</span></p>
        <p className="text-sm">Petsa: <span className="font-semibold">{data.invoiceDate}</span></p>
        <p className="text-sm">Due Date: <span className="font-semibold">{data.dueDate}</span></p>
      </div>
    </div>

    <div className="mb-8">
      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Para Kay:</h3>
      <p className="font-medium">{data.patientName}</p>
      <p className="text-sm">{data.patientAddress}</p>
    </div>

    <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
        <thead className="bg-blue-50 dark:bg-blue-900">
          <tr>
            <th className="py-2 px-4 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Deskripsyon</th>
            <th className="py-2 px-4 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Dami</th>
            <th className="py-2 px-4 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Halaga kada piraso</th>
            <th className="py-2 px-4 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Kabuuang Halaga</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-700/50">
              <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{item.description}</td>
              <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{item.quantity}</td>
              <td className="py-2 px-4 text-right text-sm text-gray-700 dark:text-gray-300">₱{item.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-4 text-right text-sm text-gray-700 dark:text-gray-300">₱{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end">
      <div className="w-full max-w-xs">
        <div className="flex justify-between py-1 text-sm">
          <span>Subtotal:</span>
          <span className="font-semibold">₱{data.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span>Discount:</span>
          <span className="font-semibold">₱{data.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm border-b pb-2 border-gray-200 dark:border-gray-700">
          <span>Tax (5%):</span>
          <span className="font-semibold">₱{data.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-lg font-bold text-blue-800 dark:text-blue-200">
          <span>Kabuuang Babayaran:</span>
          <span>₱{data.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {data.notes && (
      <div className="mt-8 border-t pt-4 border-blue-200 dark:border-blue-700 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-semibold">Mga Paalala:</p>
        <p>{data.notes}</p>
      </div>
    )}
  </div>
);

// Patient Summary PDF Design
const PatientSummaryPDF = ({ data, clinicInfo }) => (
  <div className="p-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-w-2xl mx-auto my-8 font-sans text-gray-800 dark:text-gray-200">
    <div className="text-center mb-8 border-b pb-4 border-blue-200 dark:border-blue-700">
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">{clinicInfo.name}</h1>
      <p className="text-md text-gray-600 dark:text-gray-400">Patient Summary Report</p>
    </div>

    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Patient ID:</span> {data.patientId}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Pangalan:</span> {data.name}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Petsa ng Kapanganakan:</span> {data.dob}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Kasarian:</span> {data.gender}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Kontak:</span> {data.contact}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Email:</span> {data.email}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">Huling Bisita:</span> {data.lastVisit}</p>
    </div>

    <div className="mb-6 border-t pt-4 border-blue-200 dark:border-blue-700">
      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Medikal na Kasaysayan</h3>
      <p className="mb-2"><span className="font-semibold">Mga Allergy:</span> {data.allergies}</p>
      <p><span className="font-semibold">Kondisyong Medikal:</span> {data.medicalHistory}</p>
    </div>

    <div className="mb-6 border-t pt-4 border-blue-200 dark:border-blue-700">
      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Kamakailang Paggamot</h3>
      {data.recentTreatments.length > 0 ? (
        <ul className="list-disc pl-5">
          {data.recentTreatments.map((treatment, index) => (
            <li key={index} className="mb-1 text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{treatment.date}:</span> {treatment.procedure} (Doktor: {treatment.doctor})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Walang kamakailang paggamot.</p>
      )}
    </div>

    <div className="mb-6 border-t pt-4 border-blue-200 dark:border-blue-700">
      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Susunod na Appointment</h3>
      {data.nextAppointment ? (
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">{data.nextAppointment.date}</span>, <span className="font-semibold">{data.nextAppointment.time}</span>
          <br/>Serbisyo: {data.nextAppointment.service}
          <br/>Doktor: {data.nextAppointment.doctor}
        </p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Walang nakatakdang susunod na appointment.</p>
      )}
    </div>

    <div className="mt-8 pt-4 border-t border-blue-200 dark:border-blue-700 text-center text-sm text-gray-600 dark:text-gray-400">
      <p>&copy; {new Date().getFullYear()} {clinicInfo.name}. Lahat ng karapatan ay nakalaan.</p>
    </div>
  </div>
);

// Appointment Confirmation PDF Design
const AppointmentConfirmationPDF = ({ data }) => (
  <div className="p-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-w-xl mx-auto my-8 font-sans text-gray-800 dark:text-gray-200">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-3">Kumpirmasyon ng Appointment</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">Mula sa {data.clinicName}</p>
    </div>

    <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-blue-800 dark:text-blue-200">
      <p className="text-xl font-semibold mb-3">Mahal na {data.patientName},</p>
      <p className="text-lg">
        Kinukumpirma namin ang iyong appointment para sa:
      </p>
    </div>

    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
      <div>
        <p className="font-semibold text-blue-700 dark:text-blue-300">Petsa:</p>
        <p className="text-gray-900 dark:text-gray-100 font-bold">{data.appointmentDate}</p>
      </div>
      <div>
        <p className="font-semibold text-blue-700 dark:text-blue-300">Oras:</p>
        <p className="text-gray-900 dark:text-gray-100 font-bold">{data.appointmentTime}</p>
      </div>
      <div className="col-span-full">
        <p className="font-semibold text-blue-700 dark:text-blue-300">Doktor:</p>
        <p className="text-gray-900 dark:text-gray-100">{data.doctorName}</p>
      </div>
      <div className="col-span-full">
        <p className="font-semibold text-blue-700 dark:text-blue-300">Serbisyo:</p>
        <p className="text-gray-900 dark:text-gray-100">{data.service}</p>
      </div>
    </div>

    <div className="text-center text-md text-gray-700 dark:text-gray-300 border-t pt-6 border-blue-200 dark:border-blue-700">
      <p>Mangyaring dumating 15 minuto bago ang iyong appointment.</p>
      <p className="mt-4">
        Kung mayroon kang katanungan o kailangan mong baguhin ang iyong appointment,
        tawagan kami sa <span className="font-semibold">{data.contactInfo}</span>.
      </p>
      <p className="mt-6 text-blue-700 dark:text-blue-300 font-semibold">{data.clinicName}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{data.clinicAddress}</p>
    </div>
  </div>
);

export default function PDFDesignShowcase() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-blue-50 to-blue-100 p-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-blue-900 dark:text-blue-100 mb-12">
        <span className="block text-blue-700 dark:text-blue-300">Iba't Ibang Disenyo ng PDF</span>
        para sa Dental Clinic
      </h1>

      <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6 text-center mt-12">1. Invoice / Bill ng Paggamot</h2>
      <InvoicePDF data={mockInvoiceData} clinicInfo={mockClinicInfo} />
      <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6 text-center mt-12">2. Patient Summary Report</h2>
      <PatientSummaryPDF data={mockPatientSummaryData} clinicInfo={mockClinicInfo} />
      <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6 text-center mt-12">3. Kumpirmasyon ng Appointment</h2>
      <AppointmentConfirmationPDF data={mockAppointmentConfirmationData} />

    </div>
  );
}
