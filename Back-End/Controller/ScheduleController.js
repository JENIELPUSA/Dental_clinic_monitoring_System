const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Schedule = require("../Models/DoctorSchemaSched");
const mongoose = require("mongoose");
const LogActionAudit = require("../Models/LogActionAudit");

const Doctor = require("../Models/DoctorDentalSchema");
const Notification = require("./../Models/NotificationSchema");
const User = require("./../Models/LogInDentalSchema");

exports.createSchedule = AsyncErrorHandler(async (req, res, next) => {
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress;
  console.log("Backend received request body for schedule creation:", req.body);

  const sched = await Schedule.create(req.body);
  console.log("Schedule successfully created:", sched);

  const doctorId = req.body.doctor;

  if (doctorId) {
    await Doctor.findByIdAndUpdate(doctorId, { scheduled: true });
  }

  // SOCKET EMIT to specific doctor
  const io = req.app.get("io");
  const targetDoctor = global.connectedUsers?.[doctorId];

  const message = {
    message: "You have been assigned a new schedule.",
    data: sched,
  };

  if (targetDoctor && io) {
    const { socketId } = targetDoctor;
    io.to(socketId).emit("scheduleAssigned", message);
    console.log(`Sent real-time notification to doctor (${doctorId})`);
  } else {
    console.log(`No active socket for doctor (${doctorId})`);
  }

  // DATABASE NOTIFICATION for that doctor only (with isRead tracking)
  await Notification.create({
    message:
      "🦷 A new schedule has been created. Please check your schedule to approve.",
    viewers: [
      {
        user: new mongoose.Types.ObjectId(doctorId),
        isRead: false,
        viewedAt: null,
      },
    ],
  });

  await LogActionAudit.create({
    action_type: "CREATE",
    performed_by: req.user?.linkedId,
    module: "Schedule",
    reference_id: sched._id,
    description: `Created a new schedule assigned to doctor (${doctorId}).`,
    new_data: sched,
    ip_address: ipAddress,
  });

  res.status(201).json({
    status: "success",
    data: sched,
  });
});

exports.DisplaySchedule = AsyncErrorHandler(async (req, res) => {
  try {
    const schedules = await Schedule.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor_info",
        },
      },
      {
        $unwind: {
          path: "$doctor_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          avatar: "$doctor_info.avatar",
          doctorId: "$doctor_info._id",
          doctorName: {
            $concat: ["$doctor_info.first_name", " ", "$doctor_info.last_name"],
          },
          specialty: "$doctor_info.specialty",
          day: 1,
          date: 1,
          timeSlots: {
            $map: {
              input: "$timeSlots",
              as: "slot",
              in: {
                start: "$$slot.start",
                end: "$$slot.end",
                maxPatientsPerSlot: "$$slot.maxPatientsPerSlot",
                reason: "$$slot.reason",
                _id: "$$slot._id",
              },
            },
          },
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: "Success",
      data: schedules,
    });
  } catch (error) {
    console.error("Error in DisplaySchedule:", error.message);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
});

