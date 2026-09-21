
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = `${ import.meta.env.API_URL}api/auth`;

const DEFAULT_SETTINGS = {
  notifications: true,
  emailAlerts: true,
  compactMode: false,
  language: "English",
};

function Settings() {
  const navigate = useNavigate();

  // ==========================================
  // ADMIN DATA
  // ==========================================
  const [admin, setAdmin] = useState(null);

  // ==========================================
  // SETTINGS STATE
  // ==========================================
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  // ==========================================
  // MESSAGES
  // ==========================================
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // PASSWORD MODAL
  // ==========================================
  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] =
    useState(false);

  // ==========================================
  // LOAD ADMIN + SETTINGS
  // ==========================================
  useEffect(() => {
    try {
      // Load admin information.
      const savedAdmin =
        localStorage.getItem("admin");

      if (savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
      }

      // Load saved dashboard settings.
      const savedSettings =
        localStorage.getItem(
          "dashboardSettings"
        );

      if (savedSettings) {
        const parsedSettings =
          JSON.parse(savedSettings);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
        });
      }
    } catch (loadError) {
      console.error(
        "Failed to load settings:",
        loadError
      );

      setError(
        "Unable to load your saved settings."
      );
    }
  }, []);

  // ==========================================
  // APPLY COMPACT MODE
  // ==========================================
  useEffect(() => {
    // Adding a class to the body allows the CSS
    // to change spacing across the dashboard.
    document.body.classList.toggle(
      "compact-mode",
      settings.compactMode
    );

    return () => {
      document.body.classList.remove(
        "compact-mode"
      );
    };
  }, [settings.compactMode]);

  // ==========================================
  // UPDATE SETTING
  // ==========================================
  const updateSetting = (name, value) => {
    const updatedSettings = {
      ...settings,
      [name]: value,
    };

    setSettings(updatedSettings);

    // Save settings so they survive refresh.
    localStorage.setItem(
      "dashboardSettings",
      JSON.stringify(updatedSettings)
    );

    setError("");
    setSuccess("Settings saved successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 2000);
  };

  // ==========================================
  // RESET SETTINGS
  // ==========================================
  const handleResetSettings = () => {
    const confirmReset = window.confirm(
      "Reset all dashboard preferences to default?"
    );

    if (!confirmReset) {
      return;
    }

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      "dashboardSettings",
      JSON.stringify(DEFAULT_SETTINGS)
    );

    setError("");
    setSuccess(
      "Settings reset to default successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  // ==========================================
  // PASSWORD INPUT
  // ==========================================
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // CLOSE PASSWORD FORM
  // ==========================================
  const handleClosePasswordForm = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordForm(false);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setError("");
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_URL}/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const responseText =
        await response.text();

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
            "Failed to change password."
        );
      }

      // Clear password fields after success.
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);

      setSuccess(
        "Password changed successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (passwordError) {
      console.error(
        "Change password error:",
        passwordError
      );

      setError(
        passwordError.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

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

    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    // Remove dashboard-only settings from the
    // current browser session? No.
    // Preferences are intentionally preserved.

    navigate("/login");
  };

  return (
    <section className="page-content settings-page">

      {/* ======================================
          HEADER
      ======================================= */}
      <div className="settings-page-header">
        <div>
          <h2>Settings</h2>

          <p>
            Manage your dashboard preferences and
            account settings.
          </p>
        </div>
      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ======================================= */}
      {success && (
        <div className="success-message settings-success">
          {success}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ======================================= */}
      {error && (
        <div className="error-message settings-error">
          {error}
        </div>
      )}

      {/* ======================================
          ACCOUNT INFORMATION
      ======================================= */}
      <div className="settings-card">

        <div className="settings-card-header">
          <div>
            <h3>Account Information</h3>

            <p>
              Information about your administrator
              account.
            </p>
          </div>
        </div>

        <div className="settings-account">

          {/* Profile picture */}
          <div className="settings-avatar">
            {admin?.profilePicture ? (
              <img
                src={admin.profilePicture}
                alt={
                  admin?.name || "Admin"
                }
              />
            ) : (
              <span>
                {admin?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "A"}
              </span>
            )}
          </div>

          {/* Admin information */}
          <div className="settings-account-info">

            <h4>
              {admin?.name || "Admin"}
            </h4>

            <p>
              {admin?.email ||
                "No email available"}
            </p>

            <span className="settings-role-badge">
              {admin?.role ||
                "Administrator"}
            </span>

          </div>

          {/* Profile button */}
          <button
            type="button"
            className="settings-secondary-btn"
            onClick={() =>
              navigate("/profile")
            }
          >
            View Profile
          </button>
        </div>
      </div>

      {/* ======================================
          NOTIFICATION SETTINGS
      ======================================= */}
      <div className="settings-card">

        <div className="settings-card-header">
          <div>
            <h3>Notifications</h3>

            <p>
              Control how your dashboard handles
              notifications and alerts.
            </p>
          </div>
        </div>

        {/* Dashboard Notifications */}
        <div className="settings-option">

          <div>
            <h4>
              Dashboard Notifications
            </h4>

            <p>
              Show important notifications inside
              the dashboard.
            </p>
          </div>

          <label className="settings-toggle">

            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(event) =>
                updateSetting(
                  "notifications",
                  event.target.checked
                )
              }
            />

            <span className="settings-toggle-slider"></span>

          </label>
        </div>

        {/* Email Alerts */}
        <div className="settings-option">

          <div>
            <h4>Email Alerts</h4>

            <p>
              Receive email notifications for
              important account activity.
            </p>
          </div>

          <label className="settings-toggle">

            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(event) =>
                updateSetting(
                  "emailAlerts",
                  event.target.checked
                )
              }
            />

            <span className="settings-toggle-slider"></span>

          </label>
        </div>
      </div>

      {/* ======================================
          DISPLAY SETTINGS
      ======================================= */}
      <div className="settings-card">

        <div className="settings-card-header">
          <div>
            <h3>Display Preferences</h3>

            <p>
              Customize how your dashboard
              is displayed.
            </p>
          </div>
        </div>

        {/* Compact Mode */}
        <div className="settings-option">

          <div>
            <h4>Compact Mode</h4>

            <p>
              Reduce spacing between dashboard
              elements.
            </p>
          </div>

          <label className="settings-toggle">

            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(event) =>
                updateSetting(
                  "compactMode",
                  event.target.checked
                )
              }
            />

            <span className="settings-toggle-slider"></span>

          </label>
        </div>

        {/* Language */}
        <div className="settings-option">

          <div>
            <h4>Language</h4>

            <p>
              Select your preferred dashboard
              language.
            </p>
          </div>

          <select
            className="settings-select"
            value={settings.language}
            onChange={(event) =>
              updateSetting(
                "language",
                event.target.value
              )
            }
          >
            <option value="English">
              English
            </option>

            <option value="Urdu">
              Urdu
            </option>
          </select>
        </div>
      </div>

      {/* ======================================
          SECURITY
      ======================================= */}
      <div className="settings-card">

        <div className="settings-card-header">
          <div>
            <h3>Security</h3>

            <p>
              Manage your account security.
            </p>
          </div>
        </div>

        {/* Change Password */}
        <div className="settings-security-row">

          <div>
            <h4>Password</h4>

            <p>
              Change your administrator account
              password securely.
            </p>
          </div>

          <button
            type="button"
            className="settings-secondary-btn"
            onClick={() => {
              setShowPasswordForm(true);
              setError("");
              setSuccess("");
            }}
          >
            Change Password
          </button>
        </div>

        {/* Edit Profile */}
        <div className="settings-security-row">

          <div>
            <h4>Profile</h4>

            <p>
              Update your name and profile picture.
            </p>
          </div>

          <button
            type="button"
            className="settings-secondary-btn"
            onClick={() =>
              navigate("/profile")
            }
          >
            Edit Profile
          </button>
        </div>

        {/* Logout */}
        <div className="settings-security-row">

          <div>
            <h4>Logout</h4>

            <p>
              Sign out of your administrator account.
            </p>
          </div>

          <button
            type="button"
            className="settings-danger-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ======================================
          RESET SETTINGS
      ======================================= */}
      <div className="settings-actions">

        <button
          type="button"
          className="settings-reset-btn"
          onClick={handleResetSettings}
        >
          Reset Preferences
        </button>
      </div>

      {/* ======================================
          CHANGE PASSWORD MODAL
      ======================================= */}
      {showPasswordForm && (
        <div className="password-modal-overlay">

          <div className="password-modal">

            {/* Modal header */}
            <div className="password-modal-header">

              <div>
                <h3>Change Password</h3>

                <p>
                  Enter your current password and
                  choose a new one.
                </p>
              </div>

              <button
                type="button"
                className="password-modal-close"
                onClick={
                  handleClosePasswordForm
                }
                disabled={changingPassword}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Password form */}
            <form
              onSubmit={handleChangePassword}
              className="password-form"
            >

              {/* Current password */}
              <div className="password-form-group">

                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  disabled={changingPassword}
                />
              </div>

              {/* New password */}
              <div className="password-form-group">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  disabled={changingPassword}
                />
              </div>

              {/* Confirm password */}
              <div className="password-form-group">

                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  disabled={changingPassword}
                />
              </div>

              {/* Modal actions */}
              <div className="password-form-actions">

                <button
                  type="button"
                  className="settings-secondary-btn"
                  onClick={
                    handleClosePasswordForm
                  }
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="settings-primary-btn"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Changing..."
                    : "Change Password"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Settings;

