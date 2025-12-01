const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Treatment = require("../Models/Treatments");
const Appointment = require("../Models/appointmentSchema");
const CustomError = require("../Utils/CustomError");
const cloudinary = require("../Utils/cloudinary");
const TreatmentResult = require("../Models/Before&after");

const PDFDocument = require('pdfkit');
const {
  sendTreatmentNotification,
} = require("./../Controller/Services/TreatmentSocketServices");

exports.createTreatment = async (req, res) => {
  try {
    const {
      appointment_id,
      treatment_description,
      treatment_date,
      treatment_cost,
      overallNotes,
      resultType,
      progress = [],
    } = req.body;

    // 1Validate appointment_id
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      return res.status(400).json({ message: "Invalid appointment_id" });
    }

    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.appointment_status !== "Completed") {
      return res.status(400).json({
        message: "Treatment can only be added to a completed appointment",
      });
    }

    // 2️⃣ Create Treatment
    const newTreatment = await Treatment.create({
      appointment_id,
      treatment_description,
      treatment_date,
      treatment_cost,
    });

    // 3 Process progress images
    const processedProgress = [];
    for (const item of progress) {
      let beforeImg = null;
      let afterImg = null;

      if (item.beforeImageBase64) {
        const uploadedBefore = await cloudinary.uploader.upload(item.beforeImageBase64, {
          folder: "treatments/progress/before",
        });
        beforeImg = {
          url: uploadedBefore.secure_url,
          public_id: uploadedBefore.public_id,
          notes: item.beforeNotes || "",
        };
      }

      if (item.afterImageBase64) {
        const uploadedAfter = await cloudinary.uploader.upload(item.afterImageBase64, {
          folder: "treatments/progress/after",
        });
        afterImg = {
          url: uploadedAfter.secure_url,
          public_id: uploadedAfter.public_id,
          notes: item.afterNotes || "",
        };
      }

      if (beforeImg || afterImg) {
        processedProgress.push({
          beforeImage: beforeImg,
          afterImage: afterImg,
          description: item.description || "",
          stage: item.stage || "",
        });
      }
    }

    // Create TreatmentResult if needed
    let treatmentResult = null;
    if (resultType && processedProgress.length > 0) {
      treatmentResult = await TreatmentResult.create({
        patient: appointment.patient_id,
        treatment: newTreatment._id,
        resultType,
        overallNotes: overallNotes || "",
        progress: processedProgress,
      });
    }

    //Aggregate enriched data safely
    const enriched = await Treatment.aggregate([
      { $match: { _id: newTreatment._id } },
      {
        $lookup: {
          from: "appointments",
          localField: "appointment_id",
          foreignField: "_id",
          as: "Appointment_info",
        },
      },
      { $unwind: { path: "$Appointment_info", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "patients",
          let: { patientId: "$Appointment_info.patient_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$patientId"] } } },
            { $project: { first_name: 1, last_name: 1, address: 1 } },
          ],
          as: "Patient_info",
        },
      },
      { $unwind: { path: "$Patient_info", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          treatment_description: 1,
          treatment_date: 1,
          treatment_cost: 1,
          appointment_id: 1,
          patient_name: {
            $concat: [
              { $ifNull: ["$Patient_info.first_name", ""] },
              " ",
              { $ifNull: ["$Patient_info.last_name", ""] },
            ],
          },
          patient_address: "$Patient_info.address",
          appointment_date: "$Appointment_info.appointment_date",
        },
      },
    ]);

    //Socket notification only if enriched data exists
    const io = req.app.get("io");
    if (enriched[0]) {
      sendTreatmentNotification(io, enriched[0]);
      io.emit("new-treatment", enriched[0]);
    }

    // Send success response
    res.status(201).json({
      status: "success",
      data: {
        treatment: enriched[0] || null,
        treatmentResult: treatmentResult || null,
      },
    });
  } catch (error) {
    console.error("Error creating treatment:", error);
    res.status(500).json({
      status: "fail",
      message: error.message || "Internal server error",
    });
  }
};

