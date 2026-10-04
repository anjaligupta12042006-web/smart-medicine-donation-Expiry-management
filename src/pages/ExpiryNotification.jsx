
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/ExpiryNotification.css";

function ExpiryNotification() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET LOGGED-IN USER
  const getLoggedInUser = () => {
    try {
      const localUser = localStorage.getItem("user");

      if (localUser) {
        return JSON.parse(localUser);
      }

      const sessionUser = sessionStorage.getItem("user");

      if (sessionUser) {
        return JSON.parse(sessionUser);
      }

      return null;
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  };

  // GET EXPIRY DATA
  useEffect(() => {
    const getExpiryData = async () => {
      try {
        setLoading(true);
        setError("");

        const user = getLoggedInUser();

        if (!user) {
          setError("User is not logged in.");
          return;
        }

        if (!user.email) {
          setError("User email not found. Please login again.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/medicines/expiry/${encodeURIComponent(
            user.email
          )}`
        );

        if (Array.isArray(response.data)) {
          setMedicines(response.data);
        } else {
          setMedicines([]);
        }
      } catch (error) {
        console.error("Expiry error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load expiry data."
        );
      } finally {
        setLoading(false);
      }
    };

    getExpiryData();
  }, []);

  // COUNTS
  const expiredCount = medicines.filter(
    (medicine) => medicine.expiryStatus === "Expired"
  ).length;

  const expiringSoonCount = medicines.filter(
    (medicine) => medicine.expiryStatus === "Expiring Soon"
  ).length;

  const safeCount = medicines.filter(
    (medicine) => medicine.expiryStatus === "Safe"
  ).length;

  // SIMPLE NOTIFICATION MESSAGE
  const getNotificationMessage = (medicine) => {
    const days = Number(medicine.daysLeft);

    if (days < 0) {
      return `❌ ${medicine.medicineName} has already expired.`;
    }

    if (days === 0) {
      return `🔴 ${medicine.medicineName} expires today.`;
    }

    if (days === 1) {
      return `⚠️ ${medicine.medicineName} expires tomorrow.`;
    }

    if (days <= 30) {
      return `⚠️ ${medicine.medicineName} will expire in ${days} days.`;
    }

    return `✅ ${medicine.medicineName} has ${days} days remaining for expiry.`;
  };

  // LOADING
  if (loading) {
    return (
      <div className="expiry-container">
        <h1>Expiry Reminder & Notifications ⏰</h1>
        <p>Loading expiry information...</p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="expiry-container">
        <h1>Expiry Reminder & Notifications ⏰</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="expiry-container">

      <h1>Expiry Reminder & Notifications ⏰</h1>

      {/* ==============================
          EXPIRY NOTIFICATIONS
      ============================== */}

      <div className="expiry-alerts">

        <h2>🔔 Expiry Notifications</h2>

        {medicines.length === 0 ? (
          <p>No expiry notifications available.</p>
        ) : (
          medicines.map((medicine) => (
            <div
              key={medicine._id}
              className={
                medicine.daysLeft < 0
                  ? "expiry-alert expired"
                  : medicine.daysLeft <= 7
                  ? "expiry-alert urgent"
                  : medicine.daysLeft <= 30
                  ? "expiry-alert warning"
                  : "expiry-alert safe"
              }
            >
              {getNotificationMessage(medicine)}
            </div>
          ))
        )}

      </div>

      {/* ==============================
          NOTIFICATION CARDS
      ============================== */}

      <div className="notification-cards">

        <div className="notify-card danger">
          <h2>⚠ Expiring Soon</h2>

          <p>
            {expiringSoonCount} medicines will expire within 30 days
          </p>
        </div>

        <div className="notify-card warning">
          <h2>📅 Expired</h2>

          <p>
            {expiredCount} medicines have expired
          </p>
        </div>

        <div className="notify-card safe">
          <h2>✅ Safe Stock</h2>

          <p>
            {safeCount} medicines have more than 30 days expiry
          </p>
        </div>

      </div>

      {/* ==============================
          MEDICINE EXPIRY TABLE
      ============================== */}

      <div className="expiry-table">

        <h2>Medicine Expiry List</h2>

        <table>

          <thead>
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Remaining Days</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {medicines.map((medicine) => (
              <tr key={medicine._id}>

                <td>
                  {medicine.medicineName}
                </td>

                <td>
                  {medicine.quantity}
                </td>

                <td>
                  {medicine.expiryDate
                    ? new Date(
                        medicine.expiryDate
                      ).toLocaleDateString("en-GB")
                    : "N/A"}
                </td>

                <td>
                  {medicine.daysLeft < 0
                    ? "Expired"
                    : medicine.daysLeft === 0
                    ? "Today"
                    : medicine.daysLeft === 1
                    ? "Tomorrow"
                    : `${medicine.daysLeft} Days`}
                </td>

                <td>
                  <span
                    className={
                      medicine.expiryStatus === "Expired"
                        ? "danger-text"
                        : medicine.expiryStatus === "Expiring Soon"
                        ? "warning-text"
                        : "safe-text"
                    }
                  >
                    {medicine.expiryStatus}
                  </span>
                </td>

              </tr>
            ))}

            {medicines.length === 0 && (
              <tr>
                <td colSpan="5">
                  No medicines found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ExpiryNotification;

