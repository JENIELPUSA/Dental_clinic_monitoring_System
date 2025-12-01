import React, { useState, useEffect } from 'react';

// --- Common Input Fields for Reusability ---

/**
 * Renders a standard input field.
 * @param {string} id - HTML ID and name attribute.
 * @param {string} label - Label to display.
 * @param {string} type - Input type (text, date, number, etc.).
 * @param {string} placeholder - Placeholder text.
 * @param {boolean} required - Whether the field is required.
 * @param {function} onChange - Function to call on change.
 * @param {string} value - Current value.
 */
const createInputField = (id, label, type, placeholder, required, onChange, value) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input 
            type={type} 
            id={id} 
            name={id} 
            required={required} 
            placeholder={placeholder}
            onChange={onChange}
            value={value || ''}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition shadow-sm"
        />
    </div>
);

/**
 * Renders a standard select dropdown field.
 * @param {string} id - HTML ID and name attribute.
 * @param {string} label - Label to display.
 * @param {Array<{value: string, label: string}>} options - Dropdown options.
 * @param {function} onChange - Function to call on change.
 * @param {string} value - Current value.
 */
const createSelectField = (id, label, options, onChange, value) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select 
            id={id} 
            name={id} 
            required
            onChange={onChange}
            value={value || options[0]?.value || ''}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition shadow-sm bg-white"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);


// --- Dynamic Parameters Component ---

/**
 * Component to display dynamic form fields based on the selected report.
 */
const ReportParameters = ({ reportType, formData, onFormChange }) => {
    // Handler for input field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFormChange(prev => ({ ...prev, [name]: value }));
    };

    // General style for the parameter header
    const headerStyle = "text-lg font-semibold text-blue-700 mb-4 border-b pb-2";

    // Dynamic content based on report type
    let content;

    switch (reportType) {
        case 'patientInfo':
            content = (
                <>
                    <h3 className={headerStyle}>Patient Information Parameters</h3>
                    {createInputField('patientId', 'Patient ID/Name', 'text', 'E.g., P-001 or John Doe', true, handleInputChange, formData.patientId)}
                    {createSelectField('dataType', 'Data Type', [
                        { value: 'basic', label: 'Basic Information Only' },
                        { value: 'full', label: 'Complete Details (including History)' }
                    ], handleInputChange, formData.dataType)}
                </>
            );
            break;
        case 'treatmentRecords':
            content = (
                <>
                    <h3 className={headerStyle}>Treatment Records Parameters</h3>
                    {createInputField('patientIdTreat', 'Patient ID', 'text', 'E.g., P-001', true, handleInputChange, formData.patientIdTreat)}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {createInputField('startDateTreat', 'Start Date (Range)', 'date', '', true, handleInputChange, formData.startDateTreat)}
                        {createInputField('endDateTreat', 'End Date (Range)', 'date', '', true, handleInputChange, formData.endDateTreat)}
                    </div>
                    {createSelectField('groupBy', 'Group By', [
                        { value: 'date', label: 'Date' },
                        { value: 'treatment', label: 'Treatment Type' }
                    ], handleInputChange, formData.groupBy)}
                </>
            );
            break;
        case 'appointments':
            content = (
                <>
                    <h3 className={headerStyle}>Appointment Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {createInputField('startDateAppt', 'Start Date (Range)', 'date', '', true, handleInputChange, formData.startDateAppt)}
                        {createInputField('endDateAppt', 'End Date (Range)', 'date', '', true, handleInputChange, formData.endDateAppt)}
                    </div>
                    {createSelectField('statusFilter', 'Status Filter', [
                        { value: 'all', label: 'All Statuses' },
                        { value: 'scheduled', label: 'Scheduled' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' }
                    ], handleInputChange, formData.statusFilter)}
                </>
            );
            break;
        case 'inventory':
            content = (
                <>
                    <h3 className={headerStyle}>Inventory Report Parameters</h3>
                    {createSelectField('inventoryCategory', 'Inventory Category', [
                        { value: 'all', label: 'All Categories' },
                        { value: 'medicine', label: 'Medicine' },
                        { value: 'supplies', label: 'Supplies' },
                        { value: 'equipment', label: 'Equipment' }
                    ], handleInputChange, formData.inventoryCategory)}
                    {createSelectField('stockLevel', 'Stock Level', [
                        { value: 'all', label: 'All' },
                        { value: 'low', label: 'Low Stock (< 10 units)' },
                        { value: 'inStock', label: 'In Stock' }
                    ], handleInputChange, formData.stockLevel)}
                </>
            );
            break;
        default:
            content = (
                <p className="text-gray-500 text-center py-10">
                    Select a Report Type to display parameters.
                </p>
            );
    }

    return (
        <div id="parametersContainer" className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[150px] transition-all duration-300">
            {content}
        </div>
    );
};


