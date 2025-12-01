const express = require('express');
const router = express.Router();//express router
const inventoryController=require('./../Controller/InventoryController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,inventoryController.addInventory)
    .get(authController.protect,inventoryController.getAllInventory)

router.route('/:id')
    .patch(authController.protect,inventoryController.updateInventory)
    .delete(authController.protect,inventoryController.deleteInventory)
router.route('/GenerateInventoryPDF')
    .get(authController.protect,inventoryController.GenerateInventoryPDF)



module.exports=router