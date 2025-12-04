"use client";

import React, { useEffect, useState, useMemo } from "react";
import { appTheme } from "../../../src/constants/theme";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("month"); // today, week, month, year

  // Fetch all data with proper error handling
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch orders
      try {
        const ordersRes = await fetch("/api/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success) {
            setOrders(ordersData.data || []);
          } else {
            setOrders([]);
          }
        } else {
          console.warn("Orders API failed:", ordersRes.status);
          setOrders([]);
        }
      } catch (ordersError) {
        console.warn("Orders fetch error:", ordersError);
        setOrders([]);
      }

      // Fetch products
      try {
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData.success) {
            setProducts(productsData.data || []);
          } else {
            setProducts([]);
          }
        } else {
          console.warn("Products API failed:", productsRes.status);
          setProducts([]);
        }
      } catch (productsError) {
        console.warn("Products fetch error:", productsError);
        setProducts([]);
      }

      // Fetch customers - handle 404 gracefully
      try {
        const customersRes = await fetch("/api/users?role=customer");
        if (customersRes.ok) {
          const customersData = await customersRes.json();
          if (customersData.success) {
            // Filter out any invalid customer objects and handle buffer fields
            const validCustomers = (customersData.data || []).filter(customer => 
              customer && typeof customer === 'object' && !customer.buffer
            );
            setCustomers(validCustomers);
          } else {
            setCustomers([]);
          }
        } else if (customersRes.status === 404) {
          console.warn("Customers API not found, using fallback data");
          // Extract customers from orders as fallback
          const customerEmails = new Set();
          orders.forEach(order => {
            if (order.email) customerEmails.add(order.email);
          });
          const fallbackCustomers = Array.from(customerEmails).map((email, index) => ({
            _id: `fallback-${index}`,
            email: email,
            name: email.split('@')[0]
          }));
          setCustomers(fallbackCustomers);
        } else {
          console.warn("Customers API failed:", customersRes.status);
          setCustomers([]);
        }
      } catch (customersError) {
        console.warn("Customers fetch error:", customersError);
        setCustomers([]);
      }

    } catch (err) {
      console.error("Fetch dashboard data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter orders by time with safe data access
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter((order) => {
      if (!order || !order.createdAt) return false;
      
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return false;
      
      switch (timeFilter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return orderDate >= startOfWeek;
        case "month":
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  // Safe data computation functions
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o && o.paymentStatus === "paid" && typeof o.totalPrice === 'number')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [filteredOrders]);

  const totalOrders = filteredOrders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Order status metrics with safe access
  const pendingOrders = filteredOrders.filter(o => o && o.status === "pending").length;
  const processingOrders = filteredOrders.filter(o => o && o.status === "processing").length;
  const shippedOrders = filteredOrders.filter(o => o && o.status === "shipped").length;
  const deliveredOrders = filteredOrders.filter(o => o && o.status === "delivered").length;
  const cancelledOrders = filteredOrders.filter(o => o && o.status === "cancelled").length;

  // Payment status metrics
  const paidOrders = filteredOrders.filter(o => o && o.paymentStatus === "paid").length;
  const pendingPaymentOrders = filteredOrders.filter(o => o && o.paymentStatus === "pending").length;

  // Top selling products with safe data access
  const topSellingProducts = useMemo(() => {
    const productSales = {};
    
    filteredOrders.forEach(order => {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!item) return;
          
          const productName = item.productName || 'Unknown Product';
          const productId = item.productId?._id || productName;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          const price = typeof item.price === 'number' ? item.price : 0;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].revenue += price * quantity;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredOrders]);

  // Chart data configurations
  const revenueChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue (₹)",
        data: [120000, 190000, 150000, 180000, 160000, 195000, 210000, 185000, 175000, 165000, 155000, 140000],
        borderColor: appTheme.colors.primary,
        backgroundColor: `${appTheme.colors.primary}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const ordersChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Orders",
        data: [45, 52, 48, 55, 50, 58, 62, 57, 54, 52, 49, 46],
        backgroundColor: appTheme.colors.secondary,
        borderRadius: 8,
      },
    ],
  };

  const orderStatusData = {
    labels: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    datasets: [
      {
        data: [pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF6384"
        ],
        borderWidth: 2,
        borderColor: appTheme.colors.surface,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: `${appTheme.colors.border}40`,
        }
      },
      x: {
        grid: {
          color: `${appTheme.colors.border}40`,
        }
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
    },
    cutout: '65%',
  };

  // Recent orders with safe data access
  const recentOrders = useMemo(() => {
    return filteredOrders
      .filter(order => order && order.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        _id: order._id || 'unknown',
        orderNumber: order.orderNumber || `ORD-${Math.random().toString(36).substr(2, 9)}`,
        createdBy: order.customerName || order.email || 'Unknown Customer',
        totalPrice: typeof order.totalPrice === 'number' ? order.totalPrice : 0,
        status: order.status || 'pending',
        createdAt: order.createdAt
      }));
  }, [filteredOrders]);

  if (loading) {
    return (
      <div style={{ 
        padding: "40px", 
        backgroundColor: appTheme.colors.background,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          textAlign: "center",
          color: appTheme.colors.textSecondary
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <p style={{ fontSize: "1.2rem" }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "30px", 
      backgroundColor: appTheme.colors.background, 
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px",
      }}>
        <div>
          <h1 style={{ 
            color: appTheme.colors.textPrimary, 
            marginBottom: "8px",
            fontSize: "2rem",
            fontWeight: "700"
          }}>
            Dashboard Overview
          </h1>
          <p style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "1rem"
          }}>
            Welcome to your e-commerce dashboard
          </p>
        </div>

        {/* Time Filter */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <label style={{ 
            color: appTheme.colors.textSecondary,
            fontWeight: "500"
          }}>Period: </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: `1.5px solid ${appTheme.colors.border}`,
              fontFamily: appTheme.fonts.primary,
              backgroundColor: appTheme.colors.surface,
              color: appTheme.colors.textPrimary,
              fontSize: "0.9rem",
              cursor: "pointer",
              minWidth: "120px"
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Main Metrics Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        {/* Revenue Card */}
        <div style={{
          background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>Total Revenue</div>
            <div style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              {timeFilter === 'today' ? 'Today' : 
               timeFilter === 'week' ? 'This Week' : 
               timeFilter === 'month' ? 'This Month' : 'This Year'}
            </div>
          </div>
          <div style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            fontSize: "5rem",
            opacity: 0.1,
            transform: "rotate(15deg)"
          }}>
            💰
          </div>
        </div>

        {/* Orders Card */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `${appTheme.colors.info}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem"
            }}>
              📦
            </div>
            <div>
              <div style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
                Total Orders
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: "700", color: appTheme.colors.textPrimary }}>
                {totalOrders}
              </div>
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `${appTheme.colors.success}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem"
            }}>
              👥
            </div>
            <div>
              <div style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
                Total Customers
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: "700", color: appTheme.colors.textPrimary }}>
                {totalCustomers}
              </div>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `${appTheme.colors.warning}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem"
            }}>
              🛍️
            </div>
            <div>
              <div style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
                Total Products
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: "700", color: appTheme.colors.textPrimary }}>
                {totalProducts}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Charts */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        {/* Revenue Chart */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <h3 style={{ marginBottom: "20px", color: appTheme.colors.textPrimary }}>
            Revenue Trend
          </h3>
          <div style={{ height: "300px" }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Order Status Chart */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <h3 style={{ marginBottom: "20px", color: appTheme.colors.textPrimary }}>
            Order Status
          </h3>
          <div style={{ height: "300px" }}>
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Third Row - Additional Info */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "20px" 
      }}>
        {/* Recent Orders */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <h3 style={{ marginBottom: "20px", color: appTheme.colors.textPrimary }}>
            Recent Orders
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order._id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                backgroundColor: `${appTheme.colors.background}50`,
                borderRadius: "8px",
                border: `1px solid ${appTheme.colors.border}20`,
              }}>
                <div>
                  <div style={{ fontWeight: "600", color: appTheme.colors.textPrimary }}>
                    #{order.orderNumber}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary }}>
                    {order.createdBy} • ₹{order.totalPrice}
                  </div>
                </div>
                <div style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  backgroundColor: 
                    order.status === 'delivered' ? `${appTheme.colors.success}20` :
                    order.status === 'shipped' ? `${appTheme.colors.info}20` :
                    order.status === 'processing' ? `${appTheme.colors.warning}20` :
                    `${appTheme.colors.error}20`,
                  color: 
                    order.status === 'delivered' ? appTheme.colors.success :
                    order.status === 'shipped' ? appTheme.colors.info :
                    order.status === 'processing' ? appTheme.colors.warning :
                    appTheme.colors.error,
                }}>
                  {order.status}
                </div>
              </div>
            )) : (
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                color: appTheme.colors.textSecondary 
              }}>
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${appTheme.colors.border}30`,
        }}>
          <h3 style={{ marginBottom: "20px", color: appTheme.colors.textPrimary }}>
            Top Selling Products
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topSellingProducts.length > 0 ? topSellingProducts.map((product, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                backgroundColor: `${appTheme.colors.background}50`,
                borderRadius: "8px",
                border: `1px solid ${appTheme.colors.border}20`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: `linear-gradient(135deg, ${appTheme.colors.primary}20, ${appTheme.colors.secondary}20)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: appTheme.colors.primary
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", color: appTheme.colors.textPrimary, fontSize: "0.9rem" }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                      {product.quantity} sold
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontWeight: "600", 
                  color: appTheme.colors.primary,
                  fontSize: "0.9rem"
                }}>
                  ₹{product.revenue.toLocaleString()}
                </div>
              </div>
            )) : (
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                color: appTheme.colors.textSecondary 
              }}>
                No sales data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}