const cron = require("node-cron");
const User = require("../Models/LogInDentalSchema"); // Siguraduhin na tama ang path na ito

cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron job to delete old unverified users...");
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await User.deleteMany({
      isVerified: false, 
      createdAt: { $lt: fiveMinutesAgo }
    });

    console.log(`Deleted ${result.deletedCount} old unverified users.`);
  } catch (error) {
    console.error("Error deleting old unverified users:", error);
  }
});