import React, { useState } from "react";
import "../css/Signup.css";
import { Link } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Donor");
  const [ngoRegistrationNumber, setNgoRegistrationNumber] = useState("");
  const [ngoDocument, setNgoDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 3 || cleanName.length > 50) {
      alert("Please enter a valid full name (3-50 characters).");
      return false;
    }
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    if (!nameRegex.test(cleanName)) {
      alert("Name can contain only letters and spaces.");
      return false;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || cleanEmail.length > 100) {
      alert("Please enter a valid email.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!password || password.length < 8 || password.length > 100) {
      alert("Password must be between 8 and 100 characters.");
      return false;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(password)) {
      alert("Password must contain uppercase, lowercase, number, and special character.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match!");
      return false;
    }

    if (role === "NGO") {
      if (!ngoRegistrationNumber.trim()) {
        alert("Please enter NGO Registration Number.");
        return false;
      }
      if (!ngoDocument) {
        alert("Please upload NGO registration proof.");
        return false;
      }
      if (ngoDocument.size > 5 * 1024 * 1024) {
        alert("NGO document must be less than 5MB.");
        return false;
      }
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      formData.append("role", role);

      if (role === "NGO") {
        formData.append("ngoRegistrationNumber", ngoRegistrationNumber.trim());
        formData.append("ngoDocument", ngoDocument);
      }

      const response = await axios.post("http://localhost:5000/api/auth/signup", formData);
      
      if (role === "NGO") {
        alert("NGO account created successfully! Your account is pending admin verification.");
      } else {
        alert("Account created successfully!");
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("Donor");
      setNgoRegistrationNumber("");
      setNgoDocument(null);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || "Signup failed.";
      alert(typeof message === "string" ? message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    if (selectedRole === "Donor") {
      setNgoRegistrationNumber("");
      setNgoDocument(null);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="logo">MedBridge</h1>
        <h2>Create Account</h2>
        <p className="subtitle">Create your account to continue</p>

        <form onSubmit={handleSignup}>
          
          {/* Row 1: Full Name & Email */}
          <div className="form-row">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                required
              />
            </div>
          </div>

          {/* Row 2: Password & Confirm Password */}
          <div className="form-row">
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={100}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                maxLength={100}
                required
              />
            </div>
          </div>
          
          <small className="password-hint">
            Password must be 8+ chars with uppercase, lowercase, number & special character.
          </small>

          {/* Row 3: Role Selection */}
          <div className="input-group full-width">
            <label>Select Role</label>
            <select value={role} onChange={handleRoleChange} required>
              <option value="Donor">Donor</option>
              <option value="NGO">NGO</option>
            </select>
          </div>

          {/* NGO Fields (Conditional Row) */}
          {role === "NGO" && (
            <div className="ngo-section">
              <div className="form-row">
                <div className="input-group">
                  <label>NGO Registration Number</label>
                  <input
                    type="text"
                    placeholder="Enter NGO registration number"
                    value={ngoRegistrationNumber}
                    onChange={(e) => setNgoRegistrationNumber(e.target.value)}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>NGO Registration Proof</label>
                  <input
                    id="ngoDocument"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setNgoDocument(e.target.files[0] || null)}
                    required
                  />
                </div>
              </div>
              <p className="info-text">Upload certificate/proof (Max 5MB). Pending admin verification.</p>
            </div>
          )}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="login-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;