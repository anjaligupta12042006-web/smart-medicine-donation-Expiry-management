
const express = require("express");

const router = express.Router();

const User = require("../models/User");
const Medicine = require("../models/Medicine");
const Request = require("../models/Request");


// ===============================
// ADMIN DASHBOARD STATS
// ===============================

router.get("/stats", async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({
      role: "Donor",
    });

    const totalNGOs = await User.countDocuments({
      role: "NGO",
    });

    const totalMedicines = await Medicine.countDocuments();

    const pendingApprovals = await Medicine.countDocuments({
      status: "Pending",
    });

    const pendingNGOs = await User.countDocuments({
      role: "NGO",
      verificationStatus: "Pending",
    });

    res.status(200).json({
      success: true,

      stats: {
        totalDonors,
        totalNGOs,
        totalMedicines,
        pendingApprovals,
        pendingNGOs,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard statistics",
    });
  }
});


// ===============================
// RECENT DONATIONS
// ===============================

router.get("/recent-donations", async (req, res) => {
  try {
    const donations = await Medicine.find()
      .sort({ _id: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error("Recent Donations Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent donations",
    });
  }
});


// ===============================
// PENDING MEDICINE APPROVALS
// ===============================

router.get("/pending", async (req, res) => {
  try {
    const medicines = await Medicine.find({
      status: "Pending",
    }).sort({ _id: -1 });

    res.status(200).json({
      success: true,
      medicines,
    });
  } catch (error) {
    console.error("Pending Medicines Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending medicines",
    });
  }
});


// ===============================
// APPROVE MEDICINE
// ===============================

router.put("/approve/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
      },
      {
        new: true,
      }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine approved successfully",
      medicine,
    });
  } catch (error) {
    console.error("Approve Medicine Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve medicine",
    });
  }
});


// ===============================
// REJECT MEDICINE
// ===============================

router.put("/reject/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
      },
      {
        new: true,
      }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine rejected successfully",
      medicine,
    });
  } catch (error) {
    console.error("Reject Medicine Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject medicine",
    });
  }
});


// ==================================================
// NGO VERIFICATION
// ==================================================


// ===============================
// GET PENDING NGOS
// ===============================

router.get("/ngos/pending", async (req, res) => {
  try {
    const ngos = await User.find({
      role: "NGO",
      verificationStatus: "Pending",
    })
      .select("-password -resetOTP -resetOTPExpiry")
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      ngos,
    });
  } catch (error) {
    console.error("Pending NGOs Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending NGOs",
    });
  }
});


// ===============================
// APPROVE NGO
// ===============================

router.put("/ngos/approve/:id", async (req, res) => {
  try {
    const ngo = await User.findOne({
      _id: req.params.id,
      role: "NGO",
    });

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    if (ngo.verificationStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This NGO is already processed",
      });
    }

    // NGO must have submitted required verification details
    if (
      !ngo.ngoRegistrationNumber ||
      !ngo.ngoDocument
    ) {
      return res.status(400).json({
        success: false,
        message:
          "NGO registration number and verification document are required",
      });
    }

    ngo.verificationStatus = "Approved";

    await ngo.save();

    res.status(200).json({
      success: true,
      message: "NGO approved successfully",
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        role: ngo.role,
        verificationStatus: ngo.verificationStatus,
        ngoRegistrationNumber: ngo.ngoRegistrationNumber,
        ngoDocument: ngo.ngoDocument,
      },
    });
  } catch (error) {
    console.error("Approve NGO Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve NGO",
    });
  }
});


// ===============================
// REJECT NGO
// ===============================

router.put("/ngos/reject/:id", async (req, res) => {
  try {
    const ngo = await User.findOne({
      _id: req.params.id,
      role: "NGO",
    });

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    if (ngo.verificationStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This NGO is already processed",
      });
    }

    ngo.verificationStatus = "Rejected";

    await ngo.save();

    res.status(200).json({
      success: true,
      message: "NGO rejected successfully",
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        role: ngo.role,
        verificationStatus: ngo.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Reject NGO Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject NGO",
    });
  }
});


// ===============================
// GET NGO MEDICINE REQUESTS - ADMIN
// ===============================

router.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("NGO Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch NGO requests",
    });
  }
});


module.exports = router;



