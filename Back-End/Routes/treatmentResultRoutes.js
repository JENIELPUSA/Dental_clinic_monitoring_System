const express = require("express");
const treatmentResultController = require("../Controller/UploadResultController");
const upload = require("../middleware/imageUploader"); 
const router = express.Router();

router
  .route("/progress")
  .post(
    upload.fields([
      { name: "beforeImage", maxCount: 1 },
      { name: "afterImage", maxCount: 1 },
    ]),
    treatmentResultController.addTreatmentProgress
  );

router
  .route("/patient/:id")
  .get(treatmentResultController.getTreatmentResultsByPatient);;

module.exports = router;
