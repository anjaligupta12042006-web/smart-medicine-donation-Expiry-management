const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Medicine = require("../models/Medicine");


// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/medicines"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      ),
      false
    );

  }

};


// =====================================================
// MULTER UPLOAD
// =====================================================

const upload = multer({

  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});


// =====================================================
// DONATE MEDICINE
// =====================================================

router.post(
  "/donate",
  upload.single("image"),

  async (req, res) => {

    try {

      console.log("");
      console.log("==============================================");
      console.log("        MEDICINE DONATION REQUEST");
      console.log("==============================================");

      console.log("Donation body:", req.body);
      console.log("Uploaded image:", req.file);


      // =================================================
      // CHECK REQUIRED DATA
      // =================================================

      if (
        !req.body.medicineName ||
        !req.body.medicineType ||
        !req.body.quantity ||
        !req.body.expiryDate ||
        !req.body.manufacturer ||
        !req.body.donorEmail
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Please fill all required fields"

        });

      }


      // =================================================
      // CHECK QUANTITY
      // =================================================

      const quantity =
        Number(req.body.quantity);

      if (
        isNaN(quantity) ||
        quantity <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Quantity must be a valid positive number"

        });

      }


      // =================================================
      // CHECK EXPIRY DATE
      // =================================================

      const expiryDate =
        new Date(req.body.expiryDate);

      if (
        isNaN(expiryDate.getTime())
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid expiry date"

        });

      }


      // Medicine cannot be donated if already expired
      if (
        expiryDate < new Date()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Expired medicine cannot be donated"

        });

      }


      // =================================================
      // CHECK IMAGE
      // =================================================

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Medicine image is required"

        });

      }


      // =================================================
      // IMAGE PATH
      // =================================================

      const imagePath =
        `/uploads/medicines/${req.file.filename}`;


      // =================================================
      // CREATE MEDICINE OBJECT
      // =================================================

      const medicineData = {

        medicineName:
          req.body.medicineName.trim(),

        medicineType:
          req.body.medicineType.trim(),

        quantity:
          quantity,

        expiryDate:
          expiryDate,

        manufacturer:
          req.body.manufacturer.trim(),

        description:
          req.body.description
            ? req.body.description.trim()
            : "",

        donorEmail:
          req.body.donorEmail.trim().toLowerCase(),

        image:
          imagePath,

        status:
          "Pending"

      };


      console.log(
        "Medicine data:",
        medicineData
      );


      // =================================================
      // CREATE MEDICINE
      // =================================================

      const medicine =
        new Medicine(
          medicineData
        );


      // =================================================
      // SAVE TO MONGODB
      // =================================================

      await medicine.save();


      console.log(
        "✅ Medicine saved successfully"
      );


      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      return res.status(201).json({

        success: true,

        message:
          "Medicine donated successfully and sent for admin approval",

        medicine

      });

    } catch (error) {

      console.error("");
      console.error(
        "=============================================="
      );
      console.error(
        "       ❌ DONATE MEDICINE ERROR"
      );
      console.error(
        "=============================================="
      );

      console.error(
        "Error name:",
        error.name
      );

      console.error(
        "Error message:",
        error.message
      );

      console.error(
        "Error:",
        error
      );


      // =================================================
      // DELETE UPLOADED IMAGE IF SAVE FAILED
      // =================================================

      if (req.file) {

        try {

          if (
            fs.existsSync(
              req.file.path
            )
          ) {

            fs.unlinkSync(
              req.file.path
            );

          }

        } catch (deleteError) {

          console.error(
            "Image delete error:",
            deleteError
          );

        }

      }


      // =================================================
      // MONGOOSE VALIDATION ERROR
      // =================================================

      if (
        error.name === "ValidationError"
      ) {

        const validationErrors =
          Object.values(
            error.errors
          ).map(
            (err) => err.message
          );

        return res.status(400).json({

          success: false,

          message:
            validationErrors.join(", ")

        });

      }


      // =================================================
      // DUPLICATE KEY ERROR
      // =================================================

      if (
        error.code === 11000
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This medicine information already exists."

        });

      }


      // =================================================
      // GENERAL SERVER ERROR
      // =================================================

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Server error while donating medicine"

      });

    }

  }
);


