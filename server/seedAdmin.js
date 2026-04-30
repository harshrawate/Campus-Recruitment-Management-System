const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin"); // Import Admin model
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Delete all existing admins
    await Admin.deleteMany({});
    console.log("All existing admin records deleted");

    // Create the new seed admin
    const admin = new Admin({
      name: "Harsh Rawate",
      email: "harshrawate7@gmail.com",
      password: "Harsh@1357", // Make sure this is a string
      role: "Super Admin", // Must match exactly: "Super Admin" or "Admin"
    });

    // Save the admin
    await admin.save();
    console.log("Admin seed data created successfully");
  } catch (error) {
    console.error("Error seeding admin data:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

// Run the seed script
seedAdmin();