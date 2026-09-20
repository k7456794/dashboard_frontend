
import { useEffect, useRef, useState } from "react";

const API_URL = "https://dashboard-backend-pro.up.railway.app/api/auth";

function Profile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  // Hidden file input.
  const fileInputRef = useRef(null);

  // ==========================================
  // FETCH ADMIN PROFILE
  // ==========================================
  const fetchAdmin = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch profile."
        );
      }

      // Save the profile received from MongoDB.
      setAdmin(data);

      // Keep localStorage synchronized with the database.
      localStorage.setItem("admin", JSON.stringify(data));

      // Tell Navbar and other components that
      // the admin information has been refreshed.
      window.dispatchEvent(
        new Event("admin-profile-updated")
      );
    } catch (err) {
      console.error("Profile error:", err);

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD PROFILE
  // ==========================================
  useEffect(() => {
    fetchAdmin();
  }, []);

  // ==========================================
  // OPEN FILE SELECTOR
  // ==========================================
  const handleChoosePicture = () => {
    setError("");
    setSuccess("");

    fileInputRef.current?.click();
  };

  // ==========================================
  // RESIZE IMAGE
  // ==========================================
  // Resizing before upload keeps the Base64 image
  // small enough for the API and MongoDB.
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");

          const MAX_SIZE = 500;

          let width = image.width;
          let height = image.height;

          // Keep the original aspect ratio.
          if (
            width > MAX_SIZE ||
            height > MAX_SIZE
          ) {
            if (width > height) {
              height = (height / width) * MAX_SIZE;
              width = MAX_SIZE;
            } else {
              width = (width / height) * MAX_SIZE;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(
              new Error("Unable to process the image.")
            );
            return;
          }

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          // Convert to JPEG to reduce the stored size.
          const compressedImage = canvas.toDataURL(
            "image/jpeg",
            0.85
          );

          resolve(compressedImage);
        };

        image.onerror = () => {
          reject(
            new Error("Unable to read the image.")
          );
        };

        image.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error("Unable to process the image.")
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // ==========================================
  // HANDLE FILE SELECT
  // ==========================================
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // Allow common image formats.
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    // Maximum original-file size.
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      // Resize before uploading.
      const compressedImage =
        await resizeImage(file);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      // Send image to backend.
      const response = await fetch(
        `${API_URL}/profile-picture`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profilePicture: compressedImage,
          }),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile picture."
        );
      }

      // Backend returns the updated admin.
      setAdmin(data.admin);

      // Store the updated admin locally.
      localStorage.setItem(
        "admin",
        JSON.stringify(data.admin)
      );

      // IMPORTANT:
      // Tell Navbar and Sidebar to update immediately.
      window.dispatchEvent(
        new Event("admin-profile-updated")
      );

      setSuccess(
        "Profile picture updated successfully."
      );
    } catch (err) {
      console.error(
        "Upload profile picture error:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile picture."
      );
    } finally {
      setUploading(false);

      // Allows selecting the same file again.
      event.target.value = "";
    }
  };

  // ==========================================
  // REMOVE PROFILE PICTURE
  // ==========================================
  const handleRemovePicture = async () => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmRemove) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_URL}/profile-picture`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profilePicture: "",
          }),
        }
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove profile picture."
        );
      }

      // Update Profile immediately.
      setAdmin(data.admin);

      // Update localStorage.
      localStorage.setItem(
        "admin",
        JSON.stringify(data.admin)
      );

      // IMPORTANT:
      // Update Navbar and Sidebar immediately.
      window.dispatchEvent(
        new Event("admin-profile-updated")
      );

      setSuccess("Profile picture removed.");
    } catch (err) {
      console.error(
        "Remove profile picture error:",
        err
      );

      setError(
        err.message ||
          "Failed to remove profile picture."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <section className="page-content profile-page">
        <div className="empty-table">
          <p>Loading profile...</p>
        </div>
      </section>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (error && !admin) {
    return (
      <section className="page-content profile-page">
        <div className="error-message">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="page-content profile-page">

      {/* ======================================
          HEADER
      ======================================= */}
      <div className="profile-page-header">
        <div>
          <h2>Admin Profile</h2>

          <p>
            View and manage your administrator
            information.
          </p>
        </div>
      </div>

      {/* ======================================
          MESSAGES
      ======================================= */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message profile-success">
          {success}
        </div>
      )}

      {/* ======================================
          PROFILE CARD
      ======================================= */}
      <div className="profile-card">

        {/* ====================================
            PROFILE PICTURE
        ===================================== */}
        <div className="profile-picture-section">

          <button
            type="button"
            className="profile-avatar-button"
            onClick={handleChoosePicture}
            disabled={uploading}
            aria-label="Change profile picture"
          >
            {admin?.profilePicture ? (
              <img
                src={admin.profilePicture}
                alt={
                  admin?.name || "Admin profile"
                }
                className="profile-avatar-image"
              />
            ) : (
              <span className="profile-avatar">
                {admin?.name
                  ? admin.name
                      .charAt(0)
                      .toUpperCase()
                  : "A"}
              </span>
            )}

            <span className="profile-picture-overlay">
              {uploading ? "Saving..." : "Change"}
            </span>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="profile-picture-input"
          />

          <div className="profile-picture-actions">

            <button
              type="button"
              className="profile-picture-change-btn"
              onClick={handleChoosePicture}
              disabled={uploading}
            >
              {uploading
                ? "Saving..."
                : "Change Picture"}
            </button>

            {admin?.profilePicture && (
              <button
                type="button"
                className="profile-picture-remove-btn"
                onClick={handleRemovePicture}
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>

          <p className="profile-picture-help">
            JPG, PNG or WebP. Maximum 5 MB.
          </p>
        </div>

        {/* ====================================
            PROFILE INFORMATION
        ===================================== */}
        <div className="profile-info">

          <h3>
            {admin?.name || "Admin"}
          </h3>

          <p className="profile-role">
            {admin?.role || "Administrator"}
          </p>

          <div className="profile-details">

            {/* Name */}
            <div className="profile-detail-item">
              <span>Name</span>

              <strong>
                {admin?.name || "—"}
              </strong>
            </div>

            {/* Email */}
            <div className="profile-detail-item">
              <span>Email</span>

              <strong>
                {admin?.email || "—"}
              </strong>
            </div>

            {/* Role */}
            <div className="profile-detail-item">
              <span>Role</span>

              <strong>
                {admin?.role ||
                  "Administrator"}
              </strong>
            </div>

            {/* Status */}
            <div className="profile-detail-item">
              <span>Account Status</span>

              <strong className="active-status">
                {admin?.status || "Active"}
              </strong>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;

