// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  RiAlertLine,
  RiRefreshLine,
  RiShoppingBagLine,
  RiMedicineBottleLine,
  RiTruckLine,
  RiMoneyDollarCircleLine,
  RiLineChartLine,
  RiPriceTagLine,
} from "react-icons/ri";

type DashboardData = {
  metrics: {
    medicines: number;
    sales: number;
    suppliers: number;
    revenue: number;
    profit: number;
    lowStock: number;
    expiryAlert: number;
  };
  recentSales: Array<{
    id: number;
    date: string;
    total: number;
    medicine_name: string;
  }>;
  expiringMedicines: Array<{
    id: number;
    name: string;
    expiry: string;
    days_left: number;
    stock: number;
  }>;
  lowStockMedicines: Array<{
    id: number;
    name: string;
    stock: number;
    min_stock: number;
  }>;
};

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const API_URL = "http://localhost:8000";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard/`);
      setData(response.data);
      setLastUpdated(new Date());
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return `৳ ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 7) return "text-error";
    if (days <= 15) return "text-warning";
    return "text-info";
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: "Total Medicines",
      value: data.metrics.medicines,
      icon: RiMedicineBottleLine,
      color: "primary",
    },
    {
      label: "Total Sales",
      value: data.metrics.sales,
      icon: RiShoppingBagLine,
      color: "secondary",
    },
    {
      label: "Total Suppliers",
      value: data.metrics.suppliers,
      icon: RiTruckLine,
      color: "accent",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(data.metrics.revenue),
      icon: RiMoneyDollarCircleLine,
      color: "success",
    },
    {
      label: "Total Profit",
      value: formatCurrency(data.metrics.profit),
      icon: RiLineChartLine,
      color: "info",
    },
    {
      label: "Low Stock Items",
      value: data.metrics.lowStock,
      icon: RiAlertLine,
      color: "warning",
    },
    {
      label: "Expiring Soon",
      value: data.metrics.expiryAlert,
      icon: RiPriceTagLine,
      color: "error",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Overview of pharmacy performance and alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-base-content/50">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RiRefreshLine className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Metrics Cards - No gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className={`card bg-${item.color} text-${item.color}-content shadow-xl`}>
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs opacity-90">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                  </div>
                  <Icon className="text-3xl opacity-80" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="card bg-base-100 shadow-xl border">
          <div className="card-body">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <RiShoppingBagLine className="text-primary" />
              Recent Sales
            </h2>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-base-content/50 text-center py-8">
                No sales recorded yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold">Sale #{sale.id}</p>
                      <p className="text-xs text-base-content/50">{sale.date}</p>
                      <p className="text-xs text-base-content/70 mt-1">{sale.medicine_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{formatCurrency(sale.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-6">
          {/* Expiring Alerts */}
          <div className="card bg-base-100 shadow-xl border">
            <div className="card-body">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <RiAlertLine className="text-warning" />
                Expiration Alerts
              </h2>
              <p className="text-sm text-base-content/70 mb-3">
                Medicines expiring within 30 days
              </p>
              {data.expiringMedicines.length === 0 ? (
                <div className="text-center py-6">
                  <div className="badge badge-success badge-lg">No Expiring Medicines</div>
                  <p className="text-xs text-base-content/50 mt-2">All medicines have valid expiry dates</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.expiringMedicines.map((med) => (
                    <div
                      key={med.id}
                      className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-base-content/50">Stock: {med.stock} units</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${getDaysLeftColor(med.days_left)}`}>
                          {med.days_left} days left
                        </p>
                        <p className="text-xs text-base-content/50">Expires: {med.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card bg-base-100 shadow-xl border">
            <div className="card-body">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <RiAlertLine className="text-error" />
                Low Stock Alerts
              </h2>
              <p className="text-sm text-base-content/70 mb-3">
                Items below minimum stock level
              </p>
              {data.lowStockMedicines.length === 0 ? (
                <div className="text-center py-6">
                  <div className="badge badge-success badge-lg">All Stock Levels Good</div>
                  <p className="text-xs text-base-content/50 mt-2">No items need restocking</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.lowStockMedicines.map((med) => (
                    <div
                      key={med.id}
                      className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-base-content/50">Min required: {med.min_stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-error">Stock: {med.stock}</p>
                        <p className="text-xs text-base-content/50">Critical Level</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
        <button
          className="btn btn-outline btn-primary"
          onClick={() => window.location.href = "/dashboard//admin/stock"}
        >
          <RiMedicineBottleLine className="mr-2" />
          Manage Medicines
        </button>
        <button
          className="btn btn-outline btn-secondary"
          onClick={() => window.location.href = "/dashboard//admin/pos"}
        >
          <RiShoppingBagLine className="mr-2" />
          New Sale
        </button>
        <button
          className="btn btn-outline btn-info"
          onClick={() => window.location.href = "/dashboard//admin/restock"}
        >
          <RiTruckLine className="mr-2" />
          Restock Items
        </button>
        <button
          className="btn btn-outline btn-warning"
          onClick={() => window.location.href = "/dashboard/admin/reports"}
        >
          <RiLineChartLine className="mr-2" />
          View Reports
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;