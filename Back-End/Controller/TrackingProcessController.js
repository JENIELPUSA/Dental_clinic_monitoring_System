const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Apifeatures = require("./../Utils/ApiFeatures");
const trackingprocess = require("./../Models/AppointmentStepProcess");


exports.Displaytrackingprocess = AsyncErrorHandler(async (req, res) => {
  const { limit = 20, page = 1, search = "" } = req.query;
  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;

  // --- Date range: last 7 days ---
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
  const sevenDaysAgoUTC = new Date(todayUTC);
  sevenDaysAgoUTC.setDate(todayUTC.getDate() - 7);

  const admin = req.user.linkId;

  // --- Base filter ---
  const matchStage = {
    createdAt: { $gte: sevenDaysAgoUTC, $lte: now },
    overallStatus: { $ne: "completed" },
  };

  // --- Search filter ---
  if (search.trim()) {
    const searchTerms = search.trim().split(/\s+/);
    matchStage.$and = searchTerms.map((term) => ({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ],
    }));
  }

  // --- Aggregation pipeline ---
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "appointments",
        localField: "appointmentId",
        foreignField: "_id",
        as: "appointmentInfo",
      },
    },
    {
      $unwind: {
        path: "$appointmentInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Only appointments today or later (UTC)
    {
      $match: {
        "appointmentInfo.appointment_date": { $gte: todayUTC },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parsedLimit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await trackingprocess.aggregate(pipeline);

  const data = results[0]?.data || [];
  const totalCategories = results[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    message: "Weekly tracking process data fetched successfully",
    data,
    totalCategories,
    totalPages: Math.ceil(totalCategories / parsedLimit),
    currentPage: parsedPage,
    dateRange: {
      from: sevenDaysAgoUTC.toISOString(),
      to: now.toISOString(),
    },
  });
});


