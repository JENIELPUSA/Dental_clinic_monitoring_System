const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const DentalBill = require("./../Models/Bills_Schema");
const CustomError = require("./../Utils/CustomError");
const Notification = require("../Models/NotificationSchema");
const User = require("../Models/LogInDentalSchema");
const LogActionAudit = require("./../Models/LogActionAudit");
const sendEmail = require("../Utils/email");
const { PassThrough } = require("stream");
const BillingHistory = require("../Models/BllingHiistorySchema");
const generateBillPDFAndSend = require("../Controller/Services/generateBillPDF");
const Treatment = require("../Models/Treatments");
const AppointmentStepProcess = require("./../Models/AppointmentStepProcess");

exports.createBill = AsyncErrorHandler(async (req, res) => {
  const {
    treatment_id,
    total_amount,
    amount_paid,
    balance,
    bill_date,
    payment_status,
  } = req.body;

  const bill = await DentalBill.create({
    treatment_id,
    total_amount,
    amount_paid,
    balance,
    bill_date,
    payment_status,
  });

  await LogActionAudit.create({
    action_type: "CREATE",
    performed_by: req.user?.linkedId,
    module: "Billing",
    reference_id: bill._id,
    description: `Created a new dental bill. Amount: ₱${Number(
      total_amount
    ).toFixed(2)} | Status: ${payment_status}`,
    new_data: bill,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  const BillWithDetails = await DentalBill.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(bill._id) },
    },
    {
      $lookup: {
        from: "treatments",
        localField: "treatment_id",
        foreignField: "_id",
        as: "treatment_info",
      },
    },
    {
      $unwind: { path: "$treatment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "appointments",
        localField: "treatment_info.appointment_id",
        foreignField: "_id",
        as: "appointment_info",
      },
    },
    {
      $unwind: { path: "$appointment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "patients",
        let: { patientId: "$appointment_info.patient_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$patientId"] },
            },
          },
          { $project: { first_name: 1, last_name: 1, address: 1 } },
        ],
        as: "patient_info",
      },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        treatment_id: 1,
        total_amount: 1,
        amount_paid: 1,
        balance: 1,
        bill_date: 1,
        payment_status: 1,
        treatment_description: "$treatment_info.treatment_description",
        treatment_date: "$treatment_info.treatment_date",
        appointment_date: "$appointment_info.appointment_date",
        appointment_id: "$appointment_info._id",
        patient_id: "$appointment_info.patient_id",
        patient_name: {
          $cond: {
            if: { $not: { $ifNull: ["$patient_info", false] } },
            then: "N/A",
            else: {
              $concat: [
                { $ifNull: ["$patient_info.first_name", ""] },
                " ",
                { $ifNull: ["$patient_info.last_name", ""] },
              ],
            },
          },
        },
        patient_address: {
          $ifNull: ["$patient_info.address", "N/A"],
        },
      },
    },
    { $sort: { payment_date: 1 } },
  ]);

  const detailedBill = BillWithDetails[0];
  const { appointment_id, patient_id } = detailedBill;



  await AppointmentStepProcess.findOneAndUpdate(
    { appointmentId: appointment_id },
    {
      $set: {
        currentStep: 6, // Payment step
        overallStatus: "completed", // Mark the entire process as done
        updatedAt: new Date(),
        "steps.$[elem].status": "completed",
      },
    },
    {
      arrayFilters: [{ "elem.stepNumber": 6 }],
      new: true,
    }
  );

  const io = req.app.get("io");
  const targetUser = global.connectedUsers?.[patient_id?.toString()];
  const billMessage = {
    message: `A new bill has been generated for you. Amount paid: ₱${Number(
      detailedBill.amount_paid
    ).toFixed(2)} | Status: ${detailedBill.payment_status}`,
    data: detailedBill,
  };

  if (targetUser) {
    io.to(targetUser.socketId).emit("billNotification", billMessage);
    console.log(`📨 Sent bill notification to patient (${patient_id})`);
  } else {
    console.log(`Patient (${patient_id}) is offline, saving notification...`);
  }

  if (patient_id) {
    await Notification.create({
      message: billMessage.message,
      viewers: [
        {
          user: new mongoose.Types.ObjectId(patient_id),
          isRead: false,
          viewedAt: null,
        },
      ],
    });
  }

  await BillingHistory.create({
    patient_id: detailedBill.patient_id,
    treatment_description: detailedBill.treatment_description,
    total_amount: detailedBill.total_amount,
    amount_paid: detailedBill.amount_paid,
    balance: detailedBill.balance,
    payment_status: detailedBill.payment_status,
  });

  await Treatment.findByIdAndUpdate(treatment_id, { done: true });

  return res.status(201).json({
    status: "success",
    data: detailedBill,
  });
});

