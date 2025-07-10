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
  const features = new Apifeatures(Patient.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const patients = await features.query;

  // Format dob to "yyyy-MM-dd"
  const formattedPatients = patients.map((patient) => {
    const patientObj = patient.toObject();

    if (patientObj.dob) {
      const dob = new Date(patientObj.dob);
      const year = dob.getFullYear();
      const month = String(dob.getMonth() + 1).padStart(2, "0");
      const day = String(dob.getDate()).padStart(2, "0");
      patientObj.dob = `${year}-${month}-${day}`;
    }

    return patientObj;
  });

  res.status(200).json({
    status: "success",
    data: formattedPatients,
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

  await LogActionAudit.create({
    action_type: "DELETE",
    performed_by: req.user?.linkedId,
    module: "Patient",
    reference_id: patient._id,
    description: `Deleted patient: ${patient.first_name} ${patient.last_name}`,
    old_data: patient,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  res.status(200).json({
    status: "success",
    message: "Patient deleted successfully.",
    data: null,
  });
});

