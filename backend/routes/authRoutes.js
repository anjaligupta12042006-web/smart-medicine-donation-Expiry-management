
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// =====================================================
// PROFILE UPLOAD DIRECTORY
// =====================================================

const profileUploadDirectory = path.join(
  __dirname,
  "../uploads/profiles"
);

if (!fs.existsSync(profileUploadDirectory)) {
  fs.mkdirSync(profileUploadDirectory, {
    recursive: true,
  });
}


// =====================================================
// NGO DOCUMENT UPLOAD DIRECTORY
// =====================================================

const ngoDocumentDirectory = path.join(
  __dirname,
  "../uploads/ngo-documents"
);

if (!fs.existsSync(ngoDocumentDirectory)) {
  fs.mkdirSync(ngoDocumentDirectory, {
    recursive: true,
  });
}


// =====================================================
// PROFILE IMAGE STORAGE
// =====================================================

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDirectory);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});


// =====================================================
// PROFILE IMAGE FILTER
// =====================================================

const profileFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
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
// PROFILE UPLOAD
// =====================================================

const upload = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// =====================================================
// NGO DOCUMENT STORAGE
// =====================================================

const ngoDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ngoDocumentDirectory);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});


// =====================================================
// NGO DOCUMENT FILTER
// =====================================================

const ngoDocumentFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "NGO document must be PDF, JPG, JPEG, PNG or WEBP"
      ),
      false
    );
  }
};


// =====================================================
// NGO DOCUMENT UPLOAD
// =====================================================

const ngoUpload = multer({
  storage: ngoDocumentStorage,
  fileFilter: ngoDocumentFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// =====================================================
// SIGNUP
// =====================================================

router.post(
  "/signup",
  ngoUpload.single("ngoDocument"),

  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
        ngoRegistrationNumber,
      } = req.body;


      // ===============================
      // BASIC VALIDATION
      // ===============================

      if (
        !name ||
        !email ||
        !password ||
        !role
      ) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (deleteError) {
            console.log(
              "Uploaded NGO document delete error:",
              deleteError
            );
          }
        }

        return res.status(400).send(
          "All required fields must be filled"
        );
      }


      // ===============================
      // ALLOW ONLY DONOR OR NGO
      // ===============================

      if (
        role !== "Donor" &&
        role !== "NGO"
      ) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (deleteError) {}
        }

        return res.status(403).send(
          "Invalid role"
        );
      }


      // ===============================
      // BLOCK ADMIN SIGNUP
      // ===============================

      if (role === "Admin") {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (deleteError) {}
        }

        return res.status(403).send(
          "Admin signup is not allowed"
        );
      }


      // ===============================
      // CLEAN EMAIL
      // ===============================

      const cleanEmail =
        email.trim().toLowerCase();


      // ===============================
      // CHECK EMAIL
      // ===============================

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (deleteError) {}
        }

        return res.status(400).send(
          "Email already registered"
        );
      }


      // =================================================
      // NGO VALIDATION
      // =================================================

      if (role === "NGO") {

        if (
          !ngoRegistrationNumber ||
          !ngoRegistrationNumber.trim()
        ) {
          if (req.file) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (deleteError) {}
          }

          return res.status(400).send(
            "NGO registration number is required"
          );
        }


        if (!req.file) {
          return res.status(400).send(
            "NGO verification document is required"
          );
        }
      }


      // =================================================
      // DONOR SHOULD NOT SEND NGO DOCUMENT
      // =================================================

      if (
        role === "Donor" &&
        req.file
      ) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {}

        return res.status(400).send(
          "Donor does not require an NGO document"
        );
      }


      // =================================================
      // PASSWORD HASH
      // =================================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      // =================================================
      // NGO DOCUMENT PATH
      // =================================================

      let ngoDocumentPath = "";

      if (
        role === "NGO" &&
        req.file
      ) {
        ngoDocumentPath =
          `/uploads/ngo-documents/${req.file.filename}`;
      }


      // =================================================
      // CREATE USER
      // =================================================

      const user = new User({
        name: name.trim(),

        email: cleanEmail,

        password: hashedPassword,

        role: role,

        phone: "",

        address: "",

        profilePhoto: "",


        // ==========================================
        // VERIFICATION STATUS
        // ==========================================

        verificationStatus:
          role === "NGO"
            ? "Pending"
            : "Approved",


        // ==========================================
        // NGO DOCUMENT
        // ==========================================

        ngoDocument:
          role === "NGO"
            ? ngoDocumentPath
            : "",


        // ==========================================
        // NGO REGISTRATION NUMBER
        // ==========================================

        ngoRegistrationNumber:
          role === "NGO"
            ? ngoRegistrationNumber.trim()
            : "",


        // ==========================================
        // PASSWORD RESET LINK
        // ==========================================

        resetTokenHash: "",

        resetTokenExpiry: null,
      });


      // =================================================
      // SAVE USER
      // =================================================

      await user.save();


      // =================================================
      // NGO RESPONSE
      // =================================================

      if (role === "NGO") {
        return res.status(201).send({
          message:
            "NGO account created successfully. Your account is pending admin verification.",

          verificationStatus:
            "Pending",
        });
      }


      // =================================================
      // DONOR RESPONSE
      // =================================================

      return res.status(201).send({
        message:
          "User Saved Successfully",

        verificationStatus:
          "Approved",
      });

    } catch (error) {

      console.error(
        "Signup Error:",
        error
      );


      // ==========================================
      // DELETE UPLOADED FILE IF SIGNUP FAILS
      // ==========================================

      if (req.file) {
        try {
          if (
            fs.existsSync(req.file.path)
          ) {
            fs.unlinkSync(req.file.path);
          }
        } catch (deleteError) {
          console.log(
            "Signup file cleanup error:",
            deleteError
          );
        }
      }


      res.status(500).send(
        "Server Error"
      );
    }
  }
);


// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  async (req, res) => {
    try {

      const {
        email,
        password,
        role,
      } = req.body;


      // ===============================
      // BASIC VALIDATION
      // ===============================

      if (
        !email ||
        !password ||
        !role
      ) {
        return res.status(400).send(
          "Email, password and role are required"
        );
      }


      // ===============================
      // FIND USER
      // ===============================

      const user =
        await User.findOne({
          email:
            email.trim().toLowerCase(),
        });


      if (!user) {
        return res.status(400).send(
          "Invalid email or password"
        );
      }


      // ===============================
      // CHECK PASSWORD
      // ===============================

      const isPasswordCorrect =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!isPasswordCorrect) {
        return res.status(400).send(
          "Invalid email or password"
        );
      }


      // ===============================
      // CHECK ROLE
      // ===============================

      if (user.role !== role) {
        return res.status(400).send(
          "Incorrect role selected"
        );
      }


      // ===============================
      // LOGIN SUCCESS
      // ===============================

      res.send({
        message:
          "Login successful",

        user: {
          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          phone:
            user.phone || "",

          address:
            user.address || "",

          profilePhoto:
            user.profilePhoto || "",

          verificationStatus:
            user.verificationStatus || "Pending",

          ngoRegistrationNumber:
            user.ngoRegistrationNumber || "",

          ngoDocument:
            user.ngoDocument || "",
        },
      });

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      res.status(500).send(
        "Server Error"
      );
    }
  }
);


// =====================================================
// SEND PASSWORD RESET LINK
// =====================================================

router.post(
  "/send-reset-link",
  async (req, res) => {
    try {

      const {
        email,
      } = req.body;


      // ===============================
      // EMAIL VALIDATION
      // ===============================

      if (!email) {
        return res.status(400).send(
          "Email is required"
        );
      }


      const cleanEmail =
        email.trim().toLowerCase();


      // ===============================
      // FIND USER
      // ===============================

      const user =
        await User.findOne({
          email: cleanEmail,
        });


      if (!user) {
        return res.status(404).send(
          "Email not registered"
        );
      }


      // =================================================
      // GENERATE SECURE RANDOM TOKEN
      // =================================================

      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");


      // =================================================
      // HASH TOKEN BEFORE SAVING
      // =================================================

      const resetTokenHash =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");


      // =================================================
      // TOKEN EXPIRY - 15 MINUTES
      // =================================================

      const resetTokenExpiry =
        new Date(
          Date.now() +
          15 * 60 * 1000
        );


      user.resetTokenHash =
        resetTokenHash;

      user.resetTokenExpiry =
        resetTokenExpiry;


      await user.save();


      // =================================================
      // CREATE RESET LINK
      // =================================================

      const resetLink =
        `http://localhost:5173/reset-password?token=${resetToken}`;


      // =================================================
      // EMAIL TRANSPORTER
      // =================================================

      const transporter =
        nodemailer.createTransport({
          service: "gmail",

          auth: {
            user:
              process.env.EMAIL_USER,

            pass:
              process.env.EMAIL_PASS,
          },
        });


      // =================================================
      // SEND EMAIL
      // =================================================

      await transporter.sendMail({
        from:
          process.env.EMAIL_USER,

        to:
          cleanEmail,

        subject:
          "MedBridge - Reset Your Password",

        text:
          `Hello ${user.name || "User"},

We received a request to reset your MedBridge password.

Click the link below to reset your password:

${resetLink}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

MedBridge`,
      });


      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      res.send(
        "Password reset link sent successfully"
      );

    } catch (error) {

      console.error(
        "Send Reset Link Error:",
        error
      );

      res.status(500).send(
        "Failed to send password reset link"
      );
    }
  }
);


// =====================================================
// RESET PASSWORD USING RESET LINK
// =====================================================

