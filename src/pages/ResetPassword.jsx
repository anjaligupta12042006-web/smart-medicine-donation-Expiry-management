
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/ForgotPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ===============================
  // RESET PASSWORD
  // ===============================

  const handleResetPassword = async (e) => {
    e.preventDefault();


    // ===============================
    // CHECK TOKEN
    // ===============================

    if (!token) {
      alert(
        "Invalid or missing reset link."
      );
      return;
    }


    // ===============================
    // PASSWORD VALIDATION
    // ===============================

    if (!newPassword) {
      alert(
        "Please enter a new password."
      );
      return;
    }


    if (newPassword.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }


    if (
      newPassword !== confirmPassword
    ) {
      alert(
        "Passwords do not match."
      );
      return;
    }


    setLoading(true);


    try {

      // ===============================
      // RESET PASSWORD API
      // ===============================

      const response = await axios.put(
        "http://localhost:5000/api/auth/reset-password",
        {
          token: token,
          newPassword: newPassword,
        }
      );


      alert(
        typeof response.data === "string"
          ? response.data
          : response.data?.message ||
              "Password reset successfully"
      );


      // ===============================
      // GO TO LOGIN
      // ===============================

      navigate("/login");

    } catch (error) {

      console.log(
        "Reset Password Error:",
        error
      );


      if (error.response) {

        const message =
          typeof error.response.data ===
          "string"
            ? error.response.data
            : error.response.data?.message ||
              "Password reset failed";

        alert(message);

      } else {

        alert(
          "Server is not connected"
        );
      }

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="forgot-page">

      <div className="forgot-card">

        {/* ===============================
            ICON
        =============================== */}

        <div className="forgot-icon">
          🔐
        </div>


        {/* ===============================
            TITLE
        =============================== */}

        <h1>
          Reset Password
        </h1>


        {/* ===============================
            DESCRIPTION
        =============================== */}

        <p>
          Enter your new password below.
        </p>


        {/* ===============================
            RESET PASSWORD FORM
        =============================== */}

        <form
          onSubmit={handleResetPassword}
        >

          {/* NEW PASSWORD */}

          <label>
            New Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            required
          />


          {/* CONFIRM PASSWORD */}

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            required
          />


          {/* RESET BUTTON */}

          <button
            type="submit"
            className="reset-btn"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>


        {/* ===============================
            BACK TO LOGIN
        =============================== */}

        <button
          type="button"
          className="back-login"
          onClick={() =>
            navigate("/login")
          }
        >
          ← Back to Login
        </button>

      </div>

    </div>
  );
}

export default ResetPassword;

