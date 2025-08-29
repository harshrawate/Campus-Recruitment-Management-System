require("events").EventEmitter.defaultMaxListeners = 15;
const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const AdminRoutes = require("./routes/admin/adminRoute");
const FacultyRoutes = require("./routes/faculty/facultyRoutes");
const SharedRoutes = require("./routes/shared/sharedRoute");
const StudentRoutes = require("./routes/student/studentRoutes");

const { connectDB } = require("./config/db.js");

const { scheduleProfileUpdateReminders } = require("./services/cronJobs");

const app = express();

app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true }));
app.use(express.json());
connectDB();

scheduleProfileUpdateReminders();

app.use("/admin", AdminRoutes);
app.use("/faculty", FacultyRoutes);
app.use("/student", StudentRoutes);
app.use("/", SharedRoutes);

PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
