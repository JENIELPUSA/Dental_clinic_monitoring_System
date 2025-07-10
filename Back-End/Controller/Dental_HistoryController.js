const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const DentalHistory = require("./../Models/Dental_HistorySchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const DentalBillHistory = require("../Models/BllingHiistorySchema");
exports.createHistory = AsyncErrorHandler(async (req, res) => {
  const {
    patient_id,
    previous_conditions,
    surgeries,
    allergies,
    family_dental_history,
    last_checkup_date,
  } = req.body;

  // Create the appointment first
  const history = await DentalHistory.create({
    patient_id,
    previous_conditions,
    surgeries,
    allergies,
    family_dental_history,
    last_checkup_date,
  });

  // Fetch the full details of the patient and doctor
  const appointmentWithDetails = await DentalHistory.aggregate([
    {
      // Left join with Patient collection
      $lookup: {
        from: "patients", // MongoDB collection name (lowercase and plural)
        localField: "patient_id", // Field from Appointment collection
        foreignField: "_id", // Field from Patient collection
        as: "patient_info", // Output field name with the joined data
      },
    },
    {
      // Match by the newly created appointment's _id
      $match: { _id: new mongoose.Types.ObjectId(history._id) },
    },
    {
      // Unwind the patient_info array to get flattened patient data
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  // Return the newly created appointment along with patient and doctor details
  return res.status(201).json({
    status: "success",
    data: appointmentWithDetails[0], // Return the first (and only) appointment object
  });
});

exports.DisplayHistory = AsyncErrorHandler(async (req, res) => {
  try {
    const history = await DentalHistory.aggregate([
      {
        // Left join with Patient collection
        $lookup: {
          from: "patients", // MongoDB collection name (lowercase and plural)
          localField: "patient_id", // Field from Appointment collection
          foreignField: "_id", // Field from Patient collection
          as: "patient_info", // Output field name with the joined data
        },
      },
      {
        // Optionally, unwind the patient_info array (if you want flattened data)
        $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true }, // Keeps appointment without a patient
      },
    ]);

    return res.status(200).json({
      status: "Success",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
});

exports.UpdateHistory = AsyncErrorHandler(async (req, res, next) => {
  const {
    patient_id,
    previous_conditions,
    surgeries,
    allergies,
    family_dental_history,
    last_checkup_date,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid ID format", 400));
  }

  const updatehistory = await DentalHistory.findByIdAndUpdate(
    req.params.id,
    {
      patient_id,
      previous_conditions,
      surgeries,
      allergies,
      family_dental_history,
      last_checkup_date,
    },
    { new: true }
  );

  if (!updatehistory) {
    return next(new CustomError("Dental history not found", 404));
  }

  const historyWithDetails = await DentalHistory.aggregate([
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    {
      $match: { _id: new mongoose.Types.ObjectId(updatehistory._id) },
    },
    {
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: historyWithDetails[0],
  });
});


exports.deleteHistory = AsyncErrorHandler(async (req, res, next) => {
  // First, aggregate to fetch the appointment with patient and doctor details
  const historyWithDetails = await DentalHistory.aggregate([
    {
      // Left join with Patient collection
      $lookup: {
        from: "patients", // MongoDB collection name (lowercase and plural)
        localField: "patient_id", // Field from Appointment collection
        foreignField: "_id", // Field from Patient collection
        as: "patient_info", // Output field name with the joined data
      },
    },
    {
      // Match by the appointment's _id
      $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
    },
    {
      // Unwind the patient_info array to get flattened patient data
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true }
    }
  ]);

  // If no appointment found, return error
  if (!historyWithDetails || historyWithDetails.length === 0) {
    return next(new CustomError("Appointment not found", 404));
  }

  // Now delete the appointment
  const deleteHistory = await DentalHistory.findByIdAndDelete(req.params.id);

  if (!deleteHistory) {
    return next(new CustomError("Failed to delete appointment", 500));
  }

  // Return a confirmation response along with the deleted appointment details
  return res.status(200).json({
    status: "success",
    message: "Appointment deleted successfully",
    data: historyWithDetails[0], // Return the deleted appointment with details
  });
});


exports.DisplayBillByHistoryPatientId = AsyncErrorHandler(async (req, res) => {
  const { id: patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid Patient ID format. Please provide a valid ObjectId.",
    });
  }

  const patientObjectId = new mongoose.Types.ObjectId(patientId);

  const bills = await DentalBillHistory.aggregate([
    // Join to Treatment
    {
      $lookup: {
        from: "treatments",
        localField: "treatment_id",
        foreignField: "_id",
        as: "treatment_info",
      },
    },
    { $unwind: { path: "$treatment_info", preserveNullAndEmptyArrays: true } },

    // Join to Appointment
    {
      $lookup: {
        from: "appointments",
        localField: "treatment_info.appointment_id",
        foreignField: "_id",
        as: "appointment_info",
      },
    },
    { $unwind: { path: "$appointment_info", preserveNullAndEmptyArrays: true } },

    // Filter by patient and isGenerated = false
    {
      $match: {
        "appointment_info.patient_id": patientObjectId,
        isGenerated: false,
      },
    },

    // Join to Patient
    {
      $lookup: {
        from: "patients",
        localField: "appointment_info.patient_id",
        foreignField: "_id",
        as: "patient_info",
      },
    },
    { $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true } },

    // Select only needed fields
    {
      $project: {
        _id: 1,
        bill_date: 1,
        isGenerated: 1,
        total_amount: { $ifNull: ["$total_amount", 0] },
        amount_paid: { $ifNull: ["$amount_paid", 0] },
        balance: { $ifNull: ["$balance", 0] },
        payment_status: { $ifNull: ["$payment_status", "Pending"] },
        treatment_description: {
          $ifNull: ["$treatment_info.treatment_description", "No description"],
        },
        treatment_date: "$treatment_info.treatment_date",
        appointment_date: "$appointment_info.appointment_date",
        patient_id: "$appointment_info.patient_id",
        patient_first_name: "$patient_info.first_name",
        patient_last_name: "$patient_info.last_name",
        patient_address: "$patient_info.address",
        patient_phone: "$patient_info.phone",
        patient_email: "$patient_info.email",
      },
    },
    { $sort: { bill_date: 1 } },
  ]);

  if (bills.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "No billing records found for this patient.",
    });
  }

  return res.status(200).json({
    status: "success",
    count: bills.length,
    data: bills,
  });
});
