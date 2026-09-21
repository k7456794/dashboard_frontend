
import { useEffect, useState } from "react";

const API_URL =
  `${import.meta.env.API_URL}api/orders`;

// This event tells Dashboard and RecentOrders
// that the data has changed.
const DASHBOARD_UPDATE_EVENT =
  "dashboard-data-updated";

function Orders() {
  // Store all orders from the backend.
  const [orders, setOrders] = useState([]);

  // Loading state.
  const [loading, setLoading] = useState(true);

  // API/form errors.
  const [error, setError] = useState("");

  // Search field.
  const [search, setSearch] = useState("");

  // Controls form visibility.
  const [showForm, setShowForm] = useState(false);

  // Controls edit mode.
  const [isEditing, setIsEditing] = useState(false);

  // ID of order being edited.
  const [editingId, setEditingId] = useState(null);

  // Form data.
  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    amount: "",
    status: "Pending",
    date: "",
  });

  // ==========================================
  // GET ORDERS
  // ==========================================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

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
            "Failed to fetch orders."
        );
      }

      setOrders(
        Array.isArray(data)
          ? data
          : data.orders || []
      );
    } catch (err) {
      console.error(
        "Fetch orders error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // NOTIFY DASHBOARD
  // ==========================================
  const notifyDashboard = () => {
    window.dispatchEvent(
      new Event(DASHBOARD_UPDATE_EVENT)
    );
  };

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setFormData({
      customer: "",
      product: "",
      amount: "",
      status: "Pending",
      date: "",
    });

    setEditingId(null);
    setIsEditing(false);
    setShowForm(false);
  };

  // ==========================================
  // OPEN ADD ORDER FORM
  // ==========================================
  const handleAddOrder = () => {
    setError("");

    setIsEditing(false);
    setEditingId(null);

    setFormData({
      customer: "",
      product: "",
      amount: "",
      status: "Pending",
      date: "",
    });

    setShowForm(true);
  };

  // ==========================================
  // ADD / UPDATE ORDER
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const orderData = {
        customer: formData.customer.trim(),
        product: formData.product.trim(),
        amount: Number(formData.amount),
        status: formData.status,
        date: formData.date,
      };

      // Validate required fields.
      if (
        !orderData.customer ||
        !orderData.product ||
        !formData.amount ||
        !orderData.date
      ) {
        setError(
          "Please fill in all required fields."
        );
        return;
      }

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Failed to update order."
              : "Failed to create order.")
        );
      }

      // Refresh this page.
      await fetchOrders();

      // Tell Dashboard to refresh too.
      notifyDashboard();

      // Close form.
      resetForm();
    } catch (err) {
      console.error(
        "Save order error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    }
  };

  // ==========================================
  // EDIT ORDER
  // ==========================================
  const handleEdit = (order) => {
    setError("");

    setIsEditing(true);
    setEditingId(order._id);
    setShowForm(true);

    setFormData({
      customer: order.customer || "",
      product: order.product || "",
      amount: order.amount ?? "",
      status:
        order.status || "Pending",
      date: order.date
        ? new Date(order.date)
            .toISOString()
            .split("T")[0]
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE ORDER
  // ==========================================
  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this order?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete order."
        );
      }

      await fetchOrders();

      // Refresh Dashboard.
      notifyDashboard();
    } catch (err) {
      console.error(
        "Delete order error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================
  const filteredOrders =
    orders.filter((order) => {
      const searchText =
        search.toLowerCase();

      return (
        String(order._id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(order.orderId || "")
          .toLowerCase()
          .includes(searchText) ||
        String(order.customer || "")
          .toLowerCase()
          .includes(searchText) ||
        String(order.product || "")
          .toLowerCase()
          .includes(searchText) ||
        String(order.status || "")
          .toLowerCase()
          .includes(searchText)
      );
    });

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return date;
    }

    return formattedDate.toLocaleDateString();
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================
  const getStatusClass = (status) => {
    return String(
      status || "Pending"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <section className="page-content orders-page">
      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="orders-page-header">
        <div>
          <h2>Orders</h2>

          <p>
            Manage your customer orders.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="add-btn"
            onClick={handleAddOrder}
          >
            + Add Order
          </button>
        )}
      </div>

      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================
          ADD / EDIT FORM
      ====================================== */}

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h3>
                {isEditing
                  ? "Edit Order"
                  : "Add New Order"}
              </h3>

              <p>
                {isEditing
                  ? "Update the order information below."
                  : "Enter the order information below."}
              </p>
            </div>
          </div>

          <form
            className="order-form"
            onSubmit={handleSubmit}
          >
            {/* Order ID */}
            {isEditing && (
              <div className="form-group">
                <label htmlFor="orderId">
                  Order ID
                </label>

                <input
                  id="orderId"
                  type="text"
                  value={editingId || ""}
                  disabled
                />

                <small>
                  Order ID cannot be changed.
                </small>
              </div>
            )}

            {/* Customer */}
            <div className="form-group">
              <label htmlFor="customer">
                Customer
              </label>

              <input
                id="customer"
                name="customer"
                type="text"
                placeholder="Enter customer name"
                value={formData.customer}
                onChange={handleChange}
                required
              />
            </div>

            {/* Product */}
            <div className="form-group">
              <label htmlFor="product">
                Product
              </label>

              <input
                id="product"
                name="product"
                type="text"
                placeholder="Enter product name"
                value={formData.product}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label htmlFor="amount">
                Amount
              </label>

              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label htmlFor="date">
                Date
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
              >
                {isEditing
                  ? "Update Order"
                  : "Add Order"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================
          ORDERS TABLE
      ====================================== */}

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h3>Order List</h3>

            <p>
              {filteredOrders.length} order
              {filteredOrders.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-table">
            <p>
              Loading orders...
            </p>
          </div>
        ) : filteredOrders.length ===
          0 ? (
          <div className="empty-table">
            <p>
              {search
                ? "No orders found for your search."
                : "No orders available."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr
                      key={order._id}
                    >
                      <td
                        title={
                          order.orderId ||
                          order._id
                        }
                      >
                        {order.orderId
                          ? `#${order.orderId}`
                          : `#${String(
                              order._id
                            ).slice(-6)}`}
                      </td>

                      <td>
                        {order.customer ||
                          "—"}
                      </td>

                      <td>
                        {order.product ||
                          "—"}
                      </td>

                      <td>
                        $
                        {Number(
                          order.amount || 0
                        ).toFixed(2)}
                      </td>

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

                      <td>
                        {formatDate(
                          order.date
                        )}
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() =>
                              handleEdit(
                                order
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() =>
                              handleDelete(
                                order._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;

