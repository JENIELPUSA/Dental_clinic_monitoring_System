const cron = require("node-cron");
const mongoose = require("mongoose");
const DentalBill = require("../Models/Bills_Schema");
const generateBillPDFAndSend = require("../Controller/Services/generateBillPDF");

const checkReciept = () => {
  cron.schedule("*/3 * * * *", async () => {
    try {
      console.log("Running CRON job to generate invoices...");

      const bills = await DentalBill.aggregate([
        { $match: { isGenerated: false } },
        {
          $lookup: {
            from: "treatments",
            localField: "treatment_id",
            foreignField: "_id",
            as: "treatment_info",
          },
        },
        { $unwind: "$treatment_info" },
        {
          $lookup: {
            from: "appointments",
            localField: "treatment_info.appointment_id",
            foreignField: "_id",
            as: "appointment_info",
          },
        },
        { $unwind: "$appointment_info" },
        {
          $lookup: {
            from: "patients",
            localField: "appointment_info.patient_id",
            foreignField: "_id",
            as: "patient_info",
          },
        },
        { $unwind: "$patient_info" },
        {
          $project: {
            _id: 1,
            bill_date: 1,
            isGenerated: 1,
            patient_id: "$appointment_info.patient_id",
            patient_first_name: "$patient_info.first_name",
            patient_last_name: "$patient_info.last_name",
          },
        },
        { $sort: { bill_date: 1 } },
        {
          $group: {
            _id: "$patient_id",
            bill: { $first: "$$ROOT" },
          },
        },
      ]);

      console.log(
        `🔍 Found ${bills.length} patients with ungenerated bills...`
      );

      for (const record of bills) {
        const patientId = record.bill.patient_id;
        const billId = record.bill._id;

        try {
          // 👉 Call the shared invoice PDF generator + email sender
          await generateBillPDFAndSend(patientId);

          console.log(
            `Invoice sent for patient_id: ${patientId} (${record.bill.patient_first_name} ${record.bill.patient_last_name})`
          );
        } catch (err) {
          console.error(
            `Failed to generate/send invoice for patient_id ${patientId}:`,
            err.message
          );
        }
      }

      console.log("CRON job completed.");
    } catch (err) {
      console.error("CRON job failed:", err.message);
    }
  });
};

module.exports = checkReciept;
