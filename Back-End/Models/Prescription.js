const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
  medication_name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
});

const PrescriptionSchema = new mongoose.Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    medications: [MedicationSchema],
    fileUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
