const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Staff = require("../Models/StaffDentalSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const fs = require("fs");
const path = require("path");

exports.createBrand = AsyncErrorHandler(async (req, res) => {
  const branded = await Staff.create(req.body);
  res.status(200).json({
    status: "success",
    data: branded,
  });
});

exports.DisplayStaff = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(Staff.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const Staffs = await features.query;

  res.status(200).json({
    status: "success",
    data: Staffs,
  });
});

exports.UpdateStaff = AsyncErrorHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    return res.status(404).json({ status: "fail", message: "Staff not found" });
  }

  if (req.file) {
    if (staff.avatar && fs.existsSync(staff.avatar)) {
      fs.unlinkSync(staff.avatar);
    }

    req.body.avatar = req.file.path; 
  }

  const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedStaff,
  });
});

exports.RemoveStaff = AsyncErrorHandler(async (req, res, next) => {
  await Staff.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    data: null,
  });
});
