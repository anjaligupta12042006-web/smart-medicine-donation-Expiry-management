
import React, { useEffect, useState } from "react";
import "../css/AdminDashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  const navigate = useNavigate();

  // =====================================================
  // ADMIN STATS
  // =====================================================

  const [stats, setStats] = useState({
    totalDonors: 0,
    totalNGOs: 0,
    totalMedicines: 0,
    pendingApprovals: 0,
    pendingNGOs: 0,
  });

  // =====================================================
  // RECENT DONATIONS
  // =====================================================

  const [donations, setDonations] = useState([]);

  // =====================================================
  // PENDING MEDICINES
  // =====================================================

  const [pendingMedicines, setPendingMedicines] = useState([]);

  // =====================================================
  // SELECTED MEDICINE
  // =====================================================

  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // =====================================================
  // NGO REQUESTS
  // =====================================================

  const [ngoRequests, setNgoRequests] = useState([]);

  // =====================================================
  // PENDING NGO VERIFICATIONS
  // =====================================================

  const [pendingNGOs, setPendingNGOs] = useState([]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/login", {
      replace: true
    });

  };

  // =====================================================
  // FETCH ALL DATA
  // =====================================================

  useEffect(() => {

    fetchStats();
    fetchRecentDonations();
    fetchPendingMedicines();
    fetchNgoRequests();
    fetchPendingNGOs();

  }, []);

  // =====================================================
  // FETCH ADMIN STATS
  // =====================================================

  const fetchStats = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/admin/stats"
      );

      setStats(
        response.data.stats
      );

    } catch (error) {

      console.log(
        "Error fetching admin stats:",
        error
      );

    }

  };

  // =====================================================
  // FETCH RECENT DONATIONS
  // =====================================================

  const fetchRecentDonations = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/admin/recent-donations"
      );

      setDonations(
        response.data.donations
      );

    } catch (error) {

      console.log(
        "Error fetching recent donations:",
        error
      );

    }

  };

  // =====================================================
  // FETCH PENDING MEDICINES
  // =====================================================

  const fetchPendingMedicines = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/admin/pending"
      );

      setPendingMedicines(
        response.data.medicines
      );

    } catch (error) {

      console.log(
        "Error fetching pending medicines:",
        error
      );

    }

  };

  // =====================================================
  // FETCH NGO REQUESTS
  // =====================================================

  const fetchNgoRequests = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/admin/requests"
      );

      setNgoRequests(
        response.data.requests
      );

    } catch (error) {

      console.log(
        "Error fetching NGO requests:",
        error
      );

    }

  };

  // =====================================================
  // FETCH PENDING NGO VERIFICATIONS
  // =====================================================

  const fetchPendingNGOs = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/admin/ngos/pending"
      );

      setPendingNGOs(
        response.data.ngos
      );

    } catch (error) {

      console.log(
        "Error fetching pending NGOs:",
        error
      );

    }

  };

  // =====================================================
  // APPROVE NGO
  // =====================================================

  const approveNGO = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/admin/ngos/approve/${id}`
      );

      alert(
        "NGO verified and approved successfully!"
      );

      fetchPendingNGOs();
      fetchStats();

    } catch (error) {

      console.log(
        "Error approving NGO:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to approve NGO"
      );

    }

  };

  // =====================================================
  // REJECT NGO
  // =====================================================

  const rejectNGO = async (id) => {

    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this NGO?"
      );

    if (!confirmReject) {
      return;
    }

    try {

      await axios.put(
        `http://localhost:5000/api/admin/ngos/reject/${id}`
      );

      alert(
        "NGO rejected successfully!"
      );

      fetchPendingNGOs();
      fetchStats();

    } catch (error) {

      console.log(
        "Error rejecting NGO:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to reject NGO"
      );

    }

  };

  // =====================================================
  // OPEN MEDICINE DETAILS
  // =====================================================

  const viewMedicine = (medicine) => {

    setSelectedMedicine(medicine);

  };

  // =====================================================
  // CLOSE MEDICINE DETAILS
  // =====================================================

  const closeMedicine = () => {

    setSelectedMedicine(null);

  };

  // =====================================================
  // APPROVE MEDICINE
  // =====================================================

  const approveMedicine = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/admin/approve/${id}`
      );

      alert(
        "Medicine approved successfully"
      );

      setSelectedMedicine(null);

      fetchPendingMedicines();
      fetchStats();
      fetchRecentDonations();

    } catch (error) {

      console.log(
        "Error approving medicine:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to approve medicine"
      );

    }

  };

  // =====================================================
  // REJECT MEDICINE
  // =====================================================

  const rejectMedicine = async (id) => {

    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this medicine?"
      );

    if (!confirmReject) {
      return;
    }

    try {

      await axios.put(
        `http://localhost:5000/api/admin/reject/${id}`
      );

      alert(
        "Medicine rejected successfully"
      );

      setSelectedMedicine(null);

      fetchPendingMedicines();
      fetchStats();
      fetchRecentDonations();

    } catch (error) {

      console.log(
        "Error rejecting medicine:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to reject medicine"
      );

    }

  };

  // =====================================================
  // APPROVE NGO REQUEST
  // =====================================================

  const approveNgoRequest = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/requests/approve/${id}`
      );

      alert(
        "NGO request approved successfully"
      );

      fetchNgoRequests();
      fetchStats();

    } catch (error) {

      console.log(
        "Error approving NGO request:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to approve NGO request"
      );

    }

  };

  // =====================================================
  // REJECT NGO REQUEST
  // =====================================================

  const rejectNgoRequest = async (id) => {

    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this NGO request?"
      );

    if (!confirmReject) {
      return;
    }

    try {

      await axios.put(
        `http://localhost:5000/api/requests/reject/${id}`
      );

      alert(
        "NGO request rejected successfully"
      );

      fetchNgoRequests();

    } catch (error) {

      console.log(
        "Error rejecting NGO request:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to reject NGO request"
      );

    }

  };

  // =====================================================
  // STAT CARDS
  // =====================================================

  const statCards = [

    {
      icon: "👥",
      number: stats.totalDonors,
      title: "Total Donors",
    },

    {
      icon: "🏥",
      number: stats.totalNGOs,
      title: "Total NGOs",
    },

    {
      icon: "💊",
      number: stats.totalMedicines,
      title: "Total Medicines",
    },

    {
      icon: "⏳",
      number: stats.pendingApprovals,
      title: "Pending Approvals",
    },

  ];

  // =====================================================
  // RETURN UI
  // =====================================================

  return (

    <div className="admin-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-header">

        <div className="admin-header-content">

          <h1>
            Welcome Admin 👋
          </h1>

          <p>
            Manage donors, NGOs, medicines and approvals
          </p>

        </div>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="admin-stats">

        {statCards.map(
          (stat, index) => (

            <div
              className="admin-stat-card"
              key={index}
            >

              <div className="admin-stat-icon">
                {stat.icon}
              </div>

              <h2>
                {stat.number}
              </h2>

              <p>
                {stat.title}
              </p>

            </div>

          )
        )}

      </div>

      {/* =================================================
          NGO VERIFICATION
      ================================================= */}

      <div className="admin-section">

        <h2>
          🏥 NGO Verification
        </h2>

        <p>
          Verify NGO registration details before allowing
          medicine requests.
        </p>

        <div className="admin-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  NGO Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Registration Number
                </th>

                <th>
                  Document
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {pendingNGOs.map(
                (ngo) => (

                  <tr
                    key={ngo._id}
                  >

                    <td>
                      {ngo.name || "N/A"}
                    </td>

                    <td>
                      {ngo.email || "N/A"}
                    </td>

                    <td>
                      {ngo.ngoRegistrationNumber ||
                        "N/A"}
                    </td>

                    <td>

                      {ngo.ngoDocument ? (

                        <a
                          href={`http://localhost:5000${ngo.ngoDocument}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#0d6efd",
                            textDecoration: "none",
                            fontWeight: "600"
                          }}
                        >
                          📄 View Document
                        </a>

                      ) : (

                        "N/A"

                      )}

                    </td>

                    <td>

                      <span
                        className="admin-status pending"
                      >
                        {ngo.verificationStatus}
                      </span>

                    </td>

                    <td>

                      <button
                        type="button"
                        onClick={() =>
                          approveNGO(ngo._id)
                        }
                      >
                        ✅ Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          rejectNGO(ngo._id)
                        }
                      >
                        ❌ Reject
                      </button>

                    </td>

                  </tr>

                )
              )}

              {pendingNGOs.length === 0 && (

                <tr>

                  <td colSpan="6">
                    No pending NGO verifications
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          RECENT DONATIONS
      ================================================= */}

      <div className="admin-section">

        <h2>
          Recent Donations
        </h2>

        <div className="admin-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Donor
                </th>

                <th>
                  Medicine
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

              {donations.map(
                (donation) => (

                  <tr
                    key={donation._id}
                  >

                    <td>
                      {donation.donorEmail}
                    </td>

                    <td>
                      {donation.medicineName}
                    </td>

                    <td>
                      {donation.quantity}
                    </td>

                    <td>

                      <span
                        className={`admin-status ${
                          donation.status?.toLowerCase()
                        }`}
                      >

                        {donation.status}

                      </span>

                    </td>

                  </tr>

                )
              )}

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

      {/* =================================================
          PENDING MEDICINE APPROVALS
      ================================================= */}

      <div className="admin-section">

        <h2>
          Pending Medicine Approvals
        </h2>

        <p>
          Review medicine image and information before approving.
        </p>

        <div className="admin-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Image
                </th>

                <th>
                  Medicine
                </th>

                <th>
                  Type
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Expiry Date
                </th>

                <th>
                  Donor
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {pendingMedicines.map(
                (medicine) => (

                  <tr
                    key={medicine._id}
                  >

                    <td>

                      {medicine.image ? (

                        <img
                          src={`http://localhost:5000${medicine.image}`}
                          alt={medicine.medicineName}
                          style={{
                            width: "65px",
                            height: "65px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #ddd"
                          }}
                        />

                      ) : (

                        <div
                          style={{
                            width: "65px",
                            height: "65px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f1f1f1",
                            borderRadius: "8px",
                            fontSize: "12px"
                          }}
                        >
                          No Image
                        </div>

                      )}

                    </td>

                    <td>
                      {medicine.medicineName}
                    </td>

                    <td>
                      {medicine.medicineType}
                    </td>

                    <td>
                      {medicine.quantity}
                    </td>

                    <td>

                      {medicine.expiryDate
                        ? new Date(
                            medicine.expiryDate
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}

                    </td>

                    <td>
                      {medicine.donorEmail}
                    </td>

                    <td>

                      <button
                        type="button"
                        onClick={() =>
                          viewMedicine(medicine)
                        }
                      >
                        👁️ View
                      </button>

                    </td>

                  </tr>

                )
              )}

              {pendingMedicines.length === 0 && (

                <tr>

                  <td colSpan="7">
                    No pending medicines
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          MEDICINE VERIFICATION MODAL
      ================================================= */}

      {selectedMedicine && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >

          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "18px",
              padding: "30px",
              position: "relative",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25)"
            }}
          >

            <button
              type="button"
              onClick={closeMedicine}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                border: "none",
                background: "#f1f1f1",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              ✕
            </button>

            <h2
              style={{
                marginBottom: "25px"
              }}
            >
              Medicine Verification 🔍
            </h2>

            <div
              style={{
                textAlign: "center",
                marginBottom: "25px"
              }}
            >

              {selectedMedicine.image ? (

                <img
                  src={`http://localhost:5000${selectedMedicine.image}`}
                  alt={selectedMedicine.medicineName}
                  style={{
                    width: "280px",
                    height: "280px",
                    objectFit: "contain",
                    borderRadius: "15px",
                    border: "2px solid #ddd",
                    padding: "5px",
                    background: "#fafafa"
                  }}
                />

              ) : (

                <div
                  style={{
                    width: "280px",
                    height: "280px",
                    margin: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f3f3",
                    borderRadius: "15px",
                    color: "#777"
                  }}
                >
                  No Medicine Image
                </div>

              )}

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "25px"
              }}
            >

              <div>
                <strong>
                  Medicine Name
                </strong>

                <p>
                  {selectedMedicine.medicineName}
                </p>
              </div>

              <div>
                <strong>
                  Medicine Type
                </strong>

                <p>
                  {selectedMedicine.medicineType}
                </p>
              </div>

              <div>
                <strong>
                  Quantity
                </strong>

                <p>
                  {selectedMedicine.quantity}
                </p>
              </div>

              <div>
                <strong>
                  Manufacturer
                </strong>

                <p>
                  {selectedMedicine.manufacturer || "N/A"}
                </p>
              </div>

              <div>
                <strong>
                  Expiry Date
                </strong>

                <p>
                  {selectedMedicine.expiryDate
                    ? new Date(
                        selectedMedicine.expiryDate
                      ).toLocaleDateString(
                        "en-GB"
                      )
                    : "N/A"}
                </p>
              </div>

              <div>
                <strong>
                  Donor Email
                </strong>

                <p>
                  {selectedMedicine.donorEmail}
                </p>
              </div>

            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "25px"
              }}
            >

              <strong>
                Description
              </strong>

              <p>
                {selectedMedicine.description ||
                  "No description provided"}
              </p>

            </div>

            <div
              style={{
                marginBottom: "25px"
              }}
            >

              <strong>
                Current Status:
              </strong>

              <span
                style={{
                  marginLeft: "10px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: "#fff3cd",
                  color: "#856404"
                }}
              >
                {selectedMedicine.status}
              </span>

            </div>

            <div
              style={{
                background: "#eef7ff",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "25px"
              }}
            >

              <strong>
                Admin Verification
              </strong>

              <p>
                Please check the medicine image,
                expiry date, manufacturer, quantity
                and other information before approving.
              </p>

            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >

              <button
                type="button"
                onClick={closeMedicine}
                style={{
                  padding: "11px 20px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  rejectMedicine(
                    selectedMedicine._id
                  )
                }
                style={{
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#dc3545",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                ❌ Reject
              </button>

              <button
                type="button"
                onClick={() =>
                  approveMedicine(
                    selectedMedicine._id
                  )
                }
                style={{
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#198754",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                ✅ Approve
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          NGO MEDICINE REQUESTS
      ================================================= */}

      <div
        className="admin-section"
        id="ngo-requests"
      >

        <h2>
          NGO Medicine Requests
        </h2>

        <p>
          Review medicine requests submitted by NGOs.
        </p>

        <div className="admin-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  NGO Email
                </th>

                <th>
                  Medicine
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Status
                </th>

                <th>
                  Request Date
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {ngoRequests.map(
                (request) => (

                  <tr
                    key={request._id}
                  >

                    <td>
                      {request.ngoEmail}
                    </td>

                    <td>
                      {request.medicineName}
                    </td>

                    <td>
                      {request.quantity}
                    </td>

                    <td>

                      <span
                        className={`admin-status ${
                          request.status?.toLowerCase()
                        }`}
                      >
                        {request.status}
                      </span>

                    </td>

                    <td>

                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}

                    </td>

                    <td>

                      {request.status === "Pending" && (

                        <>

                          <button
                            type="button"
                            onClick={() =>
                              approveNgoRequest(
                                request._id
                              )
                            }
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              rejectNgoRequest(
                                request._id
                              )
                            }
                          >
                            Reject
                          </button>

                        </>

                      )}

                    </td>

                  </tr>

                )
              )}

              {ngoRequests.length === 0 && (

                <tr>

                  <td colSpan="6">
                    No NGO requests found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="admin-section">

        <h2>
          Quick Actions
        </h2>

        <div className="admin-actions">

          <button
            className="admin-action-card"
            onClick={() =>
              navigate("/InventoryManagement")
            }
          >

            <span>
              💊
            </span>

            <div>

              <h3>
                Inventory Management
              </h3>

              <p>
                View and manage medicine inventory
              </p>

            </div>

          </button>

          <button
            className="admin-action-card"
            onClick={() =>
              navigate("/SearchFilter")
            }
          >

            <span>
              🔍
            </span>

            <div>

              <h3>
                Search & Filter
              </h3>

              <p>
                Search and filter medicines
              </p>

            </div>

          </button>

          <button
            className="admin-action-card"
            onClick={() =>
              navigate("/ReportAnalytics")
            }
          >

            <span>
              📊
            </span>

            <div>

              <h3>
                Reports & Analytics
              </h3>

              <p>
                View donation reports and analytics
              </p>

            </div>

          </button>

          <button
            className="admin-action-card"
            onClick={() =>
              navigate("/ProfileManagement")
            }
          >

            <span>
              👤
            </span>

            <div>

              <h3>
                Profile Management
              </h3>

              <p>
                Manage admin profile
              </p>

            </div>

          </button>

        </div>

      </div>

      {/* =================================================
          APPROVAL ALERT
      ================================================= */}

      {(stats.pendingApprovals > 0 ||
        stats.pendingNGOs > 0) && (

        <div className="admin-alert">

          <div className="admin-alert-icon">
            ⚠️
          </div>

          <div className="admin-alert-content">

            <h3>
              Pending Approval Alert
            </h3>

            <p>

              {stats.pendingApprovals > 0 && (
                <>
                  {stats.pendingApprovals}
                  {" "}
                  medicine donations are waiting
                  for admin approval.
                </>
              )}

              {stats.pendingApprovals > 0 &&
                stats.pendingNGOs > 0 && (
                  <>
                    {" "}
                    Also,
                    {" "}
                  </>
                )}

              {stats.pendingNGOs > 0 && (
                <>
                  {stats.pendingNGOs}
                  {" "}
                  NGO accounts are waiting
                  for verification.
                </>
              )}

            </p>

          </div>

          <button
            type="button"
            onClick={() => {

              const approvalSection =
                document.querySelector(
                  ".admin-section"
                );

              if (approvalSection) {

                approvalSection.scrollIntoView({
                  behavior: "smooth"
                });

              }

            }}
          >
            View Requests
          </button>

        </div>

      )}

      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <div className="admin-section">

        <h2>
          Recent Activity
        </h2>

        <div className="admin-activity">

          <div className="admin-activity-item">

            <span className="admin-activity-icon">
              👤
            </span>

            <div>

              <h3>
                New Donor Registered
              </h3>

              <p>
                A new donor has registered on the platform.
              </p>

            </div>

            <span className="admin-activity-time">
              Today
            </span>

          </div>

          <div className="admin-activity-item">

            <span className="admin-activity-icon">
              💊
            </span>

            <div>

              <h3>
                New Medicine Donation
              </h3>

              <p>
                A medicine donation has been added.
              </p>

            </div>

            <span className="admin-activity-time">
              Today
            </span>

          </div>

          <div className="admin-activity-item">

            <span className="admin-activity-icon">
              🏥
            </span>

            <div>

              <h3>
                NGO Registered
              </h3>

              <p>
                A new NGO has joined the MedDonate platform.
              </p>

            </div>

            <span className="admin-activity-time">
              Recently
            </span>

          </div>

        </div>

      </div>

    </div>

  );

}

export default AdminDashboard;

