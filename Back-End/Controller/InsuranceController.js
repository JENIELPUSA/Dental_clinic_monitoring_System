const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const DentalInsurance = require("./../Models/InsuranceSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const CustomError = require("../Utils/CustomError");
const LogActionAudit = require("./../Models/LogActionAudit");
const getInsuranceDetailsPipeline = (id = null) => {
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
      $unwind: { path: "$patient_info", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        patient_id: 1,
        insurance_provider: 1,
        policy_number: 1,
        coverage_details: 1,
        start_date: "$valid_from",
        end_date: "$valid_until",
        patient_name: {
          $concat: [
            { $ifNull: ["$patient_info.first_name", ""] },
            " ",
            { $ifNull: ["$patient_info.last_name", ""] },
          ],
        },
      },
    },
  ];

  if (id) {
    pipeline.unshift({
      $match: { _id: new mongoose.Types.ObjectId(id) },
    });
  }

  return pipeline;
};

exports.createIsnurance = AsyncErrorHandler(async (req, res, next) => {
  const {
    patient_id,
    insurance_provider,
    policy_number,
    coverage_details,
    valid_from,
    valid_until,
  } = req.body;

  if (patient_id && !mongoose.Types.ObjectId.isValid(patient_id)) {
    return next(new CustomError("Invalid Patient ID format", 400));
  }
  const newInsurance = await DentalInsurance.create({
    patient_id,
    insurance_provider,
    policy_number,
    coverage_details,
    valid_from,
    valid_until,
  });

  const insuranceWithDetails = await DentalInsurance.aggregate(
    getInsuranceDetailsPipeline(newInsurance._id)
  );

  const detailedInsurance = insuranceWithDetails[0];

  await LogActionAudit.create({
    action_type: "CREATE",
    performed_by: req.user?.linkedId,
    module: "Insurance",
    reference_id: newInsurance._id,
    description: `Created insurance record for patient: ${detailedInsurance?.patient_name || "Unknown"}`,
    new_data: newInsurance,
    ip_address: req.headers["x-forwarded-for"]?.split(",").shift() || req.socket?.remoteAddress,
  });

  return res.status(201).json({
    status: "success",
    data: detailedInsurance,
  });
});

exports.DisplayInsurance = AsyncErrorHandler(async (req, res) => {
  const insurance = await DentalInsurance.aggregate(getInsuranceDetailsPipeline());

  return res.status(200).json({
    status: "Success",
    data: insurance,
  });
});

exports.UpdateInsurance = AsyncErrorHandler(async (req, res, next) => {
  const {
    patient_id,
    insurance_provider,
    policy_number,
    coverage_details,
    valid_from,
    valid_until,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid Insurance ID format", 400));
  }

  if (patient_id && !mongoose.Types.ObjectId.isValid(patient_id)) {
    return next(new CustomError("Invalid Patient ID format", 400));
  }

  // 🔍 Get the existing record for logging
  const oldInsuranceData = await DentalInsurance.findById(req.params.id);
  if (!oldInsuranceData) {
    return next(new CustomError("Insurance record not found", 404));
  }

  // 🛠 Update the insurance record
  const updateinsurance = await DentalInsurance.findByIdAndUpdate(
    req.params.id,
    {
      patient_id,
      insurance_provider,
      policy_number,
      coverage_details,
      valid_from,
      valid_until,
    },
    { new: true, runValidators: true }
  );
  const insuranceWithDetails = await DentalInsurance.aggregate(
    getInsuranceDetailsPipeline(updateinsurance._id)
  );
  const detailedInsurance = insuranceWithDetails[0];

  await LogActionAudit.create({
    action_type: "UPDATE",
    performed_by: req.user?.linkedId,
    module: "Insurance",
    reference_id: updateinsurance._id,
    description: `Updated insurance record for patient: ${detailedInsurance?.patient_name || "Unknown"}`,
    old_data: oldInsuranceData,
    new_data: updateinsurance,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() || req.socket?.remoteAddress,
  });

  return res.status(200).json({
    status: "success",
    data: detailedInsurance,
  });
});

exports.deleteInsurance = AsyncErrorHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid Insurance ID format", 400));
  }

  const insuranceWithDetails = await DentalInsurance.aggregate(
    getInsuranceDetailsPipeline(req.params.id)
  );

  if (!insuranceWithDetails || insuranceWithDetails.length === 0) {
    return next(new CustomError("Insurance record not found", 404));
  }

  const deleteResult = await DentalInsurance.findByIdAndDelete(req.params.id);

  if (!deleteResult) {
    return next(new CustomError("Failed to delete insurance record", 500));
  }

  await LogActionAudit.create({
    action_type: "DELETE",
    performed_by: req.user?.linkedId,
    module: "Insurance",
    reference_id: deleteResult._id,
    description: `Deleted insurance record for patient: ${
      insuranceWithDetails[0]?.patient_name || "Unknown"
    }`,
    old_data: deleteResult,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  return res.status(200).json({
    status: "success",
    message: "Insurance record deleted successfully",
    data: insuranceWithDetails[0],
  });
});


