import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/SearchFilter.css";

function SearchFilter() {

  // Medicines MongoDB se aayengi
  const [medicines, setMedicines] = useState([]);

  // Search value
  const [search, setSearch] = useState("");

  // Category filter
  const [category, setCategory] = useState("All");

  // Loading
  const [loading, setLoading] = useState(true);


  // =================================
  // GET MEDICINES FROM BACKEND
  // =================================

  const fetchMedicines = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/medicines/all"
      );

      setMedicines(response.data);

    } catch (error) {

      console.log(
        "Error fetching medicines:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =================================
  // PAGE LOAD
  // =================================

  useEffect(() => {

    fetchMedicines();

  }, []);


  // =================================
  // GET INVENTORY STATUS
  // =================================

  const getStatus = (medicine) => {

    const today = new Date();

    const expiryDate = new Date(
      medicine.expiryDate
    );


    // Expired
    if (expiryDate < today) {

      return "Expired";

    }


    // Out of Stock
    if (medicine.quantity === 0) {

      return "Out of Stock";

    }


    // Low Stock
    if (medicine.quantity <= 10) {

      return "Low Stock";

    }


    // Available
    return "Available";

  };


  // =================================
  // SEARCH + FILTER
  // =================================

  const filteredMedicines = medicines.filter(
    (medicine) => {

      const medicineName =
        medicine.medicineName
          ?.toLowerCase() || "";


      const medicineType =
        medicine.medicineType || "";


      // Search medicine name
      const matchesSearch =
        medicineName.includes(
          search.toLowerCase()
        );


      // Category
      const matchesCategory =
        category === "All" ||
        medicineType === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    }
  );


  return (

    <div className="search-container">


      {/* =================================
          HEADING
      ================================= */}

      <h1>
        Search & Filter Medicine 🔍
      </h1>


      {/* =================================
          FILTERS
      ================================= */}

      <div className="filters">


        {/* Search */}

        <input
          type="text"
          placeholder="Search medicine..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />


        {/* Category */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          <option value="All">
            All Categories
          </option>

          <option value="Tablet">
            Tablet
          </option>

          <option value="Capsule">
            Capsule
          </option>

          <option value="Syrup">
            Syrup
          </option>

          <option value="Injection">
            Injection
          </option>

          <option value="Other">
            Other
          </option>

        </select>


      </div>


      {/* =================================
          LOADING
      ================================= */}

      {loading ? (

        <p>
          Loading medicines...
        </p>

      ) : (


        <table>

          <thead>

            <tr>

              <th>
                Medicine
              </th>

              <th>
                Category
              </th>

              <th>
                Stock
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


            {filteredMedicines.length > 0 ? (

              filteredMedicines.map(
                (medicine) => {

                  const status =
                    getStatus(medicine);


                  return (

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


                      <td
                        className={
                          status === "Available"
                            ? "available"
                            : status === "Low Stock"
                            ? "low"
                            : "out"
                        }
                      >

                        {status}

                      </td>

                    </tr>

                  );

                }

              )

            ) : (

              <tr>

                <td colSpan="5">

                  No medicines found

                </td>

              </tr>

            )}


          </tbody>

        </table>

      )}


    </div>

  );

}


export default SearchFilter;