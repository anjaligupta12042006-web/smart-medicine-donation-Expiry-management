
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // SEND RESET LINK
  // ===============================

  const handleSendResetLink = async (e) => {
    e.preventDefault();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      alert("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/send-reset-link",
        {
          email: cleanEmail,
        }
      );

      alert(
        typeof response.data === "string"
          ? response.data
          : response.data?.message ||
              "Password reset link sent successfully"
      );

      setEmail(cleanEmail);

    } catch (error) {
      console.log(
        "Send Reset Link Error:",
        error
      );

      if (error.response) {
        const message =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data?.message ||
              "Failed to send reset link";

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
          Forgot Password?
        </h1>


        {/* ===============================
            DESCRIPTION
        =============================== */}

        <p>
          Enter your registered email and
          we will send you a password reset
          link.
        </p>


        {/* ===============================
            EMAIL FORM
        =============================== */}

        <form
          onSubmit={handleSendResetLink}
        >
          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          {/* ===============================
              SEND BUTTON
          =============================== */}

          <button
            type="submit"
            className="reset-btn"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>


        {/* ===============================
            INFO
        =============================== */}

        <p
          style={{
            fontSize: "13px",
            color: "#777",
            marginTop: "15px",
            lineHeight: "1.5",
          }}
        >
          The password reset link will
          expire after 15 minutes.
        </p>


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

export default ForgotPassword;
