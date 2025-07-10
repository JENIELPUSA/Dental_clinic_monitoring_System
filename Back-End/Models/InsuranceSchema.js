const mongoose = require("mongoose");

const InsuranceSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  insurance_provider: String,
  policy_number: String,
  coverage_details: String,
  valid_from: Date,
  valid_until: Date
});

module.exports = mongoose.model("Insurance", InsuranceSchema);