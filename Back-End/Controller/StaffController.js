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
  const { search = "", limit = 10, page = 1 } = req.query;

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
        { position: { $regex: term, $options: "i" } },
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

  const results = await Staff.aggregate(pipeline);

  const data = results[0]?.data || [];
  const totalStaff = results[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalStaff,
    totalPages: Math.ceil(totalStaff / parsedLimit),
    currentPage: parsedPage,
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