exports.deleteSched = AsyncErrorHandler(async (req, res, next) => {
  await Schedule.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.UpdateStatus = AsyncErrorHandler(async (req, res, next) => {
  const updatedata = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  await LogActionAudit.create({
    action_type: "UPDATE",
    performed_by: req.user?.linkedId,
    module: "Schedule",
    reference_id: updatedata._id,
    description: `Updated schedule status to "${updatedata.status}".`,
    new_data: updatedata,
    ip_address:
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress,
  });

  const schedules = await Schedule.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(updatedata._id) },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    {
      $unwind: {
        path: "$doctor_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        doctorId: "$doctor_info._id",
        doctorName: {
          $concat: ["$doctor_info.first_name", " ", "$doctor_info.last_name"],
        },
        day: 1,
        date: 1,
        timeSlots: {
          $map: {
            input: "$timeSlots",
            as: "slot",
            in: {
              start: "$$slot.start",
              end: "$$slot.end",
              maxPatientsPerSlot: "$$slot.maxPatientsPerSlot",
              _id: "$$slot._id",
            },
          },
        },
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
      },
    },
  ]);

  const io = req.app.get("io");
  const viewers = new Set();

  // 🔔 Helper function for notifying and collecting viewers
  const notifyAndCollect = (messageText) => {
    const message = {
      message: messageText,
      data: schedules[0],
    };

    let anyOnline = false;

    for (const linkId in global.connectedUsers) {
      const { socketId, role } = global.connectedUsers[linkId];
      if (role === "admin" || role === "staff") {
        io.to(socketId).emit("adminNotification", message);
        viewers.add(linkId);
        anyOnline = true;
        console.log(`🔔 Notified ${role} (${linkId}) about: "${messageText}"`);
      }
    }

    return anyOnline;
  };

  const handleNotification = async (statusText, messageText) => {
    const online = notifyAndCollect(messageText);

    if (!online) {
      const fallbackUsers = await User.find(
        { role: { $in: ["admin", "staff"] } },
        "_id"
      );
      console.log("🧪 Fallback users (offline):", fallbackUsers);

      fallbackUsers.forEach((user) => viewers.add(user._id.toString()));
    }

    try {
      const finalViewers = [...viewers];
      console.log("📥 Saving notification for viewers:", finalViewers);

      await Notification.create({
        message: messageText,
        viewers: finalViewers.map((id) => ({
          user: new mongoose.Types.ObjectId(id),
          isRead: false,
          viewedAt: null,
        })),
      });
    } catch (err) {
      console.error("❌ Failed to save notification:", err);
    }
  };
  switch (updatedata.status) {
    case "Approved":
      await handleNotification(
        "Approved",
        "🦷 A new schedule has been confirmed."
      );
      break;
    case "Cancelled":
      await handleNotification(
        "Cancelled",
        "🦷 A schedule has been cancelled by the doctor."
      );
      break;
    case "Re-Assigned":
      await handleNotification(
        "Re-Assigned",
        "🦷 A schedule has been re-assigned to another doctor."
      );
      break;
    default:
      console.log("No action for status:", updatedata.status);
      break;
  }

  for (const linkId in global.connectedUsers) {
    const { socketId, role } = global.connectedUsers[linkId];
    if (role === "admin" || role === "staff") {
      io.to(socketId).emit("scheduleStatusUpdated", schedules[0]);
    }
  }

  res.status(200).json({
    status: "success",
    data: schedules,
  });
});

exports.UpdateDoctorSched = AsyncErrorHandler(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return res
      .status(404)
      .json({ status: "fail", message: "Schedule not found" });
  }

  if (schedule.hasReassigned && req.body.status === "Re-Assigned") {
    return res.status(400).json({
      status: "fail",
      message:
        "🦷 Schedule has already been reassigned once. Further reassignments are not allowed.",
    });
  }

  const updatedData = {
    ...req.body,
    ...(req.body.status === "Re-Assigned" ? { hasReassigned: true } : {}),
  };

  const updatedSchedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    updatedData,
    {
      new: true,
    }
  );

  // Then continue with your aggregation (unchanged)
  const schedules = await Schedule.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(updatedSchedule._id) } },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctor_info",
      },
    },
    {
      $unwind: {
        path: "$doctor_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        doctorId: "$doctor_info._id",
        doctorName: {
          $concat: ["$doctor_info.first_name", " ", "$doctor_info.last_name"],
        },
        day: 1,
        date: 1,
        timeSlots: {
          $map: {
            input: "$timeSlots",
            as: "slot",
            in: {
              start: "$$slot.start",
              end: "$$slot.end",
              maxPatientsPerSlot: "$$slot.maxPatientsPerSlot",
              _id: "$$slot._id",
            },
          },
        },
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
        hasReassigned: 1, // Optional: include this in frontend for control
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: schedules,
  });
});
