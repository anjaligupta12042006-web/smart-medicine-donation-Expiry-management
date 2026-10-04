import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/ReceivedMedicines.css";

function ReceivedMedicines() {

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // GET APPROVED / RECEIVED MEDICINES
  // ===============================

  const getReceivedMedicines = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/medicines/all"
      );

      // Only Approved medicines
      const approvedMedicines = response.data.filter(
        (medicine) =>
          medicine.status === "Approved"
      );

      setMedicines(approvedMedicines);

    } catch (error) {

      console.log(
        "Received medicines error:",
        error
      );

      alert("Unable to load received medicines");

    } finally {

      setLoading(false);

    }

  };


  // ===============================
  // PAGE LOAD
  // ===============================

  useEffect(() => {

    getReceivedMedicines();

  }, []);


  return (

    <div className="received-container">

      {/* ===============================
          HEADER
      =============================== */}

      <div className="received-header">

        <h1>
          Received Medicines 💊
        </h1>

        <p>
          Medicines approved and received by NGO
        </p>

      </div>


      {/* ===============================
          LOADING
      =============================== */}

      {loading && (

        <p className="received-message">
          Loading received medicines...
        </p>

      )}


      {/* ===============================
          EMPTY
      =============================== */}

      {!loading && medicines.length === 0 && (

        <div className="received-empty">

          <div>
            💊
          </div>

          <h2>
            No Medicines Received
          </h2>

          <p>
            No approved medicines are available yet.
          </p>

        </div>

      )}


      {/* ===============================
          MEDICINES TABLE
      =============================== */}

      {!loading && medicines.length > 0 && (

        <div className="received-table-wrapper">

          <table>

            <thead>

              <tr>

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
                  Manufacturer
                </th>

                <th>
                  Expiry Date
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {medicines.map((medicine) => (

                <tr
                  key={medicine._id}
                >

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
                    {medicine.manufacturer || "N/A"}
                  </td>

                  <td>

                    {medicine.expiryDate
                      ? new Date(
                          medicine.expiryDate
                        ).toLocaleDateString("en-GB")
                      : "N/A"
                    }

                  </td>

                  <td>

                    <span className="received-status">
                      Approved
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

export default ReceivedMedicines;