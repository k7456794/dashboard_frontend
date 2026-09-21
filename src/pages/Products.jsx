
import { useEffect, useState } from "react";

const API_URL =
  `${import.meta.env.VITE_API_URL}/api/products`;

const DASHBOARD_UPDATE_EVENT =
  "dashboard-data-updated";

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  // null = add mode
  // object = edit mode
  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "In Stock",
  });

  // ==========================================
  // GET PRODUCTS
  // ==========================================
  const fetchProducts = async () => {
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
            "Failed to fetch products."
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : data.products || []
      );
    } catch (err) {
      console.error(
        "Fetch products error:",
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
    fetchProducts();
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
      category: "",
      price: "",
      stock: "",
      status: "In Stock",
    });

    setEditingProduct(null);
    setShowForm(false);
    setError("");
  };

  // ==========================================
  // OPEN ADD PRODUCT
  // ==========================================
  const handleAdd = () => {
    setError("");

    setEditingProduct(null);

    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      status: "In Stock",
    });

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT PRODUCT
  // ==========================================
  const handleEdit = (product) => {
    setError("");

    setEditingProduct(product);
    setShowForm(true);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      status:
        product.status || "In Stock",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ADD / UPDATE PRODUCT
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const productData = {
        name: formData.name.trim(),
        category:
          formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        status: formData.status,
      };

      if (
        !productData.name ||
        !productData.category ||
        formData.price === "" ||
        formData.stock === ""
      ) {
        setError(
          "Please fill in all required fields."
        );
        return;
      }

      const url = editingProduct
        ? `${API_URL}/${editingProduct._id}`
        : API_URL;

      const method = editingProduct
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
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
            (editingProduct
              ? "Failed to update product."
              : "Failed to create product.")
        );
      }

      await fetchProducts();

      // Update Dashboard immediately.
      notifyDashboard();

      resetForm();
    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================
  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
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
            "Failed to delete product."
        );
      }

      await fetchProducts();

      notifyDashboard();
    } catch (err) {
      console.error(
        "Delete product error:",
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
  const filteredProducts =
    products.filter((product) => {
      const searchText =
        search.toLowerCase();

      return (
        String(product._id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(product.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(product.category || "")
          .toLowerCase()
          .includes(searchText) ||
        String(product.status || "")
          .toLowerCase()
          .includes(searchText)
      );
    });

  // ==========================================
  // STATUS CLASS
  // ==========================================
  const getStatusClass = (status) => {
    return String(
      status || "In Stock"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <section className="page-content products-page">
      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="products-page-header">
        <div>
          <h2>Products</h2>

          <p>
            Manage all products in your store.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="add-btn"
            onClick={handleAdd}
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================
          ADD / EDIT PRODUCT FORM
      ====================================== */}

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h3>
                {editingProduct
                  ? "Edit Product"
                  : "Add New Product"}
              </h3>

              <p>
                {editingProduct
                  ? "Update the product information below."
                  : "Enter the product information below."}
              </p>
            </div>
          </div>

          <form
            className="product-form"
            onSubmit={handleSubmit}
          >
            {/* Product ID */}
            {editingProduct && (
              <div className="form-group">
                <label htmlFor="productId">
                  Product ID
                </label>

                <input
                  id="productId"
                  type="text"
                  value={
                    editingProduct._id ||
                    ""
                  }
                  disabled
                />

                <small>
                  Product ID cannot be changed.
                </small>
              </div>
            )}

            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="name">
                Product Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <input
                id="category"
                name="category"
                type="text"
                placeholder="Enter category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            {/* Stock */}
            <div className="form-group">
              <label htmlFor="stock">
                Stock
              </label>

              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                placeholder="Enter stock quantity"
                value={formData.stock}
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
                <option value="In Stock">
                  In Stock
                </option>

                <option value="Low Stock">
                  Low Stock
                </option>

                <option value="Out of Stock">
                  Out of Stock
                </option>
              </select>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
              >
                {editingProduct
                  ? "Update Product"
                  : "Save Product"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================
          PRODUCT TABLE
      ====================================== */}

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h3>All Products</h3>

            <p>
              {filteredProducts.length}{" "}
              product
              {filteredProducts.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
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
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="empty-table">
            <p>
              {search
                ? "No products found for your search."
                : "No products available."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={product._id}
                    >
                      <td>
                        {product.name ||
                          "—"}
                      </td>

                      <td>
                        {product.category ||
                          "—"}
                      </td>

                      <td>
                        $
                        {Number(
                          product.price || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {product.stock ??
                          0}
                      </td>

                      <td>
                        <span
                          className={`status ${getStatusClass(
                            product.status
                          )}`}
                        >
                          {product.status ||
                            "In Stock"}
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() =>
                              handleEdit(
                                product
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
                                product._id
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

export default Products;

