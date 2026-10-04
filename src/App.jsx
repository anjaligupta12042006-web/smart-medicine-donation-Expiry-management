
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import DonorDashboard from "./pages/DonorDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import DonateMedicine from "./pages/DonateMedicine";
import MyDonation from "./pages/MyDonation";
import InventoryManagement from "./pages/InventoryManagement";
import ProfileManagement from "./pages/ProfileManagement";
import ReportAnalytics from "./pages/ReportAnalytics";
import ExpiryNotification from "./pages/ExpiryNotification";
import SearchFilter from "./pages/SearchFilter";
import MedicineRequest from "./pages/MedicineRequest";
import ReceivedMedicines from "./pages/ReceivedMedicines";


// =====================================================
// CHECK LOGIN
// =====================================================

function getLoggedInUser() {
  const localUser = localStorage.getItem("user");

  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch (error) {
      localStorage.removeItem("user");
    }
  }

  const sessionUser = sessionStorage.getItem("user");

  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch (error) {
      sessionStorage.removeItem("user");
    }
  }

  return null;
}


// =====================================================
// DEFAULT PAGE
// =====================================================

function Home() {
  const user = getLoggedInUser();

  if (user) {

    if (user.role === "Donor") {
      return (
        <Navigate
          to="/donor-Dashboard"
          replace
        />
      );
    }

    if (user.role === "NGO") {
      return (
        <Navigate
          to="/ngo-Dashboard"
          replace
        />
      );
    }

    if (user.role === "Admin") {
      return (
        <Navigate
          to="/admin-Dashboard"
          replace
        />
      );
    }
  }

  return <Login />;
}


// =====================================================
// APP
// =====================================================

function App() {

  const [expiryPopup, setExpiryPopup] =
    useState("");


  // =====================================================
  // EXPIRY POPUP
  // =====================================================

  useEffect(() => {

    const checkExpiry = async () => {

      try {

        const user = getLoggedInUser();

        if (!user || !user.email) {
          return;
        }


        const response = await axios.get(
          `http://localhost:5000/api/medicines/expiry/${encodeURIComponent(
            user.email
          )}`
        );


        if (!Array.isArray(response.data)) {
          return;
        }


        const medicine = response.data.find(
          (item) =>
            Number(item.daysLeft) <= 30
        );


        if (!medicine) {
          return;
        }


        const days =
          Number(medicine.daysLeft);


        if (days < 0) {

          setExpiryPopup(
            `❌ ${medicine.medicineName} has expired.`
          );

        } else if (days === 0) {

          setExpiryPopup(
            `🔴 ${medicine.medicineName} expires today.`
          );

        } else if (days === 1) {

          setExpiryPopup(
            `⚠️ ${medicine.medicineName} expires tomorrow.`
          );

        } else {

          setExpiryPopup(
            `⚠️ ${medicine.medicineName} will expire in ${days} days.`
          );

        }

      } catch (error) {

        console.log(
          "Expiry popup error:",
          error
        );

      }

    };


    checkExpiry();

  }, []);


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <BrowserRouter>

      {/* =================================================
          EXPIRY POPUP
      ================================================= */}

      {expiryPopup && (

        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            width: "320px",
            background: "white",
            padding: "18px",
            borderRadius: "10px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 9999,
            borderLeft:
              "5px solid orange"
          }}
        >

          <button
            type="button"
            onClick={() =>
              setExpiryPopup("")
            }
            style={{
              position: "absolute",
              right: "8px",
              top: "5px",
              border: "none",
              background: "none",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>


          <h3
            style={{
              marginTop: "0"
            }}
          >
            🔔 Expiry Alert
          </h3>


          <p
            style={{
              fontWeight: "600",
              textAlign: "center"
            }}
          >
            {expiryPopup}
          </p>

        </div>

      )}


      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* SIGNUP */}

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* RESET PASSWORD */}

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =================================================
            DONOR
        ================================================= */}

        <Route
          path="/donor-Dashboard"
          element={<DonorDashboard />}
        />

        <Route
          path="/DonateMedicine"
          element={<DonateMedicine />}
        />

        <Route
          path="/MyDonation"
          element={<MyDonation />}
        />

        <Route
          path="/ExpiryNotification"
          element={<ExpiryNotification />}
        />


        {/* =================================================
            NGO
        ================================================= */}

        <Route
          path="/ngo-Dashboard"
          element={<NgoDashboard />}
        />

        <Route
          path="/MedicineRequest"
          element={<MedicineRequest />}
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin-Dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/InventoryManagement"
          element={<InventoryManagement />}
        />

        <Route
          path="/SearchFilter"
          element={<SearchFilter />}
        />

        <Route
          path="/ReportAnalytics"
          element={<ReportAnalytics />}
        />


        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/ProfileManagement"
          element={<ProfileManagement />}
        />

        <Route
          path="/ReceivedMedicines"
          element={<ReceivedMedicines />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;

