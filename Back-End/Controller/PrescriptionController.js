const mongoose = require("mongoose");
const streamifier = require("streamifier");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Prescription = require("./../Models/Prescription");
const Apifeatures = require("./../Utils/ApiFeatures");
const axios = require("axios");
const Appointment = require("../Models/appointmentSchema");
const cloudinary = require("./../Utils/cloudinary")
const PDFDocument = require("pdfkit");
const AppointmentStepProcess = require("./../Models/AppointmentStepProcess");

exports.createPrescription = AsyncErrorHandler(async (req, res) => {
  const { appointment_id, medications, special_instructions, refills } = req.body;

  if (!appointment_id || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({
      message: "Missing required fields: appointment_id and medications[]"
    });
  }

  // Validate each medication
  for (const med of medications) {
    const requiredFields = ['medication_name', 'dosage', 'frequency', 'start_date', 'end_date'];
    for (const field of requiredFields) {
      if (!med[field]) {
        return res.status(400).json({
          message: `Each medication must include: ${requiredFields.join(', ')}`
        });
      }
    }

    const startDate = new Date(med.start_date);
    const endDate = new Date(med.end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format in medication dates" });
    }
    if (startDate >= endDate) {
      return res.status(400).json({
        message: `End date must be after start date for ${med.medication_name}`
      });
    }
  }

  // Check appointment - POPULATE patient and doctor details
  const appointment = await Appointment.findById(appointment_id)
    .populate('patient_id')
    .populate('doctor_id');
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  if (appointment.appointment_status !== "Completed") {
    return res.status(400).json({ 
      message: "Prescription can only be added to a completed appointment" 
    });
  }

  // Prepare prescription data
  const prescriptionData = {
    appointment_id,
    medications: medications.map(m => ({
      medication_name: m.medication_name.trim(),
      dosage: m.dosage.trim(),
      frequency: m.frequency.trim(),
      start_date: new Date(m.start_date),
      end_date: new Date(m.end_date),
    })),
    prescribed_date: new Date(),
    ...(special_instructions && { special_instructions: special_instructions.trim() }),
    ...(refills !== undefined && { refills: parseInt(refills, 10) })
  };

  const prescription = await Prescription.create(prescriptionData);

  // Generate and upload PDF with appointment details
  const pdfUrl = await generateAndUploadPrescriptionPDF(prescription, appointment);
  prescription.fileUrl = pdfUrl;
  await prescription.save();

    await AppointmentStepProcess.findOneAndUpdate(
    { appointmentId: appointment_id },
    {
      $set: {
        "steps.$[prescriptionStep].status": "completed",
        "steps.$[completedStep].status": "in-progress",
        currentStep: 5, 
      },
    },
    {
      arrayFilters: [
        { "prescriptionStep.stepName": "Prescription" },
        { "completedStep.stepName": "Completed" },
      ],
      new: true,
    }
  );

  // Fetch full prescription with populated details
  const prescriptionWithDetails = await getPrescriptionWithDetails(prescription._id);

  return res.status(201).json({
    status: "success",
    message: "Prescription created successfully",
    data: prescriptionWithDetails
  });
});

const generateAndUploadPrescriptionPDF = async (prescription, appointment) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  // Generate PDF content with prescription, appointment data
  generatePDFContent(doc, prescription, appointment);

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.end();

  await new Promise((resolve, reject) => {
    doc.on('end', resolve);
    doc.on('error', reject);
  });

  const pdfBuffer = Buffer.concat(chunks);

  // Upload to Cloudinary
  const folderPath = "prescriptions/rx";
  const fileName = `prescription_${prescription._id}_${Date.now()}.pdf`;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: "raw",
        public_id: fileName.replace(".pdf", ""),
        use_filename: true,
        unique_filename: false,
        access_mode: "public",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(pdfBuffer).pipe(stream);
  });

  return uploadResult.secure_url;
};

