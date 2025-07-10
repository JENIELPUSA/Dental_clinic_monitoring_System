const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "High Priority", "Completed", "Normal"],
      default: "Pending",
    },

    appointmentDate: {
      type: Date,
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "PendingAppointment",
        "NoScheduleEver",
        "NoScheduleThisWeek",
        "FollowUp",
        "Manual",
      ],
      default: "Manual",
    },

    isSystemGenerated: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
