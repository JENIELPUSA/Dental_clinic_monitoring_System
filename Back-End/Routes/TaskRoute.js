const express = require('express');
const router = express.Router();
const TaskController=require('./../Controller/TaskController')
const authController = require('./../Controller/authController')

router.route('/')
    .get(authController.protect,TaskController.DisplayTask)

module.exports=router