const generatePDFContent = (doc, prescription, appointment) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;

  // Colors
  const primaryBlue = '#1e5aa8';
  const lightBlue = '#e3f2fd';
  const textGray = '#333333';
  const borderGray = '#d0d0d0';

  // Helper: Format Date
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  // Get patient info
  const patient = appointment.patient_id || {};
  const patientName = patient.first_name && patient.last_name 
    ? `${patient.first_name} ${patient.last_name}` 
    : 'N/A';
  const patientAddress = patient.address || 'N/A';
  const patientPhone = patient.phone || 'N/A';
  
  // Get doctor info
  const doctor = appointment.doctor_id || {};
  const doctorName = doctor.first_name && doctor.last_name 
    ? `Dr. ${doctor.first_name} ${doctor.last_name}` 
    : 'Dr. N/A';
  const doctorLicense = doctor.license_number || 'N/A';

  // ========== HEADER ==========
  doc.fillColor(primaryBlue).fontSize(20).font('Helvetica-Bold');
  doc.text('DENTAL CLINIC', margin, margin, { align: 'center' });
  
  doc.fontSize(10).font('Helvetica').fillColor(textGray);
  doc.text('123 Dental Street, City, Country', { align: 'center' });
  doc.text('Phone: (123) 456-7890 | Email: info@dentalclinic.com', { align: 'center' });
  doc.moveDown(0.5);

  // Divider
  doc.moveTo(margin, doc.y)
    .lineTo(pageWidth - margin, doc.y)
    .strokeColor(primaryBlue)
    .lineWidth(2)
    .stroke();
  doc.moveDown(1);

  // ========== RX SYMBOL & TITLE ==========
  const rxY = doc.y;
  drawRxSymbol(doc, margin, rxY, 32);
  
  doc.fontSize(18).font('Helvetica-Bold').fillColor(primaryBlue);
  doc.text('PRESCRIPTION', margin + 55, rxY + 5);
  doc.moveDown(1.2);

  // ========== PRESCRIPTION INFO (2 COLUMNS) ==========
  const infoY = doc.y;
  doc.fontSize(9).font('Helvetica').fillColor(textGray);
  
  // Left column
  doc.text(`Rx ID:`, margin, infoY);
  doc.text(prescription._id.toString(), margin + 45, infoY);
  
  // Right column
  doc.text(`Prescribed:`, pageWidth / 2, infoY);
  doc.text(formatDate(prescription.prescribed_date), pageWidth / 2 + 60, infoY);
  
  doc.text(`Appointment:`, pageWidth / 2, infoY + 12);
  doc.text(formatDate(appointment.appointment_date), pageWidth / 2 + 60, infoY + 12);
  
  doc.moveDown(2);

  // ========== PATIENT INFORMATION ==========
  const patientBoxY = doc.y;
  
  // Header bar
  doc.fillColor(lightBlue)
    .rect(margin, patientBoxY, pageWidth - margin * 2, 20)
    .fill();
  
  doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold');
  doc.text('PATIENT INFORMATION', margin + 10, patientBoxY + 6);
  
  // Patient details box
  const patientContentY = patientBoxY + 20;
  doc.strokeColor(borderGray)
    .lineWidth(1)
    .rect(margin, patientContentY, pageWidth - margin * 2, 50)
    .stroke();
  
  doc.fontSize(9).font('Helvetica').fillColor(textGray);
  const pY = patientContentY + 8;
  const labelCol = margin + 10;
  const valueCol = margin + 70;
  
  doc.font('Helvetica-Bold').text('Name:', labelCol, pY);
  doc.font('Helvetica').text(patientName, valueCol, pY);
  
  doc.font('Helvetica-Bold').text('Address:', labelCol, pY + 15);
  doc.font('Helvetica').text(patientAddress, valueCol, pY + 15, { 
    width: pageWidth - valueCol - margin - 10 
  });
  
  doc.font('Helvetica-Bold').text('Phone:', labelCol, pY + 30);
  doc.font('Helvetica').text(patientPhone, valueCol, pY + 30);
  
  doc.y = patientContentY + 50;
  doc.moveDown(1);

  // ========== MEDICATIONS ==========
  const medHeaderY = doc.y;
  
  // Header bar
  doc.fillColor(lightBlue)
    .rect(margin, medHeaderY, pageWidth - margin * 2, 20)
    .fill();
  
  doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold');
  doc.text('MEDICATIONS', margin + 10, medHeaderY + 6);
  
  doc.y = medHeaderY + 20;
  doc.moveDown(0.5);

  // Render medications
  if (prescription.medications && prescription.medications.length > 0) {
    prescription.medications.forEach((med, index) => {
      const rowHeight = 75;
      const currentY = doc.y;

      // Check if need new page - with better space calculation for footer
      const spaceNeeded = rowHeight + 120; // 120px for signature + footer
      if (currentY + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        doc.y = margin + 20;
      }

      // Medication container
      const medY = doc.y;
      
      doc.fillColor('#ffffff')
        .strokeColor(borderGray)
        .lineWidth(1)
        .roundedRect(margin, medY, pageWidth - margin * 2, rowHeight, 5)
        .fillAndStroke();

      const contentStartY = medY + 10;
      const leftCol = margin + 15;
      const rightCol = pageWidth / 2 + 10;

      // Medication number badge
      doc.fillColor(primaryBlue)
        .circle(leftCol - 5, contentStartY + 5, 10)
        .fill();
      
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text(index + 1, leftCol - 9, contentStartY + 1, { width: 8, align: 'center' });

      // Medication name (prominent)
      doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold');
      doc.text(med.medication_name || 'N/A', leftCol + 12, contentStartY);

      // Left column details
      doc.fillColor(textGray).fontSize(9).font('Helvetica-Bold');
      doc.text('Dosage:', leftCol, contentStartY + 20);
      doc.font('Helvetica').fontSize(9);
      doc.text(med.dosage || 'N/A', leftCol, contentStartY + 32);

      doc.font('Helvetica-Bold');
      doc.text('Frequency:', leftCol, contentStartY + 47);
      doc.font('Helvetica');
      doc.text(med.frequency || 'N/A', leftCol, contentStartY + 59);

      // Right column details
      doc.font('Helvetica-Bold');
      doc.text('Duration:', rightCol, contentStartY + 20);
      doc.font('Helvetica').fontSize(8);
      doc.text(`${formatDate(med.start_date)}`, rightCol, contentStartY + 32);
      doc.text(`to ${formatDate(med.end_date)}`, rightCol, contentStartY + 42);

      // Refills (if applicable)
      if (prescription.refills !== undefined && prescription.refills !== null) {
        doc.font('Helvetica-Bold').fontSize(9);
        doc.text('Refills:', rightCol, contentStartY + 57);
        doc.font('Helvetica');
        doc.text(prescription.refills.toString(), rightCol + 35, contentStartY + 57);
      }

      doc.y = medY + rowHeight;
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(9).fillColor(textGray).font('Helvetica-Oblique');
    doc.text('No medications prescribed.', margin + 10);
    doc.moveDown(1);
  }

  // ========== SPECIAL INSTRUCTIONS ==========
  if (prescription.special_instructions) {
    // Calculate space needed for special instructions
    const testHeight = doc.heightOfString(prescription.special_instructions, {
      width: pageWidth - margin * 2 - 20
    });
    const instructionsHeight = testHeight + 40;
    
    // Check for page space including footer
    if (doc.y + instructionsHeight + 100 > pageHeight - margin) {
      doc.addPage();
      doc.y = margin + 20;
    }

    doc.moveDown(0.5);
    
    const instY = doc.y;
    const boxHeight = instructionsHeight;
    
    // Draw instruction box
    doc.fillColor('#fff4e6')
      .strokeColor('#ffa726')
      .lineWidth(1)
      .roundedRect(margin, instY, pageWidth - margin * 2, boxHeight, 5)
      .fillAndStroke();
    
    // Instruction content
    doc.fillColor('#f57c00').fontSize(10).font('Helvetica-Bold');
    doc.text('⚠ Special Instructions:', margin + 10, instY + 10);
    
    doc.fillColor(textGray).fontSize(9).font('Helvetica');
    doc.text(prescription.special_instructions, margin + 10, instY + 25, {
      width: pageWidth - margin * 2 - 20,
      align: 'left'
    });
    
    doc.y = instY + boxHeight;
    doc.moveDown(1);
  }

  // ========== FOOTER SECTION - COMPLETELY REWORKED ==========
  
  // Define footer heights
  const signatureHeight = 55;
  const footerTextHeight = 20;
  const totalFooterHeight = signatureHeight + footerTextHeight + 30; // +30 for spacing
  
  // Check if we need a new page for the footer
  if (doc.y + totalFooterHeight > pageHeight - margin) {
    doc.addPage();
    doc.y = margin;
  }
  
  // ========== SIGNATURE AREA ==========
  // Position signature area with consistent spacing
  const signatureY = Math.max(doc.y, pageHeight - totalFooterHeight);
  doc.y = signatureY;
  
  // Add some space before signature
  doc.moveDown(0.5);
  
  const sigBoxWidth = 170;
  const sigBoxX = pageWidth - margin - sigBoxWidth;
  const currentSigY = doc.y;
  
  // Signature box
  doc.strokeColor(borderGray)
    .lineWidth(1)
    .rect(sigBoxX, currentSigY, sigBoxWidth, signatureHeight)
    .stroke();
  
  // Signature line
  const sigLineY = currentSigY + 22;
  doc.moveTo(sigBoxX + 10, sigLineY)
    .lineTo(sigBoxX + sigBoxWidth - 10, sigLineY)
    .strokeColor(textGray)
    .lineWidth(1)
    .stroke();
  
  // Label above line
  doc.fontSize(7).fillColor('#888888').font('Helvetica');
  doc.text('Authorized Signature', sigBoxX + 10, currentSigY + 8);
  
  // Doctor name below line
  doc.fontSize(9).font('Helvetica-Bold').fillColor(textGray);
  doc.text(doctorName, sigBoxX + 10, sigLineY + 5, {
    width: sigBoxWidth - 20,
    align: 'left'
  });
  
  // License number
  doc.fontSize(8).font('Helvetica').fillColor(textGray);
  doc.text(`License No: ${doctorLicense}`, sigBoxX + 10, sigLineY + 18, {
    width: sigBoxWidth - 20,
    align: 'left'
  });

  // ========== FOOTER TEXT - FIXED POSITION ==========
  // Always position footer text at the bottom of the page
  const fixedFooterY = pageHeight - 30;
  
  // Footer divider line
  doc.strokeColor(borderGray)
    .lineWidth(0.5)
    .moveTo(margin, fixedFooterY - 12)
    .lineTo(pageWidth - margin, fixedFooterY - 12)
    .stroke();
  
  // Footer text - always at the same position
  const footerText = 'This is a computer-generated prescription. Please verify with your healthcare provider.';
  
  doc.fontSize(7)
    .fillColor('#666666')
    .font('Helvetica-Oblique')
    .text(footerText, margin, fixedFooterY - 8, {
      align: 'center',
      width: pageWidth - (margin * 2)
    });
};

const drawRxSymbol = (doc, x, y, size = 40) => {
  doc.save();
  doc.fillColor('#1e5aa8');
  
  // Draw clear "Rx" symbol
  doc.fontSize(size).font('Helvetica-Bold');
  doc.text('R', x, y);
  
  // Draw subscript "x"
  doc.fontSize(size * 0.6);
  doc.text('x', x + (size * 0.5), y + (size * 0.4));
  
  doc.restore();
};



const getPrescriptionWithDetails = async (prescriptionId) => {
  const result = await Prescription.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(prescriptionId) } },
    {
      $lookup: {
        from: "appointments",
        localField: "appointment_id",
        foreignField: "_id",
        as: "appointment_info",
      },
    },
    { $unwind: { path: "$appointment_info", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "patients",
        localField: "appointment_info.patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "doctors",
        localField: "appointment_info.doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    { $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        appointment_id: 1,
        medications: 1,
        special_instructions: 1,
        refills: 1,
        prescribed_date: 1,
        fileUrl: 1,
        patient_name: {
          $cond: {
            if: { $and: ["$patient_info.first_name", "$patient_info.last_name"] },
            then: { $concat: ["$patient_info.first_name", " ", "$patient_info.last_name"] },
            else: "N/A"
          }
        },
        doctor_name: {
          $cond: {
            if: { $and: ["$doctor_info.first_name", "$doctor_info.last_name"] },
            then: { $concat: ["Dr. ", "$doctor_info.first_name", " ", "$doctor_info.last_name"] },
            else: "N/A"
          }
        },
        patient_address: "$patient_info.address",
        patient_phone: "$patient_info.contact_number",
        appointment_date: "$appointment_info.appointment_date"
      },
    },
  ]);

  return result[0] || null;
};

