const express = require('express');
const router = express.Router();//express router
const DoctorController=require('./../Controller/DoctorController')
const authController = require('./../Controller/authController')
const upload = require('../middleware/imageUploader');

router.route('/')
    .post(authController.protect,DoctorController.createDoctor)
    .get(authController.protect,DoctorController.DisplayDoctors)

router.route('/:id')
.patch(authController.protect, upload.single("avatar"), DoctorController.UpdateDoctor)
.delete(authController.protect,DoctorController.deleteDoctor)
    
module.exports=router