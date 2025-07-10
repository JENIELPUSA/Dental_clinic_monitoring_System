const express = require("express");
const router = express.Router();
const AppointmentController = require("./../Controller/AppointmentController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, AppointmentController.createAppointment)
  .get(authController.protect, AppointmentController.DisplayAppointment);

router
  .route("/:id")
  .patch(authController.protect, AppointmentController.UpdateAppointment)
  .delete(authController.protect, AppointmentController.deleteAppointment);

router
  .route("/GetSpecificAppointment")
  .get(authController.protect, AppointmentController.GetSpecificAppointment);

router
  .route("/UpdateStatus/:id")
  .patch(authController.protect, AppointmentController.UpdateStatus);

router
  .route("/GetSpecificByAppointment/:id")
  .get(authController.protect, AppointmentController.GetSpecificAppointmentById);

router
  .route("/GetPatientAppointment/:id")
  .get(authController.protect, AppointmentController.GetPatientAppointment);


module.exports = router;
