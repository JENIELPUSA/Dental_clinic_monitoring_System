const mongoose = require('mongoose');

const DentalHistorySchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  previous_conditions: String,
  surgeries: String,
  allergies: String,
  family_dental_history: String,
  last_checkup_date: Date
});

module.exports = mongoose.model("DentalHistory", DentalHistorySchema);