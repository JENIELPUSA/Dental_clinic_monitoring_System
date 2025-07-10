const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment_date: { type: Date, required: true },
  slot_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  appointment_status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  created_at: { type: Date, default: Date.now },
  taskCreated: { type: Boolean, default: false }
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
