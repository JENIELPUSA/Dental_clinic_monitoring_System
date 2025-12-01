const express = require('express');
const router = express.Router();//express router
const releaseController=require('./../Controller/releaseHistoryController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,releaseController.addItem)
    .get(authController.protect,releaseController.getItems)

router.route('/:id')
    .patch(authController.protect,releaseController.updateItem)
    .delete(authController.protect,releaseController.deleteItem)
router.route('/GenerateReleaseReportPDF')
    .get(authController.protect,releaseController.GenerateReleaseHistoryPDF)


module.exports=router