router.put(
  "/reset-password",
  async (req, res) => {
    try {

      const {
        token,
        newPassword,
      } = req.body;


      // ===============================
      // VALIDATION
      // ===============================

      if (
        !token ||
        !newPassword
      ) {
        return res.status(400).send(
          "Reset token and new password are required"
        );
      }


      if (
        newPassword.length < 6
      ) {
        return res.status(400).send(
          "Password must be at least 6 characters"
        );
      }


      // =================================================
      // HASH TOKEN RECEIVED FROM LINK
      // =================================================

      const resetTokenHash =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");


      // =================================================
      // FIND USER USING TOKEN
      // =================================================

      const user =
        await User.findOne({
          resetTokenHash:
            resetTokenHash,
        });


      if (!user) {
        return res.status(400).send(
          "Invalid or expired reset link"
        );
      }


      // =================================================
      // CHECK TOKEN EXPIRY
      // =================================================

      if (
        !user.resetTokenExpiry ||
        user.resetTokenExpiry < new Date()
      ) {

        user.resetTokenHash = "";

        user.resetTokenExpiry = null;

        await user.save();

        return res.status(400).send(
          "Reset link has expired"
        );
      }


      // =================================================
      // HASH NEW PASSWORD
      // =================================================

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );


      user.password =
        hashedPassword;


      // =================================================
      // CLEAR RESET TOKEN
      // =================================================

      user.resetTokenHash = "";

      user.resetTokenExpiry = null;


      await user.save();


      // =================================================
      // SUCCESS
      // =================================================

      res.send(
        "Password reset successfully"
      );

    } catch (error) {

      console.error(
        "Reset Password Error:",
        error
      );

      res.status(500).send(
        "Server Error"
      );
    }
  }
);


// =====================================================
// GET PROFILE
// =====================================================

router.get(
  "/profile/:userId",
  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {
        return res.status(404).send(
          "User not found"
        );
      }


      res.send({
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        phone:
          user.phone || "",

        address:
          user.address || "",

        profilePhoto:
          user.profilePhoto || "",

        verificationStatus:
          user.verificationStatus || "Pending",

        ngoRegistrationNumber:
          user.ngoRegistrationNumber || "",

        ngoDocument:
          user.ngoDocument || "",
      });

    } catch (error) {

      console.error(
        "Get Profile Error:",
        error
      );

      res.status(500).send(
        "Server Error"
      );
    }
  }
);


// =====================================================
// UPDATE PROFILE + PROFILE PHOTO
// =====================================================

router.put(
  "/profile/:userId",
  upload.single("profilePhoto"),

  async (req, res) => {
    try {

      const {
        name,
        phone,
        address,
      } = req.body;


      // ===============================
      // FIND USER
      // ===============================

      const user =
        await User.findById(
          req.params.userId
        );


      if (!user) {

        if (req.file) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch (deleteError) {}
        }

        return res.status(404).send(
          "User not found"
        );
      }


      // ===============================
      // UPDATE NAME
      // ===============================

      if (
        name !== undefined
      ) {
        user.name =
          name.trim();
      }


      // ===============================
      // UPDATE PHONE
      // ===============================

      if (
        phone !== undefined
      ) {
        user.phone =
          phone.trim();
      }


      // ===============================
      // UPDATE ADDRESS
      // ===============================

      if (
        address !== undefined
      ) {
        user.address =
          address.trim();
      }


      // ===============================
      // UPDATE PROFILE PHOTO
      // ===============================

      if (req.file) {

        // DELETE OLD IMAGE

        if (
          user.profilePhoto
        ) {

          const oldImagePath =
            path.join(
              __dirname,
              "..",
              user.profilePhoto
            );


          if (
            fs.existsSync(
              oldImagePath
            )
          ) {
            try {
              fs.unlinkSync(
                oldImagePath
              );
            } catch (deleteError) {
              console.log(
                "Old profile photo delete error:",
                deleteError
              );
            }
          }
        }


        // SAVE NEW IMAGE PATH

        user.profilePhoto =
          `/uploads/profiles/${req.file.filename}`;
      }


      // ===============================
      // SAVE USER
      // ===============================

      await user.save();


      // ===============================
      // RESPONSE
      // ===============================

      const updatedUser = {
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        phone:
          user.phone || "",

        address:
          user.address || "",

        profilePhoto:
          user.profilePhoto || "",

        verificationStatus:
          user.verificationStatus || "Pending",

        ngoRegistrationNumber:
          user.ngoRegistrationNumber || "",

        ngoDocument:
          user.ngoDocument || "",
      };


      res.send({
        message:
          "Profile updated successfully",

        user:
          updatedUser,
      });

    } catch (error) {

      console.error(
        "Profile Update Error:",
        error
      );


      // ===============================
      // DELETE NEW IMAGE IF ERROR
      // ===============================

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
          console.log(
            "Uploaded image delete error:",
            deleteError
          );
        }
      }


      res.status(500).send(
        "Server Error"
      );
    }
  }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {

    console.error(
      "Upload Error:",
      error
    );


    // ===============================
    // FILE SIZE ERROR
    // ===============================

    if (
      error instanceof multer.MulterError
    ) {

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).send(
          "File must be less than 5MB"
        );
      }
    }


    // ===============================
    // PROFILE IMAGE ERROR
    // ===============================

    if (
      error.message ===
      "Only JPG, JPEG, PNG and WEBP images are allowed"
    ) {
      return res.status(400).send(
        error.message
      );
    }


    // ===============================
    // NGO DOCUMENT ERROR
    // ===============================

    if (
      error.message ===
      "NGO document must be PDF, JPG, JPEG, PNG or WEBP"
    ) {
      return res.status(400).send(
        error.message
      );
    }


    next(error);
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;

