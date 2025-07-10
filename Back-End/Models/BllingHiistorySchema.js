const mongoose = require('mongoose');
const BillingHistorySchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  treatment_description: String,
  total_amount: Number,       
  amount_paid: Number,        
  balance: Number,               
  treatment_date: {
    type: Date,
    default: Date.now,
  },
   payment_status: {
    type: String,
    enum: ["Paid", "Unpaid", "Partial"],
    default: "Unpaid",
  },         
});


module.exports = mongoose.model("BillingHistory", BillingHistorySchema);