// --- Main Application Component ---

const App = () => {
    const [reportType, setReportType] = useState('');
    const [formData, setFormData] = useState({});
    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get the label of the selected report
    const getReportName = () => {
        const options = [
            { value: 'patientInfo', label: '1. Patient Information' },
            { value: 'treatmentRecords', label: '2. Treatment Records' },
            { value: 'appointments', label: '3. Appointments and Scheduling' },
            { value: 'inventory', label: '4. Inventory Report' }
        ];
        return options.find(opt => opt.value === reportType)?.label || 'None Selected';
    };

    // Resets output and form data when the report type changes
    const handleReportTypeChange = (e) => {
        const newType = e.target.value;
        setReportType(newType);
        setFormData({});
        setOutput(null);
    };

    // Simulation function for report generation
    const simulateReportGeneration = (e) => {
        e.preventDefault();
        
        // ******************************************************
        // Dito ang console.log: I-display ang lahat ng user input
        // ******************************************************
        console.log('--- Report Generation Triggered ---');
        console.log('Report Type:', reportType);
        console.log('Form Data (Parameters):', formData);
        console.log('-----------------------------------');
        // ******************************************************

        // Start loading state
        setIsLoading(true);
        setOutput(null);

        // Simulation Delay (1.5 seconds)
        setTimeout(() => {
            const reportName = getReportName();
            const parameters = formData;

            // Create HTML output (Simulation)
            const outputHtml = (
                <>
                    <h3 className="text-xl font-bold text-green-700 mb-3">Successfully Generated!</h3>
                    <p className="text-gray-700 mb-4">
                        Report: <span className="font-semibold text-lg text-blue-700">{reportName}</span>
                    </p>
                    <p className="font-medium mb-2 text-gray-800">Simulated Report Parameters:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 bg-white p-3 rounded-md shadow-inner">
                        {Object.entries(parameters).map(([key, value]) => (
                            <li key={key} className="text-sm text-gray-700">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> 
                                <span className="text-gray-600 ml-1">{value || 'Not provided'}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 p-3 bg-cyan-500/10 border-l-4 border-cyan-500 text-sm text-gray-700 rounded-lg">
                        <p className="font-semibold">Notice:</p>
                        <p>In a real system, the PDF file would automatically download or open based on these parameters.</p>
                    </div>
                </>
            );

            setOutput(outputHtml);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-200">

                {/* Header */}
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-800 mb-2">
                        Clinic Reports Generator
                    </h1>
                    <p className="text-lg text-gray-500">
                        Select a report type and specify the required details.
                    </p>
                </header>

                {/* --- Main Content: Two Columns (Form on Left, Output on Right) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Report Generation Form */}
                    <form onSubmit={simulateReportGeneration} className="grid grid-cols-1 gap-6">

                        {/* Report Type Selection */}
                        <div className='p-4 bg-blue-50 rounded-xl border border-blue-200'>
                            <label htmlFor="reportType" className="block text-sm font-bold text-blue-800 mb-2">
                                Select Report Type:
                            </label>
                            <select 
                                id="reportType" 
                                name="reportType" 
                                onChange={handleReportTypeChange}
                                value={reportType}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-md focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 transition duration-150 ease-in-out text-base bg-white"
                            >
                                <option value="" disabled>Select an option...</option>
                                <option value="patientInfo">1. Patient Information</option>
                                <option value="treatmentRecords">2. Treatment Records</option>
                                <option value="appointments">3. Appointments and Scheduling</option>
                                <option value="inventory">4. Inventory Report</option>
                            </select>
                        </div>

                        {/* Dynamic Parameters Container */}
                        {reportType && (
                            <ReportParameters 
                                reportType={reportType} 
                                formData={formData} 
                                onFormChange={setFormData}
                            />
                        )}

                        {/* Generate Button */}
                        <button 
                            type="submit" 
                            disabled={!reportType || isLoading}
                            className={`w-full py-3 px-4 font-bold rounded-xl shadow-lg transition duration-300 ease-in-out text-lg flex items-center justify-center space-x-2
                                ${!reportType || isLoading 
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-cyan-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/50'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating... Please Wait</span>
                                </>
                            ) : (
                                <span>Generate Report (PDF)</span>
                            )}
                        </button>
                    </form>

                    {/* RIGHT COLUMN: Output/Simulation Area */}
                    <div className="p-4 md:p-6 bg-white border border-gray-300 rounded-xl shadow-xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Output (Simulation)
                        </h2>
                        <div id="outputArea" className="bg-gray-100 p-4 rounded-lg border border-gray-200 min-h-[100px] flex items-center">
                            {output ? output : (
                                <p className="text-gray-500 italic">
                                    The generated report parameters will be displayed here. (This is not a real PDF generator).
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;