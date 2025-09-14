const express = require('express');
const router = express.Router();//express router
const categoryController=require('./../Controller/CategoryController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,categoryController.createCategory)
    .get(authController.protect,categoryController.Displaycategory)

router.route('/:id')
    .patch(authController.protect,categoryController.Updatecategory)
    .delete(authController.protect,categoryController.deletecategory)


module.exports=router