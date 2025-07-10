const LogActionAudit = require("../Models/LogActionAudit");
const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.displayAuditLogs = AsyncErrorHandler(async (req, res) => {
  const logs = await LogActionAudit.aggregate([
    {
      $lookup: {
        from: "userloginschemas", // Your users collection
        localField: "performed_by", // This is an ObjectId pointing to another model
        foreignField: "linkedId",   // Match performed_by to this field
        as: "user_info",
      },
    },
    {
      $unwind: {
        path: "$user_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        action_type: 1,
        module: 1,
        description: 1,
        reference_id: 1,
        old_data: 1,
        new_data: 1,
        ip_address: 1,
        timestamp: 1,
        performed_by: "$performed_by",
        performed_by_name: {
          $concat: [
            { $ifNull: ["$user_info.first_name", ""] },
            " ",
            { $ifNull: ["$user_info.last_name", ""] },
          ],
        },
        role: "$user_info.role",
      },
    },
    {
      $sort: { timestamp: -1 },
    },
  ]);

  return res.status(200).json({
    status: "success",
    results: logs.length,
    data: logs,
  });
});
