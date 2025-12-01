const mongoose = require('mongoose');

const PostCareSchema = new mongoose.Schema(
  {
    instructions: { type: String, default: "" },
    medication: { type: String, default: "" },
    nextVisit: { type: Date, default: null },
  },
  { _id: false } 
);

const TreatmentSchema = new mongoose.Schema({
  appointment_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment'
  },

  treatment_description: { type: String, required: true },

  treatment_date: { type: Date, required: true },

  treatment_cost: { type: Number, default: 0 },

  done: { type: Boolean, default: false },

  postCare: {
    type: PostCareSchema,
    default: () => ({})
  }
});

module.exports = mongoose.model("Treatment", TreatmentSchema);