exports.DisplayBill = AsyncErrorHandler(async (req, res) => {
  const bill = await DentalBill.aggregate([
    {
      $lookup: {
        from: "treatments",
        localField: "treatment_id",
        foreignField: "_id",
        as: "treatment_info",
      },
    },
    {
      $unwind: { path: "$treatment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "appointments",
        localField: "treatment_info.appointment_id",
        foreignField: "_id",
        as: "appointment_info",
      },
    },
    {
      $unwind: { path: "$appointment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "patients",
        let: { patientId: "$appointment_info.patient_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$patientId"] },
            },
          },
          { $project: { first_name: 1, last_name: 1, address: 1, email: 1 } },
        ],
        as: "patient_info",
      },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        bill_date: 1,
        total_amount: 1,
        payment_status: 1,
        amount_paid: 1,
        balance: 1,
        treatment_id: 1,
        treatment_description: "$treatment_info.treatment_description",
        treatment_date: "$treatment_info.treatment_date",
        appointment_date: "$appointment_info.appointment_date",
        patient_id: "$appointment_info.patient_id",
        email: { $ifNull: ["$patient_info.email", "N/A"] },
        patient_name: {
          $cond: {
            if: { $not: { $ifNull: ["$patient_info", false] } },
            then: "N/A",
            else: {
              $concat: [
                { $ifNull: ["$patient_info.first_name", ""] },
                " ",
                { $ifNull: ["$patient_info.last_name", ""] },
              ],
            },
          },
        },
        patient_address: {
          $ifNull: ["$patient_info.address", "N/A"],
        },
      },
    },
  ]);

  res.status(200).json({ status: "success", data: bill });
});

