const express = require('express');
const router = express.Router();//express router
const SchedController=require('./../Controller/ScheduleController')
const authController = require('./../Controller/authController')


router.route('/')
    .post(authController.protect,SchedController.createSchedule)
    .get(authController.protect,SchedController.DisplaySchedule)

router.route('/:id')
.delete(authController.protect,SchedController.deleteSched)
.patch(authController.protect,SchedController.UpdateStatus)
router.route('/update-sched/:id')
.patch(authController.protect,SchedController.UpdateDoctorSched)

    
module.exports=router