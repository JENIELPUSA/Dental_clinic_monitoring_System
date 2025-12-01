const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Appointment = require("./../Models/appointmentSchema");
const Notification = require("./../Models/NotificationSchema");
const sendEmail = require("../Utils/email");
const User = require("./../Models/LogInDentalSchema");
const Treatment = require("./../Models/Treatments"); //appointment_id
const Prescription = require("./../Models/Prescription"); //appointment_id
const { Readable } = require('stream');

const PDFDocument = require("pdfkit");
const {
  findValidScheduleAndSlot,
  createAppointmentEntry,
  sendSocketNotification,
  notifyByEmailAndDatabase,
  returnSlotOnCancel,
} = require("../Controller/Services/AppointmentService");

const AppointmentStepProcess = require("./../Models/AppointmentStepProcess");

exports.createAppointment = AsyncErrorHandler(async (req, res) => {
  const {
    patient_id,
    doctor_id,
    appointment_date,
    appointment_status,
    slot_id,
  } = req.body;

  const slot = await findValidScheduleAndSlot(
    doctor_id,
    appointment_date,
    slot_id
  );

  const appointment = await createAppointmentEntry({
    patient_id,
    doctor_id,
    appointment_date,
    appointment_status,
    slot_id,
    slot,
  });

   await AppointmentStepProcess.create({
    appointmentId: appointment._id,
    patientId: patient_id,
    doctorId: doctor_id,
    steps: [
      { stepNumber: 1, stepName: "Appointment", status: "completed" },
      { stepNumber: 2, stepName: "Confirmation", status: "pending" },
      { stepNumber: 3, stepName: "Treatment", status: "pending" },
      { stepNumber: 4, stepName: "Prescription", status: "pending" },
      { stepNumber: 5, stepName: "Completed", status: "pending" },
      { stepNumber: 6, stepName: "Payment", status: "pending" },
    ],
    currentStep: 2,
    overallStatus: "in-progress",
  });

  const io = req.app.get("io");
  const fullAppointment = await Appointment.aggregate([
    { $match: { _id: appointment._id } },
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  if (fullAppointment.length > 0) {
    io.emit("new-appointment", fullAppointment[0]); // ✅ now contains patient_info & doctor_info
    sendSocketNotification(io, doctor_id, fullAppointment[0]);
    await notifyByEmailAndDatabase(fullAppointment[0], doctor_id);

    return res.status(201).json({
      status: "success",
      data: fullAppointment[0],
    });
  } else {
    return res.status(404).json({
      status: "failed",
      message: "Failed to populate newly created appointment",
    });
  }
});

exports.DisplayAppointment = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search = "", From, To } = req.query;

  const matchStage = {};
  const hasFrom = From && From.trim() !== "";
  const hasTo = To && To.trim() !== "";

  if (hasFrom || hasTo) {
    matchStage.appointment_date = {};
    if (hasFrom) matchStage.appointment_date.$gte = new Date(From);
    if (hasTo) {
      const endDate = new Date(To);
      endDate.setDate(endDate.getDate() + 1);
      matchStage.appointment_date.$lt = endDate;
    }
  }

  const pipeline = [
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        patient_name: {
          $concat: [
            { $ifNull: ["$patient_info.first_name", ""] },
            " ",
            { $ifNull: ["$patient_info.last_name", ""] },
          ],
        },
        doctor_name: {
          $concat: [
            { $ifNull: ["$doctor_info.first_name", ""] },
            " ",
            { $ifNull: ["$doctor_info.last_name", ""] },
          ],
        },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(search.trim()
          ? {
              $or: [
                { patient_name: { $regex: new RegExp(search.trim(), "i") } },
                { doctor_name: { $regex: new RegExp(search.trim(), "i") } },
              ],
            }
          : {}),
      },
    },
    { $sort: { appointment_date: -1 } },
    {
      $project: {
        _id: 1,
        appointment_date: 1,
        slot_id: 1,
        start_time: 1,
        end_time: 1,
        appointment_status: 1,
        patient_info: 1,
        doctor_info: 1,
        patient_name: 1,
        doctor_name: 1,
        created_at: 1,
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await Appointment.aggregate(pipeline);

  const data = results[0].data;
  const totalAppointments = results[0].totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalAppointments,
    currentPage: page,
    totalPages: Math.ceil(totalAppointments / limit),
  });
});