exports.DisplayPrescription = AsyncErrorHandler(async (req, res) => {
  try {
    const Prescribe = await Prescription.aggregate([
      // Lookup Appointment
      {
        $lookup: {
          from: "appointments",
          localField: "appointment_id",
          foreignField: "_id",
          as: "Appointment_info",
        },
      },
      {
        $unwind: {
          path: "$Appointment_info",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup Patient (galing sa Appointment)
      {
        $lookup: {
          from: "patients",
          localField: "Appointment_info.patient_id",
          foreignField: "_id",
          as: "Patient_info",
        },
      },
      {
        $unwind: {
          path: "$Patient_info",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Project final output
      {
        $project: {
          _id: 1,
          appointment_id: 1,
          medications: 1,
          fileUrl: 1,
          createdAt: 1, // ✅ Ensure this is included
          patient_id: "$Appointment_info.patient_id",
          patient_name: {
            $cond: {
              if: { $ifNull: ["$Patient_info", false] },
              then: {
                $concat: [
                  { $ifNull: ["$Patient_info.first_name", ""] },
                  " ",
                  { $ifNull: ["$Patient_info.last_name", ""] },
                ],
              },
              else: "N/A",
            },
          },
          patient_address: { $ifNull: ["$Patient_info.address", "N/A"] },
          appointment_date: "$Appointment_info.appointment_date",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({
      status: "Success",
      data: Prescribe,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
});

exports.updatePrescription = AsyncErrorHandler(async (req, res, next) => {
  const {
    appointment_id,
    medication_name,
    dosage,
    frequency,
    start_date,
    end_date,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid ID format", 400));
  }

  const updatePrescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    {
      appointment_id,
      medication_name,
      dosage,
      frequency,
      start_date,
      end_date,
    },
    { new: true }
  );

  if (!updatePrescription) {
    return next(new CustomError("Prescription not found", 404));
  }

  const PrescriptionWithDetails = await Prescription.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(updatePrescription._id) },
    },
    {
      $lookup: {
        from: "appointments",
        localField: "appointment_id",
        foreignField: "_id",
        as: "Appointment_info",
      },
    },
    {
      $unwind: { path: "$Appointment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "patients",
        let: { patientId: "$Appointment_info.patient_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$patientId"] },
            },
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
              address: 1,
            },
          },
        ],
        as: "Patient_info",
      },
    },
    {
      $unwind: { path: "$Patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        appointment_id: 1,
        medication_name: 1,
        dosage: 1,
        frequency: 1,
        start_date: 1,
        end_date: 1,
        patient_id: "$Appointment_info.patient_id",
        patient_name: {
          $cond: {
            if: {
              $or: [
                { $not: "$Patient_info.first_name" },
                { $not: "$Patient_info.last_name" },
              ],
            },
            then: "N/A",
            else: {
              $concat: [
                "$Patient_info.first_name",
                " ",
                "$Patient_info.last_name",
              ],
            },
          },
        },
        patient_address: {
          $ifNull: ["$Patient_info.address", "N/A"],
        },
        appointment_date: "$Appointment_info.appointment_date",
      },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: PrescriptionWithDetails[0],
  });
});


exports.deletePrescription = AsyncErrorHandler(async (req, res, next) => {
  // First, aggregate to fetch the appointment with patient and doctor details
  const prescriptionWithDetails = await Prescription.aggregate([
    {
      // Left join with Patient collection
      $lookup: {
        from: "appointments", // MongoDB collection name (lowercase and plural)
        localField: "appointment_id", // Field from Appointment collection
        foreignField: "_id", // Field from Patient collection
        as: "Appointment_info", // Output field name with the joined data
      },
    },
    {
      // Match by the appointment's _id
      $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
    },
    {
      // Unwind the patient_info array to get flattened patient data
      $unwind: { path: "$Appointment_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  // If no appointment found, return error
  if (!prescriptionWithDetails || prescriptionWithDetails.length === 0) {
    return next(new CustomError("Appointment not found", 404));
  }

  // Now delete the appointment
  const deletePrescription = await Prescription.findByIdAndDelete(
    req.params.id
  );

  if (!deletePrescription) {
    return next(new CustomError("Failed to delete appointment", 500));
  }

  // Return a confirmation response along with the deleted appointment details
  return res.status(200).json({
    status: "success",
    message: "Appointment deleted successfully",
    data: prescriptionWithDetails[0], // Return the deleted appointment with details
  });
});

exports.DisplaySpecificPrescription = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Prescription ID is required." });

  const prescrip = await Prescription.findById(id);
  if (!prescrip) return res.status(404).json({ message: "Prescription not found." });

  try {
    let fileUrl = prescrip.fileUrl;

    // Kung may filePublicId, i-check sa Cloudinary
    if (prescrip.filePublicId) {
      try {
        // Cloudinary call to check if file exists
        const resource = await cloudinary.api.resource(prescrip.filePublicId, {
          resource_type: "raw",
        });

        // Kung walang error, may file talaga
        fileUrl = cloudinary.url(prescrip.filePublicId, { resource_type: "raw", sign_url: true });
      } catch (err) {
        // Kung Cloudinary says "not found"
        console.error("Cloudinary file not found:", err.message);
        return res.status(404).json({ message: "Prescription file not found on Cloudinary." });
      }
    } else if (!fileUrl) {
      return res.status(404).json({ message: "No prescription file available." });
    }

    // Stream PDF
    const axios = require("axios");
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Prescription_${prescrip._id}.pdf"`);
    res.setHeader("Access-Control-Allow-Origin", "*");

    response.data.pipe(res);
  } catch (error) {
    console.error("Error streaming prescription:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to stream prescription", error: error.message });
    }
  }
});

