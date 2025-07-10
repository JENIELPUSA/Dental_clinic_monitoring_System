const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  avatar: String,
  first_name: String,
  last_name: String,
  dob: Date,
  gender: { type: String, enum: ["Male", "Female"] },
  contact_number: String,
  email: String,
  address: String,
  emergency_contact_name: String,
  emergency_contact_number: String,
  created_at: { type: Date, default: Date.now },
});

module.exports= mongoose.model("Patient", PatientSchema);
