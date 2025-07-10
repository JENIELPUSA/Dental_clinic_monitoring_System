const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medication_name: String,
  dosage: String,
  frequency: String,
  start_date: Date,
  end_date: Date
});


module.exports= mongoose.model("Prescription", PrescriptionSchema);