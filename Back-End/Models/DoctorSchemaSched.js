const mongoose = require("mongoose");

const DoctorSpecificScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    day: {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },
    timeSlots: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
        reason: { type: String },
        maxPatientsPerSlot: {
          type: Number,
          required: true,
          default: 10,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Re-Assigned","Cancelled"],
      default: "Pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasReassigned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

DoctorSpecificScheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model(
  "DoctorSpecificSchedule",
  DoctorSpecificScheduleSchema
);
