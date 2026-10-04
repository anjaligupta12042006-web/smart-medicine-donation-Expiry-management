
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    default: "",
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "User",
  },

  phone: {
    type: String,
    default: "",
  },

  address: {
    type: String,
    default: "",
  },

  // ===============================
  // PROFILE PHOTO
  // ===============================

  profilePhoto: {
    type: String,
    default: "",
  },

  // ===============================
  // NGO VERIFICATION
  // ===============================

  verificationStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  ngoDocument: {
    type: String,
    default: "",
  },

  ngoRegistrationNumber: {
    type: String,
    default: "",
  },

  // ===============================
  // PASSWORD RESET LINK
  // ===============================

  resetTokenHash: {
    type: String,
    default: "",
  },

  resetTokenExpiry: {
    type: Date,
    default: null,
  },

});

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;

