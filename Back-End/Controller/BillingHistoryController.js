const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const BillingHistory = require("../Models/BllingHiistorySchema");

exports.DisplayBillHistory = AsyncErrorHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", from, to } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const matchStage = {};

    // Use treatment_date instead of bill_date
    if (from && to) {
      matchStage.treatment_date = {
        $gte: new Date(from + "T00:00:00.000Z"),
        $lte: new Date(to + "T23:59:59.999Z"),
      };
    } else if (from) {
      matchStage.treatment_date = { $gte: new Date(from + "T00:00:00.000Z") };
    } else if (to) {
      matchStage.treatment_date = { $lte: new Date(to + "T23:59:59.999Z") };
    }

    const searchConditions = [];
    if (search.trim()) {
      const terms = search.trim().split(/\s+/);
      searchConditions.push(
        ...terms.map((term) => ({
          $or: [
            { treatment_description: { $regex: term, $options: "i" } },
            { payment_status: { $regex: term, $options: "i" } },
            { "patient_info.first_name": { $regex: term, $options: "i" } },
            { "patient_info.last_name": { $regex: term, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: ["$patient_info.first_name", " ", "$patient_info.last_name"],
                  },
                  regex: term,
                  options: "i",
                },
              },
            },
          ],
        }))
      );
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient_info",
        },
      },
      {
        $unwind: {
          path: "$patient_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...(searchConditions.length > 0 ? [{ $match: { $and: searchConditions } }] : []),
      {
        $project: {
          _id: 1,
          treatment_id: 1,
          treatment_description: 1,
          treatment_date: 1,
          total_amount: 1,
          amount_paid: 1,
          balance: 1,
          payment_status: 1,
          patient_id: 1,
          patient_first_name: "$patient_info.first_name",
          patient_last_name: "$patient_info.last_name",
          patient_address: "$patient_info.address",
          patient_email: "$patient_info.email",
          patient_phone: "$patient_info.phone",
        },
      },
      { $sort: { treatment_date: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await BillingHistory.aggregate(pipeline);
    const data = results[0]?.data || [];
    const totalCount = results[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      status: "success",
      currentPage: pageNum,
      totalPages,
      totalCount,
      data,
    });
  } catch (error) {
    console.error("Error in DisplayBillHistory:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});



