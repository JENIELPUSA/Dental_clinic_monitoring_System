const express = require('express');
const router = express.Router();//express router
const StaffController = require('../Controller/StaffController')
const authController = require('./../Controller/authController')
const upload = require('../middleware/imageUploader');

router.route('/')
    .get(authController.protect,StaffController.DisplayStaff)

router.route('/:id')
    .delete(authController.protect,StaffController.RemoveStaff)
    .patch(authController.protect,upload.single("avatar"),StaffController.UpdateStaff)

module.exports=router