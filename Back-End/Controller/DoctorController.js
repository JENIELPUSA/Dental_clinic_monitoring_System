const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const doctors = require("./../Models/DoctorDentalSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const fs = require("fs");
const path = require("path");
const LogActionAudit = require("./../Models/LogActionAudit");
const Appointment = require("./../Models/appointmentSchema"); //doctor_id
const DoctorSched = require("./../Models/DoctorSchemaSched"); //doctor

exports.createDoctor = AsyncErrorHandler(async (req, res) => {
  const doctor = await doctors.create(req.body);

  await LogActionAudit.create({
    action_type: "CREATE",
    performed_by: req.user?.linkedId,
    module: "User",
    reference_id: doctor._id,
    description: `Created new doctor: ${doctor.first_name} ${doctor.last_name}`,
    new_data: doctor,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  res.status(201).json({
    status: "success",
    data: doctor,
  });
});

exports.DisplayDoctors = AsyncErrorHandler(async (req, res) => {
  const { search = "", limit = 10, page } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const matchStage = {};

  if (search.trim()) {
    const searchTerms = search.trim().split(/\s+/); // hatiin sa bawat space
    matchStage.$and = searchTerms.map((term) => ({
      $or: [
        { first_name: { $regex: term, $options: "i" } },
        { last_name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { specialty: { $regex: term, $options: "i" } },
      ],
    }));
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { created_at: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await doctors.aggregate(pipeline);

  const data = results[0]?.data || [];
  const totalDoctors = results[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalDoctors,
    totalPages: Math.ceil(totalDoctors / parseInt(limit)),
    currentPage: parseInt(page),
  });
});



exports.UpdateDoctor = AsyncErrorHandler(async (req, res, next) => {
  const doctor = await doctors.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  if (req.file) {
    if (doctor.avatar && fs.existsSync(doctor.avatar)) {
      fs.unlinkSync(doctor.avatar);
    }
    req.body.avatar = req.file.path;
  }

  const updatedDoctor = await doctors.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  await LogActionAudit.create({
    action_type: "UPDATE",
    performed_by: req.user?.linkedId,
    module: "User",
    reference_id: updatedDoctor._id,
    description: `Updated doctor: ${updatedDoctor.first_name} ${updatedDoctor.last_name}`,
    old_data: doctor,
    new_data: updatedDoctor,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  res.status(200).json({
    status: "success",
    data: updatedDoctor,
  });
});

exports.deleteDoctor = AsyncErrorHandler(async (req, res, next) => {
  const doctorId = req.params.id;

  const doctor = await doctors.findById(doctorId);
  if (!doctor) {
    return res.status(404).json({
      status: "fail",
      message: "Doctor not found",
    });
  }

  const [appointments, doctorsched] = await Promise.all([
    Appointment.exists({ doctor_id: doctorId }), // corrected field
    DoctorSched.exists({ doctor: doctorId }),
  ]);

  if (appointments || doctorsched) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot delete doctor: there are existing related records.",
    });
  }

  const deletedDoctor = await doctors.findByIdAndDelete(doctorId);

  await LogActionAudit.create({
    action_type: "DELETE",
    performed_by: req.user?.linkedId,
    module: "User",
    reference_id: deletedDoctor._id,
    description: `Deleted doctor: ${deletedDoctor.first_name} ${deletedDoctor.last_name}`,
    old_data: deletedDoctor,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  res.status(200).json({
    status: "success",
    data: null,
  });
});
