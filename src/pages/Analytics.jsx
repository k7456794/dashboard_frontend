
import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL =
  `${import.meta.env.API_URL}/api/analytics`;

const REVENUE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

function Analytics() {
  // ==========================================
  // STATE
  // ==========================================

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChart: [],
    ordersChart: [],
    productStatus: {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ANALYTICS
  // ==========================================

  useEffect(() => {
    const fetchAnalytics = async () => {
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
              "Failed to load analytics."
          );
        }

        setAnalytics({
          totalRevenue: Number(
            data.totalRevenue || 0
          ),

          totalOrders: Number(
            data.totalOrders || 0
          ),

          totalCustomers: Number(
            data.totalCustomers || 0
          ),

          totalProducts: Number(
            data.totalProducts || 0
          ),

          revenueChart:
            data.revenueChart || [],

          ordersChart:
            data.ordersChart || [],

          productStatus: {
            inStock: Number(
              data.productStatus?.inStock ??
                data.productStatus?.["In Stock"] ??
                0
            ),
            lowStock: Number(
              data.productStatus?.lowStock ??
                data.productStatus?.["Low Stock"] ??
                0
            ),
            outOfStock: Number(
              data.productStatus?.outOfStock ??
                data.productStatus?.["Out of Stock"] ??
                0
            ),
          },
        });
      } catch (err) {
        console.error(
          "Analytics error:",
          err
        );

        setError(
          err.message ||
            "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    const handleDashboardUpdate = () => {
      fetchAnalytics();
    };

    window.addEventListener(
      "dashboard-data-updated",
      handleDashboardUpdate
    );

    return () => {
      window.removeEventListener(
        "dashboard-data-updated",
        handleDashboardUpdate
      );
    };
  }, []);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return `$${Number(
      value || 0
    ).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <section className="page-content analytics-page">
        <div className="analytics-page-header">
          <h2>Analytics</h2>

          <p>
            Analyze your business performance.
          </p>
        </div>

        <div className="analytics-state-card">
          <div className="loading-spinner"></div>

          <p>
            Loading analytics...
          </p>
        </div>
      </section>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <section className="page-content analytics-page">
        <div className="analytics-page-header">
          <h2>Analytics</h2>

          <p>
            Analyze your business performance.
          </p>
        </div>

        <div className="analytics-state-card">
          <p className="error-message">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-content analytics-page">
      {/* ======================================
          HEADER
      ======================================= */}

      <div className="analytics-page-header">
        <h2>Analytics</h2>

        <p>
          Analyze your business performance
          and recent trends.
        </p>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ======================================= */}

      <div className="stats-grid analytics-stats-grid">
        {/* Revenue */}
        <div className="stat-card analytics-stat-card">
          <div className="stat-icon">💰</div>

          <div className="stat-info">
            <p>Total Revenue</p>

            <h3>
              {formatCurrency(
                analytics.totalRevenue
              )}
            </h3>

            <span>
              Completed orders
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="stat-card analytics-stat-card">
          <div className="stat-icon">🛒</div>

          <div className="stat-info">
            <p>Total Orders</p>

            <h3>
              {analytics.totalOrders.toLocaleString(
                "en-US"
              )}
            </h3>

            <span>
              All orders
            </span>
          </div>
        </div>

        {/* Customers */}
        <div className="stat-card analytics-stat-card">
          <div className="stat-icon">👥</div>

          <div className="stat-info">
            <p>Total Customers</p>

            <h3>
              {analytics.totalCustomers.toLocaleString(
                "en-US"
              )}
            </h3>

            <span>
              Registered customers
            </span>
          </div>
        </div>

        {/* Products */}
        <div className="stat-card analytics-stat-card">
          <div className="stat-icon">📦</div>

          <div className="stat-info">
            <p>Total Products</p>

            <h3>
              {analytics.totalProducts.toLocaleString(
                "en-US"
              )}
            </h3>

            <span>
              Products in database
            </span>
          </div>
        </div>
      </div>

      {/* ======================================
          ANALYTICS CHARTS
      ======================================= */}

      <div className="charts-grid analytics-charts-grid">
        {/* ====================================
            REVENUE ANALYTICS
        ===================================== */}

        <div className="chart-card analytics-chart-card">
          <div className="analytics-chart-header">
            <div>
              <h3>
                Revenue Analytics
              </h3>

              <p>
                Monthly completed-order revenue
              </p>
            </div>
          </div>

          {analytics.revenueChart.length > 0 ? (
            <div className="revenue-chart-layout analytics-revenue-layout">
              {/* Donut */}
              <div className="revenue-chart-circle">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        analytics.revenueChart
                      }
                      dataKey="revenue"
                      nameKey="month"
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={120}
                      paddingAngle={5}
                      cornerRadius={6}
                    >
                      {analytics.revenueChart.map(
                        (entry, index) => (
                          <Cell
                            key={`analytics-revenue-${index}`}
                            fill={
                              REVENUE_COLORS[
                                index %
                                  REVENUE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue details */}
              <div className="revenue-month-list">
                {analytics.revenueChart.map(
                  (item, index) => (
                    <div
                      className="revenue-month-item"
                      key={`${item.month}-${index}`}
                    >
                      <div className="revenue-month-name">
                        <span
                          className="revenue-color-dot"
                          style={{
                            backgroundColor:
                              REVENUE_COLORS[
                                index %
                                  REVENUE_COLORS.length
                              ],
                          }}
                        ></span>

                        <span>
                          {item.month}
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(
                          item.revenue
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="chart-empty">
              <p>
                No revenue data available.
              </p>
            </div>
          )}
        </div>

        {/* ====================================
            ORDERS ANALYTICS
        ===================================== */}

        <div className="chart-card analytics-chart-card">
          <div className="analytics-chart-header">
            <div>
              <h3>
                Orders Analytics
              </h3>

              <p>
                Monthly order activity
              </p>
            </div>
          </div>

          {analytics.ordersChart.length > 0 ? (
            <div className="orders-chart-analytics">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={analytics.ordersChart}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                    }}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Orders",
                    ]}
                  />

                  <Bar
                    dataKey="orders"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                    barSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>
                No order data available.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================
          PRODUCT STOCK STATUS
      ======================================= */}

      <div className="product-status-card">
        <div className="analytics-chart-header">
          <div>
            <h3>
              Product Stock Status
            </h3>

            <p>
              Current inventory distribution
            </p>
          </div>
        </div>

        <div className="product-status-grid">
          <div className="product-status-item">
            <span>In Stock</span>

            <strong>
              {analytics.productStatus.inStock}
            </strong>
          </div>

          <div className="product-status-item">
            <span>Low Stock</span>

            <strong>
              {analytics.productStatus.lowStock}
            </strong>
          </div>

          <div className="product-status-item">
            <span>Out of Stock</span>

            <strong>
              {analytics.productStatus.outOfStock}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Analytics;
