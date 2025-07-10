const mongoose = require('mongoose');


const TreatmentSchema = new mongoose.Schema({
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'},
  treatment_description: String,
  treatment_date: Date,
  treatment_cost: Number,
  done: { type: Boolean, default: false }
});

module.exports= mongoose.model("Treatment", TreatmentSchema);