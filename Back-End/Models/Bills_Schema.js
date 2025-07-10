const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  treatment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Treatment",
    required: true,
    unique: true,
  },
  total_amount: Number,
  amount_paid: Number,
  balance: Number,
  bill_date: Date,
  payment_status: { type: String, enum: ["Paid", "Unpaid", "Partial"] },
  isGenerated: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Bill", BillSchema);
