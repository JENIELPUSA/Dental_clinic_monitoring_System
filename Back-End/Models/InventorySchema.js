const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brand: {
    type: String,
    default: "Generic",
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    enum: ["pcs", "box", "pack", "bottle", "set", "kit"],
    default: "pcs",
  },
  expirationDate: {
    type: Date, // for consumables/meds
  },
  dateAcquired: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Good", "Low Stock", "Expired", "For Repair", "Unavailable"],
    default: "Good",
  },
  reorderLevel: {
    type: Number, // threshold for alert
    default: 10,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Inventory", InventorySchema);
