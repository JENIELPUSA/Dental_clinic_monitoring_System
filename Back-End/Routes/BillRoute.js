const express = require("express");
const router = express.Router(); //express router
const BillController = require("./../Controller/BillController");
const authController = require("./../Controller/authController");
const BillingHistoryController = require("./../Controller/BillingHistoryController")

router
  .route("/")
  .post(authController.protect, BillController.createBill)
  .get(authController.protect, BillController.DisplayBill);

router
  .route("/:id")
  .patch(authController.protect, BillController.UpdateBill)
  .delete(authController.protect, BillController.deleteBill);

router
  .route("/patientId/:id")
  .get(authController.protect, BillController.DisplayBillByPatientId);

router
  .route("/History")
  .get(authController.protect, BillingHistoryController.DisplayBillHistory);

module.exports = router;
