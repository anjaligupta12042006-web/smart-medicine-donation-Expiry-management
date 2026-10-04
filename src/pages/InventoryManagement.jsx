
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/InventoryManagement.css";

function InventoryManagement() {

  const [medicines, setMedicines] = useState([]);

  // Search value
  const [search, setSearch] = useState("");

  // Selected status
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected medicine for View
  const [selectedMedicine, setSelectedMedicine] = useState(null);


  useEffect(() => {
    fetchMedicines();
  }, []);


  // =====================================================
  // FETCH ACTIVE INVENTORY
  // =====================================================

  const fetchMedicines = async () => {
    try {

      const response = await axios.get(
        "http://localhost:5000/api/medicines/all"
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);


      // Remove expired medicines from visible inventory
      const activeMedicines = response.data.filter((medicine) => {

        const expiryDate = new Date(medicine.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        return expiryDate >= today;
      });


      setMedicines(activeMedicines);

    } catch (error) {

      console.log(
        "Error fetching medicines:",
        error
      );

    }
  };


  // =====================================================
  // CALCULATE INVENTORY STATUS
  // =====================================================

  const getInventoryStatus = (medicine) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(
      medicine.expiryDate
    );

    expiryDate.setHours(0, 0, 0, 0);


    if (expiryDate < today) {
      return "Expired";
    }


    if (Number(medicine.quantity) === 0) {
      return "Out of Stock";
    }


    if (Number(medicine.quantity) <= 10) {
      return "Low Stock";
    }


    return "Available";
  };


  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    if (status === "Available") {
      return "available";
    }

    if (status === "Low Stock") {
      return "low";
    }

    if (status === "Out of Stock") {
      return "out";
    }

    if (status === "Expired") {
      return "out";
    }

    return "";
  };


  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredMedicines = medicines.filter((medicine) => {

    const status = getInventoryStatus(medicine);


    const matchesSearch =
      medicine.medicineName
        .toLowerCase()
        .includes(search.toLowerCase());


    const matchesStatus =
      statusFilter === "All" ||
      status === statusFilter;


    return matchesSearch && matchesStatus;
  });


  return (
    <div className="inventory-container">

      <h1>Inventory Management 💊</h1>


      {/* Search and Filter */}

      <div className="inventory-controls">

        <input
          type="text"
          placeholder="Search medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />


        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >

          <option value="All">
            All Status
          </option>

          <option value="Available">
            Available
          </option>

          <option value="Low Stock">
            Low Stock
          </option>

          <option value="Out of Stock">
            Out of Stock
          </option>

        </select>

      </div>


      {/* Medicine Table */}

      <table>

        <thead>

          <tr>

            <th>Medicine</th>

            <th>Category</th>

            <th>Stock</th>

            <th>Expiry Date</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>


        <tbody>

          {filteredMedicines.length > 0 ? (

            filteredMedicines.map((medicine) => {

              const status =
                getInventoryStatus(medicine);


              return (

                <tr key={medicine._id}>

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
                    ).toLocaleDateString("en-GB")}
                  </td>


                  <td
                    className={
                      getStatusClass(status)
                    }
                  >
                    {status}
                  </td>


                  <td>

                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedMedicine(medicine)
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>

              );

            })

          ) : (

            <tr>

              <td colSpan="6">
                No medicines found
              </td>

            </tr>

          )}

        </tbody>

      </table>


      {/* Medicine Details Popup */}

      {selectedMedicine && (

        <div className="medicine-modal">

          <div className="medicine-modal-content">

            <h2>
              Medicine Details 💊
            </h2>


            <p>
              <strong>
                Medicine Name:
              </strong>{" "}
              {selectedMedicine.medicineName}
            </p>


            <p>
              <strong>
                Medicine Type:
              </strong>{" "}
              {selectedMedicine.medicineType}
            </p>


            <p>
              <strong>
                Quantity:
              </strong>{" "}
              {selectedMedicine.quantity}
            </p>


            <p>
              <strong>
                Expiry Date:
              </strong>{" "}
              {new Date(
                selectedMedicine.expiryDate
              ).toLocaleDateString("en-GB")}
            </p>


            <p>
              <strong>
                Manufacturer:
              </strong>{" "}
              {selectedMedicine.manufacturer}
            </p>


            <p>
              <strong>
                Description:
              </strong>{" "}
              {selectedMedicine.description}
            </p>


            <p>
              <strong>
                Donor Email:
              </strong>{" "}
              {selectedMedicine.donorEmail}
            </p>


            <p>
              <strong>
                Status:
              </strong>{" "}
              {getInventoryStatus(
                selectedMedicine
              )}
            </p>


            <button
              className="close-btn"
              onClick={() =>
                setSelectedMedicine(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


export default InventoryManagement;