exports.DisplayTreatment = AsyncErrorHandler(async (req, res) => {
  const results = await Treatment.aggregate([
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
              $expr: {
                $eq: ["$_id", "$$patientId"],
              },
            },
          },
          { $project: { first_name: 1, last_name: 1, address: 1 } },
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
        treatment_description: 1,
        treatment_date: 1,
        treatment_cost: 1,
        appointment_id: 1,
        done: 1,
        patient_id: "$Appointment_info.patient_id", // <- Add this to include patient_id
        patient_name: {
          $cond: {
            if: { $not: { $ifNull: ["$Patient_info", false] } },
            then: "N/A",
            else: {
              $concat: [
                { $ifNull: ["$Patient_info.first_name", ""] },
                " ",
                { $ifNull: ["$Patient_info.last_name", ""] },
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
    { $sort: { treatment_date: -1 } },
  ]);

  return res.status(200).json({
    status: "success",
    data: results,
  });
});

exports.UpdateTreatment = AsyncErrorHandler(async (req, res, next) => {
  const {
    appointment_id,
    treatment_description,
    treatment_date,
    treatment_cost,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid ID format", 400));
  }

  const updateTreatment = await Treatment.findByIdAndUpdate(
    req.params.id,
    {
      appointment_id,
      treatment_description,
      treatment_date,
      treatment_cost,
    },
    { new: true }
  );

  if (!updateTreatment) {
    return next(new CustomError("Treatment not found", 404));
  }

  const enriched = await Treatment.aggregate([
    { $match: { _id: updateTreatment._id } },
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
        // TAMA: Gamitin ang patient_id mula sa Appointment_info
        let: { patientId: "$Appointment_info.patient_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$patientId"] } } },
          { $project: { first_name: 1, last_name: 1, address: 1 } },
        ],
        as: "Patient_info",
      },
    },
    { $unwind: { path: "$Patient_info", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        treatment_description: 1,
        treatment_date: 1,
        treatment_cost: 1,
        appointment_id: 1,
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
        patient_address: "$Patient_info.address",
        appointment_date: "$Appointment_info.appointment_date",
      },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: enriched[0],
  });
});

exports.deleteTreatment = AsyncErrorHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid ID", 400));
  }

  const deletedTreatment = await Treatment.findByIdAndDelete(req.params.id);
  if (!deletedTreatment) {
    return next(new CustomError("Treatment not found", 404));
  }

  return res.status(200).json({
    status: "success",
    message: "Treatment deleted successfully",
    data: deletedTreatment,
  });
});

exports.DisplayTreatmentByPatientId = AsyncErrorHandler(async (req, res) => {
  const { id: patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid Patient ID format. Please provide a valid ObjectId.",
    });
  }

  const results = await Treatment.aggregate([
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
      $match: {
        "Appointment_info.patient_id": new mongoose.Types.ObjectId(patientId),
      },
    },
    {
      $lookup: {
        from: "patients",
        let: { patientId: "$Appointment_info.patient_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$patientId"],
              },
            },
          },
          { $project: { first_name: 1, last_name: 1, address: 1 } },
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
        treatment_description: 1,
        treatment_date: 1,
        treatment_cost: 1,
        done: 1,
        appointment_id: 1,
        patient_id: "$Appointment_info.patient_id",
        patient_name: {
          $cond: {
            if: { $not: { $ifNull: ["$Patient_info", false] } },
            then: "N/A",
            else: {
              $concat: [
                { $ifNull: ["$Patient_info.first_name", ""] },
                " ",
                { $ifNull: ["$Patient_info.last_name", ""] },
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
    data: results,
  });
});

