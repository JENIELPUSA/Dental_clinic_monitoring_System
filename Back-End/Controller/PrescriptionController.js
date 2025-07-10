const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Prescription = require("./../Models/Prescription");
const Apifeatures = require("./../Utils/ApiFeatures");
const Appointment = require("../Models/appointmentSchema");

exports.createPrescription = AsyncErrorHandler(async (req, res) => {
  const {
    appointment_id,
    medication_name,
    dosage,
    frequency,
    start_date,
    end_date,
  } = req.body;

  const appointment = await Appointment.findById(appointment_id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (appointment.appointment_status !== "Completed") {
    return res.status(400).json({
      message: "Prescription can only be added to a completed appointment",
    });
  }

  const prescrip = await Prescription.create({
    appointment_id,
    medication_name,
    dosage,
    frequency,
    start_date,
    end_date,
  });

  const PrescriptionWithDetails = await Prescription.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(prescrip._id) } },
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
        appointment_id: 1,
        medication_name: 1,
        dosage: 1,
        frequency: 1,
        start_date: 1,
        end_date: 1,
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
      },
    },
  ]);

  return res.status(201).json({
    status: "success",
    data: PrescriptionWithDetails[0],
  });
});


exports.DisplayPrescription = AsyncErrorHandler(async (req, res) => {
  try {
    const Prescribe = await Prescription.aggregate([
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
          appointment_id: 1,
          medication_name: 1,
          dosage: 1,
          frequency: 1,
          start_date: 1,
          end_date: 1,
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
