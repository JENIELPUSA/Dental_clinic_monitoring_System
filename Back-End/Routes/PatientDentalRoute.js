
const express = require("express");
const router = express.Router();//express router
const PatientController=require('./../Controller/PatientDentalController')
const authController = require('./../Controller/authController')
const upload = require('../middleware/imageUploader');
router.route('/')
    .get(PatientController.DisplayPatient)

router.route('/:id')
.patch(authController.protect, upload.single("avatar"), PatientController.UpdatePatient)
    .delete(authController.protect,PatientController.deletePatient)


module.exports = router;