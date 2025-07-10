const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const BillingHistory = require("../Models/BllingHiistorySchema");

exports.DisplayBillHistory = AsyncErrorHandler(async (req, res) => {
  const bills = await BillingHistory.aggregate([
    // JOIN patient info
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
    {
      $project: {
        _id: 1,
        treatment_id: 1,
        treatment_description: 1,
        treatment_date:1,
        total_amount: 1,
        amount_paid: 1,
        balance: 1,
        bill_date: 1,
        payment_status: 1,
        patient_id:1,
        patient_first_name: "$patient_info.first_name",
        patient_last_name: "$patient_info.last_name",
        patient_address: "$patient_info.address",
        patient_email: "$patient_info.email",
        patient_phone: "$patient_info.phone",
      },
    },
    { $sort: { payment_date: 1 } },
  ]);

  if (!bills.length) {
    return res.status(404).json({
      status: "error",
      message: "No billing history records found.",
    });
  }

  return res.status(200).json({
    status: "success",
    count: bills.length,
    data: bills,
  });
});