// =====================================================
// GET MY DONATIONS
// =====================================================

router.get(
  "/my-donations/:email",

  async (req, res) => {

    try {

      const medicines =
        await Medicine.find({

          donorEmail:
            req.params.email.toLowerCase()

        })
        .sort({
          createdAt: -1
        });

      res.status(200).json(
        medicines
      );

    } catch (error) {

      console.log(
        "My Donations Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// DONOR DASHBOARD STATS
// =====================================================

router.get(
  "/stats/:email",

  async (req, res) => {

    try {

      const medicines =
        await Medicine.find({

          donorEmail:
            req.params.email.toLowerCase()

        });

      const total =
        medicines.length;

      const approved =
        medicines.filter(
          medicine =>
            medicine.status === "Approved"
        ).length;

      const pending =
        medicines.filter(
          medicine =>
            medicine.status === "Pending"
        ).length;

      const today =
        new Date();

      const expired =
        medicines.filter(
          medicine =>
            new Date(
              medicine.expiryDate
            ) < today
        ).length;

      res.json({

        total,

        approved,

        pending,

        expired

      });

    } catch (error) {

      console.log(
        "Stats Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// EXPIRY NOTIFICATION
// =====================================================

router.get(
  "/expiry/:email",

  async (req, res) => {

    try {

      const medicines =
        await Medicine.find({

          donorEmail:
            req.params.email.toLowerCase()

        });

      const today =
        new Date();

      const result =
        medicines.map(
          (medicine) => {

            const expiryDate =
              new Date(
                medicine.expiryDate
              );

            const difference =
              expiryDate - today;

            const daysLeft =
              Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
              );

            let status;

            if (
              daysLeft < 0
            ) {

              status =
                "Expired";

            } else if (
              daysLeft <= 30
            ) {

              status =
                "Expiring Soon";

            } else {

              status =
                "Safe";

            }

            return {

              ...medicine.toObject(),

              daysLeft,

              expiryStatus:
                status

            };

          }
        );

      res.json(
        result
      );

    } catch (error) {

      console.log(
        "Expiry Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// GET PENDING MEDICINES
// =====================================================

router.get(
  "/pending",

  async (req, res) => {

    try {

      const medicines =
        await Medicine.find({

          status:
            "Pending"

        })
        .sort({
          createdAt: -1
        });

      res.json(
        medicines
      );

    } catch (error) {

      console.log(
        "Pending Medicines Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// ACCEPT MEDICINE
// =====================================================

router.put(
  "/accept/:id",

  async (req, res) => {

    try {

      const medicine =
        await Medicine.findById(
          req.params.id
        );

      if (!medicine) {

        return res.status(404).json({

          message:
            "Medicine not found"

        });

      }


      // Do not approve expired medicine
      if (
        new Date(medicine.expiryDate) < new Date()
      ) {

        return res.status(400).json({

          message:
            "Expired medicine cannot be approved"

        });

      }


      medicine.status =
        "Approved";

      await medicine.save();


      res.json({

        message:
          "Medicine approved",

        medicine

      });

    } catch (error) {

      console.log(
        "Accept Medicine Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// REJECT MEDICINE
// =====================================================

router.put(
  "/reject/:id",

  async (req, res) => {

    try {

      const medicine =
        await Medicine.findByIdAndUpdate(

          req.params.id,

          {
            status:
              "Rejected"
          },

          {
            new:
              true
          }

        );

      if (!medicine) {

        return res.status(404).json({

          message:
            "Medicine not found"

        });

      }

      res.json({

        message:
          "Medicine rejected",

        medicine

      });

    } catch (error) {

      console.log(
        "Reject Medicine Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// GET ALL MEDICINES
// Admin/history can still see expired medicines
// =====================================================

router.get(
  "/all",

  async (req, res) => {

    try {

      const medicines =
        await Medicine.find()
        .sort({
          createdAt: -1
        });

      res.json(
        medicines
      );

    } catch (error) {

      console.log(
        "All Medicines Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// GET ACTIVE MEDICINES
// ONLY APPROVED + AVAILABLE + NON-EXPIRED
// =====================================================

router.get(
  "/active",

  async (req, res) => {

    try {

      const now =
        new Date();

      const medicines =
        await Medicine.find({

          status:
            "Approved",

          quantity: {
            $gt: 0
          },

          expiryDate: {
            $gte: now
          }

        })
        .sort({
          createdAt: -1
        });

      res.json(
        medicines
      );

    } catch (error) {

      console.log(
        "Active Medicines Error:",
        error
      );

      res.status(500).json({

        message:
          "Server error"

      });

    }

  }
);


// =====================================================
// APPROVE / REJECT BY STATUS
// =====================================================

router.put(
  "/status/:id",

  async (req, res) => {

    try {

      const {
        status
      } = req.body;

      if (
        status !== "Approved" &&
        status !== "Rejected"
      ) {

        return res.status(400).json({

          message:
            "Invalid status"

        });

      }


      const medicine =
        await Medicine.findById(
          req.params.id
        );

      if (!medicine) {

        return res.status(404).json({

          message:
            "Medicine not found"

        });

      }


      // Prevent approval of expired medicine
      if (
        status === "Approved" &&
        new Date(medicine.expiryDate) < new Date()
      ) {

        return res.status(400).json({

          message:
            "Expired medicine cannot be approved"

        });

      }


      medicine.status =
        status;

      await medicine.save();


      res.json({

        message:
          `Medicine ${status}`,

        medicine

      });

    } catch (error) {

      console.log(
        "Status Update Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// REPORTS & ANALYTICS
// =====================================================

router.get(
  "/reports",

  async (req, res) => {

    try {

      const medicines =
        await Medicine.find()
        .sort({
          createdAt: -1
        });

      const total =
        medicines.length;

      const approved =
        medicines.filter(
          medicine =>
            medicine.status === "Approved"
        ).length;

      const pending =
        medicines.filter(
          medicine =>
            medicine.status === "Pending"
        ).length;

      const rejected =
        medicines.filter(
          medicine =>
            medicine.status === "Rejected"
        ).length;

      const monthlyData = {};

      medicines.forEach(
        (medicine) => {

          const date =
            new Date(
              medicine.createdAt
            );

          const month =
            date.toLocaleString(
              "en-US",
              {
                month: "short"
              }
            );

          if (
            !monthlyData[month]
          ) {

            monthlyData[month] =
              0;

          }

          monthlyData[month]++;

        }
      );

      const recentActivity =
        medicines
          .slice(0, 10)
          .map(
            (medicine) => {

              return {

                date:
                  medicine.createdAt,

                donor:
                  medicine.donorEmail,

                medicine:
                  medicine.medicineName,

                status:
                  medicine.status

              };

            }
          );

      res.json({

        summary: {

          total,

          approved,

          pending,

          rejected

        },

        monthlyData,

        recentActivity

      });

    } catch (error) {

      console.log(
        "Reports Error:",
        error
      );

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {

    console.error(
      "Multer/Upload Error:",
      error
    );

    if (
      error instanceof multer.MulterError
    ) {

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Image size must be less than 5MB"

        });

      }

    }

    if (
      error.message ===
      "Only JPG, JPEG, PNG and WEBP images are allowed"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Only JPG, JPEG, PNG and WEBP images are allowed"

      });

    }

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "File upload error"

    });

  }
);


module.exports = router;