exports.GenerateTreatmentPDF = async (req, res) => {
  try {
    const { from, to, patientName, description } = req.query;

    // Date filtering setup
    const matchStage = {};
    let displayFrom, displayTo;
    let hasDateFilter = false;

    if (from || to) {
      hasDateFilter = true;
      matchStage.treatment_date = {};
      if (from) {
        const fromDate = new Date(from);
        matchStage.treatment_date.$gte = fromDate;
        displayFrom = fromDate.toLocaleDateString('en-PH');
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        matchStage.treatment_date.$lte = toDate;
        displayTo = toDate.toLocaleDateString('en-PH');
      }
    }

    // Aggregation with patient_name and treatment_description
    const results = await Treatment.aggregate([
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
              $match: { $expr: { $eq: ["$_id", "$$patientId"] } },
            },
            { $project: { first_name: 1, last_name: 1, address: 1 } },
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
          treatment_description: 1,
          treatment_date: 1,
          treatment_cost: 1,
          done: 1,
          patient_name: {
            $cond: {
              if: { $not: { $ifNull: ["$Patient_info", false] } },
              then: "N/A",
              else: {
                $concat: [
                  { $ifNull: ["$Patient_info.first_name", ""] },
                  " ",
                  { $ifNull: ["$Patient_info.last_name", ""] },
                ],
              },
            },
          },
          patient_address: { $ifNull: ["$Patient_info.address", "N/A"] },
        },
      },
      { $sort: { treatment_date: -1 } },
    ]);

    // Apply date filter
    let filteredResults = results;
    if (hasDateFilter) {
      filteredResults = filteredResults.filter(item => {
        const d = new Date(item.treatment_date);
        let valid = true;
        if (matchStage.treatment_date.$gte) valid = valid && d >= matchStage.treatment_date.$gte;
        if (matchStage.treatment_date.$lte) valid = valid && d <= matchStage.treatment_date.$lte;
        return valid;
      });
    }

    // Apply patient name filter
    if (patientName && patientName.trim() !== "") {
      const searchTerm = patientName.trim().toLowerCase();
      filteredResults = filteredResults.filter(item =>
        item.patient_name !== "N/A" &&
        item.patient_name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply description filter
    if (description && description.trim() !== "") {
      const descTerm = description.trim().toLowerCase();
      filteredResults = filteredResults.filter(item =>
        item.treatment_description &&
        item.treatment_description.toLowerCase().includes(descTerm)
      );
    }

    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    const filename = `treatment-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4', 
      bufferPages: true 
    });
    doc.pipe(res);

    // Colors
    const primaryColor = '#2563eb';
    const headerBg = '#f1f5f9';
    const borderColor = '#cbd5e1';

    // Page dimensions
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const FOOTER_HEIGHT = 50;
    const PAGE_BOTTOM = pageHeight - FOOTER_HEIGHT;

    // ===== BUSINESS HEADER =====
    const businessName = 'Doc. Saclolo Dental Care';
    const contactInfo = {
      phone: '(02) 123-4567',           // ← UPDATE THESE
      email: 'info@saclolodentalcare.com',
      address: 'Naval,Biliran, Philippines'
    };

    // Business name
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(businessName, margin, 20, { align: 'center' });

    // Contact info
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Phone: ${contactInfo.phone}`, margin, 40, { align: 'center' })
       .text(`Email: ${contactInfo.email}`, margin, 52, { align: 'center' })
       .text(`Address: ${contactInfo.address}`, margin, 64, { align: 'center' });

    // Start main content after business header
    let currentY = 90;
    doc.y = currentY;

    // ===== REPORT TITLE BANNER =====
    doc.rect(0, currentY, pageWidth, 40).fill(primaryColor);
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('TREATMENT REPORT', margin, currentY + 12, { align: 'center' });
    doc.moveDown(2);
    doc.fillColor('#000000');

    // ===== FILTER SUMMARY =====
    let filterText = '';
    if (from || to) {
      const fromText = displayFrom || 'Any';
      const toText = displayTo || 'Any';
      filterText += `Date Range: ${fromText} to ${toText}\n`;
    }
    if (patientName && patientName.trim() !== "") {
      filterText += `Patient Name: "${patientName.trim()}"\n`;
    }
    if (description && description.trim() !== "") {
      filterText += `Description: "${description.trim()}"\n`;
    }

    if (filterText) {
      const filterY = doc.y;
      doc.roundedRect(margin, filterY, pageWidth - 2 * margin, 0, 5).fill(headerBg);
      doc.fillColor('#334155')
         .fontSize(10)
         .text(filterText, margin + 15, filterY + 10, {
           width: pageWidth - 2 * margin - 30,
           align: 'left'
         });
      const filterHeight = doc.y - filterY + 15;
      doc.roundedRect(margin, filterY, pageWidth - 2 * margin, filterHeight, 5)
         .stroke(borderColor);
      doc.moveDown(1);
    }

    // Summary
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(`Total Treatments: ${filteredResults.length}`, margin, doc.y);
    doc.moveDown(1.5);

    // ===== TABLE =====
    const drawTableHeader = (yPos) => {
      const y = yPos || doc.y;
      const headers = ['Date', 'Patient Name', 'Address', 'Treatment', 'Cost', 'Status'];
      const colWidths = [80, 130, 85, 100, 55, 70];
      let x = margin;

      doc.rect(margin, y - 5, pageWidth - 2 * margin, 25).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(h, x + 5, y, { width: colWidths[i] - 10 });
        x += colWidths[i];
      });
      doc.fillColor('#000000');
      return y + 25;
    };

    let tableY = drawTableHeader();
    doc.y = tableY + 5;
    const colWidths = [80, 130, 85, 100, 55, 70];
    const rowHeight = 24;
    let rowIndex = 0;

    if (filteredResults.length === 0) {
      doc.fontSize(12)
         .fillColor('#ef4444')
         .text('No treatment records found.', margin, doc.y);
    } else {
      filteredResults.forEach((item) => {
        const spaceNeeded = rowHeight + 5;
        const spaceAvailable = PAGE_BOTTOM - doc.y;

        if (spaceAvailable < spaceNeeded) {
          doc.addPage();
          tableY = drawTableHeader(50);
          doc.y = tableY + 5;
          rowIndex = 0;
        }

        const rowY = doc.y;
        if (rowIndex % 2 === 0) {
          doc.rect(margin, rowY - 3, pageWidth - 2 * margin, rowHeight).fill('#f8fafc');
        }

        const treatmentDate = item.treatment_date
          ? new Date(item.treatment_date).toLocaleDateString('en-PH')
          : 'N/A';

        let patientNameDisplay = (item.patient_name || 'N/A').trim();
        if (!patientNameDisplay || patientNameDisplay === 'N/A') {
          patientNameDisplay = 'N/A';
        } else {
          patientNameDisplay = patientNameDisplay.length > 25
            ? patientNameDisplay.substring(0, 24) + '…'
            : patientNameDisplay;
        }

        const statusText = item.done ? 'Done' : 'Pending';
        const statusColor = item.done ? '#16a34a' : '#f59e0b';
        const treatmentDesc = (item.treatment_description || '–').substring(0, 18);
        const address = (item.patient_address || 'N/A').substring(0, 16);
        const cost = item.treatment_cost != null
          ? `₱${Number(item.treatment_cost).toFixed(2)}`
          : '–';

        const rowData = [
          { text: treatmentDate, color: '#64748b' },
          { text: patientNameDisplay, color: '#0f172a' },
          { text: address, color: '#475569' },
          { text: treatmentDesc, color: '#1e293b' },
          { text: cost, color: '#1e293b' },
          { text: statusText, color: statusColor },
        ];

        let x = margin;
        doc.fontSize(9).font('Helvetica');
        rowData.forEach((cell, i) => {
          doc.fillColor(cell.color)
             .text(cell.text, x + 5, rowY, {
               width: colWidths[i] - 10,
               ellipsis: true,
             });
          x += colWidths[i];
        });

        doc.strokeColor(borderColor)
           .lineWidth(0.5)
           .moveTo(margin, rowY + rowHeight - 5)
           .lineTo(pageWidth - margin, rowY + rowHeight - 5)
           .stroke();

        doc.y = rowY + rowHeight;
        rowIndex++;
      });
    }

    // ===== SMART FOOTER POSITIONING =====
    const range = doc.bufferedPageRange();
    const totalPages = range.count;

    if (totalPages === 1) {
      const contentEndY = doc.y;
      let footerY;

      if (contentEndY > PAGE_BOTTOM - 20) {
        footerY = pageHeight - 40;
      } else {
        footerY = Math.max(contentEndY + 30, pageHeight - 100);
        footerY = Math.min(footerY, pageHeight - 30);
        if (footerY < contentEndY + 20) {
          footerY = contentEndY + 20;
        }
      }

      doc.strokeColor(borderColor)
         .lineWidth(0.5)
         .moveTo(margin, footerY)
         .lineTo(pageWidth - margin, footerY)
         .stroke();

      doc.fontSize(8)
         .fillColor('#64748b')
         .text(`Generated on ${new Date().toLocaleString('en-PH')}`, margin, footerY + 5, { align: 'left' })
         .text(`Page 1 of 1`, pageWidth - margin, footerY + 5, { align: 'right' });
    } else {
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        const footerY = pageHeight - 40;

        doc.strokeColor(borderColor)
           .lineWidth(0.5)
           .moveTo(margin, footerY)
           .lineTo(pageWidth - margin, footerY)
           .stroke();

        doc.fontSize(8)
           .fillColor('#64748b')
           .text(`Generated on ${new Date().toLocaleString('en-PH')}`, margin, footerY + 5, { align: 'left' })
           .text(`Page ${i + 1} of ${totalPages}`, pageWidth - margin, footerY + 5, { align: 'right' });
      }
    }

    doc.end();
  } catch (error) {
    console.error('Treatment PDF Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate treatment report PDF',
        error: error.message,
      });
    }
  }
};