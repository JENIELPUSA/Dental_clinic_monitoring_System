const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

const ProgressSchema = new mongoose.Schema({
  beforeImage: ImageSchema,
  afterImage: ImageSchema,
  description: { type: String }, // e.g., "Adjusted upper braces", "Final smile"
  stage: { type: String },       // e.g., "Initial", "Mid-treatment", "Final"
  createdAt: { type: Date, default: Date.now }
});

const TreatmentResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },
    treatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treatment",
      required: true
    },
    resultType: {
      type: String,
      enum: ["braces", "whitening", "implant", "filling", "general"],
      default: "general"
    },
    progress: [ProgressSchema],
    overallNotes: { type: String }
  },
  { timestamps: true }
);

TreatmentResultSchema.virtual("firstProgress").get(function () {
  if (this.progress && this.progress.length > 0) {
    return this.progress[0]; // pinaka-una
  }
  return null;
});

TreatmentResultSchema.virtual("lastProgress").get(function () {
  if (this.progress && this.progress.length > 0) {
    return this.progress[this.progress.length - 1]; // pinaka-huli
  }
  return null;
});

TreatmentResultSchema.set("toJSON", { virtuals: true });
TreatmentResultSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("TreatmentResult", TreatmentResultSchema);
