const mongoose = require("mongoose");
const PostCareSchema = new mongoose.Schema(
  {
    instructions: { type: String, default: "" },
    medication: { type: String, default: "" },
    nextVisit: { type: Date, default: null },
  },
  { _id: false }
);

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

    postCare: {
      type: PostCareSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
