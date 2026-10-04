import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/ProfileManagement.css";

function ProfileManagement() {

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    profilePhoto: "",
  });


  // =====================================================
  // PHOTO STATE
  // =====================================================

  const [selectedPhoto, setSelectedPhoto] =
    useState(null);

  const [previewPhoto, setPreviewPhoto] =
    useState("");


  // =====================================================
  // OTHER STATES
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {

    try {

      // First check localStorage
      let storedUser =
        localStorage.getItem("user");


      // If not found, check sessionStorage
      if (!storedUser) {

        storedUser =
          sessionStorage.getItem("user");

      }


      if (!storedUser) {

        console.log(
          "No logged-in user found in storage"
        );

        return null;

      }


      const user =
        JSON.parse(storedUser);


      console.log(
        "Logged-in user:",
        user
      );


      return user;

    } catch (error) {

      console.log(
        "Error reading user:",
        error
      );

      return null;

    }

  };


  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = (user) => {

    if (!user) {
      return null;
    }

    return user.id || user._id || null;

  };


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    const user =
      getLoggedInUser();


    if (!user) {

      setLoading(false);

      return;

    }


    const userId =
      getUserId(user);


    if (!userId) {

      console.log(
        "User ID not found:",
        user
      );

      setLoading(false);

      return;

    }


    fetchProfile(userId);

  }, []);


  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile =
    async (userId) => {

      try {

        console.log(
          "Fetching profile for:",
          userId
        );


        const response =
          await axios.get(
            `http://localhost:5000/api/auth/profile/${userId}`
          );


        console.log(
          "Profile response:",
          response.data
        );


        const data =
          response.data;


        setProfile({

          name:
            data.name || "",

          email:
            data.email || "",

          role:
            data.role || "",

          phone:
            data.phone || "",

          address:
            data.address || "",

          profilePhoto:
            data.profilePhoto || "",

        });


        // =================================================
        // PROFILE PHOTO
        // =================================================

        if (data.profilePhoto) {

          setPreviewPhoto(
            `http://localhost:5000${data.profilePhoto}`
          );

        } else {

          setPreviewPhoto("");

        }


      } catch (error) {

        console.log(
          "Error fetching profile:",
          error
        );


        console.log(
          "Backend response:",
          error.response?.data
        );

      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // HANDLE TEXT INPUT
  // =====================================================

  const handleChange =
    (e) => {

      const {
        name,
        value
      } = e.target;


      setProfile(
        previousProfile => ({

          ...previousProfile,

          [name]:
            value,

        })
      );

    };


  // =====================================================
  // HANDLE PROFILE PHOTO
  // =====================================================

  const handlePhotoChange =
    (e) => {

      const file =
        e.target.files?.[0];


      if (!file) {

        return;

      }


      // =================================================
      // ALLOWED IMAGE TYPES
      // =================================================

      const allowedTypes = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",

      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        alert(
          "Please select JPG, JPEG, PNG or WEBP image."
        );

        e.target.value = "";

        return;

      }


      // =================================================
      // IMAGE SIZE
      // =================================================

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        alert(
          "Profile photo must be less than 5MB."
        );

        e.target.value = "";

        return;

      }


      // =================================================
      // SAVE SELECTED PHOTO
      // =================================================

      setSelectedPhoto(file);


      // =================================================
      // CREATE PREVIEW
      // =================================================

      const imageUrl =
        URL.createObjectURL(file);


      setPreviewPhoto(
        imageUrl
      );

    };


  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      // =================================================
      // GET USER
      // =================================================

      const user =
        getLoggedInUser();


      if (!user) {

        alert(
          "User not logged in. Please login again."
        );

        return;

      }


      // =================================================
      // GET USER ID
      // =================================================

      const userId =
        getUserId(user);


      if (!userId) {

        alert(
          "User ID not found. Please login again."
        );

        console.log(
          "Stored user:",
          user
        );

        return;

      }


      try {

        setSaving(true);


        // =================================================
        // CREATE FORMDATA
        // =================================================

        const data =
          new FormData();


        data.append(
          "name",
          profile.name.trim()
        );


        data.append(
          "phone",
          profile.phone.trim()
        );


        data.append(
          "address",
          profile.address.trim()
        );


        // =================================================
        // ADD PROFILE PHOTO
        // =================================================

        if (selectedPhoto) {

          data.append(
            "profilePhoto",
            selectedPhoto
          );

        }


        // =================================================
        // DEBUG
        // =================================================

        console.log(
          "Updating profile..."
        );

        console.log(
          "User ID:",
          userId
        );

        console.log(
          "Name:",
          profile.name
        );

        console.log(
          "Phone:",
          profile.phone
        );

        console.log(
          "Address:",
          profile.address
        );

        console.log(
          "Photo:",
          selectedPhoto
        );


        // =================================================
        // SEND REQUEST
        // =================================================

        const response =
          await axios.put(

            `http://localhost:5000/api/auth/profile/${userId}`,

            data

          );


        console.log(
          "Profile updated:",
          response.data
        );


        // =================================================
        // UPDATED USER
        // =================================================

        const updatedUser =
          response.data.user;


        // =================================================
        // UPDATE PROFILE STATE
        // =================================================

        setProfile({

          name:
            updatedUser.name || "",

          email:
            updatedUser.email || "",

          role:
            updatedUser.role || "",

          phone:
            updatedUser.phone || "",

          address:
            updatedUser.address || "",

          profilePhoto:
            updatedUser.profilePhoto || "",

        });


        // =================================================
        // UPDATE PHOTO PREVIEW
        // =================================================

        if (
          updatedUser.profilePhoto
        ) {

          setPreviewPhoto(
            `http://localhost:5000${updatedUser.profilePhoto}`
          );

        }


        // =================================================
        // IMPORTANT:
        // KEEP USER ID IN STORAGE
        // =================================================

        const userForStorage = {

          id:
            updatedUser.id ||
            updatedUser._id ||
            userId,

          name:
            updatedUser.name || "",

          email:
            updatedUser.email ||
            user.email ||
            "",

          role:
            updatedUser.role ||
            user.role ||
            "",

          phone:
            updatedUser.phone || "",

          address:
            updatedUser.address || "",

          profilePhoto:
            updatedUser.profilePhoto || "",

        };


        // =================================================
        // UPDATE LOCAL STORAGE
        // =================================================

        if (
          localStorage.getItem("user")
        ) {

          localStorage.setItem(
            "user",
            JSON.stringify(
              userForStorage
            )
          );

        }


        // =================================================
        // UPDATE SESSION STORAGE
        // =================================================

        if (
          sessionStorage.getItem("user")
        ) {

          sessionStorage.setItem(
            "user",
            JSON.stringify(
              userForStorage
            )
          );

        }


        // =================================================
        // CLEAR SELECTED PHOTO
        // =================================================

        setSelectedPhoto(null);


        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        setMessage(
          "Profile updated successfully! ✅"
        );


        setTimeout(() => {

          setMessage("");

        }, 3000);


      } catch (error) {

        console.log(
          "Error updating profile:",
          error
        );


        console.log(
          "Backend error:",
          error.response?.data
        );


        setMessage(

          error.response?.data?.message ||

          error.response?.data ||

          "Failed to update profile."

        );

      } finally {

        setSaving(false);

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="profile-container">

        <h2>
          Loading Profile...
        </h2>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="profile-container">

      <div className="profile-card">


        {/* =================================================
            PROFILE IMAGE
        ================================================= */}

        <div className="profile-image">

          <img

            src={
              previewPhoto ||
              "https://via.placeholder.com/120"
            }

            alt="Profile"

          />

        </div>


        {/* =================================================
            NAME
        ================================================= */}

        <h2>

          {profile.name ||
            "User"}

        </h2>


        {/* =================================================
            ROLE
        ================================================= */}

        <p className="role">

          {profile.role}

        </p>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <p className="profile-message">

            {message}

          </p>

        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form

          className="profile-form"

          onSubmit={
            handleSubmit
          }

        >


          {/* NAME */}

          <div className="input-group">

            <label>
              Full Name
            </label>

            <input

              type="text"

              name="name"

              value={
                profile.name
              }

              onChange={
                handleChange
              }

              placeholder="Enter your name"

              required

            />

          </div>


          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email
            </label>

            <input

              type="email"

              name="email"

              value={
                profile.email
              }

              disabled

            />

          </div>


          {/* PHONE */}

          <div className="input-group">

            <label>
              Phone Number
            </label>

            <input

              type="text"

              name="phone"

              value={
                profile.phone
              }

              onChange={
                handleChange
              }

              placeholder="Enter phone number"

            />

          </div>


          {/* ADDRESS */}

          <div className="input-group">

            <label>
              Address
            </label>

            <textarea

              name="address"

              rows="3"

              value={
                profile.address
              }

              onChange={
                handleChange
              }

              placeholder="Enter address"

            ></textarea>

          </div>


          {/* PROFILE PHOTO */}

          <div className="input-group">

            <label>
              Change Profile Photo
            </label>

            <input

              type="file"

              accept="image/jpeg,image/jpg,image/png,image/webp"

              onChange={
                handlePhotoChange
              }

            />

            <small>

              JPG, JPEG, PNG or WEBP • Maximum 5 MB

            </small>

          </div>


          {/* UPDATE BUTTON */}

          <button

            type="submit"

            disabled={saving}

          >

            {saving

              ? "Updating Profile..."

              : "Update Profile"

            }

          </button>


        </form>

      </div>

    </div>

  );

}


export default ProfileManagement;