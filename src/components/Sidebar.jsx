
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const [admin, setAdmin] = useState(null);

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
        console.error(
          "Failed to load admin data:",
          error
        );
        setAdmin(null);
      }
    };

    // Load current admin data when Sidebar mounts.
    loadAdminData();

    // Listen for profile picture/name updates.
    // Profile.jsx sends this event after updating
    // the admin information.
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
  }, []);

  // ==========================================
  // ADMIN INITIAL
  // ==========================================
  const adminInitial =
    admin?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <>
      {/* ======================================
          MOBILE OVERLAY
      ======================================= */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}

      {/* ======================================
          SIDEBAR
      ======================================= */}
      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* ====================================
            SIDEBAR HEADER
        ===================================== */}
        <div className="sidebar-logo">

          {/* Admin profile picture */}
          <div className="sidebar-profile-avatar">
            {admin?.profilePicture ? (
              <img
                src={admin.profilePicture}
                alt={admin?.name || "Admin"}
                className="sidebar-profile-image"
              />
            ) : (
              <span className="sidebar-profile-fallback">
                {adminInitial}
              </span>
            )}
          </div>

          <div>
            <h2>AdminPanel</h2>
            <span>Management System</span>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* ====================================
            NAVIGATION
        ===================================== */}
        <nav className="sidebar-nav">

          <p className="nav-title">
            MAIN MENU
          </p>

          <NavLink
            to="/"
            end
            onClick={onClose}
          >
            <span>📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/orders"
            onClick={onClose}
          >
            <span>🛒</span>
            Orders
          </NavLink>

          <NavLink
            to="/customers"
            onClick={onClose}
          >
            <span>👥</span>
            Customers
          </NavLink>

          <NavLink
            to="/products"
            onClick={onClose}
          >
            <span>📦</span>
            Products
          </NavLink>

          <NavLink
            to="/analytics"
            onClick={onClose}
          >
            <span>📈</span>
            Analytics
          </NavLink>

          <p className="nav-title">
            ADMIN
          </p>

          <NavLink
            to="/profile"
            onClick={onClose}
          >
            <span>👤</span>
            Profile
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onClose}
          >
            <span>⚙️</span>
            Settings
          </NavLink>
        </nav>

        {/* ====================================
            SIDEBAR FOOTER
        ===================================== */}
        <div className="sidebar-footer">
          <span>Admin Dashboard</span>
          <small>v1.0.0</small>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
