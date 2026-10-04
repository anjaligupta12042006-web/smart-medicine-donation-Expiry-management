import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/DonorDashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();


  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;


  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    expired: 0,
  });


  // =====================================================
  // DONATIONS
  // =====================================================

  const [donations, setDonations] = useState([]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    // Clear login data
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    // Go to login page
    navigate("/login");

  };


  // =====================================================
  // GET DASHBOARD DATA
  // =====================================================

  useEffect(() => {

    const getDashboardData = async () => {

      try {

        // Get stats
        const statsResponse = await axios.get(
          `http://localhost:5000/api/medicines/stats/${user.email}`
        );

        console.log(
          "Dashboard stats:",
          statsResponse.data
        );

        setStats(statsResponse.data);


        // Get donations
        const donationsResponse = await axios.get(
          `http://localhost:5000/api/medicines/my-donations/${user.email}`
        );

        console.log(
          "Recent donations:",
          donationsResponse.data
        );

        setDonations(
          donationsResponse.data
        );


      } catch (error) {

        console.log(
          "Dashboard error:",
          error
        );

      }

    };


    if (user) {

      getDashboardData();

    } else {

      // No user found
      navigate("/login");

    }

  }, []);


  return (

    <div className="dashboard-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dashboard-header">


        {/* Dashboard Title */}

        <div className="header-text">

          <h1>
            Donor Dashboard
          </h1>

          <p>
            Welcome Back, Donor 👋
          </p>

        </div>


        {/* Logout Button */}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>


      </div>



      {/* =====================================================
          STATS CARDS
      ===================================================== */}

      <div className="stats-container">


        {/* Total Donations */}

        <div className="stat-card">

          <div className="stat-icon">
            💊
          </div>

          <h2>
            {stats.total}
          </h2>

          <p>
            Total Donations
          </p>

        </div>


        {/* Approved */}

        <div className="stat-card">

          <div className="stat-icon">
            ✅
          </div>

          <h2>
            {stats.approved}
          </h2>

          <p>
            Approved
          </p>

        </div>


        {/* Pending */}

        <div className="stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <h2>
            {stats.pending}
          </h2>

          <p>
            Pending
          </p>

        </div>


        {/* Expired */}

        <div className="stat-card">

          <div className="stat-icon">
            ⚠️
          </div>

          <h2>
            {stats.expired}
          </h2>

          <p>
            Expired
          </p>

        </div>


      </div>



      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="section-card">

        <h2>
          Quick Actions
        </h2>


        <div className="quick-actions">


          {/* Donate Medicine */}

          <button
            className="action-card"
            onClick={() =>
              navigate("/DonateMedicine")
            }
          >

            <span>
              💊
            </span>

            <div>

              <h3>
                Donate Medicine
              </h3>

              <p>
                Add a new medicine donation
              </p>

            </div>

          </button>


          {/* My Donations */}

          <button
            className="action-card"
            onClick={() =>
              navigate("/MyDonation")
            }
          >

            <span>
              📋
            </span>

            <div>

              <h3>
                My Donations
              </h3>

              <p>
                View your donation history
              </p>

            </div>

          </button>


          {/* Expiry Alerts */}

          <button
            className="action-card"
            onClick={() =>
              navigate("/ExpiryNotification")
            }
          >

            <span>
              🔔
            </span>

            <div>

              <h3>
                Expiry Alerts
              </h3>

              <p>
                Check medicines near expiry
              </p>

            </div>

          </button>


          {/* Profile */}

          <button
            className="action-card"
            onClick={() =>
              navigate("/ProfileManagement")
            }
          >

            <span>
              👤
            </span>

            <div>

              <h3>
                My Profile
              </h3>

              <p>
                Manage your profile
              </p>

            </div>

          </button>


        </div>

      </div>



      {/* =====================================================
          EXPIRY ALERT
      ===================================================== */}

      <div className="expiry-alert">


        <div className="alert-icon">
          ⚠️
        </div>


        <div className="alert-content">

          <h3>
            Expiry Alert
          </h3>

          <p>
            {stats.expired} donated medicines are expired.
            Please check your donation records.
          </p>

        </div>


        <button
          onClick={() =>
            navigate("/ExpiryNotification")
          }
        >
          View Alerts
        </button>


      </div>



      {/* =====================================================
          RECENT DONATIONS
      ===================================================== */}

      <div className="recent-donations">

        <h2>
          Recent Donations
        </h2>


        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Date
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>


              {donations.map(
                (donation) => (

                  <tr
                    key={donation._id}
                  >

                    <td>
                      {donation.medicineName}
                    </td>

                    <td>
                      {donation.quantity}
                    </td>

                    <td>

                      {new Date(
                        donation.createdAt
                      ).toLocaleDateString(
                        "en-GB"
                      )}

                    </td>

                    <td>

                      <span
                        className={
                          donation.status === "Approved"
                            ? "status approved"
                            : donation.status === "Rejected"
                            ? "status rejected"
                            : "status pending"
                        }
                      >

                        {donation.status}

                      </span>

                    </td>

                  </tr>

                )
              )}


              {/* No Donations */}

              {donations.length === 0 && (

                <tr>

                  <td colSpan="4">

                    No donations found

                  </td>

                </tr>

              )}


            </tbody>

          </table>

        </div>

      </div>


    </div>

  );

}

export default Dashboard;