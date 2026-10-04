const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new User({
      name: "New Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "Admin"
    });

    await admin.save();

    console.log("Admin created successfully!");
    console.log("Email: admin@gmail.com");
    console.log("Password: Admin@123");

    process.exit();
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};

createAdmin();