
import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const API_URL = `${import.meta.env.API_URL}api/auth`;

function Login({ onLogin }) {
  const navigate = useNavigate();

  // Read the original page requested by the user.
  const [searchParams] = useSearchParams();

  const redirectPath =
    searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================
  // LOGIN
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Read response as text first so we can safely handle
      // cases where the backend returns invalid JSON.
      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      // Backend returned an error.
      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      // ========================================
      // SAVE JWT TOKEN
      // ========================================
      localStorage.setItem(
        "adminToken",
        data.token
      );

      // ========================================
      // SAVE ADMIN INFORMATION
      // ========================================
      localStorage.setItem(
        "admin",
        JSON.stringify(data.admin)
      );

      // Tell App.jsx that login was successful.
      onLogin();

      // ========================================
      // RETURN TO ORIGINAL PAGE
      // ========================================
      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GO TO REGISTER
  // ==========================================
  const handleRegisterClick = () => {
    navigate(
      `/register?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        {/* ==================================
            AUTH HEADER
        =================================== */}
        <div className="auth-header">
          <div className="auth-logo">A</div>

          <h1>Admin Login</h1>

          <p>
            Sign in to continue.
          </p>
        </div>

        {/* ==================================
            ERROR
        =================================== */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ==================================
            LOGIN FORM
        =================================== */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          {/* Register button */}
          <button
            type="button"
            className="register-link-btn"
            onClick={handleRegisterClick}
          >
            Don't have an account?
            <span> Register</span>
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;

