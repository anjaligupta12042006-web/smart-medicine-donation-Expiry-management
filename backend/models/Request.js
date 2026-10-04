const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    // NGO email
    ngoEmail: {
      type: String,
      required: true,
    },

    // Medicine ID
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    // Medicine name
    medicineName: {
      type: String,
      required: true,
    },

    // Requested quantity
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Request status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;