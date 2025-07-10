const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
  avatar: String,
  first_name: String,
  last_name: String,
  contact_number: String,
  email: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("staff", StaffSchema);