exports.GetSpecificAppointment = AsyncErrorHandler(async (req, res) => {
  try {
    const appointments = await Appointment.aggregate([
      // Join patient and doctor info
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true } },

      {
        $sort: { appointment_date: -1 },
      },
      {
        $group: {
          _id: "$patient_id",
          appointment_date: { $first: "$appointment_date" },
          appointment_status: { $first: "$appointment_status" },
          start_time: { $first: "$start_time" },
          patient_info: { $first: "$patient_info" },
          doctor_info: { $first: "$doctor_info" },
          patient_id: { $first: "$patient_id" },
        },
      },
      {
        $lookup: {
          from: "appointments",
          let: { patientId: "$patient_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$patient_id", "$$patientId"] },
                    { $eq: ["$appointment_status", "Completed"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$patient_id",
                totalVisits: { $sum: 1 },
                lastVisit: { $max: "$appointment_date" },
              },
            },
          ],
          as: "patient_stats",
        },
      },
      {
        $unwind: {
          path: "$patient_stats",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Final output format
      {
        $project: {
          appointment_date: 1,
          appointment_status: 1,
          start_time: 1,
          patient_info: 1,
          doctor_info: 1,
          totalVisits: "$patient_stats.totalVisits",
          lastVisit: "$patient_stats.lastVisit",
        },
      },
    ]);

    return res.status(200).json({
      status: "Success",
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
});

exports.UpdateAppointment = AsyncErrorHandler(async (req, res, next) => {
  const { patient_id, doctor_id, appointment_date, appointment_status } =
    req.body;
  const updateAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { patient_id, doctor_id, appointment_date, appointment_status },
    { new: true }
  );

  if (!updateAppointment) {
    return next(new CustomError("Appointment not found", 404));
  }

  const appointmentWithDetails = await Appointment.aggregate([
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    {
      $match: { _id: new mongoose.Types.ObjectId(updateAppointment._id) },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: appointmentWithDetails[0],
  });
});

exports.UpdateStatus = AsyncErrorHandler(async (req, res, next) => {
  const appointmentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ message: "Invalid appointment ID" });
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    req.body,
    { new: true }
  );

  if (!updatedAppointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const appointments = await Appointment.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(updatedAppointment._id) } },
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true } },
  ]);

  const detailedAppointment = appointments[0];
  const io = req.app.get("io");

  const status = updatedAppointment.appointment_status;
  const doctorId = updatedAppointment.doctor_id?.toString();
  const patientId = updatedAppointment.patient_id?.toString();

  if (!status) {
    return res.status(400).json({ message: "Missing appointment status" });
  }

  if (status === "Confirmed") {
     await AppointmentStepProcess.findOneAndUpdate(
      { appointmentId: updatedAppointment._id },
      {
        $set: {
          "steps.$[appointmentStep].status": "completed",
          "steps.$[confirmationStep].status": "in-progress",
          currentStep: 2,
        },
      },
      {
        arrayFilters: [
          { "appointmentStep.stepName": "Appointment" },
          { "confirmationStep.stepName": "Confirmation" },
        ],
        new: true,
      }
    );


    const targetUser = global.connectedUsers?.[patientId];

    if (targetUser && io) {
      io.to(targetUser.socketId).emit("appointmentConfirmed", {
        message: "Your appointment has been confirmed.",
        data: detailedAppointment,
      });
      console.log(`📣 Sent confirmation to patient ${patientId}`);
    } else {
      console.log(`⚠️ Patient ${patientId} is offline. Saving notification...`);
    }

    await Notification.create({
      message: "Your appointment has been confirmed.",
      viewers: [
        {
          user: new mongoose.Types.ObjectId(patientId),
          isRead: false,
          viewedAt: null,
        },
      ],
    });

    const patientEmail = detailedAppointment?.patient_info?.email;
    const doctor = detailedAppointment?.doctor_info;

    if (patientEmail) {
      try {
        await sendEmail({
          email: patientEmail,
          subject: "Appointment Confirmed",
          text: `<strong>Your appointment has been confirmed.</strong><br/>
<strong>Appointment ID:</strong> ${updatedAppointment._id}<br/>
<strong>Doctor:</strong> ${doctor?.first_name || ""} ${
            doctor?.last_name || ""
          }<br/>
<strong>Date:</strong> ${updatedAppointment.appointment_date}<br/>
<strong>Time:</strong> ${updatedAppointment.start_time} – ${
            updatedAppointment.end_time
          }<br/>
<strong>Status:</strong> ${updatedAppointment.appointment_status}`,
        });
        console.log(`Email sent to ${patientEmail}`);
      } catch (err) {
        console.error(`Failed to send email: ${err.message}`);
      }
    } else {
      console.warn(`No email found in patient_info`);
    }
  }

  if (status === "Completed") {
    await AppointmentStepProcess.findOneAndUpdate(
      { appointmentId: updatedAppointment._id },
      {
        $set: {
          "steps.$[treatmentStep].status": "completed", 
          "steps.$[prescriptionStep].status": "in-progress", 
          currentStep: 4, 
        },
      },
      {
        arrayFilters: [
          { "treatmentStep.stepName": "Treatment" },
          { "prescriptionStep.stepName": "Prescription" },
        ],
        new: true,
      }
    );
  }

  if (status === "Cancelled") {
    //Step 3.1: Ibalik ang slot
    try {
      await returnSlotOnCancel(
        updatedAppointment.doctor_id,
        updatedAppointment.appointment_date,
        updatedAppointment.slot_id
      );
      console.log("✔️ Slot returned successfully.");
    } catch (err) {
      console.error("❌ Failed to return slot:", err.message);
    }

    // Step 3.2: Proceed with notifications
    const message = {
      message: `An appointment has been canceled. Appointment ID: ${updatedAppointment._id}`,
      data: detailedAppointment,
    };

    const allowedUsers = await User.find({
      $or: [{ role: { $in: ["admin", "staff"] } }, { _id: doctorId }],
    }).select("_id username role");

    const viewerIds = allowedUsers.map((u) => u._id.toString());
    const emailList = allowedUsers.map((u) => u.username);

    let anyOnline = false;

    if (io) {
      for (const linkId in global.connectedUsers) {
        const { socketId, role } = global.connectedUsers[linkId];
        if (role === "admin" || role === "staff" || linkId === doctorId) {
          io.to(socketId).emit("adminNotification", message);
          console.log(`📣 Sent cancellation notice to ${role} (${linkId})`);
          anyOnline = true;
        }
      }
    }

    if (!anyOnline) {
      console.log("⚠️ No active sockets. Saving notification to DB...");
    }

    await Notification.create({
      message: "An appointment has been canceled.",
      viewers: viewerIds.map((id) => ({
        user: new mongoose.Types.ObjectId(id),
        isRead: false,
        viewedAt: null,
      })),
    });

    for (const email of emailList) {
      try {
        await sendEmail({
          email,
          subject: "Appointment Cancelled",
          text: `<strong>An appointment has been canceled</strong><br/>
<strong>Appointment ID:</strong> ${updatedAppointment._id}<br/>
<strong>Date:</strong> ${updatedAppointment.appointment_date}<br/>
<strong>Time:</strong> ${updatedAppointment.start_time} – ${updatedAppointment.end_time}<br/>
<strong>Status:</strong> ${updatedAppointment.appointment_status}`,
        });
        console.log(`📨 Cancellation email sent to ${email}`);
      } catch (err) {
        console.error(`❌ Failed to send email to ${email}: ${err.message}`);
      }
    }
  }

  if (status === "Re-assigned") {
    const message = {
      message: "An appointment has been re-assigned.",
      data: detailedAppointment,
    };

    const staffUsers = await User.find({ role: "staff" }).select("_id");
    const staffIds = staffUsers.map((u) => u._id.toString());

    let anyOnline = false;

    if (io) {
      for (const linkId in global.connectedUsers) {
        const { socketId, role } = global.connectedUsers[linkId];
        if (role === "staff") {
          io.to(socketId).emit("adminNotification", message);
          console.log(`Sent re-assigned notice to staff (${linkId})`);
          anyOnline = true;
        }
      }
    }

    if (!anyOnline) {
      console.log("No staff online. Saving notification...");
    }

    await Notification.create({
      message: "An appointment has been re-assigned.",
      viewers: staffIds.map((id) => ({
        user: new mongoose.Types.ObjectId(id),
        isRead: false,
        viewedAt: null,
      })),
    });
  }

  // Broadcast updated appointment with populated info to all connected clients
  if (io && detailedAppointment) {
    io.emit("updated-appointment", detailedAppointment);
    console.log(
      " Broadcasted updated appointment via socket:",
      detailedAppointment._id
    );
  }

  return res.status(200).json({
    status: "success",
    data: detailedAppointment || updatedAppointment,
  });
});

