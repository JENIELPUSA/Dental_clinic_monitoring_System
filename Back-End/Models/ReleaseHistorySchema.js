const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now, 
    },
    item: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
    },
    category: {
      type: String, 
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Releasehistory", ItemSchema);
