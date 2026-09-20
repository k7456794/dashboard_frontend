
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({
  onMenuClick,
  onLogout,
  isAuthenticated,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  const navigate = useNavigate();

  // ==========================================
  // LOAD ADMIN DATA
  // ==========================================
  useEffect(() => {
    const loadAdminData = () => {
      try {
        const savedAdmin = localStorage.getItem("admin");

        if (savedAdmin) {
          setAdmin(JSON.parse(savedAdmin));
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error("Failed to load admin data:", error);
        setAdmin(null);
      }
    };

    // Load admin information when Navbar starts.
    loadAdminData();

    // Listen for profile updates from Profile.jsx.
    // This makes the Navbar update immediately after
    // the user changes or removes their profile picture.
    const handleProfileUpdate = () => {
      loadAdminData();
    };

    window.addEventListener(
      "admin-profile-updated",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "admin-profile-updated",
        handleProfileUpdate
      );
    };
  }, [isAuthenticated]);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    // Let App.jsx remove the token/admin data
    // and update the authentication state.
    onLogout();

    // Clear local Navbar admin state.
    setAdmin(null);

    // Close dropdown.
    setIsOpen(false);

    // Return to public Dashboard.
    navigate("/");
  };

  // ==========================================
  // ADMIN INITIAL
  // ==========================================
  const adminInitial =
    admin?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="navbar">
      {/* =====================================
          MOBILE MENU BUTTON
      ====================================== */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* =====================================
          NAVBAR TITLE
      ====================================== */}
      <div className="navbar-title">
        <h1>Dashboard</h1>
        <p>Welcome back!</p>
      </div>

      {/* =====================================
          LOGGED OUT
      ====================================== */}
      {!isAuthenticated && (
        <div className="navbar-auth-buttons">
          {/* Login */}
          <button
            type="button"
            className="navbar-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          {/* Sign Up */}
          <button
            type="button"
            className="navbar-register-btn"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* =====================================
          LOGGED IN
      ====================================== */}
      {isAuthenticated && (
        <div className="navbar-user">
          {/* Admin button */}
          <button
            type="button"
            className="admin-button"
            onClick={() =>
              setIsOpen((previousState) => !previousState)
            }
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            {/* Profile picture */}
            {admin?.profilePicture ? (
              <img
                src={admin.profilePicture}
                alt={admin.name || "Admin"}
                className="navbar-admin-avatar"
              />
            ) : (
              <span className="navbar-admin-avatar navbar-admin-avatar-fallback">
                {adminInitial}
              </span>
            )}

            {/* Admin name */}
            <span>
              {admin?.name || "Admin"}
            </span>

            {/* Dropdown arrow */}
            <span
              className={`admin-arrow ${
                isOpen ? "open" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {/* =====================================
              ADMIN DROPDOWN
          ====================================== */}
          {isOpen && (
            <div className="admin-dropdown">
              {/* Profile */}
              <button
                type="button"
                onClick={() => {
                  navigate("/profile");
                  setIsOpen(false);
                }}
              >
                👤 Profile
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  navigate("/settings");
                  setIsOpen(false);
                }}
              >
                ⚙️ Settings
              </button>

              {/* Logout */}
              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;

