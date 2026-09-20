
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

// ==========================================
// PROTECTED ROUTE
// ==========================================
// This component protects pages that require login.
// If the user is not authenticated, they are sent
// to the Login page and the original page is saved.
function ProtectedRoute({ isAuthenticated }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname
        )}`}
        replace
      />
    );
  }

  return <Outlet />;
}

// ==========================================
// DASHBOARD LAYOUT
// ==========================================
// The sidebar and navbar are shared by dashboard pages.
function DashboardLayout({
  isAuthenticated,
  onLogout,
  sidebarOpen,
  onMenuClick,
  onCloseSidebar,
}) {
  return (
    <div className="app">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={onCloseSidebar}
      />

      <main className="main-content">
        <Navbar
          onMenuClick={onMenuClick}
          onLogout={onLogout}
          isAuthenticated={isAuthenticated}
        />

        <Outlet />
      </main>
    </div>
  );
}

// ==========================================
// APP
// ==========================================
function App() {
  // Check localStorage when the application starts.
  // If a JWT exists, we consider the admin logged in.
  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {
      return Boolean(
        localStorage.getItem("adminToken")
      );
    });

  // Controls the mobile sidebar.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // LOGIN SUCCESS
  // ==========================================
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    // Remove authentication data.
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    // Update React authentication state.
    setIsAuthenticated(false);

    // Close mobile sidebar.
    setSidebarOpen(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================
            LOGIN PAGE
        ====================================== */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* =====================================
            REGISTER PAGE
        ====================================== */}
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* =====================================
            MAIN DASHBOARD LAYOUT
        ====================================== */}
        <Route
          element={
            <DashboardLayout
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              sidebarOpen={sidebarOpen}
              onMenuClick={() => setSidebarOpen(true)}
              onCloseSidebar={() =>
                setSidebarOpen(false)
              }
            />
          }
        >
          {/* ==================================
              PUBLIC DASHBOARD
          =================================== */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* ==================================
              PROTECTED PAGES
          =================================== */}
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
              />
            }
          >
            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Route>

          {/* ==================================
              UNKNOWN ROUTE
          =================================== */}
          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

