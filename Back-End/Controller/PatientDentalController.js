const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Patient = require("./../Models/PatientDentalSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const LogActionAudit = require("./../Models/LogActionAudit");
const fs = require("fs");
const path = require("path");
const Appointment = require("./../Models/appointmentSchema");
const BillingHistory = require("./../Models/BllingHiistorySchema");
const DentalHistory = require("./../Models/Dental_HistorySchema");
const Insurance = require("./../Models/InsuranceSchema");

exports.DisplayPatient = AsyncErrorHandler(async (req, res) => {
  const { search = "", limit = 10, page = 1 } = req.query;

  // Convert safely to integer
  const parsedLimit = parseInt(limit, 10) || 5;
  const parsedPage = parseInt(page, 10) || 1;
  const skip = (parsedPage - 1) * parsedLimit;

  const matchStage = {};

  if (search.trim()) {
    const searchTerms = search.trim().split(/\s+/);
    matchStage.$and = searchTerms.map((term) => ({
      $or: [
        { first_name: { $regex: term, $options: "i" } },
        { last_name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { contactNumber: { $regex: term, $options: "i" } },
      ],
    }));
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { created_at: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: parsedLimit },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await Patient.aggregate(pipeline);

  const data = results[0]?.data || [];
  const totalPatients = results[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalPatients,
    totalPages: Math.ceil(totalPatients / parsedLimit),
    currentPage: parsedPage,
  });
});



exports.UpdatePatient = AsyncErrorHandler(async (req, res, next) => {
  const oldPatient = await Patient.findById(req.params.id);

  if (!oldPatient) {
    return res
      .status(404)
      .json({ status: "fail", message: "Patient not found" });
  }

  if (req.file) {
    if (oldPatient.avatar && fs.existsSync(oldPatient.avatar)) {
      fs.unlinkSync(oldPatient.avatar);
    }
    req.body.avatar = req.file.path;
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  await LogActionAudit.create({
    action_type: "UPDATE",
    performed_by: req.user?.linkedId,
    module: "Patient",
    reference_id: updatedPatient._id,
    description: `Updated patient info: ${updatedPatient.first_name} ${updatedPatient.last_name}`,
    old_data: oldPatient,
    new_data: updatedPatient,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  res.status(200).json({
    status: "success",
    data: updatedPatient,
  });
});

exports.deletePatient = AsyncErrorHandler(async (req, res, next) => {
  const patientId = req.params.id;
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res
      .status(404)
      .json({ status: "fail", message: "Patient not found" });
  }
  const [appointments, billings, dentalHistory, insurances] = await Promise.all([
    Appointment.exists({ patient_id: patientId }),
    BillingHistory.exists({ patient_id: patientId }),
    DentalHistory.exists({ patient_id: patientId }),
    Insurance.exists({ patient_id: patientId }),
  ]);

  if (appointments || billings || dentalHistory || insurances) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot delete patient: there are existing related records.",
    });
  }

  await Patient.findByIdAndDelete(patientId);

  res.status(200).json({
    status: "success",
    message: "Patient deleted successfully.",
    data: null,
  });
});

