import React, { useState } from "react";
import "../css/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Remember Me
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          role,
          email,
          password,
        }
      );

      console.log("Login successful:", response.data);

      // =====================================================
      // REMEMBER ME
      // =====================================================

      const userData = JSON.stringify(response.data.user);

      if (rememberMe) {
        localStorage.setItem("user", userData);
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("user", userData);
        localStorage.removeItem("user");
      }

      alert("Login successful!");

      // =====================================================
      // ROLE BASED NAVIGATION
      // =====================================================

      if (response.data.user.role === "Donor") {
        navigate("/donor-Dashboard");
      } else if (response.data.user.role === "NGO") {
        navigate("/ngo-Dashboard");
      } else if (response.data.user.role === "Admin") {
        navigate("/admin-Dashboard");
      }
    } catch (error) {
      console.log("Login error:", error);

      if (error.response) {
        alert(error.response.data);
      } else {
        alert("Server is not connected");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">❤️</div>

        <h1>
          Welcome <span>Back!</span>
        </h1>

        <p className="subtitle">Login to continue</p>

        <form onSubmit={handleLogin}>
          {/* ===============================
              ROLE
          ================_______________ */}
          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select your role</option>
            <option value="Donor">Donor</option>
            <option value="NGO">NGO</option>
            <option value="Admin">Admin</option>
          </select>

          {/* ===============================
              EMAIL
          ================_______________ */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* ===============================
              PASSWORD
          ================_______________ */}
          <label>Password</label>
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "hide" : "👁"}
            </button>
          </div>

          {/* ===============================
              OPTIONS
          ================_______________ */}
          <div className="options">
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>

            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {/* ===============================
              LOGIN BUTTON
          ================_______________ */}
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {/* ===============================
            DIVIDER
        ================_______________ */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* ===============================
            SIGNUP
        ================_______________ */}
        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;