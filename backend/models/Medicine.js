const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    // ===============================
    // MEDICINE NAME
    // ===============================

    medicineName: {
      type: String,
      required: true,
      trim: true,
    },


    // ===============================
    // MEDICINE TYPE
    // ===============================

    medicineType: {
      type: String,
      required: true,
      trim: true,
    },


    // ===============================
    // QUANTITY
    // ===============================

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },


    // ===============================
    // EXPIRY DATE
    // ===============================

    expiryDate: {
      type: Date,
      required: true,
    },


    // ===============================
    // MANUFACTURER
    // ===============================

    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },


    // ===============================
    // MEDICINE IMAGE
    // ===============================

    image: {
      type: String,
      required: true,
    },


    // ===============================
    // DESCRIPTION
    // ===============================

    description: {
      type: String,
      default: "",
      trim: true,
    },


    // ===============================
    // DONOR EMAIL
    // ===============================

    donorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },


    // ===============================
    // DONOR NAME
    // ===============================

    donorName: {
      type: String,
      default: "",
      trim: true,
    },


    // ===============================
    // STATUS
    // ===============================

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },


    // ===============================
    // CREATED DATE
    // ===============================

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const Medicine = mongoose.model(
  "Medicine",
  medicineSchema
);

module.exports = Medicine;