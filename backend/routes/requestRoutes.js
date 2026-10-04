
const express = require("express");

const router = express.Router();

const Request = require("../models/Request");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

// =====================================================
// GET APPROVED & AVAILABLE MEDICINES
// =====================================================

router.get("/available-medicines", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const medicines = await Medicine.find({
      status: "Approved",

      // Stock available hona chahiye
      quantity: { $gt: 0 },

      // Expired medicine show nahi hogi
      expiryDate: { $gte: today },
    }).sort({
      createdAt: -1,
    });

    res.json(medicines);
  } catch (error) {
    console.log("Available Medicines Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// CREATE MEDICINE REQUEST
// =====================================================

router.post("/create", async (req, res) => {
  try {
    const {
      ngoEmail,
      medicineId,
      quantity,
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!ngoEmail || !medicineId || quantity === undefined) {
      return res.status(400).json({
        message: "NGO email, medicine and quantity are required",
      });
    }

    // =================================================
    // CLEAN NGO EMAIL
    // =================================================

    const cleanNgoEmail = ngoEmail
      .trim()
      .toLowerCase();

    // =================================================
    // VERIFY NGO ACCOUNT
    // =================================================

    const ngo = await User.findOne({
      email: cleanNgoEmail,
    });

    // NGO account exist karta hai?
    if (!ngo) {
      return res.status(404).json({
        message: "NGO account not found",
      });
    }

    // User ka role actually NGO hai?
    if (ngo.role !== "NGO") {
      return res.status(403).json({
        message: "Only NGO users can request medicines",
      });
    }

    // Admin ne NGO approve kiya hai?
    if (ngo.verificationStatus !== "Approved") {
      return res.status(403).json({
        message:
          "Your NGO account is not approved by admin yet. You cannot request medicines.",
      });
    }

    // =================================================
    // VALIDATE QUANTITY
    // =================================================

    const requestedQuantity = Number(quantity);

    if (
      !Number.isFinite(requestedQuantity) ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      return res.status(400).json({
        message: "Please enter a valid whole-number quantity",
      });
    }

    // =================================================
    // FIND MEDICINE
    // =================================================

    const medicine = await Medicine.findById(
      medicineId
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    // =================================================
    // CHECK MEDICINE STATUS
    // =================================================

    if (medicine.status !== "Approved") {
      return res.status(400).json({
        message: "Medicine is not available",
      });
    }

    // =================================================
    // CHECK EXPIRY
    // =================================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(
      medicine.expiryDate
    );

    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return res.status(400).json({
        message:
          "This medicine has expired and cannot be requested",
      });
    }

    // =================================================
    // CHECK STOCK
    // =================================================

    if (medicine.quantity <= 0) {
      return res.status(400).json({
        message: "Medicine is out of stock",
      });
    }

    if (requestedQuantity > medicine.quantity) {
      return res.status(400).json({
        message:
          `Only ${medicine.quantity} units are available`,
      });
    }

    // =================================================
    // CREATE REQUEST
    // =================================================

    const request = new Request({
      ngoEmail: cleanNgoEmail,

      medicineId,

      medicineName:
        medicine.medicineName,

      quantity:
        requestedQuantity,

      status: "Pending",
    });

    await request.save();

    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({
      message:
        "Medicine request created successfully",

      request,
    });
  } catch (error) {
    console.log(
      "Create Medicine Request Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// GET NGO REQUESTS
// =====================================================

router.get("/ngo/:email", async (req, res) => {
  try {
    const cleanEmail = req.params.email
      .trim()
      .toLowerCase();

    const requests = await Request.find({
      ngoEmail: cleanEmail,
    }).sort({
      createdAt: -1,
    });

    res.json(requests);
  } catch (error) {
    console.log(
      "Get NGO Requests Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// GET ALL PENDING NGO REQUESTS - ADMIN
// =====================================================

router.get("/pending", async (req, res) => {
  try {
    const requests = await Request.find({
      status: "Pending",
    }).sort({
      createdAt: -1,
    });

    res.json(requests);
  } catch (error) {
    console.log(
      "Pending Requests Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// APPROVE NGO REQUEST
// =====================================================

router.put("/approve/:id", async (req, res) => {
  try {
    // =================================================
    // FIND REQUEST
    // =================================================

    const request = await Request.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // =================================================
    // CHECK REQUEST STATUS
    // =================================================

    if (request.status !== "Pending") {
      return res.status(400).json({
        message:
          "Request has already been processed",
      });
    }

    // =================================================
    // VERIFY NGO AGAIN
    // =================================================

    const ngo = await User.findOne({
      email: request.ngoEmail
        .trim()
        .toLowerCase(),
    });

    if (!ngo) {
      return res.status(404).json({
        message:
          "NGO account associated with this request was not found",
      });
    }

    if (ngo.role !== "NGO") {
      return res.status(403).json({
        message:
          "Request belongs to an invalid NGO account",
      });
    }

    if (ngo.verificationStatus !== "Approved") {
      return res.status(403).json({
        message:
          "This NGO is no longer approved",
      });
    }

    // =================================================
    // FIND MEDICINE
    // =================================================

    const medicine = await Medicine.findById(
      request.medicineId
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    // =================================================
    // CHECK MEDICINE STATUS
    // =================================================

    if (medicine.status !== "Approved") {
      return res.status(400).json({
        message: "Medicine is not available",
      });
    }

    // =================================================
    // CHECK EXPIRY AGAIN
    // =================================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(
      medicine.expiryDate
    );

    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return res.status(400).json({
        message:
          "This medicine has expired. Request cannot be approved.",
      });
    }

    // =================================================
    // CHECK STOCK
    // =================================================

    if (medicine.quantity <= 0) {
      return res.status(400).json({
        message: "Medicine is out of stock",
      });
    }

    if (
      medicine.quantity <
      request.quantity
    ) {
      return res.status(400).json({
        message:
          "Not enough medicine stock available",
      });
    }

    // =================================================
    // REDUCE MEDICINE STOCK
    // =================================================

    medicine.quantity =
      medicine.quantity -
      request.quantity;

    await medicine.save();

    // =================================================
    // APPROVE REQUEST
    // =================================================

    request.status = "Approved";

    await request.save();

    // =================================================
    // RESPONSE
    // =================================================

    res.json({
      message:
        "NGO request approved successfully",

      request,

      medicine,
    });
  } catch (error) {
    console.log(
      "Approve NGO Request Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// REJECT NGO REQUEST
// =====================================================

router.put("/reject/:id", async (req, res) => {
  try {
    const request = await Request.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // =================================================
    // CHECK REQUEST STATUS
    // =================================================

    if (request.status !== "Pending") {
      return res.status(400).json({
        message:
          "Request has already been processed",
      });
    }

    // =================================================
    // REJECT REQUEST
    // =================================================

    request.status = "Rejected";

    await request.save();

    res.json({
      message:
        "NGO request rejected successfully",

      request,
    });
  } catch (error) {
    console.log(
      "Reject NGO Request Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;

