
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  `${import.meta.env.VITE_API_URL}/api/orders`;

function RecentOrders() {
  // ==========================================
  // STATE
  // ==========================================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // FETCH RECENT ORDERS
  // ==========================================
  useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

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
            "Failed to load orders."
        );
      }

      // Make sure the response is an array.
      const ordersData = Array.isArray(data)
        ? data
        : data.orders || [];

      // Sort newest orders first and show only 5.
      const recentOrders = [...ordersData]
        .sort((a, b) => {
          const dateA = new Date(
            a.date || a.createdAt
          ).getTime();

          const dateB = new Date(
            b.date || b.createdAt
          ).getTime();

          return dateB - dateA;
        })
        .slice(0, 5);

      setOrders(recentOrders);
    } catch (err) {
      console.error(
        "Recent orders error:",
        err
      );

      setError(
        err.message ||
          "Unable to load recent orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load orders when Dashboard opens.
  fetchOrders();

  // Reload orders when another component
  // tells us that dashboard data changed.
  const handleDashboardUpdate = () => {
    fetchOrders();
  };

  window.addEventListener(
    "dashboard-data-updated",
    handleDashboardUpdate
  );

  // Remove the listener when the component
  // is removed to prevent duplicate listeners.
  return () => {
    window.removeEventListener(
      "dashboard-data-updated",
      handleDashboardUpdate
    );
  };
}, []);

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================
  const formatAmount = (amount) => {
    return `$${Number(
      amount || 0
    ).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // VIEW ALL ORDERS
  // ==========================================
  const handleViewAll = () => {
    navigate("/orders");
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================
  const getStatusClass = (status) => {
    return (
      status?.toLowerCase() || "pending"
    );
  };

  return (
    <div className="orders-card">
      {/* ======================================
          HEADER
      ======================================= */}
      <div className="orders-header">
        <div>
          <h3>Recent Orders</h3>

          <p>
            Latest customer orders
          </p>
        </div>

        <button
          type="button"
          className="view-all-btn"
          onClick={handleViewAll}
        >
          View All
        </button>
      </div>

      {/* ======================================
          LOADING
      ======================================= */}
      {loading && (
        <div className="empty-table">
          <p>
            Loading recent orders...
          </p>
        </div>
      )}

      {/* ======================================
          ERROR
      ======================================= */}
      {!loading && error && (
        <div className="empty-table">
          <p>{error}</p>
        </div>
      )}

      {/* ======================================
          TABLE
      ======================================= */}
      {!loading &&
        !error &&
        orders.length > 0 && (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={
                      order._id ||
                      order.orderId
                    }
                  >
                    {/* Order ID */}
                    <td>
                      {order.orderId
                        ? `#${order.orderId}`
                        : "-"}
                    </td>

                    {/* Customer */}
                    <td>
                      {order.customer || "-"}
                    </td>

                    {/* Product */}
                    <td>
                      {order.product || "-"}
                    </td>

                    {/* Amount */}
                    <td>
                      {formatAmount(
                        order.amount
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status ||
                          "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* ======================================
          EMPTY STATE
      ======================================= */}
      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="empty-table">
            <p>
              No orders available yet.
            </p>
          </div>
        )}
    </div>
  );
}

export default RecentOrders;

