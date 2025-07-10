const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Treatment = require("../Models/Treatments");
const Appointment=require("../Models/appointmentSchema")
const CustomError = require("../Utils/CustomError");
const User = require("./../Models/LogInDentalSchema");
const { sendTreatmentNotification } = require("./../Controller/Services/TreatmentSocketServices");

exports.createTreatment = AsyncErrorHandler(async (req, res) => {
  const {
    appointment_id,
    treatment_description,
    treatment_date,
    treatment_cost,
  } = req.body;

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

  const newTreatment = await Treatment.create({
    appointment_id,
    treatment_description,
    treatment_date,
    treatment_cost,
  });

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
    { $unwind: "$Appointment_info" },
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
    { $unwind: "$Patient_info" },
    {
      $project: {
        _id: 1,
        treatment_description: 1,
        treatment_date: 1,
        treatment_cost: 1,
        appointment_id: 1,
        patient_name: {
          $concat: ["$Patient_info.first_name", " ", "$Patient_info.last_name"],
        },
        patient_address: "$Patient_info.address",
        appointment_date: "$Appointment_info.appointment_date",
      },
    },
  ]);

  const io = req.app.get("io");
  sendTreatmentNotification(io, enriched[0]);
    io.emit("new-treatment", enriched[0]);

  res.status(201).json({
    status: "success",
    data: enriched[0],
  });
});
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
        appointment_id: 1,done:1,
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
    // ✅ Filter only treatments with matching patient_id
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

