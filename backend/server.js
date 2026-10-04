const mongoose = require("mongoose");
require("dotenv").config();


const express = require("express");
const app = express();

const cors = require("cors");
const path = require("path");


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// STATIC UPLOAD FOLDER
// ===============================
// This allows browser to access:
// Medicine images  → /uploads/medicines/...
// Profile images   → /uploads/profiles/...

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// ===============================
// ROUTES
// ===============================

const authRoutes =
  require("./routes/authRoutes");

const medicineRoutes =
  require("./routes/medicineRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const requestRoutes =
  require("./routes/requestRoutes");


// ===============================
// API ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/medicines",
  medicineRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/requests",
  requestRoutes
);


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "MongoDB Connected"
    );

  })

  .catch((error) => {

    console.log(
      "MongoDB Connection Error:",
      error
    );

  });


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {

  res.send(
    "MedBridge Backend is Running"
  );

});


// ===============================
// SERVER
// ===============================

const PORT = 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server is running on port ${PORT}`
    );

  }
);