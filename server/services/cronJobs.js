const cron = require("node-cron");
const { Student } = require("../models/Student");
const { sendProfileUpdateReminderMail } = require("./emailService");
const {sendProfileUpdateReminder} = require("./whatsappService")

exports.scheduleProfileUpdateReminders = () => {
  // Validate cron expression
  const cronExpression = "0 10 1,15 * *";
  if (!cron.validate(cronExpression)) {
    console.error("Invalid cron expression");
    return;
  }

  // Log when the service starts
  console.log("Profile update reminder service initialized");
  console.log("Cron schedule:", cronExpression);
  console.log("Service started at:", new Date().toISOString());

  cron.schedule(
    cronExpression,
    async () => {
      console.log("Starting profile update reminder cron job...");
      const startTime = Date.now();

      try {
        // Find all active students
        const studentsToRemind = await Student.find({
          "auth.status": "active",
          "auth.isDeactivated": false,
        });

        console.log(
          `Found ${studentsToRemind.length} active students to remind`
        );

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Send reminders to each student
        for (const student of studentsToRemind) {
          try {
            await sendProfileUpdateReminderMail(
              student.personal.collegeEmail,
              student.personal.firstName
            );

            await sendProfileUpdateReminder(
              student.personal.whatsappNumber,
              student.personal.firstName
            );

            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              studentId: student._id,
              email: student.personal.collegeEmail,
              error: error.message,
            });
            console.error(
              `Error sending reminder to ${student.personal.collegeEmail}:`,
              error
            );
          }
        }

        // Log summary
        const duration = (Date.now() - startTime) / 1000;
        console.log(`
        Cron job completed in ${duration}s
        Successfully sent: ${successCount}
        Errors: ${errorCount}
        Total processed: ${studentsToRemind.length}
      `);

        if (errors.length > 0) {
          console.error("Detailed errors:", JSON.stringify(errors, null, 2));
        }
      } catch (error) {
        console.error(
          "Fatal error in profile update reminder cron job:",
          error
        );
        // You might want to add notification to admin here
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};
