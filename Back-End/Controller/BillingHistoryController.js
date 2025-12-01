const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const BillingHistory = require("../Models/BllingHiistorySchema");
const PDFDocument = require('pdfkit');

exports.DisplayBillHistory = AsyncErrorHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", from, to } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const matchStage = {};

    // Use treatment_date instead of bill_date
    if (from && to) {
      matchStage.treatment_date = {
        $gte: new Date(from + "T00:00:00.000Z"),
        $lte: new Date(to + "T23:59:59.999Z"),
      };
    } else if (from) {
      matchStage.treatment_date = { $gte: new Date(from + "T00:00:00.000Z") };
    } else if (to) {
      matchStage.treatment_date = { $lte: new Date(to + "T23:59:59.999Z") };
    }

    const searchConditions = [];
    if (search.trim()) {
      const terms = search.trim().split(/\s+/);
      searchConditions.push(
        ...terms.map((term) => ({
          $or: [
            { treatment_description: { $regex: term, $options: "i" } },
            { payment_status: { $regex: term, $options: "i" } },
            { "patient_info.first_name": { $regex: term, $options: "i" } },
            { "patient_info.last_name": { $regex: term, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: ["$patient_info.first_name", " ", "$patient_info.last_name"],
                  },
                  regex: term,
                  options: "i",
                },
              },
            },
          ],
        }))
      );
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info",
        },
      },
      {
        $unwind: {
          path: "$patient_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...(searchConditions.length > 0 ? [{ $match: { $and: searchConditions } }] : []),
      {
        $project: {
          _id: 1,
          treatment_id: 1,
          treatment_description: 1,
          treatment_date: 1,
          total_amount: 1,
          amount_paid: 1,
          balance: 1,
          payment_status: 1,
          patient_id: 1,
          patient_first_name: "$patient_info.first_name",
          patient_last_name: "$patient_info.last_name",
          patient_address: "$patient_info.address",
          patient_email: "$patient_info.email",
          patient_phone: "$patient_info.phone",
        },
      },
      { $sort: { treatment_date: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await BillingHistory.aggregate(pipeline);
    const data = results[0]?.data || [];
    const totalCount = results[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      status: "success",
      currentPage: pageNum,
      totalPages,
      totalCount,
      data,
    });
  } catch (error) {
    console.error("Error in DisplayBillHistory:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.GenerateBillHistoryPDFByPatient = async (req, res) => {
  try {
    const { From, To } = req.query;

    // Build match stage
    const matchStage = {};
    const hasFrom = From && From.trim() !== "";
    const hasTo = To && To.trim() !== "";

    if (hasFrom || hasTo) {
      matchStage.bill_date = {};
      if (hasFrom) matchStage.bill_date.$gte = new Date(From + "T00:00:00.000Z");
      if (hasTo) matchStage.bill_date.$lte = new Date(To + "T23:59:59.999Z");
    }

    // Aggregation
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info",
        },
      },
      { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          treatment_id: 1,
          treatment_description: 1,
          bill_date: 1,
          total_amount: 1,
          amount_paid: 1,
          balance: 1,
          payment_status: 1,
          patient_first_name: "$patient_info.first_name",
          patient_last_name: "$patient_info.last_name",
        },
      },
      { $sort: { bill_date: -1 } },
    ];

    const billingRecords = await BillingHistory.aggregate(pipeline);

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=bill-history-${Date.now()}.pdf`);

    // Create PDF in LANDSCAPE
    const doc = new PDFDocument({ 
      margin: 40,
      size: [842, 595],
      bufferPages: true 
    });
    doc.pipe(res);

    // Colors
    const primaryBlue = "#1e5aa8";
    const lightBlue = "#e3f2fd";
    const textGray = "#333333";
    const borderGray = "#d0d0d0";

    // Page dimensions
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 40;

    // ========== HEADER SECTION ==========
    doc.rect(0, 0, pageWidth, 90).fill(primaryBlue);

    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('DOC.SACLOLO DENTAL CARE', margin, 15, { align: 'center' });

    // Contact information
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#ffffff')
       .text('(02) 1234-5678', { align: 'center' })
       .text('clinic@sacollo-dental.com', { align: 'center' })
       .text('Naval, Biliran, Philippines', { align: 'center' });

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#ffffff')
       .text('Billing History Report', { align: 'center' });

    doc.moveTo(margin, 85)
       .lineTo(pageWidth - margin, 85)
       .strokeColor('#ffffff')
       .lineWidth(1)
       .stroke();

    // ========== REPORT TITLE SECTION ==========
    doc.y = 100;
    doc.fillColor(primaryBlue)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('BILLING HISTORY REPORT', { align: 'center' }); // ADDED MISSING TITLE

    doc.moveDown(0.3);
    doc.fillColor(textGray)
       .fontSize(9)
       .text(`Generated on: ${new Date().toLocaleString('en-PH')}`, { align: 'center' });
    doc.moveDown(1);

    // ========== DATE RANGE SECTION ==========
    if (hasFrom || hasTo) {
      const dateBoxY = doc.y;
      const dateText = hasFrom && hasTo 
        ? `From: ${new Date(From).toLocaleDateString('en-PH')} To: ${new Date(To).toLocaleDateString('en-PH')}`
        : hasFrom 
        ? `From: ${new Date(From).toLocaleDateString('en-PH')}`
        : `To: ${new Date(To).toLocaleDateString('en-PH')}`;

      doc.roundedRect(margin, dateBoxY, pageWidth - 2 * margin, 25, 5).fill(lightBlue);

      doc.fillColor(primaryBlue)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('REPORT PERIOD:', margin + 15, dateBoxY + 8);

      doc.fillColor(textGray)
         .fontSize(9)
         .text(dateText, margin + 100, dateBoxY + 8);

      doc.roundedRect(margin, dateBoxY, pageWidth - 2 * margin, 25, 5).stroke(borderGray);
      doc.y = dateBoxY + 35;
    }

    // ========== SUMMARY STATS ==========
    const totalAmount = billingRecords.reduce((sum, record) => sum + (record.total_amount || 0), 0);
    const totalPaid = billingRecords.reduce((sum, record) => sum + (record.amount_paid || 0), 0);
    const totalBalance = billingRecords.reduce((sum, record) => sum + (record.balance || 0), 0);

    doc.fillColor(textGray)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text(`Total Records: ${billingRecords.length}`, margin, doc.y, { continued: true })
       .text(` | Total Amount: ₱${totalAmount.toFixed(2)}`, { continued: true })
       .text(` | Total Paid: ₱${totalPaid.toFixed(2)}`, { continued: true })
       .text(` | Total Balance: ₱${totalBalance.toFixed(2)}`); // ADDED MISSING BALANCE

    doc.moveDown(1);

    // ========== TABLE SECTION ==========
    if (billingRecords.length === 0) {
      doc.fillColor(textGray)
         .fontSize(11)
         .text('No billing records found for the selected date range.', margin, doc.y, { align: 'center' });
    } else {
      // Column setup for landscape - ADJUSTED FOR BETTER SPACING
      const columns = [
        { name: 'PATIENT NAME', x: margin + 10, width: 120 }, // CHANGED FROM 'PATIENT' TO 'PATIENT NAME'
        { name: 'TREATMENT', x: margin + 140, width: 180 },
        { name: 'TOTAL', x: margin + 330, width: 70, align: 'right' },
        { name: 'PAID', x: margin + 410, width: 70, align: 'right' },
        { name: 'BALANCE', x: margin + 490, width: 70, align: 'right' },
        { name: 'STATUS', x: margin + 570, width: 60, align: 'center' }
      ];

      // Table header
      const tableTopY = doc.y;
      doc.rect(margin, tableTopY, pageWidth - 2 * margin, 22).fill(primaryBlue);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      columns.forEach(col => {
        doc.text(col.name, col.x, tableTopY + 7, { 
          width: col.width, 
          align: col.align || 'left' 
        });
      });
      doc.y = tableTopY + 27;

      // Table rows
      let rowCount = 0;
      billingRecords.forEach((record, index) => {
        // Check if we need a new page (considering footer space)
        if (doc.y > pageHeight - 80) {
          doc.addPage();
          const newHeaderY = 40;
          doc.rect(margin, newHeaderY, pageWidth - 2 * margin, 22).fill(primaryBlue);
          doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
          columns.forEach(col => {
            doc.text(col.name, col.x, newHeaderY + 7, { 
              width: col.width, 
              align: col.align || 'left' 
            });
          });
          doc.y = newHeaderY + 27;
          rowCount = 0;
        }

        const rowY = doc.y;
        const rowHeight = 20;

        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.rect(margin, rowY, pageWidth - 2 * margin, rowHeight).fill('#f8fafc');
        }

        // Format data
        const fullName = `${record.patient_first_name || ""} ${record.patient_last_name || ""}`.trim() || "Unknown";
        const treatment = record.treatment_description || "N/A";
        const truncatedTreatment = treatment.length > 40 ? treatment.substring(0, 37) + "..." : treatment;
        const total = `₱${(record.total_amount || 0).toFixed(2)}`;
        const paid = `₱${(record.amount_paid || 0).toFixed(2)}`;
        const balance = `₱${(record.balance || 0).toFixed(2)}`;
        const status = record.payment_status || "N/A";

        // Status color coding
        let statusColor = textGray;
        if (status.toLowerCase() === 'paid') statusColor = '#16a34a';
        else if (status.toLowerCase() === 'pending') statusColor = '#f59e0b';
        else if (status.toLowerCase() === 'overdue') statusColor = '#dc2626';
        else if (status.toLowerCase() === 'partial') statusColor = '#2563eb';

        doc.fontSize(8).font('Helvetica');

        // Patient Name - FIXED COLUMN TITLE
        doc.fillColor(textGray)
           .text(fullName, columns[0].x, rowY + 5, { 
             width: columns[0].width, 
             ellipsis: true 
           });

        // Treatment
        doc.text(truncatedTreatment, columns[1].x, rowY + 5, { 
          width: columns[1].width, 
          ellipsis: true 
        });

        // Amounts
        doc.text(total, columns[2].x, rowY + 5, { 
          width: columns[2].width, 
          align: 'right' 
        });
        doc.text(paid, columns[3].x, rowY + 5, { 
          width: columns[3].width, 
          align: 'right' 
        });
        doc.text(balance, columns[4].x, rowY + 5, { 
          width: columns[4].width, 
          align: 'right' 
        });

        // Status
        doc.fillColor(statusColor)
           .text(status.toUpperCase(), columns[5].x, rowY + 5, { 
             width: columns[5].width, 
             align: 'center' 
           });

        // Row border
        doc.strokeColor('#e5e7eb')
           .lineWidth(0.3)
           .moveTo(margin, rowY + rowHeight)
           .lineTo(pageWidth - margin, rowY + rowHeight)
           .stroke();

        doc.y = rowY + rowHeight + 2;
        rowCount++;
      });
    }

    // ========== SMART FOOTER POSITIONING ==========
    const range = doc.bufferedPageRange();
    
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      
      let contentEndY = doc.y;
      
      let footerY;
      if (i < range.count - 1) {
        // For all pages except last, footer at bottom
        footerY = pageHeight - 40;
      } else {
        // For last page, check content position
        if (contentEndY > pageHeight - 100) {
          footerY = pageHeight - 40;
        } else {
          footerY = Math.max(contentEndY + 20, pageHeight - 100);
        }
      }

      footerY = Math.min(footerY, pageHeight - 30);

      // Footer divider line
      doc.strokeColor(borderGray)
         .lineWidth(0.5)
         .moveTo(margin, footerY)
         .lineTo(pageWidth - margin, footerY)
         .stroke();

      // Footer content
      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica');
      
      const generatedText = `Generated on ${new Date().toLocaleString('en-PH')}`;
      const pageText = `Page ${i + 1} of ${range.count}`;
      
      doc.text(generatedText, margin, footerY + 5, { align: 'left' });
      doc.text(pageText, pageWidth - margin, footerY + 5, { align: 'right' });
    }

    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        status: "error",
        message: "Failed to generate billing history PDF",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    } else {
      res.destroy();
    }
  }
};


