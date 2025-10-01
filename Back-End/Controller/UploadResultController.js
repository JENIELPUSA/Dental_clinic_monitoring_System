const TreatmentResult = require("../Models/Before&after");
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const cloudinary = require("cloudinary");
const sharp = require("sharp");
const mongoose = require("mongoose");
exports.addTreatmentProgress = async (req, res) => {
  try {
    const { patient, treatment, resultType, description, stage, beforeNotes, afterNotes } = req.body;

    if (!req.files || !req.files.beforeImage || !req.files.afterImage) {
      return res.status(400).json({ message: "Both beforeImage and afterImage are required." });
    }

    const beforeResized = await sharp(req.files.beforeImage[0].buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();
    const beforeBase64 = `data:${req.files.beforeImage[0].mimetype};base64,${beforeResized.toString("base64")}`;
    const beforeUpload = await cloudinary.uploader.upload(beforeBase64, {
      folder: "dental/treatments/before"
    });

    const afterResized = await sharp(req.files.afterImage[0].buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();
    const afterBase64 = `data:${req.files.afterImage[0].mimetype};base64,${afterResized.toString("base64")}`;
    const afterUpload = await cloudinary.uploader.upload(afterBase64, {
      folder: "dental/treatments/after"
    });

    let treatmentResult = await TreatmentResult.findOne({ patient, treatment });

    if (!treatmentResult) {
      treatmentResult = new TreatmentResult({
        patient,
        treatment,
        resultType,
        progress: []
      });
    }
    treatmentResult.progress.push({
      beforeImage: {
        url: beforeUpload.secure_url,
        public_id: beforeUpload.public_id,
        notes: beforeNotes || ""
      },
      afterImage: {
        url: afterUpload.secure_url,
        public_id: afterUpload.public_id,
        notes: afterNotes || ""
      },
      description,
      stage
    });

    await treatmentResult.save();

    return res.status(201).json({
      message: "Treatment progress added successfully!",
      data: treatmentResult
    });
  } catch (error) {
    console.error("Error adding treatment progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTreatmentResultsByPatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

const results = await TreatmentResult.aggregate([
  { $match: { patient: new mongoose.Types.ObjectId(id) } },

  // Lookup patient info
  {
    $lookup: {
      from: "patients",
      localField: "patient",
      foreignField: "_id",
      as: "patientInfo",
    },
  },
  { $unwind: "$patientInfo" },

  // Lookup treatment info
  {
    $lookup: {
      from: "treatments",
      localField: "treatment",
      foreignField: "_id",
      as: "treatmentInfo",
    },
  },
  { $unwind: "$treatmentInfo" },

  // Sort results by createdAt descending (latest first)
  { $sort: { createdAt: -1 } },

  // Unwind progress
  { $unwind: { path: "$progress", preserveNullAndEmptyArrays: true } },
  { $sort: { "progress.createdAt": 1 } }, // keep progress chronological

  // Group by resultType
  {
    $group: {
      _id: "$resultType",
      patientInfo: { $first: "$patientInfo" },
      treatmentInfo: { $first: "$treatmentInfo" },
      overallNotes: { $push: "$overallNotes" },
      firstProgress: { $first: "$progress" },
      lastProgress: { $last: "$progress" },
    },
  },

  // Format output
  {
    $project: {
      _id: 0,
      resultType: "$_id",
      patientInfo: 1,
      treatmentInfo: 1,
      overallNotes: 1,
      firstProgress: 1,
      lastProgress: 1,
    },
  },
]);


    // Post-process to handle duplicate images
    const processedResults = results.map((r) => {
      const first = r.firstProgress || {};
      const last = r.lastProgress || {};

      let beforeImage = first.beforeImage || null;
      let afterImage = last.afterImage || null;

      // Avoid duplicate if first.afterImage == last.beforeImage
      if (first.afterImage?.url && last.beforeImage?.url) {
        if (first.afterImage.url === last.beforeImage.url) {
          // only show once
          beforeImage = first.beforeImage;
          afterImage = last.afterImage;
        }
      }

      return {
        resultType: r.resultType,
        patientInfo: r.patientInfo,
        treatmentInfo: r.treatmentInfo,
        overallNotes: r.overallNotes,
        beforeImage,
        afterImage,
      };
    });

    res.status(200).json({
      success: true,
      count: processedResults.length,
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching treatment results:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
