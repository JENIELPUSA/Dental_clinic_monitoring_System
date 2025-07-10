const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  avatar: String,
  first_name: String,
  last_name: String,
  specialty: String,
  contact_number: String,
  email: String,
  scheduled: {
    type: Boolean,
    default: false,
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", DoctorSchema);
