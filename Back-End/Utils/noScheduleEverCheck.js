const cron = require("node-cron");
const dayjs = require("dayjs");
const Task = require("../Models/TaskSchema");
const Doctor = require("../Models/DoctorDentalSchema");
const DoctorSpecificSchedule = require("../Models/DoctorSchemaSched");

const noScheduleEverCron = () => {
  cron.schedule("0 7 * * 1", async () => {
    try {
      const allDoctors = await Doctor.find({});

      for (const doctor of allDoctors) {
        const doctorId = doctor._id;
        const fullName = `${doctor.first_name} ${doctor.last_name}`;
        const hasSchedule = await DoctorSpecificSchedule.exists({ doctor: doctorId });
        const existingTask = await Task.findOne({
          assignedTo: doctorId,
          category: "NoScheduleEver",
          isSystemGenerated: true,
          status: { $in: ["Pending", "High Priority"] },
        });

        if (!hasSchedule && !existingTask) {
          await Task.create({
            description: `Please check schedule — no schedule has ever been assigned to Dr. ${fullName}.`,
            dueDate: dayjs().add(1, "day").toDate(),
            assignedTo: doctorId,
            category: "NoScheduleEver",
            status: "High Priority",
            isSystemGenerated: true,
          });
        }

        if (hasSchedule && existingTask) {
          await Task.findByIdAndDelete(existingTask._id);
        }
      }
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};

module.exports = noScheduleEverCron;
