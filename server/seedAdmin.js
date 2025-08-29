const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin/Admin"); // Update with the actual path to your Admin model
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
      name: "Mani Charan Reddy Gade",
      email: "gade.manicharan12@gmail.com",
      password: 123456,
      role: "super admin", // Set role to "super admin"
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
