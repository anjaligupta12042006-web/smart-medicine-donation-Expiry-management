import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/MedicineRequest.css";

function MedicineRequest() {

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
  // AVAILABLE MEDICINES
  // =====================================================

  const [medicines, setMedicines] = useState([]);


  // =====================================================
  // NGO REQUESTS
  // =====================================================

  const [myRequests, setMyRequests] = useState([]);


  // =====================================================
  // SELECTED MEDICINE
  // =====================================================

  const [selectedMedicine, setSelectedMedicine] = useState(null);


  // =====================================================
  // QUANTITY
  // =====================================================

  const [quantity, setQuantity] = useState("");


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);


  // =====================================================
  // REQUEST LOADING
  // =====================================================

  const [requesting, setRequesting] = useState(false);


  // =====================================================
  // GET AVAILABLE MEDICINES
  // =====================================================

  const getAvailableMedicines = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/requests/available-medicines"
      );

      console.log(
        "Available medicines:",
        response.data
      );

      setMedicines(response.data);

    } catch (error) {

      console.log(
        "Error loading medicines:",
        error
      );

      alert(
        "Unable to load available medicines"
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // GET NGO REQUESTS
  // =====================================================

  const getMyRequests = async () => {

    try {

      // -----------------------------------------------
      // CHECK LOGIN
      // -----------------------------------------------

      if (!user) {

        alert("Please login first");

        return;

      }


      // -----------------------------------------------
      // GET REQUESTS OF LOGGED-IN NGO
      // -----------------------------------------------

      const response = await axios.get(
        `http://localhost:5000/api/requests/ngo/${user.email}`
      );


      console.log(
        "My NGO requests:",
        response.data
      );


      setMyRequests(response.data);

    } catch (error) {

      console.log(
        "Error loading requests:",
        error
      );

    }

  };


  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    // -----------------------------------------------
    // CHECK LOGIN FIRST
    // -----------------------------------------------

    if (!user) {

      alert("Please login first");

      window.location.href = "/login";

      return;

    }


    // -----------------------------------------------
    // LOAD DATA
    // -----------------------------------------------

    getAvailableMedicines();

    getMyRequests();

  }, []);


  // =====================================================
  // SELECT MEDICINE
  // =====================================================

  const handleSelectMedicine = (medicine) => {

    setSelectedMedicine(medicine);

    setQuantity("");

  };


  // =====================================================
  // SEND REQUEST
  // =====================================================

  const handleRequest = async (e) => {

    e.preventDefault();


    // -----------------------------------------------
    // CHECK LOGIN
    // -----------------------------------------------

    if (!user) {

      alert("Please login first");

      return;

    }


    // -----------------------------------------------
    // CHECK MEDICINE
    // -----------------------------------------------

    if (!selectedMedicine) {

      alert(
        "Please select a medicine"
      );

      return;

    }


    // -----------------------------------------------
    // CHECK QUANTITY
    // -----------------------------------------------

    if (
      !quantity ||
      Number(quantity) <= 0
    ) {

      alert(
        "Please enter a valid quantity"
      );

      return;

    }


    // -----------------------------------------------
    // CHECK AVAILABLE STOCK
    // -----------------------------------------------

    if (
      Number(quantity) >
      Number(selectedMedicine.quantity)
    ) {

      alert(
        "Requested quantity is greater than available stock"
      );

      return;

    }


    try {

      setRequesting(true);


      // -----------------------------------------------
      // CREATE REQUEST
      // -----------------------------------------------

      const response = await axios.post(
        "http://localhost:5000/api/requests/create",
        {
          ngoEmail: user.email,

          medicineId:
            selectedMedicine._id,

          quantity:
            Number(quantity),
        }
      );


      console.log(
        "Request created:",
        response.data
      );


      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      alert(
        "Medicine request sent successfully!"
      );


      // -----------------------------------------------
      // RESET FORM
      // -----------------------------------------------

      setSelectedMedicine(null);

      setQuantity("");


      // -----------------------------------------------
      // REFRESH REQUESTS
      // -----------------------------------------------

      getMyRequests();

      getAvailableMedicines();


    } catch (error) {

      console.log(
        "Request error:",
        error
      );


      if (error.response) {

        console.log(
          "Backend error:",
          error.response.data
        );


        alert(
          error.response.data.message ||
          error.response.data ||
          "Unable to send medicine request"
        );

      } else {

        alert(
          "Unable to send medicine request"
        );

      }

    } finally {

      setRequesting(false);

    }

  };


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    if (status === "Approved") {

      return "status-approved";

    }


    if (status === "Rejected") {

      return "status-rejected";

    }


    return "status-pending";

  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="request-container">


      {/* =================================================
          AVAILABLE MEDICINES
      ================================================= */}

      <h1>
        Medicine Request 💊
      </h1>


      {/* LOADING */}

      {loading && (

        <p>
          Loading available medicines...
        </p>

      )}


      {/* NO MEDICINES */}

      {!loading &&
        medicines.length === 0 && (

          <p>
            No approved medicines are currently available.
          </p>

        )}


      {/* AVAILABLE MEDICINES TABLE */}

      {!loading &&
        medicines.length > 0 && (

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
                  Available Stock
                </th>

                <th>
                  Expiry Date
                </th>

                <th>
                  Action
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

                    {new Date(
                      medicine.expiryDate
                    ).toLocaleDateString(
                      "en-GB"
                    )}

                  </td>


                  <td>

                    <button
                      className="accept"
                      onClick={() =>
                        handleSelectMedicine(
                          medicine
                        )
                      }
                    >
                      Request
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}


      {/* =================================================
          REQUEST FORM
      ================================================= */}

      {selectedMedicine && (

        <div className="request-form-box">

          <h2>
            Request Medicine
          </h2>


          <p>

            <strong>
              Medicine:
            </strong>{" "}

            {selectedMedicine.medicineName}

          </p>


          <p>

            <strong>
              Available Stock:
            </strong>{" "}

            {selectedMedicine.quantity}

          </p>


          <form
            onSubmit={handleRequest}
          >

            <label>
              Enter Required Quantity
            </label>


            <input
              type="number"
              min="1"
              max={selectedMedicine.quantity}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Enter quantity"
              required
            />


            <div className="request-buttons">

              <button
                type="submit"
                className="accept"
                disabled={requesting}
              >

                {requesting
                  ? "Sending..."
                  : "Request Medicine"}

              </button>


              <button
                type="button"
                className="reject"
                onClick={() => {

                  setSelectedMedicine(
                    null
                  );

                  setQuantity("");

                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =================================================
          MY REQUESTS
      ================================================= */}

      <div className="my-requests-section">

        <h2>
          My Medicine Requests 📋
        </h2>


        {myRequests.length === 0 ? (

          <p>
            You have not requested any medicines yet.
          </p>

        ) : (

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
                  Status
                </th>

                <th>
                  Request Date
                </th>

              </tr>

            </thead>


            <tbody>

              {myRequests.map((request) => (

                <tr
                  key={request._id}
                >

                  <td>
                    {request.medicineName}
                  </td>


                  <td>
                    {request.quantity}
                  </td>


                  <td>

                    <span
                      className={getStatusClass(
                        request.status
                      )}
                    >
                      {request.status}
                    </span>

                  </td>


                  <td>

                    {new Date(
                      request.createdAt
                    ).toLocaleDateString(
                      "en-GB"
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>


    </div>

  );

}


export default MedicineRequest;