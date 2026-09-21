
import { useEffect, useState } from "react";

const API_URL =
  `${import.meta.env.VITE_API_URL}/customers`;

const DASHBOARD_UPDATE_EVENT =
  "dashboard-data-updated";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    date: "",
  });

  // ==========================================
  // GET CUSTOMERS
  // ==========================================
  const fetchCustomers = async () => {
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
            "Failed to fetch customers."
        );
      }

      setCustomers(
        Array.isArray(data)
          ? data
          : data.customers || []
      );
    } catch (err) {
      console.error(
        "Fetch customers error:",
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
    fetchCustomers();
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
  // INPUT CHANGE
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
      name: "",
      email: "",
      phone: "",
      status: "Active",
      date: "",
    });

    setEditingId(null);
    setIsEditing(false);
    setShowForm(false);
    setError("");
  };

  // ==========================================
  // OPEN ADD CUSTOMER
  // ==========================================
  const handleAddCustomer = () => {
    setError("");

    setIsEditing(false);
    setEditingId(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "Active",
      date: "",
    });

    setShowForm(true);
  };

  // ==========================================
  // ADD / UPDATE CUSTOMER
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
        date: formData.date,
      };

      if (
        !customerData.name ||
        !customerData.email ||
        !customerData.phone ||
        !customerData.date
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
        body: JSON.stringify(customerData),
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
              ? "Failed to update customer."
              : "Failed to create customer.")
        );
      }

      await fetchCustomers();

      // Update Dashboard immediately.
      notifyDashboard();

      resetForm();
    } catch (err) {
      console.error(
        "Save customer error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    }
  };

  // ==========================================
  // EDIT CUSTOMER
  // ==========================================
  const handleEdit = (customer) => {
    setError("");

    setIsEditing(true);
    setEditingId(customer._id);
    setShowForm(true);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      status:
        customer.status || "Active",
      date: customer.date
        ? new Date(customer.date)
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
  // DELETE CUSTOMER
  // ==========================================
  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this customer?"
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
            "Failed to delete customer."
        );
      }

      await fetchCustomers();

      notifyDashboard();
    } catch (err) {
      console.error(
        "Delete customer error:",
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
  const filteredCustomers =
    customers.filter((customer) => {
      const searchText =
        search.toLowerCase();

      return (
        String(customer._id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(customer.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(customer.email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(searchText) ||
        String(customer.status || "")
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
      status || "Active"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <section className="page-content customers-page">
      {/* Header */}
      <div className="customers-page-header">
        <div>
          <h2>Customers</h2>

          <p>
            Manage your customers and their
            information.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="add-btn"
            onClick={handleAddCustomer}
          >
            + Add Customer
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h3>
                {isEditing
                  ? "Edit Customer"
                  : "Add New Customer"}
              </h3>

              <p>
                {isEditing
                  ? "Update the customer information below."
                  : "Enter the customer information below."}
              </p>
            </div>
          </div>

          <form
            className="customer-form"
            onSubmit={handleSubmit}
          >
            {isEditing && (
              <div className="form-group">
                <label htmlFor="customerId">
                  Customer ID
                </label>

                <input
                  id="customerId"
                  type="text"
                  value={editingId || ""}
                  disabled
                />

                <small>
                  Customer ID cannot be changed.
                </small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

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
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

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

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
              >
                {isEditing
                  ? "Update Customer"
                  : "Add Customer"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer table */}
      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h3>Customer List</h3>

            <p>
              {filteredCustomers.length}{" "}
              customer
              {filteredCustomers.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search customers..."
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
              Loading customers...
            </p>
          </div>
        ) : filteredCustomers.length ===
          0 ? (
          <div className="empty-table">
            <p>
              {search
                ? "No customers found for your search."
                : "No customers available."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={customer._id}
                    >
                      <td
                        title={
                          customer._id
                        }
                      >
                        #
                        {String(
                          customer._id
                        ).slice(-6)}
                      </td>

                      <td>
                        {customer.name ||
                          "—"}
                      </td>

                      <td>
                        {customer.email ||
                          "—"}
                      </td>

                      <td>
                        {customer.phone ||
                          "—"}
                      </td>

                      <td>
                        <span
                          className={`status ${getStatusClass(
                            customer.status
                          )}`}
                        >
                          {customer.status ||
                            "Active"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          customer.date
                        )}
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() =>
                              handleEdit(
                                customer
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
                                customer._id
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

export default Customers;