exports.deleteAppointment = AsyncErrorHandler(async (req, res, next) => {
  const appointmentId = req.params.id;

  // Step 1: Check if appointment is referenced in Treatment or Prescription
  const [hasTreatment, hasPrescription] = await Promise.all([
    Treatment.exists({ appointment_id: appointmentId }),
    Prescription.exists({ appointment_id: appointmentId }),
  ]);

  if (hasTreatment || hasPrescription) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot delete appointment: there are existing related records.",
    });
  }

  // Step 2: Fetch full appointment details (doctor + patient) before deleting
  const appointmentWithDetails = await Appointment.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(appointmentId) },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    {
      $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  if (!appointmentWithDetails || appointmentWithDetails.length === 0) {
    return next(new CustomError("Appointment not found", 404));
  }

  // Step 3: Delete the appointment
  const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);
  if (!deletedAppointment) {
    return next(new CustomError("Failed to delete appointment", 500));
  }

  // Step 4: Respond with full data
  return res.status(200).json({
    status: "success",
    message: "Appointment deleted successfully",
    data: appointmentWithDetails[0],
  });
});

exports.GetSpecificAppointmentById = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching Appointment ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointments = await Appointment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "appointments",
          let: { patientId: "$patient_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$patient_id", "$$patientId"] },
                    { $eq: ["$appointment_status", "Completed"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$patient_id",
                totalVisits: { $sum: 1 },
                lastVisit: { $max: "$appointment_date" },
              },
            },
          ],
          as: "patient_stats",
        },
      },
      {
        $unwind: {
          path: "$patient_stats",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          appointment_date: 1,
          appointment_status: 1,
          start_time: 1,
          patient_info: {
            first_name: "$patient_info.first_name",
            last_name: "$patient_info.last_name",
            email: "$patient_info.email",
          },
          doctor_info: {
            first_name: "$doctor_info.first_name",
            last_name: "$doctor_info.last_name",
            specialty: "$doctor_info.specialty",
            email: "$doctor_info.email",
          },
          totalVisits: "$patient_stats.totalVisits",
          lastVisit: "$patient_stats.lastVisit",
        },
      },
    ]);

    if (!appointments.length) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = appointments[0];

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Appointment ${id} Details`,
        Author: "HealthConnect System",
        CreationDate: new Date(),
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=HealthConnect_Appt_${id.substring(
        id.length - 6
      )}.pdf`
    );

    doc.pipe(res);

    const primaryBlue = "#1a73e8";
    const darkBlue = "#0d47a1";
    const lightBlue = "#e8f0fe";
    const successGreen = "#34a853";
    const warningYellow = "#fbbc05";
    const darkGray = "#3c4043";
    const mediumGray = "#5f6368";
    const lightGray = "#dadce0";
    const white = "#ffffff";

    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const formatTime = (time) => {
      if (!time) return "N/A";
      return time.replace(/(\d+:\d+):\d+/, "$1");
    };

    // --- Inayos na Header Section ---
    doc.rect(0, 0, doc.page.width, 100).fill(lightBlue).stroke(lightGray);

    // Clinic Logo/Name
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor(darkBlue)
      .text("HEALTHCONNECT", 50, 30);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(mediumGray)
      .text("Quality Healthcare Services", 50, 60);

    // Document Title at Appointment ID (Mas Klaro)
    doc
      .font("Helvetica-Bold")
      .fontSize(16) // Bahagyang binawasan ang laki para magkasya
      .fillColor(darkGray)
      .text("APPOINTMENT DETAILS", doc.page.width - 250, 35, {
        width: 200,
        align: "right",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(14) // Mas malaki kaysa sa naunang pag-aayos
      .fillColor(primaryBlue) // Ginawang primary blue para mas kapansin-pansin
      .text(
        `#${id.substring(id.length - 8).toUpperCase()}`,
        doc.page.width - 250,
        55,
        {
          // Inayos ang y-position
          width: 200,
          align: "right",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mediumGray)
      .text(`Generated: ${formatDate(new Date())}`, doc.page.width - 250, 75, {
        width: 200,
        align: "right",
      });

    let yPos = 120;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(darkBlue)
      .text("PARTICIPANT DETAILS", 50, yPos);
    yPos += 25;

    doc
      .rect(50, yPos, doc.page.width - 100, 25)
      .fill(primaryBlue)
      .stroke(lightGray);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(white)
      .text("PATIENT INFORMATION", 60, yPos + 8)
      .text("DOCTOR INFORMATION", 300, yPos + 8);
    yPos += 30;

    if (appointment.patient_info) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(darkGray)
        .text("Full Name:", 60, yPos);
      doc
        .font("Helvetica")
        .text(
          `${appointment.patient_info.first_name} ${appointment.patient_info.last_name}`,
          120,
          yPos
        );

      doc.font("Helvetica-Bold").text("Email:", 60, yPos + 15);
      doc
        .font("Helvetica")
        .text(appointment.patient_info.email || "N/A", 120, yPos + 15);
    } else {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(mediumGray)
        .text("Patient information unavailable", 60, yPos);
    }

    if (appointment.doctor_info) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(darkGray)
        .text("Name:", 300, yPos);
      doc
        .font("Helvetica")
        .text(
          `Dr. ${appointment.doctor_info.first_name} ${appointment.doctor_info.last_name}`,
          350,
          yPos
        );

      doc.font("Helvetica-Bold").text("Specialty:", 300, yPos + 15);
      doc
        .font("Helvetica")
        .text(appointment.doctor_info.specialty || "N/A", 350, yPos + 15);

      doc.font("Helvetica-Bold").text("Email:", 300, yPos + 30);
      doc
        .font("Helvetica")
        .text(appointment.doctor_info.email || "N/A", 350, yPos + 30);
    } else {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(mediumGray)
        .text("Doctor information unavailable", 300, yPos);
    }
    yPos += 70;

    doc
      .roundedRect(50, yPos, doc.page.width - 100, 70, 5)
      .fill(white)
      .stroke(lightGray);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(darkBlue)
      .text("APPOINTMENT SUMMARY", 65, yPos + 15);

    const statusText = appointment.appointment_status || "Unknown";
    const statusColor =
      statusText === "Completed" ? successGreen : warningYellow;
    const statusBg = statusText === "Completed" ? "#e6f4ea" : "#fef7e0";

    doc
      .roundedRect(doc.page.width - 130, yPos + 12, 80, 25, 3)
      .fill(statusBg)
      .stroke(statusColor);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(statusColor)
      .text(statusText.toUpperCase(), doc.page.width - 120, yPos + 18);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(mediumGray)
      .text("DATE:", 65, yPos + 45);
    doc
      .font("Helvetica")
      .fillColor(darkGray)
      .text(formatDate(appointment.appointment_date), 100, yPos + 45);

    doc
      .font("Helvetica-Bold")
      .fillColor(mediumGray)
      .text("TIME:", 65, yPos + 60);
    doc
      .font("Helvetica")
      .fillColor(darkGray)
      .text(formatTime(appointment.start_time), 100, yPos + 60);

    doc
      .font("Helvetica-Bold")
      .fillColor(mediumGray)
      .text("APPOINTMENT ID:", 250, yPos + 45);
    doc
      .font("Helvetica-Bold")
      .fillColor(darkGray)
      .text(`#${id.substring(id.length - 8).toUpperCase()}`, 350, yPos + 45);
    yPos += 90;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(darkBlue)
      .text("PATIENT HISTORY", 50, yPos);
    yPos += 25;

    if (appointment.totalVisits !== undefined) {
      doc
        .rect(50, yPos, doc.page.width - 100, 70)
        .fill(lightBlue)
        .stroke(lightGray);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(mediumGray)
        .text("TOTAL VISITS", 70, yPos + 15);

      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(primaryBlue)
        .text(appointment.totalVisits.toString(), 70, yPos + 30);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(mediumGray)
        .text("LAST VISIT", 250, yPos + 15);

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(darkGray)
        .text(formatDate(appointment.lastVisit), 250, yPos + 30);

      if (appointment.firstVisit) {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(mediumGray)
          .text("FIRST VISIT", 400, yPos + 15);

        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor(darkGray)
          .text(formatDate(appointment.firstVisit), 400, yPos + 30);
      }
    } else {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(mediumGray)
        .text("No historical visit data available", 60, yPos + 10);
    }
    yPos += 90;

    doc
      .strokeColor(lightGray)
      .lineWidth(1)
      .moveTo(50, yPos)
      .lineTo(doc.page.width - 50, yPos)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mediumGray)
      .text(
        "This is an electronically generated document - Signature not required",
        50,
        yPos + 10,
        { align: "center" }
      );

    doc.text(
      "123 Medical Drive, Suite 100 • Cityville, ST 12345 • contact@healthconnect.example.com • (555) 123-4567",
      50,
      yPos + 25,
      { align: "center" }
    );

    doc.text("© 2023 HealthConnect. All rights reserved.", 50, yPos + 40, {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("📄 PDF Generation Error:", error);
    res.status(500).json({
      status: "Error",
      message: "Failed to generate appointment summary: " + error.message,
    });
  }
});

