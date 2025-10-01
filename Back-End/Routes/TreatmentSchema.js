const express = require("express");
const router = express.Router(); //express router
const TreatmentController = require("./../Controller/TreatmentController");
const authController = require("./../Controller/authController");
const upload = require("../middleware/fileUploader");
router
  .route("/")
  .post(authController.protect, upload.single("file"),TreatmentController.createTreatment)
  .get(authController.protect, TreatmentController.DisplayTreatment);

router
  .route("/:id")
  .patch(authController.protect, TreatmentController.UpdateTreatment)
  .delete(authController.protect, TreatmentController.deleteTreatment);

router
  .route("/SpecificTreatment/:id")
  .get(authController.protect, TreatmentController.DisplayTreatmentByPatientId);

module.exports = router;
