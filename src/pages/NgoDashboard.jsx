import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/NgoDashboard.css";
import { useNavigate } from "react-router-dom";

function NGODashboard() {

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
  // NGO STATS
  // =====================================================

  const [stats, setStats] = useState({
    pending: 0,
    received: 0,
    distributed: 0,
    stock: 0,
  });


  // =====================================================
  // NGO REQUESTS
  // =====================================================

  const [requests, setRequests] = useState([]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });

  };


  // =====================================================
  // GET NGO DASHBOARD DATA
  // =====================================================

  const getDashboardData = async () => {

    try {

      // =================================================
      // CHECK USER
      // =================================================

      if (!user || !user.email) {

        console.log("NGO user not found");

        return;

      }


      // =================================================
      // GET NGO REQUESTS
      // =================================================

      const requestResponse = await axios.get(
        `http://localhost:5000/api/requests/ngo/${user.email}`
      );


      const ngoRequests = requestResponse.data;


      console.log(
        "NGO Requests:",
        ngoRequests
      );


      // =================================================
      // SAVE NGO REQUESTS
      // =================================================

      setRequests(ngoRequests);


      // =================================================
      // PENDING REQUESTS
      // =================================================

      const pendingRequests =
        ngoRequests.filter(
          (request) =>
            request.status === "Pending"
        );


      const pending =
        pendingRequests.length;


      // =================================================
      // APPROVED REQUESTS
      // =================================================

      const approvedRequests =
        ngoRequests.filter(
          (request) =>
            request.status === "Approved"
        );


      // =================================================
      // MEDICINES RECEIVED
      // =================================================

      let received = 0;


      approvedRequests.forEach(
        (request) => {

          received += Number(
            request.quantity || 0
          );

        }
      );


      // =================================================
      // GET ALL MEDICINES
      // =================================================

      const medicineResponse =
        await axios.get(
          "http://localhost:5000/api/medicines/all"
        );


      const allMedicines =
        medicineResponse.data;


      // =================================================
      // TODAY'S DATE
      // =================================================

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      // =================================================
      // AVAILABLE MEDICINES
      // Only:
      // 1. Approved
      // 2. Quantity greater than 0
      // 3. Not expired
      // =================================================

      const approvedMedicines =
        allMedicines.filter(
          (medicine) => {

            const expiryDate =
              new Date(
                medicine.expiryDate
              );

            expiryDate.setHours(
              0,
              0,
              0,
              0
            );


            return (
              medicine.status === "Approved" &&
              Number(medicine.quantity) > 0 &&
              expiryDate >= today
            );

          }
        );


      // =================================================
      // AVAILABLE STOCK
      // =================================================

      let stock = 0;


      approvedMedicines.forEach(
        (medicine) => {

          stock += Number(
            medicine.quantity || 0
          );

        }
      );


      // =================================================
      // DISTRIBUTED
      // =================================================

      // Distribution module abhi connected nahi hai
      const distributed = 0;


      // =================================================
      // UPDATE STATS
      // =================================================

      setStats({

        pending: pending,

        received: received,

        distributed: distributed,

        stock: stock,

      });


    } catch (error) {

      console.log(
        "NGO Dashboard error:",
        error
      );

    }

  };


  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    // =================================================
    // USER NOT LOGGED IN
    // =================================================

    if (!user) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;

    }


    // =================================================
    // USER IS NOT NGO
    // =================================================

    if (user.role !== "NGO") {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;

    }


    // =================================================
    // LOAD DASHBOARD
    // =================================================

    getDashboardData();


  }, []);


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    if (status === "Approved") {

      return "approved";

    }


    if (status === "Rejected") {

      return "rejected";

    }


    return "pending";

  };


  // =====================================================
  // RETURN UI
  // =====================================================

  return (

    <div className="ngo-dashboard">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="ngo-header">


        <div className="ngo-header-content">

          <h1>
            Welcome NGO 👋
          </h1>


          <p>
            Manage medicines, requests and distributions
          </p>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>


      </div>



      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="ngo-stats">


        {/* Pending */}

        <div className="ngo-stat-card">

          <div className="ngo-stat-icon">
            📋
          </div>


          <h2>
            {stats.pending}
          </h2>


          <p>
            Pending Requests
          </p>

        </div>



        {/* Received */}

        <div className="ngo-stat-card">

          <div className="ngo-stat-icon">
            💊
          </div>


          <h2>
            {stats.received}
          </h2>


          <p>
            Medicines Received
          </p>

        </div>



        {/* Distributed */}

        <div className="ngo-stat-card">

          <div className="ngo-stat-icon">
            🚚
          </div>


          <h2>
            {stats.distributed}
          </h2>


          <p>
            Distributed
          </p>

        </div>



        {/* Stock */}

        <div className="ngo-stat-card">

          <div className="ngo-stat-icon">
            📦
          </div>


          <h2>
            {stats.stock}
          </h2>


          <p>
            Available Stock
          </p>

        </div>


      </div>



      {/* =====================================================
          RECENT MEDICINE REQUESTS
      ===================================================== */}

      <div className="ngo-section">


        <h2>
          Recent Medicine Requests
        </h2>


        <div className="ngo-table-wrapper">


          <table>


            <thead>

              <tr>

                <th>
                  Medicine
                </th>


                <th>
                  NGO
                </th>


                <th>
                  Quantity
                </th>


                <th>
                  Status
                </th>

              </tr>

            </thead>



            <tbody>


              {/* =================================================
                  NGO REQUESTS
              ================================================= */}

              {requests.map((request) => (

                <tr
                  key={request._id}
                >


                  {/* Medicine */}

                  <td>
                    {request.medicineName}
                  </td>



                  {/* NGO */}

                  <td>
                    {request.ngoEmail}
                  </td>



                  {/* Quantity */}

                  <td>
                    {request.quantity}
                  </td>



                  {/* Status */}

                  <td>

                    <span
                      className={`ngo-status ${getStatusClass(
                        request.status
                      )}`}
                    >

                      {request.status}

                    </span>

                  </td>


                </tr>

              ))}



              {/* =================================================
                  NO REQUESTS
              ================================================= */}

              {requests.length === 0 && (

                <tr>

                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                    }}
                  >

                    No medicine requests yet.

                  </td>

                </tr>

              )}


            </tbody>


          </table>


        </div>


      </div>



      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="ngo-section">


        <h2>
          Quick Actions
        </h2>


        <div className="ngo-actions">


          {/* =================================================
              MEDICINE REQUESTS
          ================================================= */}

          <button
            className="ngo-action-card"
            onClick={() =>
              navigate("/MedicineRequest")
            }
          >

            <span>
              📋
            </span>


            <div>

              <h3>
                Medicine Requests
              </h3>


              <p>
                View and manage medicine requests
              </p>

            </div>


          </button>



          {/* =================================================
              RECEIVED MEDICINES
          ================================================= */}

          <button
            className="ngo-action-card"
            onClick={() =>
              navigate("/ReceivedMedicines")
            }
          >

            <span>
              💊
            </span>


            <div>

              <h3>
                Received Medicines
              </h3>


              <p>
                View approved and received medicines
              </p>

            </div>


          </button>



          {/* =================================================
              INVENTORY
          ================================================= */}

          <button
            className="ngo-action-card"
            onClick={() =>
              navigate("/InventoryManagement")
            }
          >

            <span>
              📦
            </span>


            <div>

              <h3>
                Inventory
              </h3>


              <p>
                Manage available medicine stock
              </p>

            </div>


          </button>



          {/* =================================================
              DISTRIBUTION
          ================================================= */}

          <button
            className="ngo-action-card"
            onClick={() =>
              alert(
                "Distribution module will be connected next."
              )
            }
          >

            <span>
              🚚
            </span>


            <div>

              <h3>
                Distribution
              </h3>


              <p>
                Manage medicine distribution
              </p>

            </div>


          </button>


        </div>


      </div>



      {/* =====================================================
          INVENTORY ALERT
      ===================================================== */}

      <div className="ngo-alert">


        <div className="ngo-alert-icon">
          ⚠️
        </div>


        <div className="ngo-alert-content">

          <h3>
            Inventory Alert
          </h3>


          <p>
            Please review your available medicine stock.
          </p>

        </div>


        <button
          onClick={() =>
            navigate("/InventoryManagement")
          }
        >
          View Inventory
        </button>


      </div>



      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <div className="ngo-section">


        <h2>
          Recent Activity
        </h2>


        <div className="ngo-activity">


          {/* =================================================
              ACTIVITY 1
          ================================================= */}

          <div className="activity-item">


            <span className="activity-icon">
              💊
            </span>


            <div>

              <h3>
                Medicines Received
              </h3>


              <p>
                {stats.received > 0
                  ? `${stats.received} medicines have been approved for your NGO.`
                  : "No medicines received yet."
                }
              </p>

            </div>


            <span className="activity-time">
              Today
            </span>


          </div>



          {/* =================================================
              ACTIVITY 2
          ================================================= */}

          <div className="activity-item">


            <span className="activity-icon">
              📋
            </span>


            <div>

              <h3>
                Pending Requests
              </h3>


              <p>
                {stats.pending > 0
                  ? `You have ${stats.pending} pending medicine request${stats.pending > 1 ? "s" : ""}.`
                  : "No pending medicine requests."
                }
              </p>

            </div>


            <span className="activity-time">
              Today
            </span>


          </div>



          {/* =================================================
              ACTIVITY 3
          ================================================= */}

          <div className="activity-item">


            <span className="activity-icon">
              📦
            </span>


            <div>

              <h3>
                Available Stock
              </h3>


              <p>
                {stats.stock > 0
                  ? `${stats.stock} medicines are currently available in stock.`
                  : "No medicine stock available."
                }
              </p>

            </div>


            <span className="activity-time">
              Today
            </span>


          </div>


        </div>


      </div>


    </div>

  );

}


export default NGODashboard;