exports.UpdateBill = AsyncErrorHandler(async (req, res, next) => {
  const { total_amount, amount_paid, balance, bill_date, payment_status } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid ID format", 400));
  }

  const oldBill = await DentalBill.findById(req.params.id);

  const updatebill = await DentalBill.findByIdAndUpdate(
    req.params.id,
    {
      total_amount,
      amount_paid,
      balance,
      bill_date,
      payment_status,
    },
    { new: true }
  );

  if (!updatebill) {
    return next(new CustomError("Dental bill not found", 404));
  }

  await LogActionAudit.create({
    action_type: "UPDATE",
    performed_by: req.user?.linkedId,
    module: "Billing",
    reference_id: updatebill._id,
    description: `Updated dental bill. New amount paid: ₱${Number(
      amount_paid
    ).toFixed(2)} | Status: ${payment_status}`,
    old_data: oldBill,
    new_data: updatebill,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  const billWithDetails = await DentalBill.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(updatebill._id) } },
    {
      $lookup: {
        from: "treatments",
        localField: "treatment_id",
        foreignField: "_id",
        as: "treatment_info",
      },
    },
    { $unwind: { path: "$treatment_info", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "appointments",
        localField: "treatment_info.appointment_id",
        foreignField: "_id",
        as: "appointment_info",
      },
    },
    {
      $unwind: { path: "$appointment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "patients",
        let: { patientId: "$appointment_info.patient_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$patientId"] } } },
          { $project: { first_name: 1, last_name: 1, address: 1, email: 1 } },
        ],
        as: "patient_info",
      },
    },
    { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        treatment_id: 1,
        total_amount: 1,
        amount_paid: 1,
        balance: 1,
        bill_date: 1,
        payment_status: 1,
        email: { $ifNull: ["$patient_info.email", "N/A"] },
        treatment_description: "$treatment_info.treatment_description",
        treatment_date: "$treatment_info.treatment_date",
        appointment_date: "$appointment_info.appointment_date",
        patient_id: "$appointment_info.patient_id",
        patient_name: {
          $cond: {
            if: { $not: { $ifNull: ["$patient_info", false] } },
            then: "N/A",
            else: {
              $concat: [
                { $ifNull: ["$patient_info.first_name", ""] },
                " ",
                { $ifNull: ["$patient_info.last_name", ""] },
              ],
            },
          },
        },
        patient_address: {
          $ifNull: ["$patient_info.address", "N/A"],
        },
      },
    },
  ]);

  const detailedBill = billWithDetails[0];
  const patient_id = detailedBill?.patient_id;

  //  ADD BillingHistory Snapshot
  await BillingHistory.create({
    patient_id: patient_id,
    treatment_description: detailedBill.treatment_description,
    total_amount: detailedBill.total_amount,
    amount_paid: detailedBill.amount_paid,
    balance: detailedBill.balance,
    payment_status: detailedBill.payment_status,
  });

  const io = req.app.get("io");

  const billMessage = {
    message: `Your bill has been updated. Amount paid: ₱${Number(
      detailedBill.amount_paid
    ).toFixed(2)} | Balance: ₱${Number(detailedBill.balance).toFixed(
      2
    )} | Status: ${detailedBill.payment_status}`,
    data: detailedBill,
  };

  const targetUser = global.connectedUsers?.[patient_id?.toString()];
  if (targetUser) {
    io.to(targetUser.socketId).emit("billNotification", billMessage);
    console.log(`📬 Sent bill update notification to patient (${patient_id})`);
  } else {
    console.log(`📪 Patient (${patient_id}) is offline — saving notification.`);
  }

  if (patient_id) {
    await Notification.create({
      message: billMessage.message,
      viewers: [
        {
          user: new mongoose.Types.ObjectId(patient_id),
          isRead: false,
          viewedAt: null,
        },
      ],
    });
  }

  const fmt = (n) => `${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks = [];
  const stream = new PassThrough();
  doc.pipe(stream);

  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("end", async () => {
    const pdfBuffer = Buffer.concat(chunks);
    try {
      await sendEmail({
        email: detailedBill.email,
        subject: "Updated Dental Invoice from Doc.Saclolo Dental Care",
        text: `Dear ${detailedBill.patient_name},<br><br>Your updated invoice is attached. Thank you!`,
        attachments: [
          {
            filename: `invoice-${detailedBill._id}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      console.log("Invoice email sent successfully.");
    } catch (err) {
      console.error("Failed to send invoice email:", err);
    }
  });

  // PDF Layout
  doc
    .fillColor("#2c3e50")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("Doc.Saclolo Dental Care", { align: "center" })
    .moveDown(0.2)
    .fontSize(10)
    .font("Helvetica")
    .fillColor("gray")
    .text("Naval Biliran", {
      align: "center",
    })
    .text("Phone: (02) 1234 5678 | Email: info@docsaclolo.com", {
      align: "center",
    })
    .moveDown(1.5);

  const invoiceX = doc.page.width - 200;
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#d35400")
    .text("INVOICE UPDATE", invoiceX)
    .moveDown(0.2)
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#000")
    .text(`Invoice ID: ${detailedBill._id}`, invoiceX)
    .text(
      `Date: ${new Date(detailedBill.bill_date).toLocaleDateString()}`,
      invoiceX
    )
    .moveDown(1.5);

  doc
    .fontSize(11)
    .fillColor("#34495e")
    .font("Helvetica-Bold")
    .text("BILL TO:", 50)
    .moveDown(0.2)
    .font("Helvetica")
    .fillColor("#000")
    .fontSize(10)
    .text(detailedBill.patient_name, 50)
    .text(detailedBill.patient_address || "No address provided", 50)
    .moveDown(1.2);

  const tableX = 50;
  const tableTop = doc.y;
  const rowHeight = 20;
  const tableCols = [
    { label: "Date", width: 80 },
    { label: "Description", width: 200 },
    { label: "Amount", width: 80 },
    { label: "Paid", width: 80 },
    { label: "Status", width: 80 },
  ];

  doc
    .fillColor("#2980b9")
    .rect(
      tableX,
      tableTop,
      tableCols.reduce((sum, col) => sum + col.width, 0),
      rowHeight
    )
    .fill();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff");
  let colX = tableX;
  tableCols.forEach((col) => {
    doc.text(col.label, colX + 5, tableTop + 5, {
      width: col.width - 10,
      align: ["Amount", "Paid", "Status"].includes(col.label)
        ? "right"
        : "left",
    });
    colX += col.width;
  });

  doc.y = tableTop + rowHeight + 2;

  doc.font("Helvetica").fontSize(10).fillColor("#000");
  const rowY = doc.y;
  colX = tableX;
  [
    new Date(detailedBill.bill_date).toLocaleDateString(),
    detailedBill.treatment_description,
    fmt(detailedBill.total_amount),
    fmt(detailedBill.amount_paid),
    detailedBill.payment_status,
  ].forEach((val, i) => {
    doc.text(val, colX + 5, rowY, {
      width: tableCols[i].width - 10,
      align: i >= 2 ? "right" : "left",
    });
    colX += tableCols[i].width;
  });

  doc.moveDown(2);

  const summaryX = doc.page.width - 200;
  const addSummaryRow = (label, value, color = "#000") => {
    const y = doc.y;
    doc
      .font("Helvetica-Bold")
      .fillColor(color)
      .text(label, summaryX, y, { width: 100, align: "left" })
      .font("Helvetica")
      .text(fmt(value), summaryX + 100, y, { width: 80, align: "right" })
      .moveDown(0.5);
  };

  addSummaryRow("Subtotal:", detailedBill.total_amount);
  addSummaryRow("Amount Paid:", detailedBill.amount_paid);
  addSummaryRow("Balance:", detailedBill.balance, "#c0392b");

  doc.moveDown(2);
  doc.fontSize(11).fillColor("#2c3e50").font("Helvetica-Bold");

  const thankYouText = "Thank you for trusting Doc.Saclolo Dental Care";
  const textWidth = doc.widthOfString(thankYouText);
  const centerX = (doc.page.width - textWidth) / 2;
  doc.text(thankYouText, centerX, doc.y);

  doc.end();

  return res.status(200).json({
    status: "success",
    data: detailedBill,
  });
});
exports.deleteBill = AsyncErrorHandler(async (req, res, next) => {
  const billWithDetails = await DentalBill.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
    },
    {
      $lookup: {
        from: "treatments",
        localField: "treatment_id",
        foreignField: "_id",
        as: "treatment_info",
      },
    },
    {
      $unwind: { path: "$treatment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "appointments",
        localField: "treatment_info.appointment_id",
        foreignField: "_id",
        as: "appointment_info",
      },
    },
    {
      $unwind: { path: "$appointment_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "patients",
        let: { patientId: "$appointment_info.patient_id" },
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
        as: "patient_info",
      },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  if (!billWithDetails || billWithDetails.length === 0) {
    return next(new CustomError("Billing record not found", 404));
  }

  const billData = billWithDetails[0];

  const deleteHistory = await DentalBill.findByIdAndDelete(req.params.id);

  if (!deleteHistory) {
    return next(new CustomError("Failed to delete billing record", 500));
  }

  await LogActionAudit.create({
    action_type: "DELETE",
    performed_by: req.user?.linkedId,
    module: "Billing",
    reference_id: deleteHistory._id,
    description: `Deleted billing record for patient: ${
      billData?.patient_info?.first_name || "Unknown"
    } ${billData?.patient_info?.last_name || ""}`,
    old_data: deleteHistory,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  return res.status(200).json({
    status: "success",
    message: "Billing record deleted successfully",
    data: billData,
  });
});

exports.DisplayBillByPatientId = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    await generateBillPDFAndSend(patientId);
    res.status(200).json({ status: "success", message: "Invoice sent." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