exports.GetPatientAppointment = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid patient ID format.",
      });
    }

    const appointments = await Appointment.aggregate([
      {
        $match: {
          patient_id: new mongoose.Types.ObjectId(id), // And here, using 'id'
        },
      },
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
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      {
        $unwind: {
          path: "$doctor_info",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          patient_id: 1,
          doctor_id: 1,
          appointment_date: 1,
          slot_id: 1,
          start_time: 1,
          end_time: 1,
          appointment_status: 1,
          taskCreated: 1,
          created_at: 1,
          __v: 1,
          patient_info: 1,
          doctor_info: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: "Success",
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching patient appointment:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
});

exports.GenerateReportPDF = AsyncErrorHandler(async (req, res) => {
  const { From, To, status, search = "" } = req.query;

  // Reuse your filtering logic (without pagination)
  const matchStage = {};
  const hasFrom = From && From.trim() !== "";
  const hasTo = To && To.trim() !== "";

  if (hasFrom || hasTo) {
    matchStage.appointment_date = {};
    if (hasFrom) matchStage.appointment_date.$gte = new Date(From);
    if (hasTo) {
      const endDate = new Date(To);
      endDate.setDate(endDate.getDate() + 1);
      matchStage.appointment_date.$lt = endDate;
    }
  }

  if (status && status.trim() !== "") {
    matchStage.appointment_status = status.trim();
  }

  const pipeline = [
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor_id",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$doctor_info", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        patient_name: {
          $concat: [
            { $ifNull: ["$patient_info.first_name", ""] },
            " ",
            { $ifNull: ["$patient_info.last_name", ""] },
          ],
        },
        doctor_name: {
          $concat: [
            { $ifNull: ["$doctor_info.first_name", ""] },
            " ",
            { $ifNull: ["$doctor_info.last_name", ""] },
          ],
        },
      },
    },
    {
      $match: {
        ...matchStage,
        ...(search.trim()
          ? {
              $or: [
                { patient_name: { $regex: new RegExp(search.trim(), "i") } },
                { doctor_name: { $regex: new RegExp(search.trim(), "i") } },
              ],
            }
          : {}),
      },
    },
    { $sort: { appointment_date: -1 } },
    {
      $project: {
        _id: 1,
        appointment_date: 1,
        start_time: 1,
        end_time: 1,
        appointment_status: 1,
        patient_name: 1,
        doctor_name: 1,
      },
    },
  ];

  const appointments = await Appointment.aggregate(pipeline);

  // Set response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=appointment-report-${Date.now()}.pdf`);

  // Create PDF in LANDSCAPE
  const doc = new PDFDocument({ 
    margin: 30,
    size: [842, 595], // A4 Landscape: 842x595 pts
    bufferPages: true
  });
  const stream = doc.pipe(res);

  // Colors
  const primaryColor = '#2563eb';
  const headerBg = '#f1f5f9';
  const borderColor = '#cbd5e1';

  // Page dimensions (landscape)
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 30;
  const footerHeight = 50;
  const bottomThreshold = pageHeight - margin - footerHeight;

  const checkSpace = (requiredHeight) => {
    return doc.y + requiredHeight <= bottomThreshold;
  };

  const ensureSpace = (requiredHeight) => {
    if (!checkSpace(requiredHeight)) {
      doc.addPage();
      doc.y = margin + 20;
      return true;
    }
    return false;
  };

  // ===== CLINIC HEADER (Top Left) =====
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('Doc. Saclolo Dental Care', margin, 20);

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#334155')
     .text('Sto. Niño, Naval, Biliran', margin, 35)
     .text('(053) 123-4567', margin, 47)
     .text('saclolodentalcare@gmail.com', margin, 59);

  // ===== REPORT TITLE BAR (Full Width) =====
  doc.rect(0, 75, pageWidth, 30).fill(primaryColor);
  doc.fillColor('#ffffff')
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('APPOINTMENT REPORT', margin, 82, { width: pageWidth - 2 * margin, align: 'center' });

  // Start content after header
  let currentY = 115;

  // ===== FILTER INFO =====
  let filterText = '';
  if (hasFrom || hasTo || status || search) {
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 0, 3).fill(headerBg);
    
    if (hasFrom || hasTo) {
      const fromDate = hasFrom ? new Date(From).toLocaleDateString('en-PH') : 'Any';
      const toDate = hasTo ? new Date(To).toLocaleDateString('en-PH') : 'Any';
      filterText += `📅 ${fromDate} to ${toDate}  `;
    }
    if (status) filterText += `📊 ${status}  `;
    if (search) filterText += `🔍 "${search}"`;
    
    doc.fillColor('#334155')
       .fontSize(9)
       .font('Helvetica')
       .text(filterText, margin + 10, currentY + 5, { width: pageWidth - 2 * margin - 20 });
    
    const textHeight = doc.heightOfString(filterText, { width: pageWidth - 2 * margin - 20 });
    const filterBoxHeight = textHeight + 12;
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, filterBoxHeight, 3)
       .stroke(borderColor);
    
    currentY += filterBoxHeight + 12;
  } else {
    currentY += 10;
  }

  // Summary
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Total: ${appointments.length} appointments`, margin, currentY);
  currentY += 18;

  // ===== TABLE (Optimized for Landscape) =====
  const drawTableHeader = (yPosition) => {
    const tableTop = yPosition;
    // Wider columns in landscape
    const headers = ['Date', 'Time', 'Patient Name', 'Doctor Name', 'Status'];
    const columnWidths = [90, 90, 180, 180, 100];
    let currentX = margin;

    doc.rect(margin, tableTop - 3, pageWidth - 2 * margin, 20).fill(primaryColor);
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, tableTop + 2, { width: columnWidths[i] - 10 });
      currentX += columnWidths[i];
    });

    doc.fillColor('#000000');
    return tableTop + 22;
  };

  let tableY = drawTableHeader(currentY);
  doc.y = tableY;
  const rowHeight = 20;
  const columnWidths = [90, 90, 180, 180, 100];

  appointments.forEach((app, index) => {
    ensureSpace(rowHeight + 5);
    const rowY = doc.y;
    
    if (index % 2 === 0) {
      doc.rect(margin, rowY, pageWidth - 2 * margin, rowHeight).fill('#f8fafc');
    }

    const date = app.appointment_date 
      ? new Date(app.appointment_date).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'N/A';
    
    const time = app.start_time && app.end_time 
      ? `${app.start_time.substring(0, 5)} - ${app.end_time.substring(0, 5)}` 
      : 'N/A';
    
    const patient = (app.patient_name?.trim() || 'Unknown').substring(0, 30);
    const doctor = (app.doctor_name?.trim() || 'Unknown').substring(0, 30);
    const statusText = app.appointment_status || 'N/A';

    let statusColor = '#64748b';
    if (statusText.toLowerCase() === 'completed') statusColor = '#16a34a';
    else if (statusText.toLowerCase() === 'pending') statusColor = '#f59e0b';
    else if (statusText.toLowerCase() === 'cancelled') statusColor = '#dc2626';
    else if (statusText.toLowerCase() === 'confirmed') statusColor = '#2563eb';

    const rowData = [
      { text: date, color: '#1e293b' },
      { text: time, color: '#475569' },
      { text: patient, color: '#0f172a' },
      { text: doctor, color: '#0f172a' },
      { text: statusText, color: statusColor }
    ];

    let currentX = margin;
    doc.font('Helvetica').fontSize(9);
    rowData.forEach((cell, i) => {
      doc.fillColor(cell.color)
         .text(cell.text, currentX + 5, rowY + 5, {
           width: columnWidths[i] - 10,
           ellipsis: true,
           align: i === 4 ? 'center' : 'left'
         });
      currentX += columnWidths[i];
    });

    doc.strokeColor(borderColor)
       .lineWidth(0.5)
       .moveTo(margin, rowY + rowHeight)
       .lineTo(pageWidth - margin, rowY + rowHeight)
       .stroke();

    doc.y = rowY + rowHeight;
  });

  // ===== FOOTER =====
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const footerY = bottomThreshold + 5;

    doc.strokeColor(borderColor)
       .lineWidth(0.5)
       .moveTo(margin, footerY)
       .lineTo(pageWidth - margin, footerY)
       .stroke();

    doc.fontSize(8)
       .fillColor('#64748b')
       .font('Helvetica')
       .text(`Generated on ${new Date().toLocaleString('en-PH')}`, margin, footerY + 5, { align: 'left' })
       .text(`Page ${i + 1} of ${range.count}`, pageWidth - margin, footerY + 5, { align: 'right' });
  }

  doc.end();
});
