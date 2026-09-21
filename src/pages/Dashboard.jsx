
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

import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import RecentOrders from "../components/RecentOrders";

const API_URL =
  `${import.meta.env.API_URL}/api/analytics`;

// Each month receives its own color.
const REVENUE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
  "#0d9488",
  "#9333ea",
];

function Dashboard() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChart: [],
    ordersChart: [],
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
            "Failed to load dashboard data."
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
      });
    } catch (err) {
      console.error(
        "Dashboard analytics error:",
        err
      );

      setError(
        err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load analytics when Dashboard opens.
  fetchAnalytics();

  // Reload Dashboard analytics whenever
  // Orders, Customers, or Products changes.
  const handleDashboardUpdate = () => {
    fetchAnalytics();
  };

  window.addEventListener(
    "dashboard-data-updated",
    handleDashboardUpdate
  );

  // Remove the event listener when Dashboard
  // is unmounted.
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
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <section className="dashboard-content">
        <div className="page-heading">
          <h2>Dashboard Overview</h2>
          <p>
            Monitor your business performance and
            recent activity.
          </p>
        </div>

        <div className="analytics-state-card">
          <div className="loading-spinner"></div>
          <p>
            Loading dashboard data...
          </p>
        </div>
      </section>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <section className="dashboard-content">
        <div className="page-heading">
          <h2>Dashboard Overview</h2>
          <p>
            Monitor your business performance and
            recent activity.
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
    <section className="dashboard-content">
      {/* ======================================
          PAGE HEADING
      ======================================= */}

      <div className="page-heading">
        <h2>Dashboard Overview</h2>

        <p>
          Monitor your business performance and
          recent activity.
        </p>
      </div>

      {/* ======================================
          STATISTICS
      ======================================= */}

      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(
            analytics.totalRevenue
          )}
          change="From completed orders"
          icon="💰"
        />

        <StatCard
          title="Total Orders"
          value={analytics.totalOrders.toLocaleString(
            "en-US"
          )}
          change="All orders in database"
          icon="🛒"
        />

        <StatCard
          title="Total Customers"
          value={analytics.totalCustomers.toLocaleString(
            "en-US"
          )}
          change="Customers in database"
          icon="👥"
        />

        <StatCard
          title="Total Products"
          value={analytics.totalProducts.toLocaleString(
            "en-US"
          )}
          change="Products in database"
          icon="📦"
        />
      </div>

      {/* ======================================
          ANALYTICS CHARTS
      ======================================= */}

      <div className="charts-grid">
        {/* ====================================
            REVENUE DONUT CHART
        ===================================== */}

        <ChartCard
          title="Revenue Overview"
          className="revenue-chart-card"
        >
          {analytics.revenueChart.length > 0 ? (
            <div className="revenue-chart-layout">
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
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      cornerRadius={5}
                    >
                      {analytics.revenueChart.map(
                        (entry, index) => (
                          <Cell
                            key={`revenue-${index}`}
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

              {/* Monthly revenue */}
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
                No revenue data available yet.
              </p>
            </div>
          )}
        </ChartCard>

        {/* ====================================
            ORDERS CHART
        ===================================== */}

        <ChartCard title="Orders Overview">
          {analytics.ordersChart.length > 0 ? (
            <div className="orders-chart-dashboard">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={analytics.ordersChart}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 5,
                    bottom: 25,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                     dataKey="month"
                     interval={0}
                     angle={-45}
                     textAnchor="end"
                     height={70}
                     tickMargin={12}
                     padding={{ left: 8, right: 8 }}
                     tick={{
                       fontSize: 10,
                     }}
                     tickLine={false}
                     axisLine={true}
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
                    fill="#16a34a"
                    radius={[7, 7, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>
                No order data available yet.
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ======================================
          RECENT ORDERS
      ======================================= */}

      <RecentOrders />
    </section>
  );
}

export default Dashboard;
