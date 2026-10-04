import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/MyDonation.css";

function MyDonations() {

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {

    try {

      const localUser =
        localStorage.getItem("user");

      if (localUser) {
        return JSON.parse(localUser);
      }

      const sessionUser =
        sessionStorage.getItem("user");

      if (sessionUser) {
        return JSON.parse(sessionUser);
      }

      return null;

    } catch (error) {

      console.error(
        "User data error:",
        error
      );

      return null;

    }

  };


  // =====================================================
  // GET MY DONATIONS
  // =====================================================

  useEffect(() => {

    const getDonations = async () => {

      try {

        setLoading(true);
        setError("");

        const user =
          getLoggedInUser();

        console.log(
          "Logged-in user:",
          user
        );


        // ===============================================
        // CHECK USER
        // ===============================================

        if (!user) {

          setError(
            "User is not logged in."
          );

          return;

        }


        // ===============================================
        // CHECK EMAIL
        // ===============================================

        if (!user.email) {

          setError(
            "User email not found. Please login again."
          );

          return;

        }


        console.log(
          "Fetching donations for:",
          user.email
        );


        // ===============================================
        // API CALL
        // ===============================================

        const response =
          await axios.get(

            `http://localhost:5000/api/medicines/my-donations/${encodeURIComponent(
              user.email
            )}`

          );


        console.log(
          "My donations response:",
          response.data
        );


        // ===============================================
        // SET DATA
        // ===============================================

        if (Array.isArray(response.data)) {

          setDonations(
            response.data
          );

        } else {

          setDonations([]);

        }

      } catch (error) {

        console.error(
          "My donations error:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        setError(
          error.response?.data?.message ||
          "Unable to load donations."
        );

      } finally {

        setLoading(false);

      }

    };


    getDonations();

  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="my-donations">

        <h1>
          My Donations 💊
        </h1>

        <p>
          Loading donations...
        </p>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="my-donations">

        <h1>
          My Donations 💊
        </h1>

        <p>
          {error}
        </p>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="my-donations">

      <h1>
        My Donations 💊
      </h1>


      {/* =================================================
          NO DONATIONS
      ================================================= */}

      {donations.length === 0 ? (

        <p>
          No donations found.
        </p>

      ) : (

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
                Expiry Date
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
                  key={
                    donation._id
                  }
                >

                  <td>
                    {donation.medicineName}
                  </td>


                  <td>
                    {donation.medicineType}
                  </td>


                  <td>
                    {donation.quantity}
                  </td>


                  <td>

                    {donation.expiryDate
                      ? new Date(
                          donation.expiryDate
                        ).toLocaleDateString(
                          "en-GB"
                        )
                      : "N/A"}

                  </td>


                  <td
                    className={
                      donation.status ===
                      "Approved"
                        ? "approved"
                        : donation.status ===
                          "Rejected"
                        ? "rejected"
                        : "pending"
                    }
                  >

                    {donation.status}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      )}

    </div>

  );

}

export default MyDonations;