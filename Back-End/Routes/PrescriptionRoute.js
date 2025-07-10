const express = require('express');
const router = express.Router();//express router
const PrescriptionController=require('./../Controller/PrescriptionController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,PrescriptionController.createPrescription)
    .get(authController.protect,PrescriptionController.DisplayPrescription)

router.route('/:id')
    .patch(authController.protect,PrescriptionController.updatePrescription)
     .delete(authController.protect,PrescriptionController.deletePrescription)


module.exports=router