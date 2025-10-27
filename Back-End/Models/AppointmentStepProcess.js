const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  stepName: {
    type: String,
    enum: [
      "Appointment",
      "Confirmation",
      "Treatment",
      "Prescription",
      "Completed",
      "Payment",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "skipped"],
    default: "pending",
  },
  remarks: {
    type: String,
    trim: true,
  },
  startedAt: Date,
  completedAt: Date,
});

const AppointmentStepProcessSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    steps: {
      type: [StepSchema],
      default: [
        { stepNumber: 1, stepName: "Appointment", status: "completed" },
        { stepNumber: 2, stepName: "Confirmation", status: "pending" },
        { stepNumber: 3, stepName: "Treatment", status: "pending" },
        { stepNumber: 4, stepName: "Prescription", status: "pending" },
        { stepNumber: 5, stepName: "Completed", status: "pending" },
        { stepNumber: 6, stepName: "Payment", status: "pending" },
      ],
    },
    currentStep: {
      type: Number,
      default: 2,
      min: 1,
      max: 6,
    },
    overallStatus: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "cancelled"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

AppointmentStepProcessSchema.pre("save", function (next) {
  const allCompleted = this.steps.every((s) => s.status === "completed");
  if (allCompleted) this.overallStatus = "completed";
  next();
});

module.exports = mongoose.model(
  "AppointmentStepProcess",
  AppointmentStepProcessSchema
);
