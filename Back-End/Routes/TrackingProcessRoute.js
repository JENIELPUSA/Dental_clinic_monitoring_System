const express = require('express');
const router = express.Router();//express router
const TrackingProcess=require('./../Controller/TrackingProcessController')
const authController = require('./../Controller/authController')
const upload = require('../middleware/imageUploader');

router.route('/')
    .get(authController.protect,TrackingProcess.Displaytrackingprocess)


module.exports=router