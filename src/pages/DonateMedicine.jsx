import React, { useState } from "react";
import axios from "axios";
import "../css/DonateMedicine.css";

function DonateMedicine() {

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    medicineName: "",
    medicineType: "Tablet",
    quantity: "",
    expiryDate: "",
    manufacturer: "",
    description: "",
    image: null,
  });


  // =====================================================
  // SUBMIT LOADING
  // =====================================================

  const [isSubmitting, setIsSubmitting] = useState(false);


  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {

    try {

      // Check localStorage first
      const localUser = localStorage.getItem("user");

      if (localUser) {
        return JSON.parse(localUser);
      }


      // Check sessionStorage
      const sessionUser = sessionStorage.getItem("user");

      if (sessionUser) {
        return JSON.parse(sessionUser);
      }


      return null;

    } catch (error) {

      console.error(
        "Error reading logged-in user:",
        error
      );

      return null;

    }

  };


  // =====================================================
  // FORM INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      files
    } = e.target;


    // ===================================================
    // IMAGE INPUT
    // ===================================================

    if (name === "image") {

      const selectedFile =
        files && files.length > 0
          ? files[0]
          : null;


      // No image selected
      if (!selectedFile) {
        return;
      }


      // =================================================
      // ALLOWED IMAGE TYPES
      // =================================================

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
      ];


      if (
        !allowedTypes.includes(
          selectedFile.type
        )
      ) {

        alert(
          "Please select JPG, JPEG, PNG or WEBP image."
        );

        e.target.value = "";

        return;

      }


      // =================================================
      // IMAGE SIZE - MAX 5 MB
      // =================================================

      const maxSize =
        5 * 1024 * 1024;


      if (
        selectedFile.size > maxSize
      ) {

        alert(
          "Image size should be less than 5 MB."
        );

        e.target.value = "";

        return;

      }


      // =================================================
      // SAVE IMAGE
      // =================================================

      setFormData((previousData) => ({
        ...previousData,
        image: selectedFile
      }));


      return;

    }


    // ===================================================
    // NORMAL INPUT
    // ===================================================

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

  };


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {

    setFormData((previousData) => ({
      ...previousData,
      image: null
    }));


    const fileInput =
      document.getElementById("image");


    if (fileInput) {
      fileInput.value = "";
    }

  };


  // =====================================================
  // FORM SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // =================================================
    // GET CURRENT USER
    // =================================================

    const user =
      getLoggedInUser();


    console.log(
      "Logged-in user:",
      user
    );


    // =================================================
    // CHECK LOGIN
    // =================================================

    if (!user) {

      alert(
        "Please login first."
      );

      return;

    }


    // =================================================
    // CHECK USER EMAIL
    // =================================================

    if (
      !user.email ||
      typeof user.email !== "string"
    ) {

      alert(
        "User email not found. Please login again."
      );

      return;

    }


    // =================================================
    // CHECK DONOR ROLE
    // =================================================

    if (
      user.role &&
      user.role.toLowerCase() !== "donor"
    ) {

      alert(
        "Only Donors can donate medicine."
      );

      return;

    }


    // =================================================
    // CHECK MEDICINE NAME
    // =================================================

    if (
      !formData.medicineName.trim()
    ) {

      alert(
        "Please enter medicine name."
      );

      return;

    }


    // =================================================
    // CHECK QUANTITY
    // =================================================

    if (
      !formData.quantity ||
      Number(formData.quantity) <= 0
    ) {

      alert(
        "Please enter a valid quantity."
      );

      return;

    }


    // =================================================
    // CHECK EXPIRY DATE
    // =================================================

    if (!formData.expiryDate) {

      alert(
        "Please select expiry date."
      );

      return;

    }


    // =================================================
    // CHECK MANUFACTURER
    // =================================================

    if (
      !formData.manufacturer.trim()
    ) {

      alert(
        "Please enter manufacturer name."
      );

      return;

    }


    // =================================================
    // CHECK IMAGE
    // =================================================

    if (!formData.image) {

      alert(
        "Please upload medicine image."
      );

      return;

    }


    try {

      setIsSubmitting(true);


      // =================================================
      // CREATE FORMDATA
      // =================================================

      const data =
        new FormData();


      // =================================================
      // MEDICINE NAME
      // =================================================

      data.append(
        "medicineName",
        formData.medicineName.trim()
      );


      // =================================================
      // MEDICINE TYPE
      // =================================================

      data.append(
        "medicineType",
        formData.medicineType
      );


      // =================================================
      // QUANTITY
      // =================================================

      data.append(
        "quantity",
        formData.quantity
      );


      // =================================================
      // EXPIRY DATE
      // =================================================

      data.append(
        "expiryDate",
        formData.expiryDate
      );


      // =================================================
      // MANUFACTURER
      // =================================================

      data.append(
        "manufacturer",
        formData.manufacturer.trim()
      );


      // =================================================
      // DESCRIPTION
      // =================================================

      data.append(
        "description",
        formData.description.trim()
      );


      // =================================================
      // DONOR EMAIL
      // =================================================

      data.append(
        "donorEmail",
        user.email.trim()
      );


      // =================================================
      // DONOR NAME
      // =================================================

      if (user.name) {

        data.append(
          "donorName",
          user.name
        );

      }


      // =================================================
      // MEDICINE IMAGE
      // =================================================

      data.append(
        "image",
        formData.image
      );


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "========== DONATION DATA =========="
      );

      console.log(
        "Donor Name:",
        user.name
      );

      console.log(
        "Donor Email:",
        user.email
      );

      console.log(
        "Donor Role:",
        user.role
      );

      console.log(
        "Medicine Name:",
        formData.medicineName
      );

      console.log(
        "Medicine Type:",
        formData.medicineType
      );

      console.log(
        "Quantity:",
        formData.quantity
      );

      console.log(
        "Expiry Date:",
        formData.expiryDate
      );

      console.log(
        "Manufacturer:",
        formData.manufacturer
      );

      console.log(
        "Image:",
        formData.image
      );

      console.log(
        "==================================="
      );


      // =================================================
      // SEND TO BACKEND
      // =================================================

      const response =
        await axios.post(

          "http://localhost:5000/api/medicines/donate",

          data

        );


      // =================================================
      // BACKEND RESPONSE
      // =================================================

      console.log(
        "Donation response:",
        response.data
      );


      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Medicine donated successfully! Waiting for admin verification."
      );


      // =================================================
      // RESET FORM
      // =================================================

      setFormData({

        medicineName: "",
        medicineType: "Tablet",
        quantity: "",
        expiryDate: "",
        manufacturer: "",
        description: "",
        image: null

      });


      // =================================================
      // CLEAR IMAGE INPUT
      // =================================================

      const fileInput =
        document.getElementById("image");


      if (fileInput) {
        fileInput.value = "";
      }


    } catch (error) {

      console.error(
        "Donation error:",
        error
      );


      // =================================================
      // BACKEND ERROR
      // =================================================

      if (error.response) {

        console.error(
          "Backend error:",
          error.response.data
        );


        alert(
          error.response.data?.message ||
          "Donation failed."
        );

      }


      // =================================================
      // SERVER CONNECTION ERROR
      // =================================================

      else if (error.request) {

        alert(
          "Server se connection nahi ho raha. Please check whether backend server is running."
        );

      }


      // =================================================
      // OTHER ERROR
      // =================================================

      else {

        alert(
          "Something went wrong. Please try again."
        );

      }

    } finally {

      setIsSubmitting(false);

    }

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="donate-page">

      <form
        className="donate-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <h1>
          Donate Medicine 💊
        </h1>


        {/* =================================================
            MEDICINE NAME
        ================================================= */}

        <div className="form-group">

          <label htmlFor="medicineName">
            Medicine Name
          </label>

          <input
            type="text"
            id="medicineName"
            name="medicineName"
            placeholder="Enter medicine name"
            value={formData.medicineName}
            onChange={handleChange}
            required
          />

        </div>


        {/* =================================================
            MEDICINE TYPE
        ================================================= */}

        <div className="form-group">

          <label htmlFor="medicineType">
            Medicine Type
          </label>

          <select
            id="medicineType"
            name="medicineType"
            value={formData.medicineType}
            onChange={handleChange}
            required
          >

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

            <option value="Cream">
              Cream
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>


        {/* =================================================
            QUANTITY
        ================================================= */}

        <div className="form-group">

          <label htmlFor="quantity">
            Quantity
          </label>

          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Enter quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
          />

        </div>


        {/* =================================================
            EXPIRY DATE
        ================================================= */}

        <div className="form-group">

          <label htmlFor="expiryDate">
            Expiry Date
          </label>

          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />

        </div>


        {/* =================================================
            MANUFACTURER
        ================================================= */}

        <div className="form-group">

          <label htmlFor="manufacturer">
            Manufacturer
          </label>

          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            placeholder="Company Name"
            value={formData.manufacturer}
            onChange={handleChange}
            required
          />

        </div>


        {/* =================================================
            MEDICINE IMAGE
        ================================================= */}

        <div className="form-group">

          <label htmlFor="image">
            Upload Medicine Image
          </label>


          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            required
          />


          <small>
            JPG, JPEG, PNG or WEBP • Maximum 5 MB
          </small>


          {/* =================================================
              IMAGE PREVIEW
          ================================================= */}

          {formData.image && (

            <div
              style={{
                marginTop: "15px",
                textAlign: "center"
              }}
            >

              <img
                src={URL.createObjectURL(
                  formData.image
                )}
                alt="Medicine Preview"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  border: "2px solid #ddd"
                }}
              />


              <p
                style={{
                  marginTop: "8px",
                  fontSize: "14px"
                }}
              >
                {formData.image.name}
              </p>


              <p
                style={{
                  fontSize: "12px",
                  color: "#666"
                }}
              >

                {(
                  formData.image.size /
                  (1024 * 1024)
                ).toFixed(2)}{" "}
                MB

              </p>


              <button
                type="button"
                onClick={removeImage}
                disabled={isSubmitting}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Remove Image
              </button>

            </div>

          )}

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="form-group">

          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            placeholder="Write something about the medicine..."
            value={formData.description}
            onChange={handleChange}
          />

        </div>


        {/* =================================================
            SUBMIT BUTTON
        ================================================= */}

        <button
          type="submit"
          className="donate-button"
          disabled={isSubmitting}
        >

          {isSubmitting
            ? "Uploading Medicine..."
            : "Donate Medicine"}

        </button>

      </form>

    </div>

  );

}


export default DonateMedicine;