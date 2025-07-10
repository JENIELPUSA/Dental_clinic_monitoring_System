const cron = require("node-cron");
const mongoose = require("mongoose");
const Appointment = require("../Models/appointmentSchema");
const Task = require("../Models/TaskSchema");

const checkPendingAppointments = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const pendingAppointments = await Appointment.find({ appointment_status: "Pending" }).populate("patient_id doctor_id");

      for (const appointment of pendingAppointments) {
        const appointmentId = appointment._id;

        const taskExists = await Task.findOne({
          relatedAppointment: appointmentId,
          category: "PendingAppointment",
        });

        if (!taskExists) {
          const patientName = appointment.patient_id
            ? `${appointment.patient_id.first_name} ${appointment.patient_id.last_name}`
            : "Unknown Patient";

          const doctorName = appointment.doctor_id
            ? `Dr. ${appointment.doctor_id.first_name} ${appointment.doctor_id.last_name}`
            : "Unknown Doctor";

          await Task.create({
            description: `Pending appointment for ${patientName} with ${doctorName} on ${appointment.appointment_date.toLocaleString()}.`,
            dueDate: new Date(),
            assignedTo: appointment.doctor_id?._id || null,
            category: "PendingAppointment",
            status: "Normal",
            isSystemGenerated: true,
            relatedAppointment: new mongoose.Types.ObjectId(appointmentId), // make sure it's ObjectId
          });

          console.log(` Created task for appointment ${appointmentId}`);
        }
      }

      // STEP 2: Delete task if appointment is not Pending anymore
      const tasks = await Task.find({
        category: "PendingAppointment",
        relatedAppointment: { $exists: true },
      });

      console.log(`Found ${tasks.length} tasks to verify for deletion`);

      for (const task of tasks) {
        const appointmentId = task.relatedAppointment instanceof mongoose.Types.ObjectId
          ? task.relatedAppointment
          : new mongoose.Types.ObjectId(task.relatedAppointment);

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
          console.log(`Orphan task detected. Deleting Task ID: ${task._id}`);
          await Task.findByIdAndDelete(task._id);
          continue;
        }

        if (appointment.appointment_status !== "Pending") {
          console.log(`Deleting Task ID: ${task._id} because appointment status is "${appointment.appointment_status}"`);
          await Task.findByIdAndDelete(task._id);
        } else {
          console.log(`Task ${task._id} retained. Appointment is still Pending.`);
        }
      }

    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};

module.exports = checkPendingAppointments;
